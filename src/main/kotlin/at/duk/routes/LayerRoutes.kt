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

import at.duk.models.*
import at.duk.models.spatial.SpatialLayerPart
import at.duk.services.LayerServices.checkIfSyncAlreadyRunning
import at.duk.services.LayerServices.fetchLayerFromSpatial
import at.duk.services.LayerServices.getFileTimeStamp
import at.duk.services.LayerServices.getSyncLogFile
import at.duk.tables.TableLayers
import at.duk.tables.TablePackages
import at.duk.tables.TableRasterData
import com.fasterxml.jackson.module.kotlin.jacksonObjectMapper
import com.fasterxml.jackson.module.kotlin.readValue
import io.ktor.server.application.*
import io.ktor.server.config.*
import io.ktor.server.freemarker.*
import io.ktor.server.request.*
import io.ktor.server.response.*
import io.ktor.server.routing.*
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.launch
import org.jetbrains.exposed.sql.SqlExpressionBuilder.eq
import org.jetbrains.exposed.sql.select
import org.jetbrains.exposed.sql.selectAll
import org.jetbrains.exposed.sql.transactions.transaction
import org.jetbrains.exposed.sql.update

fun Route.layerRouting(config: ApplicationConfig) {
    val mapper = jacksonObjectMapper()

    route("/admin/layer") {

        get("/list") {
            val layersList = mutableListOf<LayerData>()

            transaction {
                layersList.addAll(
                    TableLayers.selectAll().orderBy(TableLayers.name).map
                    { rs -> LayerData(rs[TableLayers.id].value, rs[TableLayers.name], rs[TableLayers.enabled],
                        rs[TableLayers.spatialLayerId], rs[TableLayers.key]) }
                )
            }

            call.respond(FreeMarkerContent("11_LayerList.ftl", mapOf("result" to layersList)))
        }

        get("/listUpdate") {
            val id = call.parameters["chkId"]?.toIntOrNull()?:-1
            transaction {
                // toggle enabled
                val checked = TableLayers.select { TableLayers.id eq id }.first()[TableLayers.enabled]
                TableLayers.update ({ TableLayers.id eq id }) {
                    it[TableLayers.enabled] = !checked
                }
            }
            call.respondRedirect("./list")
        }

        get("/sync") {

            val model = mutableMapOf<String, Any?>()
            model["isNotRunning"] = !checkIfSyncAlreadyRunning(config)
            model["logFile"] = getSyncLogFile(config)
            model["started"] = getFileTimeStamp(config, "sync.started")
            model["finished"] = getFileTimeStamp(config, "sync.finished")

            call.respond(FreeMarkerContent("13_SpatialSync.ftl", model))

        }

        get ("/syncAction") {
            if(!checkIfSyncAlreadyRunning(config))
                launch(Dispatchers.Default) {
                    fetchLayerFromSpatial(config)
                }
            // to ensure that the coroutine has already created the marker files!
            Thread.sleep(2000)
            call.respondRedirect("./sync")
       }

        get("/show") {
            call.respond(FreeMarkerContent("99_Development.ftl", null))
        }

        // for testing only
        get("/geoJson/{layerId}"){
            call.parameters["layerId"]?.toIntOrNull()?.let {

                val sql = "select properties, ST_AsGeoJSON(geom) as geom from layer_details where layer_id=$it"
                val features = mutableListOf<Feature>()
                val featureCollection = FeatureCollection("FeatureCollection", features)
                transaction {
                    exec(sql) { rs ->
                        var index = 0
                        while (rs.next() && index <300) {
                            index++
                            val x = rs.getString("properties")?.toString()?:""
                            val properties: Properties = mapper.readValue(x)
                            val jsonCoordinates: SpatialLayerPart = mapper.readValue(rs.getString("geom"))
                            features.add(Feature("Feature", properties, jsonCoordinates))

                            println("----------------------")
                            println(properties)
                        }
                    }
                }


                call.respondText(mapper.writeValueAsString(featureCollection))

            }

        }
    }
}
