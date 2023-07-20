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
package at.duk.routes

import at.duk.models.PackageData
import at.duk.models.RasterData
import at.duk.models.RasterTask
import at.duk.services.RasterServices
import at.duk.tables.TableRasterTasks
import at.duk.tables.TableUploadedRasterData
import at.duk.tables.TablePackages
import at.duk.tables.TableRasterData
import at.duk.tables.TableServices
import io.ktor.http.content.*
import io.ktor.server.application.*
import io.ktor.server.config.*
import io.ktor.server.freemarker.*
import io.ktor.server.request.*
import io.ktor.server.response.*
import io.ktor.server.routing.*
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.launch
import org.jetbrains.exposed.sql.*
import org.jetbrains.exposed.sql.transactions.transaction
import java.io.File
import java.nio.file.Paths
import java.time.format.DateTimeFormatter

@Suppress("LongMethod", "ComplexMethod")
fun Route.rasterRouting(config: ApplicationConfig) {
    val dataCacheDirectory =
        config.propertyOrNull("dataCache.directory")?.getString() ?: Paths.get("").toAbsolutePath().toString()

    route("/admin/raster") {

        get("/packages") {
            val idsInUse = mutableListOf<Int>()
            val packagesList = mutableListOf<PackageData>()

            transaction {
                packagesList.addAll(
                    TablePackages.select { TablePackages.deleted eq null }.orderBy(TablePackages.name).map
                    { rs -> PackageData(rs[TablePackages.id].value, rs[TablePackages.name], rs[TablePackages.default]) }
                )
                idsInUse.addAll(
                    TableRasterData.selectAll().map { rs -> rs[TableRasterData.packageId] ?: -1 }
                )
            }
            call.respond(
                FreeMarkerContent(
                    "04_Packages.ftl",
                    mapOf("result" to packagesList, "maxCount" to packagesList.size, "idsInUse" to idsInUse.distinct())
                )
            )
        }
        post("/packageUpdate") {
            val formParameters = call.receiveParameters()
            when (formParameters["mode"]?.toIntOrNull() ?: -1) {
                0 -> if (formParameters["name"] != "")
                    RasterServices.packageInsertOrUpdate(
                        formParameters,
                        formParameters["default"]?.toBoolean() ?: false
                    )

                1 -> RasterServices.packageDelete(formParameters)
                else -> {}
            }
            call.respondRedirect("./packages")
        }

        get("/upload") {
            call.respond(FreeMarkerContent("05_RasterUpload.ftl", null))
        }

        post("/uploadAction") {

            val rasterDataFolder = File(dataCacheDirectory).resolve("rasterData")
            if (!File("$rasterDataFolder").exists()) File("$rasterDataFolder").mkdir()

            val cachePath = File(dataCacheDirectory).resolve("rasterData").resolve("uploads")
            if (!File("$cachePath").exists()) File("$cachePath").mkdir()

            val tmpName = RasterServices.genTempName()
            if (!File("$cachePath/$tmpName").exists()) File("$cachePath/$tmpName").mkdir()

            val multipartData = call.receiveMultipart()
            var fileDescription = ""
            var fileName = ""
            var srid = ""
            multipartData.forEachPart { part ->
                when (part) {
                    is PartData.FormItem -> {
                        if (part.name == "description") fileDescription = part.value
                        if (part.name == "srid") srid = part.value
                    }

                    is PartData.FileItem -> {
                        fileName = part.originalFileName as String
                        val re = "[^A-Za-z0-9 ]".toRegex()
                        fileName = re.replace(fileName, "_")
                        var fileBytes = part.streamProvider().readBytes()
                        File("$cachePath/$tmpName/$fileName").writeBytes(fileBytes)
                    }

                    else -> {}
                }
            }

            val rasterTasksId = RasterServices.insertDataAndTask(fileName, fileDescription, tmpName)

            launch(Dispatchers.Default) {
                RasterServices.uploadIntoRasterTasks(fileName, config, tmpName, rasterTasksId, srid)
            }
            call.respondRedirect("./tasks")
        }

        get("/tasks") {
            val result = mutableListOf<RasterTask>()
            transaction {
                val complexJoin = Join(
                    TableRasterTasks, TableUploadedRasterData,
                    onColumn = TableRasterTasks.uploadedRasterDataId, otherColumn = TableUploadedRasterData.id,
                    joinType = JoinType.INNER
                )

                val res = complexJoin.selectAll().orderBy(TableRasterTasks.start, SortOrder.DESC).limit(100)
                res.forEach {
                    result.add(
                        RasterTask(
                            it[TableRasterTasks.id].value,
                            it[TableRasterTasks.pid],
                            it[TableRasterTasks.start].format(DateTimeFormatter.ofPattern("dd/MM/YYYY HH:mm:ss")),
                            it[TableRasterTasks.end]?.format(DateTimeFormatter.ofPattern("dd/MM/YYYY HH:mm:ss")),
                            it[TableRasterTasks.uploadedRasterDataId],
                            it[TableUploadedRasterData.name],
                            it[TableRasterTasks.rc],
                            it[TableRasterTasks.message],
                            it[TableRasterTasks.imported]
                        )
                    )
                }
            }
            call.respond(FreeMarkerContent("06_RasterTasks.ftl", mapOf("result" to result)))
        }

        get("/tasksAction") {
            val rasterTasksId = call.request.queryParameters["rasterTasksId"]?.toIntOrNull() ?: -1
            val mode = call.request.queryParameters["mode"]?.toIntOrNull() ?: -1
            if (mode == 0 && rasterTasksId > -1) {
                call.respondRedirect("./${RasterServices.importIntoRasterData(rasterTasksId)}")
                return@get
            }
            if (mode == 1 && rasterTasksId > -1)
                RasterServices.removeFromRasterTasks(rasterTasksId, dataCacheDirectory)

            call.respondRedirect("./tasks")
        }

        get("/list") {
            val liste: MutableList<RasterData> = emptyList<RasterData>().toMutableList()
            val sql = "SELECT d.id as id, d.name as name, d.dimension as dimension, s.name service_name, " +
                    "p.name as package_name, d.data_complete FROM public.raster_data d" +
                    "   LEFT JOIN public.services s" +
                    "    ON d.service_id = s.id" +
                    "   LEFT JOIN public.packages p" +
                    "    ON d.package_id = p.id" +
                    "   ORDER BY p.name, s.name, d.name ASC"

            transaction {
                exec(sql) { rs ->
                    while (rs.next()) {
                        val id = rs.getInt("id")
                        val name = rs.getString("name")
                        val dimension = rs.getString("dimension") ?: ""
                        val serviceName = rs.getString("service_name") ?: ""
                        val packageName = rs.getString("package_name") ?: ""
                        val dataComplete = rs.getBoolean("data_complete")
                        liste.add(RasterData(id, name, dimension, serviceName, packageName, dataComplete))
                    }
                }
            }
            call.respond(FreeMarkerContent("07_RasterList.ftl", mapOf("result" to liste)))
        }

        get("/rasterListAction") {
            call.request.queryParameters["rasterId"]?.toIntOrNull()?.let {
                RasterServices.removeFromRasterData(it, dataCacheDirectory)
            }
            call.respondRedirect("./list")
        }

        get("/{id}") {
            val model = mutableMapOf<String, Any>()
            call.parameters["id"]?.toIntOrNull()?.let {
                transaction {
                    model["combinations"] = TableRasterData.select { TableRasterData.id neq it }.map {
                        "${it[TableRasterData.packageId]}_${it[TableRasterData.serviceId]}"
                    }.distinct().joinToString()

                    TableRasterData.select { TableRasterData.id eq it }.first().apply {
                        TableRasterData.columns.forEachIndexed { idx, ele ->
                            this[ele.table.columns[idx]]?.let { model[ele.name] = this[ele.table.columns[idx]] as Any }
                        }
                    }

                    model["statistics"]?.let {
                        val quartils = RasterServices.getQuartilsFromStatistics(model["statistics"])
                        if (quartils.size == 4) {
                            model["q1"] = quartils[0].toString()
                            model["q2"] = quartils[1].toString()
                            model["q3"] = quartils[2].toString()
                            model["q4"] = quartils[3].toString()
                        }
                    }
                    model["packageList"] = TablePackages.select { TablePackages.deleted eq null }
                        .orderBy(TablePackages.name, SortOrder.ASC)
                        .map { mapOf("id" to it[TablePackages.id].toString(), "name" to it[TablePackages.name]) }
                    model["serviceList"] = TableServices.select { TableServices.deleted eq null }
                        .orderBy(TableServices.name, SortOrder.ASC)
                        .map { mapOf("id" to it[TableServices.id].toString(), "name" to it[TableServices.name]) }
                }
            }
            call.respond(FreeMarkerContent("08_RasterData.ftl", model))
        }

        get("/dataAction") {
            val id = call.request.queryParameters["id"]?.toIntOrNull() ?: -1
            val name = call.request.queryParameters["name_"].toString()
            val packageId = call.request.queryParameters["packageId"]?.toIntOrNull() ?: -1
            val serviceId = call.request.queryParameters["serviceId"]?.toIntOrNull() ?: -1
            val dimension = call.request.queryParameters["dimension"] ?: ""
            var geoserverLayerName = call.request.queryParameters["geoserverLayerName"]
            if (geoserverLayerName.isNullOrEmpty()) geoserverLayerName = null
            val geoserverWorkingSpace = if (geoserverLayerName.isNullOrEmpty())
                null
            else
                config.propertyOrNull("geoserver.workspace")?.getString() ?: "ECO"

            val xxx = call.request.queryParameters["q3"]?.replace(" ", "")
            println(xxx)
            val jsonStatistics = RasterServices.makeQuartilsJson(call.request.queryParameters["q1"]?.replace(" ", "")?.replace(",",".")?.toDoubleOrNull(),
                call.request.queryParameters["q2"]?.replace(" ", "")?.replace(",",".")?.toDoubleOrNull(),
                call.request.queryParameters["q3"]?.replace(" ", "")?.replace(",",".")?.toDoubleOrNull(),
                call.request.queryParameters["q4"]?.replace(" ", "")?.replace(",",".")?.toDoubleOrNull())

            if (id > -1 && packageId > -1 && serviceId > -1)
                transaction {
                    TableRasterData.update({ TableRasterData.id eq id }) {
                        it[TableRasterData.name] = name
                        it[TableRasterData.packageId] = packageId
                        it[TableRasterData.serviceId] = serviceId
                        it[TableRasterData.dimension] = dimension
                        it[TableRasterData.dataComplete] = true
                        it[TableRasterData.geoserverLayerName] = geoserverLayerName
                        it[TableRasterData.geoserverWorkingSpace] = geoserverWorkingSpace
                        if (jsonStatistics != null)
                            it[TableRasterData.statistics] = jsonStatistics
                    }
                }

            call.respondRedirect("./list")
        }
    }
}
