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
import at.duk.services.BiotopServices.getListOfFeatures
import at.duk.services.BiotopServices.getListOfLayers
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
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.launch
import org.jetbrains.exposed.sql.*
import org.jetbrains.exposed.sql.SqlExpressionBuilder.eq
import org.jetbrains.exposed.sql.transactions.transaction
import java.io.File
import java.nio.file.Paths
import java.time.LocalDateTime

fun Route.biotopRouting(config: ApplicationConfig) {
    val geoserverWorkspace = config.propertyOrNull("geoserver.workspace")?.getString() ?: "ECO"
    val geoserverUrl = config.propertyOrNull("geoserver.url")?.getString() ?: ""

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
