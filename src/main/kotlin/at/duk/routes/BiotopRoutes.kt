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

import at.duk.models.biotop.ClassData
import at.duk.models.biotop.HierarchyData
import at.duk.models.biotop.ProjectData
import at.duk.services.AdminServices
import at.duk.services.AdminServices.isServiceReachable
import at.duk.services.ApiServices
import at.duk.services.BiotopServices
import at.duk.services.BiotopServices.getListOfFeatures
import at.duk.services.BiotopServices.getListOfLayers
import at.duk.tables.biotop.TableClasses
import at.duk.tables.biotop.TableHierarchy
import at.duk.tables.biotop.TableProjects
import com.fasterxml.jackson.module.kotlin.jacksonObjectMapper
import io.ktor.http.content.*
import io.ktor.server.application.*
import io.ktor.server.config.*
import io.ktor.server.freemarker.*
import io.ktor.server.request.*
import io.ktor.server.response.*
import io.ktor.server.routing.*
import org.jetbrains.exposed.sql.*
import org.jetbrains.exposed.sql.transactions.transaction
import java.io.File
import java.nio.file.Paths
import java.time.LocalDateTime

fun Route.biotopRouting(config: ApplicationConfig) {
    val geoserverWorkspace = config.propertyOrNull("geoserver.workspace")?.getString() ?: "ECO"
    val geoserverUrl = config.propertyOrNull("geoserver.url")?.getString()
    val collectoryUrl = config.propertyOrNull("atlas.collectory")?.getString()
    val dataCacheDirectory = config.propertyOrNull("dataCache.directory")?.getString() ?:
    Paths.get("").toAbsolutePath().toString()


    route("/admin/biotop") {
        post("/{projectId}/removeGeoserverData") {
            call.parameters["projectId"]?.toIntOrNull()?.let { projectId ->
                transaction {
                    TableProjects.update({ TableProjects.id eq projectId }) {
                        it[TableProjects.geoserverLayer] = null
                        it[TableProjects.geoserverWorkspace] = null
                        it[TableProjects.colTypesCode] = null
                        it[TableProjects.colSpeciesCode] = null
                        it[TableProjects.updated] = LocalDateTime.now()
                    }
                }
            }
            call.respondRedirect("/admin/biotop/projects")
        }

        get("/projects") {
            val errorList = mutableListOf<String>()
            val isGR = if (geoserverUrl != null) isServiceReachable(geoserverUrl) else false
            val isCR = if (collectoryUrl != null) isServiceReachable(collectoryUrl) else false
            if (!isGR) errorList.add("Verbindung zu Geoserver nicht möglich! --> Check Konfiguration bzw. Service!")
            if (!isCR) errorList.add("Verbindung zu Collectory nicht möglich! --> Check Konfiguration bzw. Service!")

            val projectsList = mutableListOf<ProjectData>()

            transaction {
                projectsList.addAll(
                    TableProjects.select { TableProjects.deleted eq null }.orderBy(TableProjects.name).map
                    { rs -> ProjectData(rs[TableProjects.id].value, rs[TableProjects.name], rs[TableProjects.enabled]) }
                )
            }
            call.respond(
                FreeMarkerContent(
                    "15_BTProjects.ftl",
                    mapOf("result" to projectsList, "maxCount" to projectsList.size, "errorList" to errorList,
                        "isGR" to isGR, "isCR" to isCR)
                )
            )
        }
        get("/{projectId}/saveGeoserverData") {
            val layer = call.request.queryParameters["layer"]
            val typeFeature = call.request.queryParameters["typeFeature"]
            val nameFeature = call.request.queryParameters["nameFeature"]
            val projectId = call.parameters["projectId"]?.toIntOrNull()
            val workspace = call.request.queryParameters["workspace"]
            if (projectId != null && layer != null && typeFeature != null && workspace != null) {
                transaction {
                    TableProjects.update({ TableProjects.id eq projectId }) {
                        it[TableProjects.geoserverLayer] = layer
                        it[TableProjects.geoserverWorkspace] = workspace
                        it[TableProjects.colTypesCode] = typeFeature
                        it[TableProjects.colTypesDescription] = nameFeature
                        it[TableProjects.updated] = LocalDateTime.now()
                    }
                }
            }
            call.respondRedirect("/admin/biotop/projects")
        }

        get("/{projectId}/server") {
            call.parameters["projectId"]?.toIntOrNull()?.let { projectId ->
                val project: ProjectData? = ProjectData.getById(projectId)
                val listOfFeatures = call.request.queryParameters["layer"]?.let { layer ->
                    getListOfFeatures(layer, geoserverUrl, geoserverWorkspace)
                } ?: emptyList()
                val listOfLayers = if (project?.geoserverLayer == null) {
                    getListOfLayers(geoserverUrl, geoserverWorkspace)
                } else emptyList()

                call.respond(FreeMarkerContent("17_BTGeoServer.ftl",
                    mapOf("project" to project, "listOfLayers" to listOfLayers,
                        "urlRedirect" to this.context.request.path(),
                        "listOfFeatures" to listOfFeatures.sorted(),
                        "selectedLayer" to call.request.queryParameters["layer"],
                        "workspace" to geoserverWorkspace)
                ))
            }
        }

        post("/projectUpdate") {
            val formParameters = call.receiveParameters()
            when (formParameters["mode"]?.toIntOrNull() ?: -1) {
                0 -> if (formParameters["name"] != "")
                    BiotopServices.projectInsertOrUpdate(formParameters)
                1 -> BiotopServices.projectDelete(formParameters, dataCacheDirectory)
                else -> { }
            }
            call.respondRedirect("./projects")
        }

        get("/{projectId}/metadata") {
            call.parameters["projectId"]?.toIntOrNull()?.let { projectId ->
                val project: ProjectData? = ProjectData.getById(projectId)

                call.respond(FreeMarkerContent("16_BTMetaData.ftl",
                    mapOf("project" to project)
                ))
            }
        }
        get("/{projectId}/saveMetaData") {
            call.parameters["projectId"]?.toIntOrNull()?.let {
                transaction {
                    TableProjects.update({ TableProjects.id eq it }) {
                        it[TableProjects.enabled] = call.request.queryParameters["enabled"] == "on"
                        it[TableProjects.resource] = call.request.queryParameters["resource"]
                        it[TableProjects.epoch] = call.request.queryParameters["epoch"]
                        it[TableProjects.area] = call.request.queryParameters["area"]
                        it[TableProjects.updated] = LocalDateTime.now()
                    }
                }
            }
            call.respondRedirect("/admin/biotop/projects")
        }
        get("/{projectId}/metadataJson") {
            call.parameters["projectId"]?.toIntOrNull()?.let { projectId ->
                //val project: ProjectData? = ProjectData.getById(projectId)

                ProjectData.getById(projectId)?.let { project ->
                    val url = "$collectoryUrl/dataResource/${project.resource}"
                    val dataResourceExists = if (collectoryUrl != null) isServiceReachable(url) else false

                    val mapper = jacksonObjectMapper()
                    val json = mapper.writerWithDefaultPrettyPrinter().writeValueAsString(
                        mapper.readTree(ApiServices.generateProjectResponse(projectId, config))
                    ).replace("\n", "<br>").replace(" ", "&nbsp;")

                    call.respond(
                        FreeMarkerContent(
                            "16.1_BTMetaDataJson.ftl",
                            mapOf("project" to project, "json" to json, "dataResourceExists" to dataResourceExists)
                        )
                    )
                }
            }
        }

        get("/classes") {
            val classesList = mutableListOf<ClassData>()

            transaction {
                classesList.addAll(
                    TableClasses.select { TableClasses.deleted eq null }.orderBy(TableClasses.description).map
                    { rs -> ClassData(rs[TableClasses.id].value, rs[TableClasses.description]) }
                )
            }
            call.respond(
                FreeMarkerContent(
                    "19_BTClasses.ftl",
                    mapOf("result" to classesList, "maxCount" to classesList.size)
                )
            )
        }

        post("/classes/classTypeUpdate") {
            val formParameters = call.receiveParameters()
            when (formParameters["mode"]?.toIntOrNull() ?: -1) {
                0 -> if (formParameters["name"] != "")
                    BiotopServices.classInsertOrUpdate(formParameters)
                1 -> BiotopServices.classDelete(formParameters)
                else -> { }
            }
            call.respondRedirect("/admin/biotop/classes")
        }

        post("/classes/{classId}/classTypeUpload") {
            //val tmpFileName = AdminServices.getUniqueSVGName(svgDataFolder)

            var fileName: String = ""

            val classId = call.parameters["classId"]?.toIntOrNull() ?: return@post
            val classesDataFolder = AdminServices.getClassDataFolder(dataCacheDirectory, classId)

            call.receiveMultipart().forEachPart { part ->
                when (part) {
                    is PartData.FileItem -> {
                        fileName = part.originalFileName as String
                        File(classesDataFolder.resolve(fileName).toString())
                            .writeBytes(part.streamProvider().readBytes())
                    }
                    else -> {}
                }
            }
            // analyze csv file and return with message
            var report = "No Report available!"
            if (fileName.isNotEmpty())
                report = BiotopServices.classCSVProcessing(classesDataFolder.resolve(fileName).toString(), classId)

            call.respondRedirect("/admin/biotop/classes/$classId")
        }

        get("/classes/{classId}") {
            call.parameters["classId"]?.toIntOrNull()?.let { classId ->
                val classData: ClassData? = ClassData.getById(classId)

                call.respond(FreeMarkerContent("20_BTClass.ftl",
                    mapOf("classData" to classData)
                ))
            }
        }

        get("/classes/{classId}/types") {
            call.parameters["classId"]?.toIntOrNull()?.let { classId ->
                val classData: ClassData? = ClassData.getById(classId)
                val typeList = mutableListOf<HierarchyData>()
                val indentMap = mutableMapOf<Int, String>()
                transaction {
                    TableHierarchy.select { TableHierarchy.classId eq classId and (TableHierarchy.projectId eq -1) }.orderBy(TableHierarchy.sortCode)
                        .forEach {
                            typeList.add(HierarchyData.mapRSToHierarchyData(it))
                            val cnt = it[TableHierarchy.levelNumber]
                            if (!indentMap.containsKey(cnt)) {
                                var nbsp = ""
                                for (i in 0..cnt) nbsp += "&nbsp;&nbsp;"
                                indentMap[cnt] = nbsp
                            }

                    }
                }

                call.respond(FreeMarkerContent("21_BTClassHierarchy.ftl",
                    mapOf("classData" to classData, "typeList" to typeList, "indentList" to indentMap.toSortedMap().values.toList() )
                ))
            }
        }




    }
}
