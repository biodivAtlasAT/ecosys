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
package at.duk.plugins

import at.duk.routes.*
import at.duk.utils.CasChecker
import at.duk.utils.CasConfig
import at.duk.utils.UserSession
import io.ktor.http.*
import io.ktor.server.application.*
import io.ktor.server.http.content.*
import io.ktor.server.plugins.swagger.*
import io.ktor.server.response.*
import io.ktor.server.routing.*
import io.ktor.server.sessions.*
import java.io.File
import java.nio.file.Paths

fun Application.configureRouting() {
    val config = environment.config
    val rtLogger = log

    routing {
        apiRouting(config)
        adminRouting(config)
        rasterRouting(config)
        layerRouting(config)
        biotopRouting(config)

        val dataCacheDirectory = environment?.config?.propertyOrNull("dataCache.directory")
            ?.getString() ?: Paths.get("").toAbsolutePath().toString()
        val cachePath = File(dataCacheDirectory).resolve("AlaNavigation")

        swaggerUI(path = "swagger", swaggerFile = "openapi/documentation.yaml")

        get("/") {
            // get Biodiversity-Atlas navigation from data cache
            if (!File(cachePath.path).resolve("navigation.html").exists()) {
                rtLogger.error("Header file navigation.html does nit exist in dataCache/AlaNavigation directory!")
                call.respondText("Configuration Error for Navigation Header!", ContentType.Text.Html)
                return@get
            }
            call.respondText(File(cachePath.path).resolve("navigation.html").readText(), ContentType.Text.Html)
        }

        // Static plugin
        static("/static") {
            resources("static")
        }

        get("/assets/svg/{showSVG}") {
            val svgDataFolder = File(dataCacheDirectory).resolve("svg")
            val fileName = call.parameters["showSVG"]?.toString() ?: ""
            if (fileName == "" || !File("$svgDataFolder/$fileName").exists()) {
                call.respond(HttpStatusCode.NotFound)
                return@get
            }

            val file = File("$svgDataFolder/$fileName")
            call.response.header(
                HttpHeaders.ContentDisposition,
                ContentDisposition.Attachment.withParameter(ContentDisposition.Parameters.FileName, fileName)
                    .toString()
            )
            call.respondFile(file)
        }

        get("/notAuthorized") {
            call.respondText("Not authorized!")
        }

        get("/logout") {
            val casConfig = CasConfig(config)
            //CasChecker.AlaLogout(casConfig)
            val userSession = call.sessions.get<UserSession>()
            if (userSession != null)
                call.sessions.clear<UserSession>()


            call.respondRedirect(casConfig.logoutUrl)
        }

    }
}
