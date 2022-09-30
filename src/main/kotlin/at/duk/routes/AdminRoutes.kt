package at.duk.routes

import io.ktor.http.*
import io.ktor.http.content.*
import io.ktor.server.application.*
import io.ktor.server.config.*
import io.ktor.server.freemarker.*
import io.ktor.server.request.*
import io.ktor.server.response.*
import io.ktor.server.routing.*
import java.io.File
import java.nio.file.Paths

fun Route.adminRouting(config: ApplicationConfig) {
    route("/admin") {
        get("/") {
            call.respond(FreeMarkerContent("01_Start.ftl", null))
        }

        get("/categories") {
            call.respond(FreeMarkerContent("02_Categories.ftl", null))
        }

        get("/services") {
            call.respond(FreeMarkerContent("03_Services.ftl", null))
        }

        get("/cache/delete") {
            call.respond(FreeMarkerContent("14_CacheDelete.ftl", null))
        }

    }
}

