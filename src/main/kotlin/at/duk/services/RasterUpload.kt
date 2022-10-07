package at.duk.services

import at.duk.tables.TableRasterData
import at.duk.tables.TableRasterTasks
import at.duk.tables.TableRasterTasks.uploadedRasterDataId
import at.duk.tables.TableUploadedRasterData
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

class RasterUpload {
    companion object {
        private val charPool : List<Char> = ('a'..'z') + ('A'..'Z') + ('0'..'9')

        private const val windowsScript = "\"%postgresqlBinDirectory%\\raster2pgsql\" -b 1 -F -I -C -s 4326 " +
                "\"%uploadDirectory%\\%tifFileName%\" public.%tableName% > %uploadDirectory%\\rasterImport.sql\n" +
                "\"%postgresqlBinDirectory%\\psql\" -f %uploadDirectory%\\rasterImport.sql %connection%"

        fun uploadIntoRasterTasks(
            fileName: String,
            config: ApplicationConfig,
            tmpName: String,
            rasterTasksId: EntityID<Int>
        ) {
            try {
                ShellScript(generateScripts(config, tmpName, fileName, rasterTasksId.value)).exec.async().also {
                    val pidV = it.pid
                    transaction {
                        TableRasterTasks.update({ TableRasterTasks.id eq rasterTasksId }) { stmt ->
                            stmt[pid] = pidV.toInt()
                        }
                    }
                    it.waitFor()

                    if (it.state is Process.State.Exited.Failed) {
                        transaction {
                            TableRasterTasks.update({ TableRasterTasks.id eq rasterTasksId }) { table ->
                                table[rc] = it.exitCode
                                table[message] = it.error
                                table[end] = CurrentDateTime
                            }
                        }
                    } else {
                        transaction {
                            TableRasterTasks.update({ TableRasterTasks.id eq rasterTasksId }) { table ->
                                table[rc] = it.exitCode
                                table[message] = "Terminated successfully"
                                table[end] = CurrentDateTime
                            }
                        }
                    }
                }
            } catch (ex: Exception) {
                transaction {
                    TableRasterTasks.update({ TableRasterTasks.id eq rasterTasksId }) { table ->
                        table[rc] = -1
                        table[message] = ex.message?:"Undefined Error!"
                        table[end] = CurrentDateTime
                    }
                }
            }
        }

        private fun generateScripts(config: ApplicationConfig, tmpName: String, fileName: String, id: Int): String {
            val dataCacheDirectory = config.propertyOrNull("dataCache.directory")?.getString() ?: Paths.get("").toAbsolutePath().toString()
            val jobsPath = File(dataCacheDirectory).resolve("rasterData").resolve("uploads").resolve(tmpName)

            val conn = (config.propertyOrNull("ktor.database.connection.jdbc")?.getString() ?: "").split("//")[1]
            val user = config.propertyOrNull("ktor.database.connection.user")?.getString() ?: "not configured"
            val passwd = config.propertyOrNull("ktor.database.connection.user")?.getString() ?: "not configured"
            val connStr = "postgresql://$user:$passwd@$conn"

            val fileContent = windowsScript.replace("%postgresqlBinDirectory%", config.propertyOrNull("ktor.database.postgresqlBinDirectory")?.getString() ?:"")
                .replace("%uploadDirectory%", jobsPath.toString())
                .replace("%tifFileName%", fileName)
                .replace("%tableName%", "table_$tmpName")
                .replace ("%connection%", connStr)
                .replace ("%id%", id.toString())

            jobsPath.resolve("import.bat").writeText(fileContent)
            // check for OS
            return jobsPath.resolve("import.bat").toString()
        }

        fun genTempName() = (1..12)
            .map { kotlin.random.Random.nextInt(0, charPool.size) }
            .map(charPool::get)
            .joinToString("")

        fun importIntoRasterData(rasterTasksId: Int): Int {
            var rasterDataId = -1

            transaction {
                val complexJoin = Join(
                    TableRasterTasks, TableUploadedRasterData,
                    onColumn = TableRasterTasks.uploadedRasterDataId, otherColumn = TableUploadedRasterData.id,
                    joinType = JoinType.INNER)

                val res = complexJoin.select{ TableRasterTasks.id eq rasterTasksId }.first()
                val tmpTableName = res[TableUploadedRasterData.tmpTable]
                rasterDataId = TableRasterData.insertAndGetId {
                    it[TableRasterData.filename] = res[TableUploadedRasterData.filename]
                    it[TableRasterData.name] = res[TableUploadedRasterData.name]
                    it[TableRasterData.tmpTable] = res[TableUploadedRasterData.tmpTable]
                    it[TableRasterData.dataComplete] = false
                }.value

                val sql = "UPDATE raster_data " +
                    "SET rast = $tmpTableName.rast " +
                        " FROM $tmpTableName " +
                        " WHERE raster_data.id = $rasterDataId " +
                        " AND $tmpTableName.rid = 1"
                exec(sql)

                // todo: calculate quintils for raster_data based on column rast, saved as jsonb

                TableRasterTasks.update ({ TableRasterTasks.id eq rasterTasksId }) { table ->
                    table[imported] = true
                }
            }
            return rasterDataId
        }

    }
}