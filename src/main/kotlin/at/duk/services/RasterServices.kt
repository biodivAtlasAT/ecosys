/*
 * Copyright (C) 2022 Danube University Krems
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     https://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 * SPDX-License-Identifier: Apache-2.0
 * License-Filename: LICENSE
 */
package at.duk.services

import at.duk.tables.TableRasterTasks
import at.duk.tables.TableUploadedRasterData
import at.duk.tables.TableRasterData
import at.duk.tables.TablePackages
import com.fasterxml.jackson.module.kotlin.jacksonObjectMapper
import com.fasterxml.jackson.module.kotlin.readValue
import io.ktor.http.*
import io.ktor.server.config.*
import koodies.exec.Process
import koodies.exec.error
import koodies.exec.exitCode
import koodies.shell.ShellScript
import org.jetbrains.exposed.dao.id.EntityID
import org.jetbrains.exposed.sql.*
import org.jetbrains.exposed.sql.javatime.CurrentDateTime
import org.jetbrains.exposed.sql.transactions.transaction
import java.io.File
import java.nio.file.Paths
import java.time.LocalDateTime

object RasterServices {
    private val charPool: List<Char> = ('a'..'z') + ('A'..'Z') + ('0'..'9')

    private const val windowsScript = "\"%postgresqlBinDirectory%\\raster2pgsql\" -b 1 -F -I -C -s %srid% " +
            "\"%uploadDirectory%\\%tifFileName%\" public.%tableName% > %uploadDirectory%\\rasterImport.sql\n" +
            "\"%postgresqlBinDirectory%\\psql\" -f %uploadDirectory%\\rasterImport.sql %connection%"

    private const val unixScript = "%postgresqlBinDirectory%/raster2pgsql -b 1 -F -I -C -s %srid% " +
            "%uploadDirectory%/%tifFileName% public.%tableName% > %uploadDirectory%/rasterImport.sql\n" +
            "%postgresqlBinDirectory%/psql -f %uploadDirectory%/rasterImport.sql %connection%"

    private val mapper = jacksonObjectMapper()

    @Suppress("TooGenericExceptionCaught")
    fun uploadIntoRasterTasks(
        fileName: String,
        config: ApplicationConfig,
        tmpName: String,
        rasterTasksId: EntityID<Int>,
        srid: String
    ) {
        try {
            val osIsWin = System.getProperty("os.name").lowercase().contains("win")
            val scriptName = if (osIsWin) "import.bat" else "import.sh"
            val tmpFolder = generateScripts(config, tmpName, fileName, rasterTasksId.value, srid)

            if (!osIsWin)
                ShellScript("chmod 777 ${tmpFolder.resolve(scriptName)}").exec()

            ShellScript(tmpFolder.resolve(scriptName).toString()).exec.async().also { proc ->
                transaction {
                    TableRasterTasks.update({ TableRasterTasks.id eq rasterTasksId }) { stmt ->
                        stmt[pid] = proc.pid.toInt()
                    }
                }
                proc.waitFor()

                if (proc.state is Process.State.Exited.Failed) {
                    transaction {
                        TableRasterTasks.update({ TableRasterTasks.id eq rasterTasksId }) { table ->
                            table[rc] = proc.exitCode
                            table[message] = proc.error
                            table[end] = CurrentDateTime
                        }
                    }
                } else {
                    val inpFile = tmpFolder.resolve("rasterImport.sql")
                    var exitCode = proc.exitCode
                    var msg = "Terminated successfully"

                    if (!inpFile.exists() || inpFile.length() == 0L) {
                        exitCode = -1
                        msg = "Error: File rasterInput.sql is empty!"
                    }

                    transaction {
                        TableRasterTasks.update({ TableRasterTasks.id eq rasterTasksId }) { table ->
                            table[rc] = exitCode
                            table[message] = msg
                            table[end] = CurrentDateTime
                        }
                    }
                }
            }
        } catch (ex: Exception) {
            transaction {
                TableRasterTasks.update({ TableRasterTasks.id eq rasterTasksId }) { table ->
                    table[rc] = -1
                    table[message] = ex.message ?: "Undefined Error!"
                    table[end] = CurrentDateTime
                }
            }
        }
    }

    private fun String.replaceVars(
        config: ApplicationConfig, jobsPath: File, fileName: String,
        tmpName: String, connStr: String, id: Int, srid: String
    ) = this.replace(
        "%postgresqlBinDirectory%",
        config.propertyOrNull("ktor.database.postgresqlBinDirectory")?.getString() ?: ""
    ).replace("%uploadDirectory%", jobsPath.toString())
        .replace("%tifFileName%", fileName)
        .replace("%tableName%", "table_$tmpName")
        .replace("%connection%", connStr)
        .replace("%id%", id.toString())
        .replace("%srid%", srid)

    private fun generateScripts(
        config: ApplicationConfig, tmpName: String, fileName: String, id: Int, srid: String
    ): File {
        val dataCacheDirectory = config.propertyOrNull("dataCache.directory")
            ?.getString() ?: Paths.get("").toAbsolutePath().toString()
        val jobsPath = File(dataCacheDirectory).resolve("rasterData").resolve("uploads").resolve(tmpName)

        val conn = (config.propertyOrNull("ktor.database.connection.jdbc")?.getString() ?: "").split("//")[1]
        val user = config.propertyOrNull("ktor.database.connection.user")?.getString() ?: "not configured"
        val passwd = config.propertyOrNull("ktor.database.connection.password")?.getString() ?: "not configured"
        val connStr = "postgresql://$user:$passwd@$conn"

        val fileContentWin = windowsScript.replaceVars(config, jobsPath, fileName, tmpName, connStr, id, srid)
        jobsPath.resolve("import.bat").writeText(fileContentWin)

        val fileContentUnix = unixScript.replaceVars(config, jobsPath, fileName, tmpName, connStr, id, srid)
        jobsPath.resolve("import.sh").writeText(fileContentUnix)

        return jobsPath
    }

    fun genTempName(max: Int = 12) = (1..max)
        .map { kotlin.random.Random.nextInt(0, charPool.size) }
        .map(charPool::get)
        .joinToString("")

    fun importIntoRasterData(rasterTasksId: Int): Int {
        var rasterDataId = -1
        val complexJoin = Join(
            TableRasterTasks, TableUploadedRasterData,
            onColumn = TableRasterTasks.uploadedRasterDataId, otherColumn = TableUploadedRasterData.id,
            joinType = JoinType.INNER
        )

        transaction {
            val res = complexJoin.select { TableRasterTasks.id eq rasterTasksId }.first()
            val tmpTableName = res[TableUploadedRasterData.tmpTable]
            val uploadedRasterDataId = res[TableUploadedRasterData.id].value
            rasterDataId = TableRasterData.insertAndGetId {
                it[TableRasterData.filename] = res[TableUploadedRasterData.filename]
                it[TableRasterData.name] = res[TableUploadedRasterData.name]
                it[TableRasterData.tmpTable] = res[TableUploadedRasterData.tmpTable]
                it[TableRasterData.dataComplete] = false
            }.value

            val sql = "UPDATE raster_data " +
                    "SET rast = $tmpTableName.rast, srid = ST_SRID($tmpTableName.rast) " +
                    " FROM $tmpTableName " +
                    " WHERE raster_data.id = $rasterDataId " +
                    " AND $tmpTableName.rid = 1"
            exec(sql)

            // calculate quintils for raster_data based on column rast, saved as json in a varchar
            // due to ignoring 0-values th postgis function ST_Quantile could not be used!
            val quints = mutableMapOf<Double, Double>()
            val sqlStatistics = "select percentile_disc(0.2) within group (order by fff asc) as q_1, " +
                    "       percentile_disc(0.4) within group (order by fff asc) as q_2," +
                    "       percentile_disc(0.6) within group (order by fff asc) as q_3," +
                    "       percentile_disc(0.8) within group (order by fff asc) as q_4," +
                    "       percentile_disc(1.0) within group (order by fff asc) as q_5 " +
                    "from (select ttt from " +
                    " (select (ST_PixelAsPoints(rast)).val as ttt from raster_data where id = $rasterDataId) as xxx) " +
                    " as fff where ttt != 0;"
            exec(sqlStatistics) { rs ->
                while (rs.next()) {
                    quints[0.2] = rs.getString("q_1").replace("(", "").replace(")", "").toDoubleOrNull() ?: -1.0
                    quints[0.4] = rs.getString("q_2").replace("(", "").replace(")", "").toDoubleOrNull() ?: -1.0
                    quints[0.6] = rs.getString("q_3").replace("(", "").replace(")", "").toDoubleOrNull() ?: -1.0
                    quints[0.8] = rs.getString("q_4").replace("(", "").replace(")", "").toDoubleOrNull() ?: -1.0
                    // only the four limits are stored
                    // quints[1.0] = rs.getString("q_5").replace("(", "").replace(")", "").toDoubleOrNull()?:-1.0
                }
            }

            TableRasterTasks.update({ TableRasterTasks.id eq rasterTasksId }) { table ->
                table[imported] = true
            }

            TableRasterData.update({ TableRasterData.id eq rasterDataId }) {
                it[TableRasterData.uploadedRasterDataId] = uploadedRasterDataId
                it[TableRasterData.rasterTaskId] = rasterTasksId
                it[TableRasterData.statistics] = mapper.writeValueAsString(quints)
            }

            exec("drop table $tmpTableName;")
        }
        return rasterDataId
    }

    fun removeFromRasterData(it: Int, dataCacheDirectory: String) {
        transaction {
            val r = TableRasterData.select { TableRasterData.id eq it }.first()[TableRasterData.rasterTaskId] ?: -1
            if (r > -1) {
                TableRasterData.deleteWhere { TableRasterData.id eq it }
                removeFromRasterTasks(r, dataCacheDirectory)
            }
        }
    }

    fun removeFromRasterTasks(rasterTasksId: Int, dataCacheDirectory: String) {
        val complexJoin = Join(
            TableRasterTasks, TableUploadedRasterData,
            onColumn = TableRasterTasks.uploadedRasterDataId, otherColumn = TableUploadedRasterData.id,
            joinType = JoinType.INNER
        )
        var tmpTableName = ""
        var tableUploadedRasterDataId: Int

        transaction {
            complexJoin.select { TableRasterTasks.id eq rasterTasksId }.first().also {
                tmpTableName = it[TableUploadedRasterData.tmpTable]
                tableUploadedRasterDataId = it[TableUploadedRasterData.id].value
            }
            if (tableUploadedRasterDataId > -1) {
                TableRasterTasks.deleteWhere { TableRasterTasks.id eq rasterTasksId }
                TableUploadedRasterData.deleteWhere { TableUploadedRasterData.id eq tableUploadedRasterDataId }
                exec("DROP TABLE IF EXISTS $tmpTableName;")
            }
        }
        // remove the temp folder and its content
        if (tmpTableName.isNotEmpty()) {
            val folderName = tmpTableName.substring(6)
            val rasterDataFolder = File(dataCacheDirectory).resolve("rasterData")
                .resolve("uploads").resolve(folderName)
            if (File("$rasterDataFolder").exists())
                File("$rasterDataFolder").deleteRecursively()
        }
    }

    fun packageDelete(formParameters: Parameters) = formParameters["mode"]?.let {
        formParameters["id"]?.toIntOrNull().let { id ->
            transaction {
                TablePackages.update({ TablePackages.id eq id }) {
                    it[TablePackages.deleted] = LocalDateTime.now()
                }
            }
        }
    }

    fun packageInsertOrUpdate(formParameters: Parameters, defVal: Boolean) =
        formParameters["name"]?.let { name ->
            formParameters["id"]?.toIntOrNull().let { id ->
                transaction {
                    if (defVal) {
                        TablePackages.update({ TablePackages.default eq true }) {
                            it[TablePackages.default] = false
                        }
                    }
                    if (id == -1) {
                        // for the initial case: one record must be default, even if not set in form!
                        val dVal = (TablePackages.select { TablePackages.deleted eq null }.count() == 0L) || defVal
                        TablePackages.insert {
                            it[TablePackages.name] = name
                            it[TablePackages.default] = dVal
                            it[TablePackages.created] = LocalDateTime.now()
                        }
                    } else
                        TablePackages.update({ TablePackages.id eq id }) {
                            it[TablePackages.name] = name
                            it[TablePackages.default] = defVal
                            it[TablePackages.updated] = LocalDateTime.now()
                        }
                }
            }
        }

    fun insertDataAndTask(fileName: String, fileDescription: String, tmpName: String): EntityID<Int> {
        lateinit var id: EntityID<Int>
        lateinit var rasterTasksId: EntityID<Int>
        transaction {
            id = TableUploadedRasterData.insertAndGetId {
                it[filename] = fileName
                it[name] = fileDescription
                it[tmpTable] = "table_$tmpName"
            }
            rasterTasksId = TableRasterTasks.insertAndGetId {
                it[pid] = 0
                it[start] = CurrentDateTime
                it[uploadedRasterDataId] = id.value
            }
        }
        return rasterTasksId
    }

    fun getQuartilsFromStatistics(jsonStats: Any?): List<Double> {
        // "0.2":31.0,"0.4":128.0,"0.6":128.0,"0.8":128.0
        jsonStats?.let {
            val limits: Map<Double, Double> = mapper.readValue(jsonStats.toString())
            return limits.map { it.value }
        }
        return emptyList()
    }

    @Suppress("ComplexCondition")
    fun makeQuartilsJson(q1: Double?, q2: Double?, q3: Double?, q4: Double?): String? {
        if (q1 != null && q2 != null && q3 != null && q4 != null) {
            val vals = listOf<Double>(q1, q2, q3, q4).sorted()
            val quints = mutableMapOf<Double, Double>()
            quints[0.2] = vals[0]
            quints[0.4] = vals[1]
            quints[0.6] = vals[2]
            quints[0.8] = vals[3]
            val sortedMap = quints.toList().sortedBy { (k, v) -> v }.toMap()
            return mapper.writeValueAsString(sortedMap)
        }
        return null
    }
}
