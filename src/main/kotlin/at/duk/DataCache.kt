package at.duk

import io.ktor.client.*
import io.ktor.client.engine.cio.*
import io.ktor.client.request.*
import io.ktor.client.statement.*
import io.ktor.http.*
import io.ktor.server.config.*
import org.jsoup.Jsoup
import org.jsoup.nodes.Element
import java.io.File
import java.nio.file.Paths

class DataCache {
    companion object {
        suspend fun loadNavigation(config: ApplicationConfig) {
            val dataCacheDirectory = config.propertyOrNull("dataCache.directory")?.getString() ?: Paths.get("").toAbsolutePath().toString()
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
                    File(cachePath.resolve("navigation.html").toString()).writeText(generateNewBody(response.bodyAsText()))
            }
            // todo: log if any problem exists
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
            doc.head().prepend("<script type=\"text/javascript\" src=\"https://ajax.googleapis.com/ajax/libs/jquery/3.4.0/jquery.min.js\"></script>")

            val elements = emptyList<Element>().toMutableList()
            doc.head().children().forEach {
                if (it.attr("rel") == "stylesheet") {
                    if (it.attr("href").startsWith("/asset")) {
                        elements.add(it)
                        it.remove()
                    }
                    if (it.attr("href").startsWith("https://core.biodiversityatlas.at/brand-2022/css/autocomplete-extra.min.css"))
                        it.remove()

                }
                if (it.attr("type") == "text/javascript") {
                    if (it.attr("src").startsWith("/asset") && it.attr("src").indexOf("jquery") == -1) {
                        elements.add(it)
                        it.remove()
                    }
                }
            }

            doc.title("ECOSYS")
            doc.head().append("<script type=\"text/javascript\" charset=\"UTF-8\" src=\"./static/ecosys.js\"></script>")
            doc.head().append("<link rel=\"stylesheet\" href=\"./static/ecosys.css\">")

            var co = doc.toString().replace("Occurrence records", "ECOSYS").replace("en-AU", "de-AT")
            co = co.replace("de_AT", "de")
            co = co.replace("de-AT", "de")
            co = co.replace("'lang'", "'language'")
            co = co.replace("lang=", "language=")
            co = co.replace("domain=biodivdev.at", "")

            return co
        }
    }
}