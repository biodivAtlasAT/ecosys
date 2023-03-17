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
import at.duk.services.BiotopServices.getHierarchyListFromDB
import at.duk.services.BiotopServices.matchFeatures
import at.duk.services.BiotopServices.setCQLFilter
import at.duk.services.BiotopServices.speciesRenewComplete
import at.duk.services.BiotopServices.speciesRenewValues
import at.duk.services.GeoServerService
import at.duk.tables.biotop.*
import at.duk.utils.CSVChecker
import com.fasterxml.jackson.module.kotlin.jacksonObjectMapper
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

fun Route.biotopRouting(config: ApplicationConfig) {
    val geoServer = GeoServerService(config)

    val geoserverWorkspace = config.propertyOrNull("geoserver.workspace")?.getString() ?: "ECO"
    val geoserverUrl = config.propertyOrNull("geoserver.url")?.getString() ?: ""
    val collectoryUrl = config.propertyOrNull("atlas.collectory")?.getString()
    val dataCacheDirectory = config.propertyOrNull("dataCache.directory")?.getString() ?:
    Paths.get("").toAbsolutePath().toString()

    route("/admin/biotop") {
        post("/{projectId}/removeGeoserverData") {
            call.parameters["projectId"]?.toIntOrNull()?.let { projectId ->
                ProjectData.getById(projectId)?.let {
                    BiotopServices.removeSpeciesFile(it, dataCacheDirectory)
                }

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
            val projectsList = transaction {
                    TableProjects.select { TableProjects.deleted eq null }
                        .orderBy(TableProjects.name)
                        .map { ProjectData.mapRSToProjectData(it) }
            }
            val report = call.request.queryParameters["report"]
            call.respond(
                FreeMarkerContent(
                    "15_BTProjects.ftl",
                    mapOf(
                        "result" to projectsList, "maxCount" to projectsList.size, "report" to report,
                    )
                )
            )
        }
        get("/{projectId}/saveGeoserverData") {
            val layer = call.request.queryParameters["layer"]
            val typeFeature = call.request.queryParameters["typeFeature"] ?: "-1"
            val nameFeature = call.request.queryParameters["nameFeature"] ?: "-1"
            val speciesFeature = call.request.queryParameters["speciesFeature"]
            val projectId = call.parameters["projectId"]?.toIntOrNull()
            val workspace = call.request.queryParameters["workspace"]

            if (projectId != null && layer != null && typeFeature != "-1" && nameFeature != "-1" && workspace != null) {
                val mapOfFeature = call.request.queryParameters["layer"]?.let { layer ->
                        geoServer.getListOfFeatures(layer)
                    } ?: emptyMap()

                transaction {
                    TableProjects.update({ TableProjects.id eq projectId }) {
                        it[TableProjects.geoserverLayer] = layer
                        it[TableProjects.geoserverWorkspace] = workspace
                        it[TableProjects.colTypesCode] = typeFeature
                        it[TableProjects.colTypesCodeType] = mapOfFeature[typeFeature]
                        it[TableProjects.colTypesDescription] = nameFeature
                        it[TableProjects.colSpeciesCode] = if (speciesFeature == "-1") null else speciesFeature
                        it[TableProjects.updated] = LocalDateTime.now()
                    }
                }
            }
            call.respondRedirect("/admin/biotop/projects")
        }

        get("/{projectId}/server") {
            call.parameters["projectId"]?.toIntOrNull()?.let { projectId ->
                call.respond(
                    FreeMarkerContent(
                        "17_BTGeoServer.ftl",
                        mapOf(
                            "project" to ProjectData.getById(projectId),
                            "listOfLayers" to geoServer.getListOfLayers(),
                            "urlRedirect" to this.context.request.path(),
                            "listOfFeatures" to geoServer.getListOfFeatures(
                                call.request.queryParameters["layer"]
                            ).keys.sorted(),
                            "selectedLayer" to call.request.queryParameters["layer"],
                            "workspace" to geoserverWorkspace
                        )
                    )
                )
            }
        }

        post("/projectUpdate") {
            val formParameters = call.receiveParameters()
            when (formParameters["mode"]?.toIntOrNull() ?: -1) {
                0 -> if (formParameters["name"] != "")
                    BiotopServices.projectInsertOrUpdate(formParameters)

                1 -> BiotopServices.projectDelete(formParameters, dataCacheDirectory)
                else -> {}
            }
            call.respondRedirect("./projects")
        }

        get("/{projectId}/metadata") {
            call.parameters["projectId"]?.toIntOrNull()?.let { projectId ->
                val classesList = mutableListOf<ClassData>()
                transaction {
                    classesList.addAll(
                        TableClasses.select { TableClasses.deleted eq null and (TableClasses.filename neq null) }
                            .orderBy(TableClasses.description).map
                            { rs ->
                                ClassData(
                                    rs[TableClasses.id].value,
                                    rs[TableClasses.description],
                                    rs[TableClasses.filename]
                                )
                            }
                    )
                }
                call.respond(
                    FreeMarkerContent(
                        "16_BTMetaData.ftl",
                        mapOf("project" to ProjectData.getById(projectId), "classesList" to classesList)
                    )
                )
            }
        }

        post("/{projectId}/saveMetaData") {
            val projectId = call.parameters["projectId"]?.toIntOrNull() ?: return@post
            val projectsDataFolder = AdminServices.getProjectDataFolder(dataCacheDirectory, projectId)
            var fileName: String? = null
            var deleteMap = false
            val project = ProjectData.getById(projectId) ?: return@post
            project.enabled = false

            call.receiveMultipart().forEachPart { part ->
                when (part) {
                    is PartData.FormItem -> {
                        if (part.name == "deleteMap") deleteMap = part.value.toBoolean()
                        if (part.name == "enabled") project.enabled = true
                        if (part.name == "resource") project.resource = if (part.value == "") null else part.value
                        if (part.name == "epoch") project.epoch = if (part.value == "") null else part.value
                        if (part.name == "area") project.area = if (part.value == "") null else part.value
                        if (part.name == "classId") project.classId = part.value?.toIntOrNull() ?: -1
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

            if (deleteMap) {
                project.classMap = null
                projectsDataFolder.deleteRecursively()
            }

            var report = "<h4>Die CSV-Datei wurde %myOKorNOT% verarbeitet!</h4>"
            var rc: Boolean? = null
            if (!deleteMap && fileName != null && fileName != "") {
                val ret = CSVChecker(project, dataCacheDirectory, fileName!!).checkStructure(2, 2, emptyList())
                rc = ret.first
                report += ret.second.joinToString(prefix = "<ul>", postfix = "</ul>", separator = "") {
                    "<li>$it</li>"
                }
                if (!rc) {
                    project.classMap = null
                    report = report.replace("%myOKorNOT%", "NICHT")
                } else
                    report = report.replace("%myOKorNOT%", "erfolgreich")
            }
            transaction {
                TableProjects.update({ TableProjects.id eq projectId }) {
                    it[TableProjects.enabled] = project.enabled
                    it[TableProjects.resource] = project.resource
                    it[TableProjects.epoch] = project.epoch
                    it[TableProjects.area] = project.area
                    it[TableProjects.classId] = project.classId
                    it[TableProjects.classInfo] = if (project.classInfo.isNullOrEmpty()) null else project.classInfo
                    it[TableProjects.classMap] = project.classMap
                    it[TableProjects.updated] = LocalDateTime.now()
                }
            }
            if (rc == null)
                call.respondRedirect("/admin/biotop/projects")
            else
                call.respondRedirect("/admin/biotop/projects?report=$report")
        }
        get("/{projectId}/metadataJson") {
            call.parameters["projectId"]?.toIntOrNull()?.let { projectId ->

                ProjectData.getById(projectId)?.let { project ->
                    val url = "$collectoryUrl/dataResource/${project.resource}"
                    val dataResourceExists =
                        if (collectoryUrl != null && project.resource != null) isServiceReachable(url) else false

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
            val usedClassIds = mutableListOf<Int>()
            val report = call.request.queryParameters["report"]

            transaction {
                classesList.addAll(
                    TableClasses.select { TableClasses.deleted eq null }.orderBy(TableClasses.description).map
                    { rs ->
                        ClassData(
                            rs[TableClasses.id].value,
                            rs[TableClasses.description],
                            rs[TableClasses.filename]
                        )
                    }
                )
                usedClassIds.addAll(
                    TableProjects.select { TableProjects.deleted eq null }
                    .map { rs -> rs[TableProjects.classId] }
                    .distinct()
                )
            }
            call.respond(
                FreeMarkerContent(
                    "19_BTClasses.ftl",
                    mapOf(
                        "result" to classesList,
                        "maxCount" to classesList.size,
                        "used_class_ids" to usedClassIds,
                        "report" to report
                    )
                )
            )
        }

        post("/classes/classUpdate") {
            val formParameters = call.receiveParameters()
            when (formParameters["mode"]?.toIntOrNull() ?: -1) {
                0 -> if (formParameters["name"] != "")
                    BiotopServices.classInsertOrUpdate(formParameters)

                1 -> BiotopServices.classDelete(formParameters, dataCacheDirectory)
                else -> {}
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
                        fileName = part.originalFileName as String? ?: "noFilenamefound"
                        File(classesDataFolder.resolve(fileName!!).toString())
                            .writeBytes(part.streamProvider().readBytes())
                    }
                    else -> {}
                }
            }
            // analyze csv file and return with message
            var report = "<h4>Die CSV-Datei wurde %myOKorNOT% verarbeitet!</h4>"
            fileName?.let { fn ->
                val rc = BiotopServices.classCSVProcessing(classesDataFolder.resolve(fn).toString(), classId)
                report += rc.second
                if (rc.first) {
                    report = report.replace("%myOKorNOT%", "erfolgfreich")
                    transaction {
                        TableClasses.update({ TableClasses.id eq classId }) {
                            it[TableClasses.filename] = fn
                            it[TableClasses.updated] = LocalDateTime.now()
                        }
                    }
                } else report = report.replace("%myOKorNOT%", "NICHT")
            }

            call.respondRedirect("/admin/biotop/classes?report=$report")
        }

        get("/classes/{classId}") {
            call.parameters["classId"]?.toIntOrNull()?.let { classId ->
                val classIsInUse = transaction {
                    TableProjects.select { TableProjects.deleted eq null and (TableProjects.classId eq classId) }
                        .map { ProjectData.mapRSToProjectData(it) }.isNotEmpty()
                }

                call.respond(
                    FreeMarkerContent(
                        "20_BTClass.ftl",
                        mapOf("classData" to ClassData.getById(classId), "classIsInUse" to classIsInUse)
                    )
                )
            }
        }

        get("/classes/{classId}/types") {
            call.parameters["classId"]?.toIntOrNull()?.let { classId ->
                val classData: ClassData? = ClassData.getById(classId)
                val typeList = mutableListOf<HierarchyData>()
                val indentMap = mutableMapOf<Int, String>()

                val projectsList = transaction {
                    TableProjects.select { TableProjects.deleted eq null and (TableProjects.classId eq classId) }
                        .orderBy(TableProjects.name)
                        .map { ProjectData.mapRSToProjectData(it) }
                }

                transaction {
                    TableHierarchy.select { TableHierarchy.classId eq classId and (TableHierarchy.projectId eq -1) }
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

                call.respond(
                    FreeMarkerContent(
                        "21_BTClassHierarchy.ftl",
                        mapOf(
                            "classData" to classData, "typeList" to typeList,
                            "indentList" to indentMap.toSortedMap().values.toList(),
                            "projectsList" to projectsList
                        )
                    )
                )
            }
        }

        post("/classes/{classId}/typesUpdate") {
            val formParameters = call.receiveParameters()
            call.parameters["classId"]?.toIntOrNull()?.let { classId ->
                transaction {
                    formParameters.forEach { s, strings ->
                        val pos = s.indexOf("_")
                        val keyCode = s.substring(pos + 1)
                        TableHierarchy.update({
                            TableHierarchy.classId eq classId and (TableHierarchy.keyCode eq keyCode)
                        }) {
                            it[TableHierarchy.color] = strings[0]
                        }
                    }
                    TableClasses.update({ TableClasses.id eq classId }) {
                        it[TableClasses.updated] = LocalDateTime.now()
                    }
                }
            }

            call.respondRedirect("/admin/biotop/classes")
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
                    matchFeatures(config, project, geoServer.getLayerDataFromWFSService(project))

                    val sld = StyleData(
                        project,
                        getHierarchyListFromDB(project),
                        BiotopServices.DEFAULT_LAYER_COLOR
                    ).generateSLD()
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
                }
                call.respondRedirect("/admin/biotop/projects")
            }
        }
        get("/{projectId}/types") {
            val wmsUrl =
                "$geoserverUrl/$geoserverWorkspace/wms?SERVICE=WMS&VERSION=1.1.1&REQUEST=GetMap&FORMAT=" +
                        "image/png&TRANSPARENT=true&STYLES&" +
                        "LAYERS=my_ws_layer&exceptions=application/vnd.ogc.se_inimage&" +
                        "my_cql_filter&SRS=EPSG:4326&WIDTH=768&HEIGHT=330&" +
                        "BBOX=9.129638671875,45.87890625,17.567138671875,49.50439453125"

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

                    typeList.setCQLFilter(project.colTypesCode, project.colTypesCodeType)
                    val checkUrl =
                        wmsUrl.replace("my_ws_layer", "${project.geoserverWorkspace}:${project.geoserverLayer}")
                    call.respond(
                        FreeMarkerContent(
                            "22_BTProjectHierarchy.ftl",
                            mapOf(
                                "project" to project, "typeList" to typeList,
                                "indentList" to indentMap.toSortedMap().values.toList(),
                                "checkUrl" to checkUrl
                            )
                        )
                    )
                }
            }
        }

        get("/{projectId}/species") {
            call.parameters["projectId"]?.toIntOrNull()?.let { projectId ->
                val project: ProjectData? = ProjectData.getById(projectId)
                val listOfCols = mutableListOf<String>()

                if (project?.speciesFileName != null) {
                    val file = AdminServices.getProjectDataFolder(dataCacheDirectory, projectId)
                        .resolve(project.speciesFileName)
                    file.useLines { it.firstOrNull() }?.split(";")?.let { it1 -> listOfCols.addAll(it1) }
                }
                call.respond(
                    FreeMarkerContent(
                        "18_BTArtenListe.ftl",
                        mapOf(
                            "project" to project, "listOfCols" to listOfCols,
                            "urlRedirect" to this.context.request.path(),
                        )
                    )
                )
            }
        }

        post("/{projectId}/speciesFileUpload") {
            val projectId = call.parameters["projectId"]?.toIntOrNull() ?: return@post
            val projectDataFolder = AdminServices.getProjectDataFolder(dataCacheDirectory, projectId)
            var fileName: String? = null

            call.receiveMultipart().forEachPart { part ->
                when (part) {
                    is PartData.FileItem -> {
                        fileName = part.originalFileName as String? ?: "noFilenamefound"
                        File(projectDataFolder.resolve(fileName!!).toString())
                            .writeBytes(part.streamProvider().readBytes())
                    }
                    else -> {}
                }
            }
            // analyze csv file and return with message
            fileName?.let { fn ->
                transaction {
                    TableProjects.update({ TableProjects.id eq projectId }) {
                        it[TableProjects.speciesFileName] = fn
                        it[TableProjects.updated] = LocalDateTime.now()
                    }
                }
            }
            call.respondRedirect("/admin/biotop/$projectId/species")
        }

        post("/{projectId}/removeSpeciesFile") {
            val projectId = call.parameters["projectId"]?.toIntOrNull() ?: return@post
            ProjectData.getById(projectId)?.let {
                BiotopServices.removeSpeciesFile(it, dataCacheDirectory)
            }
            call.respondRedirect("/admin/biotop/projects")
        }

        get("/{projectId}/speciesDetailsSave") {
            val projectId = call.parameters["projectId"]?.toIntOrNull() ?: return@get

            var report = "<h4>Die CSV-Datei wurde %myOKorNOT% verarbeitet!</h4>"
            var rc: Boolean? = null
            val project = ProjectData.getById(projectId) ?: return@get
            val speciesColId = call.request.queryParameters["speciesColId"].orEmpty()
            val speciesColTaxonId = call.request.queryParameters["speciesColTaxonId"].orEmpty()
            val speciesColTaxonName = call.request.queryParameters["speciesColTaxonName"].orEmpty()

            val speciesColIdChanged = speciesColId != project.speciesColId
            val speciesColTaxonIdChanged = speciesColTaxonId != project.speciesColTaxonId
            val speciesColTaxonNameChanged = speciesColTaxonName != project.speciesColTaxonName

            if (speciesColId.isNotEmpty() && speciesColTaxonId.isNotEmpty() && speciesColTaxonName.isNotEmpty() &&
                (speciesColIdChanged || speciesColTaxonIdChanged || speciesColTaxonNameChanged)
                ) {

                transaction {
                    TableProjects.update({ TableProjects.id eq projectId }) {
                        it[TableProjects.speciesColId] = speciesColId
                        it[TableProjects.speciesColTaxonId] = speciesColTaxonId
                        it[TableProjects.speciesColTaxonName] = speciesColTaxonName
                        it[TableProjects.updated] = LocalDateTime.now()
                    }
                }

                ProjectData.getById(projectId)?.let { proj ->
                    if (proj.speciesFileName != null && proj.speciesColTaxonId != null) {
                        val ret = CSVChecker(project, dataCacheDirectory, proj.speciesFileName)
                            .checkStructure(3, 99, listOf(Pair(proj.speciesColTaxonId!!, "INT")))
                        rc = ret.first
                        report += ret.second.joinToString(prefix = "<ul>", postfix = "</ul>", separator = "") {
                            "<li>$it</li>"
                        }
                        if (ret.first) {
                            if (speciesColTaxonIdChanged || speciesColTaxonNameChanged)
                                speciesRenewComplete(proj, dataCacheDirectory)
                            else
                                speciesRenewValues(proj, dataCacheDirectory)
                        }
                    }
                }
                report = if (rc == true)
                    report.replace("%myOKorNOT%", "erfolgreich")
                else
                    report.replace("%myOKorNOT%", "NICHT")
            }
            if (rc == null)
                call.respondRedirect("/admin/biotop/projects")
            else
                call.respondRedirect("/admin/biotop/projects?report=$report")
        }
    }
}
