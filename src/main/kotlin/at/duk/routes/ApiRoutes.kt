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

import at.duk.models.CategoryData
import at.duk.models.LayerData
import at.duk.models.RasterDataRequest
import at.duk.services.ApiServices
import at.duk.services.RasterServices
import at.duk.tables.TableCategories
import at.duk.tables.TableLayers
import at.duk.tables.TableRasterData
import io.ktor.http.*
import io.ktor.server.application.*
import io.ktor.server.response.*
import io.ktor.server.routing.*
import org.jetbrains.exposed.sql.SqlExpressionBuilder.eq
import org.jetbrains.exposed.sql.deleteWhere
import org.jetbrains.exposed.sql.select
import org.jetbrains.exposed.sql.transactions.transaction

fun Route.apiRouting() {

    val badRequestData = "{'error':{'no':2,'msg':'Parameters not valid!'}}"

    route("/api") {
        get("/layers") {
            call.respondText(ApiServices.generateLayersResponse(),
                ContentType.parse("application/json"), HttpStatusCode.OK)
        }

        get("/layerData") {
            val layerID = call.request.queryParameters["layerID"]?.toIntOrNull()?:-1
            if (layerID > -1)
                call.respondText(ApiServices.generateRasterDataResponseIntersect(),
                    ContentType.parse("application/json"), HttpStatusCode.OK)
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
    }
}
