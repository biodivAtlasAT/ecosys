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
package at.duk

import io.ktor.client.*
import io.ktor.client.engine.cio.*
import io.ktor.client.request.*
import io.ktor.client.statement.*
import io.ktor.http.*
import io.ktor.server.config.*
import koodies.text.toLowerCase
import org.jsoup.Jsoup
import java.io.File
import java.nio.file.Paths

object DataCache {
    suspend fun loadNavigation(config: ApplicationConfig) {
        val dataCacheDirectory = config.propertyOrNull("dataCache.directory")?.getString() ?: Paths.get("")
            .toAbsolutePath().toString()
        val cachePath = File(dataCacheDirectory).resolve("AlaNavigation")
        if (!File("$cachePath").exists())
            File("$cachePath").mkdir()
        config.propertyOrNull("dataCache.navigationUrl")?.let {
            val client = HttpClient(CIO)
            val response: HttpResponse = client.request(it.getString()) {
                method = HttpMethod.Get
                cookie("lang", "de-AT")
            }
            if (response.status == HttpStatusCode.OK)
                File(cachePath.resolve("navigation.html").toString())
                    .writeText(
                        generateBody(response.bodyAsText(), it.getString(), config.propertyOrNull("ktor.api.url"), config.propertyOrNull("geoserver.url"))
                    )
        }
    }

    private fun generateBody(
        branded: String,
        navigationUrl: String,
        apiServer: ApplicationConfigValue?,
        geoServer: ApplicationConfigValue?
    ): String {
        val ecosys = this.javaClass.classLoader.getResource("static/frontend/index.html")?.readText()
            ?.let { Jsoup.parse(it) } ?: return "Error in server application: cannot read index.html for merging!"

        val brand = Jsoup.parse(branded)
        // 1. Prepend href with navigationUrl when relative: <link rel="stylesheet" href="./..." >
        brand.head().getElementsByTag("link").forEach { ele ->
            if (ele.attr("href").startsWith("./") && ele.attr("rel") == "stylesheet") {
                ele.attr("href", ele.attr("href").replace("./", "$navigationUrl/"))
            }
        }
        // 2. Remove META tags in head and replace by ecosys tags
        brand.getElementsByTag("meta").forEach { it.remove() }
        ecosys.getElementsByTag("meta").reversed().forEach {
            brand.head().prepend(it.toString())
        }
        // 3. Insert "css" and "js" links if not already included; if not included, set path to "/static..."
        ecosys.head().getElementsByTag("script").forEach {
            if (it.attr("src").split("/").last().toLowerCase() != "jquery.js")
                brand.head().append(it.toString().replace("src=\"scripts", "src=\"static/frontend/scripts"))
        }
        ecosys.head().getElementsByTag("link").forEach {
            if (it.attr("rel") == "stylesheet")
                brand.head().append(it.toString().replace("href=\"styles", "href=\"static/frontend/styles"))
        }
        // 4. find ecosys.body, get "onload" attribute and add it to navigation.body tag
        ecosys.getElementsByTag("body").first()?.attr("onload")?.let {
            brand.getElementsByTag("body").first()?.attr("onload", "func_initMap();")
        }
        // 5. find tag with id == "id_content" and replace content with ecosys.body and put scripts from body to head
        ecosys.body().getElementsByTag("script").forEach {
            if (it.hasAttr("src")) {
                it.attr("src", it.attr("src").toString().replace("scripts/", "static/frontend/scripts/"))
            }
        }
        brand.getElementById("id_content")?.append(ecosys.body().toString())

        // 6. replace title with ecosys.title
        ecosys.title().let { brand.title(it) }

        // 7. replace service api url with configuration
        apiServer?.let { conf ->
            brand.getElementById("id_content")?.children()?.forEach {
                if (it.tagName() == "script" && it.data().contains("url_ecosys")) {
                    val preChild = it.data()
                    val startPos = preChild.indexOf("url_ecosys")
                    val endPos = preChild.indexOf(";", startPos)
                    val server = preChild.substring(startPos, endPos)
                    val serverUrl = server.split("\"", "'")[1]
                    val postChild = preChild.replace(serverUrl, conf.getString())
                    it.text(postChild)
                }
            }
        }

        // 7. replace geoserver api url with configuration
        geoServer?.let { conf ->
            brand.getElementById("id_content")?.children()?.forEach {
                if (it.tagName() == "script" && it.data().contains("url_geoserver")) {
                    val preChild = it.data()
                    val startPos = preChild.indexOf("url_geoserver")
                    val endPos = preChild.indexOf(";", startPos)
                    val server = preChild.substring(startPos, endPos)
                    val serverUrl = server.split("\"", "'")[1]
                    val postChild = preChild.replace(serverUrl, conf.getString())
                    it.text(postChild)
                }
            }
        }

        // 8. prepend path to i18n/messages.json
        apiServer?.let {
            brand.getElementById("id_content")?.children()?.forEach {
                if (it.tagName() == "script" && it.data().contains("url_i18n")) {
                    val lines = it.data().lines()
                    val newLines = mutableListOf<String>()
                    lines.forEach { line ->
                        if (line.contains("url_i18n"))
                            newLines.add(line.replace("\"i18n/\"", "\"static/frontend/i18n/\""))
                        else
                            newLines.add(line)
                    }
                    it.text(newLines.joinToString("\n"))
                }
            }
        }
        return brand.toString()
    }
}
