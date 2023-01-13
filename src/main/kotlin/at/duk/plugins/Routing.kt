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

import at.duk.routes.adminRouting
import at.duk.routes.apiRouting
import at.duk.routes.layerRouting
import at.duk.routes.rasterRouting
import io.ktor.server.routing.*
import io.ktor.http.*
import io.ktor.http.content.*
import io.ktor.server.http.content.*
import io.ktor.server.application.*
import io.ktor.server.freemarker.*
import io.ktor.server.request.*
import io.ktor.server.response.*
import org.jsoup.Jsoup
import java.io.File
import java.nio.file.Paths
import io.ktor.server.plugins.swagger.*

fun Application.configureRouting() {
    val config = environment.config

    routing {
        apiRouting()
        adminRouting(config)
        rasterRouting(config)
        layerRouting(config)

        val dataCacheDirectory = environment?.config?.propertyOrNull("dataCache.directory")
            ?.getString() ?: Paths.get("").toAbsolutePath().toString()
        val cachePath = File(dataCacheDirectory).resolve("AlaNavigation")

        swaggerUI(path = "swagger", swaggerFile = "openapi/documentation.yaml")

        get("/") {
            // get Biodiversity-Atlas navigation from data cache
            val co = File(cachePath.path).resolve("navigation.html").readText()
            // get ecosys.html.body.inc and ecosysHtmlHeaderInc from resources folder
            val ecosysHtmlBodyInc =
                this.javaClass.classLoader.getResource("static/ecosys.html.body.inc")?.readText()
            val ecosysHtmlHeaderInc =
                this.javaClass.classLoader.getResource("static/ecosys.html.header.inc")?.readText()
            // fetch the tag where the html should be placed
            val doc = Jsoup.parse(co)
            if (ecosysHtmlHeaderInc != null) {
                doc.head().append(ecosysHtmlHeaderInc)
            }
            doc.select("div#main-content").first()?.append(ecosysHtmlBodyInc.toString())
            // respond to request
            call.respondText(doc.toString(), ContentType.Text.Html)
        }
        // Static plugin. Try to access `/static/index.html`
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
    }
}
