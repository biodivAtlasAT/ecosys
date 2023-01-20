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
import io.ktor.server.application.*
import io.ktor.server.config.*
import io.ktor.server.response.*
import koodies.text.toLowerCase
import org.jsoup.Jsoup
import org.jsoup.nodes.Element
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
                File(cachePath.resolve("navigation.html").toString()).writeText(generateBody(response.bodyAsText(), it.getString()))
        }
        // todo: log if any problem exists
    }

    private fun generateBody(brand: String, navigationUrl: String): String {
        val ecosys = Jsoup.parse(this.javaClass.classLoader.getResource("static/frontend/index.html")?.readText())

        val brand = Jsoup.parse(brand)
        // 1. Prepend href with navigationUrl when relative: <link rel="stylesheet" href="./..." >
        brand.head().getElementsByTag("link").forEach {ele ->
            if(ele.attr("href").startsWith("./") && ele.attr("rel") == "stylesheet") {
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
  /*      ecosys.body().getElementsByTag("script").forEach {
            if (it.hasAttr("src")) {
                it.attr("src", it.attr("src").toString().replace("scripts/", "static/frontend/scripts/"))
                val dup = it.toString()
                it.remove()
                brand.head().append(dup)
            }
        }*/
        ecosys.body().getElementsByTag("script").forEach {
          if (it.hasAttr("src")) {
              it.attr("src", it.attr("src").toString().replace("scripts/", "static/frontend/scripts/"))
          }
      }
        brand.getElementById("id_content")?.append(ecosys.body().toString())

        // 6. replace title with ecosys.title

        // check relative links zB "Kontakt" etc. Georg --> hrefs sind leer



        return brand.toString()
    }

    private fun generateNewBody(content: String): String {
        val startPos = content.indexOf("<div class=\"container-fluid\" id=\"main\">")
        val endPos = content.indexOf("<div id=\"footer\"")
        val sb: StringBuilder = StringBuilder(content.substring(0, startPos))
        sb.append("<div class=\"container-fluid\" id=\"main\">")
        sb.append("<div class=\"container-fluid\" id=\"main-content\"></div>")
        sb.append("</div>")
        sb.append(content.substring(endPos))
        val doc = Jsoup.parse(sb.toString())
        // add jquery - in live system it is included elsewhere?
        doc.head().prepend(
            "<script type=\"text/javascript\" " +
                "src=\"https://ajax.googleapis.com/ajax/libs/jquery/3.4.0/jquery.min.js\"></script>"
        )

        val elements = emptyList<Element>().toMutableList()
        doc.head().children().forEach {
            if (it.attr("rel") == "stylesheet") {
                if (it.attr("href").startsWith("/asset")) {
                    elements.add(it)
                    it.remove()
                }
                if (it.attr("href").startsWith(
                        "https://core.biodiversityatlas.at/brand-2022/css/autocomplete-extra.min.css"
                    )
                ) it.remove()
            }
            if (it.attr("type") == "text/javascript") {
                if (it.attr("src").startsWith("/asset") && it.attr("src")
                        .indexOf("jquery") == -1
                ) {
                    elements.add(it)
                    it.remove()
                }
            }
        }

        doc.title("ECOSYS")
        doc.head().append("<script type=\"text/javascript\" charset=\"UTF-8\" src=\"./static/ecosys.js\"></script>")
        doc.head().append("<link rel=\"stylesheet\" href=\"./static/ecosys.css\">")

        var co = doc.toString().replace("Occurrence records", "ECOSYS")
            .replace("en-AU", "de-AT")
        co = co.replace("de_AT", "de")
        co = co.replace("de-AT", "de")
        co = co.replace("'lang'", "'language'")
        co = co.replace("lang=", "language=")
        co = co.replace("domain=biodivdev.at", "")

        return co
    }
}
