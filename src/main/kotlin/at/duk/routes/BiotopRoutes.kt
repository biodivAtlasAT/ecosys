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
import at.duk.models.biotop.StyleData
import at.duk.services.AdminServices
import at.duk.services.AdminServices.isServiceReachable
import at.duk.services.ApiServices
import at.duk.services.BiotopServices
import at.duk.services.BiotopServices.classTypesDelete
import at.duk.services.BiotopServices.getListOfFeatures
import at.duk.services.BiotopServices.getListOfLayers
import at.duk.services.BiotopServices.matchFeatures
import at.duk.services.GeoServerService
import at.duk.tables.biotop.TableClasses
import at.duk.tables.biotop.TableHierarchy
import at.duk.tables.biotop.TableProjects
import com.fasterxml.jackson.module.kotlin.jacksonObjectMapper
import io.ktor.client.*
import io.ktor.client.engine.cio.*
import io.ktor.client.request.*
import io.ktor.client.request.forms.*
import io.ktor.client.statement.*
import io.ktor.http.*
import io.ktor.http.content.*
import io.ktor.server.application.*
import io.ktor.server.config.*
import io.ktor.server.freemarker.*
import io.ktor.server.request.*
import io.ktor.server.response.*
import io.ktor.server.routing.*
import org.jetbrains.exposed.sql.and
import org.jetbrains.exposed.sql.select
import org.jetbrains.exposed.sql.transactions.transaction
import org.jetbrains.exposed.sql.update
import java.io.*
import java.nio.file.Paths
import java.time.LocalDateTime
import java.nio.charset.StandardCharsets.UTF_8
import java.util.zip.GZIPOutputStream


fun Route.biotopRouting(config: ApplicationConfig) {
    val geoServer = GeoServerService(config)

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
            //val isGR = if (geoserverUrl != null) isServiceReachable(geoserverUrl) else false
            //val isCR = if (collectoryUrl != null) isServiceReachable(collectoryUrl) else false

            val isGR = true
            val isCR = true
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
                val classesList = mutableListOf<ClassData>()

                transaction {
                    classesList.addAll(
                        TableClasses.select { TableClasses.deleted eq null and (TableClasses.filename neq null)}.orderBy(TableClasses.description).map
                        { rs -> ClassData(rs[TableClasses.id].value, rs[TableClasses.description], rs[TableClasses.filename]) }
                    )
                }
                call.respond(FreeMarkerContent("16_BTMetaData.ftl",
                    mapOf("project" to project, "classesList" to classesList)
                ))
            }
        }
        post("/{projectId}/saveMetaData") {
            val projectId = call.parameters["projectId"]?.toIntOrNull() ?: return@post
            val projectsDataFolder = AdminServices.getProjectDataFolder(dataCacheDirectory, projectId)
            var fileName: String? = null
            var deleteMap = false
            val project = ProjectData.getById(projectId)?:return@post
            project.enabled = false

            call.receiveMultipart().forEachPart { part ->
                when (part) {
                    is PartData.FormItem -> {
                        if (part.name == "deleteMap") deleteMap = part.value.toBoolean()
                        if (part.name == "enabled") project.enabled = true
                        if (part.name == "resource") project.resource = if (part.value == "") null else part.value
                        if (part.name == "epoch") project.epoch = if (part.value == "") null else part.value
                        if (part.name == "area") project.area = if (part.value == "") null else part.value
                        if (part.name == "classId") project.classId = part.value?.toIntOrNull()?:-1
                        if (part.name == "classInfo") project.classInfo = if (part.value == "") null else part.value
                    }
                    is PartData.FileItem -> {
                        fileName = part.originalFileName as String?
                        project.classMap = part.originalFileName as String?
                        fileName?.let {
                            if (fileName != "")
                                File(projectsDataFolder.resolve(fileName!!).toString())
                                    .writeBytes(part.streamProvider().readBytes())
                        }
                    }
                    else -> {}
                }
            }

            // todo: check structure of Map-file

            if (deleteMap) {
                project.classMap = null
                projectsDataFolder.deleteRecursively()
            }
            transaction {
                TableProjects.update({ TableProjects.id eq projectId }) {
                    it[TableProjects.enabled] = project.enabled
                    it[TableProjects.resource] = project.resource
                    it[TableProjects.epoch] = project.epoch
                    it[TableProjects.area] = project.area
                    it[TableProjects.classId] = project.classId
                    it[TableProjects.classInfo] = null
                    if (project.classInfo != "" && project.classId == -1)
                        it[TableProjects.classInfo] = project.classInfo
                    it[TableProjects.classMap] = project.classMap
                    it[TableProjects.updated] = LocalDateTime.now()
                }
            }

            call.respondRedirect("/admin/biotop/projects")
        }
        get("/{projectId}/metadataJson") {
            call.parameters["projectId"]?.toIntOrNull()?.let { projectId ->

                ProjectData.getById(projectId)?.let { project ->
                    val url = "$collectoryUrl/dataResource/${project.resource}"
                    val dataResourceExists = if (collectoryUrl != null && project.resource != null) isServiceReachable(url) else false

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
                    { rs -> ClassData(rs[TableClasses.id].value, rs[TableClasses.description], rs[TableClasses.filename]) }
                )
            }
            call.respond(
                FreeMarkerContent(
                    "19_BTClasses.ftl",
                    mapOf("result" to classesList, "maxCount" to classesList.size)
                )
            )
        }

        post("/classes/classUpdate") {
            val formParameters = call.receiveParameters()
            when (formParameters["mode"]?.toIntOrNull() ?: -1) {
                0 -> if (formParameters["name"] != "")
                    BiotopServices.classInsertOrUpdate(formParameters)
                1 -> BiotopServices.classDelete(formParameters, dataCacheDirectory)
                else -> { }
            }
            call.respondRedirect("/admin/biotop/classes")
        }

        post("/classes/{classId}/classTypeUpload") {
            val classId = call.parameters["classId"]?.toIntOrNull() ?: return@post
            val classesDataFolder = AdminServices.getClassDataFolder(dataCacheDirectory, classId)
            var fileName: String? = null

            call.receiveMultipart().forEachPart { part ->
                when (part) {
                    is PartData.FileItem -> {
                        fileName = part.originalFileName as String? ?:"noFilenamefound"
                        File(classesDataFolder.resolve(fileName!!).toString())
                            .writeBytes(part.streamProvider().readBytes())
                    }
                    else -> {}
                }
            }
            // analyze csv file and return with message
            var report = "No Report available!"
            fileName?.let { fn ->
                report = BiotopServices.classCSVProcessing(classesDataFolder.resolve(fn).toString(), classId)
                transaction {
                    TableClasses.update({ TableClasses.id eq classId }) {
                        it[TableClasses.filename] = fn
                        it[TableClasses.updated] = LocalDateTime.now()
                    }
                }
            }

            call.respondRedirect("/admin/biotop/classes")
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

        post("/classes/{classId}/typesRemove") {
            call.parameters["classId"]?.toIntOrNull()?.let { classId ->
                classTypesDelete(classId, dataCacheDirectory)
            }
            call.respondRedirect("/admin/biotop/classes")
        }

        get("/{projectId}/matching") {
            call.parameters["projectId"]?.toIntOrNull()?.let { projectId ->
                ProjectData.getById(projectId)?.let { project ->
                    // workaoround
                    //project.geoserverDBFfile = "D:/reinhardt/firma/OeKOLEITA/shapeFiles/KLEINREGIONEN/KLEINREGIONENPolygon.dbf"
                    //project.geoserverDBFfile = "D:/reinhardt/firma/OeKOLEITA/vonKunden/Mail_260122_Lebensraumtypen/shape/OEKOLEITA_Biotopkartierung.dbf"
                    //project.geoserverDBFfile = "D:/reinhardt/firma/OeKOLEITA/vonKunden/Mail_260122_Lebensraumtypen/shape/OEKOLEITA_Biotopkartierung.dbf"
                    //project.geoserverDBFfile = "D:/reinhardt/firma/OeKOLEITA/shapeFiles/bezirk_wgs84_iso/bezirk_wgs84_iso.dbf"
                    project.geoserverDBFfile = "D:/reinhardt/firma/OeKOLEITA/Testdaten/bundesland_wgs84_iso/bundesland_wgs84_iso.dbf"
                    //val matchAlt = BiotopServices.getLayerDataFromWFSService(project, config)
                    //println(matchAlt)

                    matchFeatures(config, project, BiotopServices.getLayerDataFromWFSService(project, config))
                }
                call.respondRedirect("/admin/biotop/projects")
            }
        }
        get("/{projectId}/types") {
            call.parameters["projectId"]?.toIntOrNull()?.let { projectId ->
                ProjectData.getById(projectId)?.let { project ->
                    val typeList = mutableListOf<HierarchyData>()
                    val indentMap = mutableMapOf<Int, String>()
                    transaction {
                        TableHierarchy.select { TableHierarchy.projectId eq projectId }
                            .orderBy(TableHierarchy.sortCode)
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

                typeList.filter { it.isLeaf }.forEach {
                    val r = Integer.toHexString(kotlin.random.Random.nextInt(0,255))
                    val g = Integer.toHexString(kotlin.random.Random.nextInt(0,255))
                    val b = Integer.toHexString(kotlin.random.Random.nextInt(0,255))
                    it.color = "#$r$g$b"
                    it.mappedKeyCode = if (it.mappedKeyCode == null || it.mappedKeyCode == "") it.keyCode else it.mappedKeyCode
                }

                    val sld = StyleData(project, typeList).generateSLD()

                    geoServer.getStyles()?.let { styleList ->
                        if (!styleList.contains(project.geoServerStyleName))
                            geoServer.createStyle(project)
                    }

                    geoServer.getStyles()?.let { styleList ->
                        if (styleList.any { it == project.geoServerStyleName }) {
                            if (geoServer.putSLDFile(project, sld))
                                geoServer.setDefaultStyle(project)
                        }
                    }

                    call.respond(FreeMarkerContent("22_BTProjectHierarchy.ftl",
                    mapOf("project" to project, "typeList" to typeList,
                        "indentList" to indentMap.toSortedMap().values.toList(),
                        "sld" to sld)
                    ))
                }
            }
        }

    }


}

fun myGzip(content: String): ByteArray {
    val bos = ByteArrayOutputStream()
    GZIPOutputStream(bos).bufferedWriter(UTF_8).use { it.write(content) }
    return bos.toByteArray()
}
