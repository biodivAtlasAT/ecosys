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

import at.duk.models.RasterDataRequest
import at.duk.services.ApiServices
import io.ktor.http.*
import io.ktor.server.application.*
import io.ktor.server.config.*
import io.ktor.server.response.*
import io.ktor.server.routing.*
import org.jetbrains.exposed.sql.transactions.transaction

fun Route.apiRouting(config: ApplicationConfig) {

    val badRequestData = "{\"error\":{\"no\":2,\"msg\":\"Parameters not valid!\"}}"

    route("/api") {
        get("/check") {
            // todo: for testing reasons only, can be removed in production
            println(call.request.queryParameters["keyId"])
            val keyId = call.request.queryParameters["keyId"] ?: "empty"
            val layerId = call.request.queryParameters["layerId"]?.toIntOrNull() ?: -1

            val sql = "select id from layer_details where layer_id = $layerId and key_id = '$keyId' limit 1"
            var layerDetailsId = -1
            transaction {
                exec(sql) { res ->
                    while (res.next()) {
                        layerDetailsId = res.getInt("id")
                    }
                }
            }

            call.respondText(
                "{\"id\": \"$layerDetailsId\" }",
                ContentType.parse("application/json"), HttpStatusCode.OK
            )
        }

        get("/layers") {
            call.respondText(
                ApiServices.generateLayersResponse(), ContentType.parse("application/json"), HttpStatusCode.OK
            )
        }

        get("/layerData") {
            val packageId = call.request.queryParameters["packageID"]?.toIntOrNull() ?: -1
            val layerId = call.request.queryParameters["layerID"]?.toIntOrNull() ?: -1
            val layerKey = call.request.queryParameters["layerKey"] ?: ""

            if (layerId > -1 && packageId > -1 && layerKey != "")
                call.respondText(
                    ApiServices.generateRasterDataResponseIntersect(packageId, layerId, layerKey),
                    ContentType.parse("application/json"), HttpStatusCode.OK
                )
            else
                call.respondText(badRequestData, ContentType.parse("application/json"), HttpStatusCode.OK)
        }

        get("/packages") {
            call.respondText(
                ApiServices.generatePackageResponse(), ContentType.parse("application/json"),
                HttpStatusCode.OK
            )
        }

        get("/services") {
            call.request.queryParameters["packageID"]?.toIntOrNull()?.let {
                call.respondText(
                    ApiServices.generateServiceResponse(it),
                    ContentType.parse("application/json"), HttpStatusCode.OK
                )
                return@get
            }
            val str = "{'error':{'no':1,'msg':'no packageID found!'}}"
            call.respondText(str, ContentType.parse("application/json"), HttpStatusCode.OK)
        }

        post("/rasterData") {
            val reqParam = RasterDataRequest(call.request).also {
                it.initCoordsList()
                it.initServicesList()
                if (!it.reqDataExists())
                    call.respondText(badRequestData, ContentType.parse("application/json"), HttpStatusCode.OK)
            }
            call.respondText(
                ApiServices.generateRasterDataResponseResponse(reqParam),
                ContentType.parse("application/json"), HttpStatusCode.OK
            )
        }

        get("/bt/projects") {
            call.respondText(
                ApiServices.generateProjectsResponse(), ContentType.parse("application/json"),
                HttpStatusCode.OK
            )
        }

        get("/bt/projects/{projectId}") {
            call.parameters["projectId"]?.toIntOrNull()?.let {
                call.respondText(
                    ApiServices.generateProjectResponse(it, config), ContentType.parse("application/json"),
                    HttpStatusCode.OK
                )
            }
        }

        get("/bt/projects/{projectId}/filter") {
            call.parameters["projectId"]?.toIntOrNull()?.let {
                call.respondText(
                    ApiServices.generateProjectFilterResponse(it, config), ContentType.parse("application/json"),
                    HttpStatusCode.OK
                )
            }
        }

    }
}
