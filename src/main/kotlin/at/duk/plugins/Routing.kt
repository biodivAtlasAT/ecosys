package at.duk.plugins

import at.duk.routes.apiRouting
import io.ktor.server.routing.*
import io.ktor.http.*
import io.ktor.server.http.content.*
import io.ktor.server.application.*
import io.ktor.server.response.*
import io.ktor.server.request.*
import io.ktor.util.*
import org.jsoup.Jsoup
import java.io.File
import java.nio.file.Paths

fun Application.configureRouting() {


    routing {
        apiRouting()
        val dataCacheDirectory = environment?.config?.propertyOrNull("dataCache.directory")?.getString() ?: Paths.get("").toAbsolutePath().toString()
        val cachePath = File(dataCacheDirectory).resolve("AlaNavigation")

        get("/") {
            // get Biodiversity-Atlas navigation from data cache
            val co = File(cachePath.path).resolve("navigation.html").readText()
            // get ecosysIndex.html from resources folder
            val ecosysIndexHtml = this.javaClass.classLoader.getResource("static/ecosysIndex.html")?.readText()
            // fetch the tag where the html should be placed
            val doc = Jsoup.parse(co)
            doc.select("div#main-content").first()?.append(ecosysIndexHtml.toString())
            // respond to request
            call.respondText(doc.toString(), ContentType.Text.Html)
        }

        // Static plugin. Try to access `/static/index.html`
        static("/static") {
            resources("static")
        }
    }
}
