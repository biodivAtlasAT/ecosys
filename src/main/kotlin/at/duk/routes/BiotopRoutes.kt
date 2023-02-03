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
import at.duk.models.biotop.ProjectData
import at.duk.services.BiotopServices
import at.duk.tables.TableRasterData
import at.duk.tables.biotop.TableProjects
import io.ktor.client.*
import io.ktor.client.engine.cio.*
import io.ktor.client.request.*
import io.ktor.client.statement.*
import io.ktor.http.*
import io.ktor.server.application.*
import io.ktor.server.config.*
import io.ktor.server.freemarker.*
import io.ktor.server.request.*
import io.ktor.server.response.*
import io.ktor.server.routing.*
import org.jetbrains.exposed.sql.*
import org.jetbrains.exposed.sql.SqlExpressionBuilder.eq
import org.jetbrains.exposed.sql.transactions.transaction
import java.io.File
import java.nio.file.Paths
import java.time.LocalDateTime

fun Route.biotopRouting(config: ApplicationConfig) {
    val dataCacheDirectory = config.propertyOrNull("dataCache.directory")?.getString() ?:
        Paths.get("").toAbsolutePath().toString()

    route("/admin/biotop") {
        get("/projects") {
            val projectsList = mutableListOf<ProjectData>()

            transaction {
                projectsList.addAll(
                    TableProjects.select { TableProjects.deleted eq null }.orderBy(TableProjects.name).map
                    { rs -> ProjectData(rs[TableProjects.id].value, rs[TableProjects.name],null,null,null, null)
                    }
                )
            }
            call.respond(
                FreeMarkerContent(
                    "15_BTProjects.ftl",
                    mapOf("result" to projectsList, "maxCount" to projectsList.size)
                )
            )
        }
        get("/{projectId}/saveGeoserverData") {
            val layer = call.request.queryParameters["layer"]
            val typeFeature = call.request.queryParameters["typeFeature"]
            val projectId = call.parameters["projectId"]?.toIntOrNull()
            val workspace = call.request.queryParameters["workspace"]
            if (projectId != null && layer != null && typeFeature != null && workspace != null) {
                transaction {
                    TableProjects.update({ TableProjects.id eq projectId }) {
                        it[TableProjects.geoserverLayer] = layer
                        it[TableProjects.geoserverWorkspace] = workspace
                        it[TableProjects.colTypesCode] = typeFeature
                        it[TableProjects.updated] = LocalDateTime.now()
                    }
                }
            }
            call.respondRedirect("/admin/biotop/projects")
        }

        get("/{projectId}/server") {

            var project: ProjectData? = null
            val workspace = "topp"

            call.parameters["projectId"]?.toIntOrNull()?.let { projectId ->
                transaction {
                    TableProjects.select { TableProjects.id eq projectId }.limit(1).map { rs ->
                        project = ProjectData.mapRSToProjectData(rs)
                    }
                }

                // fetch layer data from selected layer
                var temp1 = "LEER temp1"
                var temp2 = "LEER temp2"
                val listOfFeatures = mutableListOf<String>()
                call.request.queryParameters["layer"]?.let { layer ->
                    val client = HttpClient(CIO)
                    //http://localhost:8081/geoserver/rest/workspaces/topp/datastores/taz_shapes/featuretypes/tasmania_state_boundaries.json
                    val url = "http://localhost:8081/geoserver/rest/workspaces/topp/layers/$layer.json"
                    val response: HttpResponse = client.request(url) {
                        method = HttpMethod.Get
                    }
                    if (response.status == HttpStatusCode.OK) {
                        temp1 = response.bodyAsText()
                    }
                    val featureUrl = temp1.split("@").first {
                        it.startsWith("class\":\"featureType\"")}.split("\"").first {
                            it.startsWith("http") }
                    val client2 = HttpClient(CIO)
                    val response2: HttpResponse = client.request(featureUrl) {
                        method = HttpMethod.Get
                    }
                    if (response2.status == HttpStatusCode.OK) {
                        temp2 = response2.bodyAsText()
                    }

                    temp2.split("\"attribute\":").forEach {
                        if (it.startsWith("[")) {
                            it.split("name\":\"").forEach {
                                val s = it.split("\"").first()
                                if (!s.startsWith("[") && !s.contains("the_geom"))
                                    listOfFeatures.add(s)
                            }
                        }
                    }
                }
                // fetch list of available layers
                var temp = "LEER"
                val listOfLayers = mutableListOf<String>()
                if (project?.geoserverLayer == null) {
                    val client = HttpClient(CIO)
                    val url = "http://localhost:8081/geoserver/rest/workspaces/topp/layers.json"
                    val response: HttpResponse = client.request(url) {
                        method = HttpMethod.Get
                    }
                    if (response.status == HttpStatusCode.OK) {
                        response.bodyAsText().split("\"").forEach {
                            if (it.startsWith("http"))
                                listOfLayers.add(it.split("/").last().replace(".json", ""))
                        }
                    }

                }
                call.respond(FreeMarkerContent("17_BTGeoServer.ftl",
                    mapOf("project" to project, "temp" to temp, "listOfLayers" to listOfLayers,
                        "urlRedirect" to this.context.request.path(),
                        "listOfFeatures" to listOfFeatures.sorted(),
                        "selectedLayer" to call.request.queryParameters["layer"],
                        "workspace" to "ECO")
                ))
            }
        }

        post("/projectUpdate") {
            val formParameters = call.receiveParameters()
            when (formParameters["mode"]?.toIntOrNull() ?: -1) {
                0 -> if (formParameters["name"] != "")
                    BiotopServices.projectInsertOrUpdate(formParameters)
                1 -> BiotopServices.projectDelete(formParameters)
                else -> { }
            }
            call.respondRedirect("./projects")
        }


        get("/classes") {
            call.respond(FreeMarkerContent("19_BTClasses.ftl", null))
        }


    }
}
