package at.duk.plugins

import at.duk.routes.apiRouting
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

fun Application.configureRouting() {
    val config = environment.config

    routing {
        apiRouting()
        rasterRouting(config)

        val dataCacheDirectory = environment?.config?.propertyOrNull("dataCache.directory")?.getString() ?: Paths.get("").toAbsolutePath().toString()
        val cachePath = File(dataCacheDirectory).resolve("AlaNavigation")

        get("/") {
            // get Biodiversity-Atlas navigation from data cache
            val co = File(cachePath.path).resolve("navigation.html").readText()
            // get ecosys.html.body.inc and ecosysHtmlHeaderInc from resources folder
            val ecosysHtmlBodyInc = this.javaClass.classLoader.getResource("static/ecosys.html.body.inc")?.readText()
            val ecosysHtmlHeaderInc = this.javaClass.classLoader.getResource("static/ecosys.html.header.inc")?.readText()
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

    }
}