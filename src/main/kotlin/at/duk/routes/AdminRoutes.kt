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

import at.duk.DataCache
import at.duk.models.CategoryData
import at.duk.models.ServiceData
import at.duk.services.AdminServices
import at.duk.services.AdminServices.getSVGDataFolder
import at.duk.services.AdminServices.getUniqueSVGName
import at.duk.services.AdminServices.resolveSVGPath
import at.duk.tables.TableCategories
import at.duk.tables.TableRasterData
import at.duk.tables.TableServices
import at.duk.tables.TableServices.updateTableServices
import io.ktor.http.content.*
import io.ktor.server.http.content.*
import io.ktor.server.application.*
import io.ktor.server.config.*
import io.ktor.server.freemarker.*
import io.ktor.server.request.*
import io.ktor.server.response.*
import io.ktor.server.routing.*
import kotlinx.coroutines.job
import kotlinx.coroutines.launch
import org.jetbrains.exposed.sql.*
import org.jetbrains.exposed.sql.transactions.transaction
import java.io.File
import java.nio.file.Paths

fun Route.adminRouting(config: ApplicationConfig) {
    val dataCacheDirectory =
        config.propertyOrNull("dataCache.directory")?.getString() ?: Paths.get("").toAbsolutePath().toString()

    route("/admin") {
        get("") {

            call.respond(FreeMarkerContent("01_Start.ftl", null))
        }

        get("/categories") {
            val idsInUse = mutableListOf<Int>()
            val categoriesList = mutableListOf<CategoryData>()

            transaction {
                categoriesList.addAll(
                    TableCategories.select { TableCategories.deleted eq null }.orderBy(TableCategories.name)
                        .map { rs -> CategoryData(rs[TableCategories.id].value, rs[TableCategories.name]) }
                )
                idsInUse.addAll(
                    TableServices.select { TableServices.deleted eq null }.map {
                        it[TableServices.categoryId]
                    }
                )
            }

            call.respond(
                FreeMarkerContent(
                    "02_Categories.ftl",
                    mapOf(
                        "result" to categoriesList, "maxCount" to categoriesList.size, "idsInUse" to idsInUse.distinct()
                    )
                )
            )
        }

        post("/categoryUpdate") {
            val formParameters = call.receiveParameters()
            when (formParameters["mode"]?.toIntOrNull() ?: -1) {
                0 -> if (formParameters["name"] != "")
                    AdminServices.categoryInsertOrUpdate(formParameters)

                1 -> AdminServices.categoryDelete(formParameters)
                else -> {}
            }
            call.respondRedirect("./categories")
        }

        get("/services") {
            val idsInUse = mutableListOf<Int>()
            val servicesList = mutableListOf<ServiceData>()
            val categoriesList = mutableListOf<CategoryData>()

            transaction {
                servicesList.addAll(
                    TableServices.select { TableServices.deleted eq null }.orderBy(TableServices.name)
                        .map { rs ->
                            ServiceData(
                                rs[TableServices.id].value, rs[TableServices.name], null,
                                rs[TableServices.categoryId], resolveSVGPath(rs[TableServices.svgPath]),
                                rs[TableServices.originalSvgName] ?: "dummy.svg"
                            )
                        }
                )
                idsInUse.addAll(
                    TableRasterData.selectAll().map { rs -> rs[TableRasterData.serviceId] ?: -1 }
                )
                categoriesList.addAll(
                    TableCategories.select { TableCategories.deleted eq null }.orderBy(TableCategories.name)
                        .map { rs -> CategoryData(rs[TableCategories.id].value, rs[TableCategories.name]) }
                )
            }

            call.respond(
                FreeMarkerContent(
                    "03_Services.ftl",
                    mapOf(
                        "result" to servicesList, "maxCount" to servicesList.size,
                        "idsInUse" to idsInUse.distinct(), "categoriesList" to categoriesList
                    )
                )
            )
        }

        post("/serviceUpdate") {
            val formParameters = call.receiveParameters()
            when (formParameters["mode"]?.toIntOrNull() ?: -1) {
                0 -> if (formParameters["name"] != "" && (formParameters["categoryId"]?.toIntOrNull() ?: -1) != -1)
                    AdminServices.serviceInsertOrUpdate(formParameters)

                1 -> AdminServices.serviceDelete(formParameters)
                else -> {}
            }
            call.respondRedirect("./services")
        }

        post("/serviceSVGDelete") {
            call.receiveParameters()["id"]?.toIntOrNull()?.let {
                transaction {
                    TableServices.removeSVG(it, File(dataCacheDirectory).resolve("svg").toString())
                }
            }
            call.respondRedirect("./services")
        }

        post("/serviceSVGUpdate") {
            val svgDataFolder = getSVGDataFolder(dataCacheDirectory)
            val tmpFileName = getUniqueSVGName(svgDataFolder)

            lateinit var fileName: String
            var uploadId: Int? = null

            call.receiveMultipart().forEachPart { part ->
                when (part) {
                    is PartData.FormItem -> {
                        if (part.name == "uploadId") uploadId = part.value.toIntOrNull()
                    }

                    is PartData.FileItem -> {
                        fileName = part.originalFileName as String
                        File(svgDataFolder.resolve(tmpFileName).toString())
                            .writeBytes(part.streamProvider().readBytes())
                    }

                    else -> {}
                }
            }

            if (File(fileName).extension == "svg" && svgDataFolder.resolve(tmpFileName).length() > 0)
                updateTableServices(uploadId, svgDataFolder, tmpFileName, fileName)
            else
                svgDataFolder.resolve(tmpFileName).delete()

            call.respondRedirect("./services")
        }

        get("/cache/delete") {
            launch {
                val filePath = File(dataCacheDirectory).resolve("AlaNavigation").resolve("navigation.html")
                if (File("$filePath").exists()) File("$filePath").delete()
                DataCache.loadNavigation(config)
                // Wait until the file is saved - to prevent responses before the navigation is cached!
                if (!File("$filePath").exists())
                    this.coroutineContext.job.join()
            }
            call.respond(FreeMarkerContent("14_CacheDelete.ftl", null))
        }
    }
}
