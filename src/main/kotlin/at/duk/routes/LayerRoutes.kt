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

import io.ktor.server.application.*
import io.ktor.server.config.*
import io.ktor.server.freemarker.*
import io.ktor.server.response.*
import io.ktor.server.routing.*

fun Route.layerRouting(config: ApplicationConfig) {
    route("/admin/layer") {

        get("/upload") {
            call.respond(FreeMarkerContent("09_LayerUpload.ftl", null))
        }

        get("/tasks") {
            call.respond(FreeMarkerContent("10_LayerTasks.ftl", null))
        }

        get("/list") {
            println(config.keys())
            call.respond(FreeMarkerContent("11_LayerList.ftl", null))
        }

        get("/data") {
            call.respond(FreeMarkerContent("12_LayerData.ftl", null))
        }

        get("/sync") {
            call.respond(FreeMarkerContent("13_SpatialSync.ftl", null))
        }
    }
}
