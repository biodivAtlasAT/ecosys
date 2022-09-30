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

fun Route.layerRouting(config: ApplicationConfig) {
    route("/admin/layer") {

        get("/upload") {
            call.respond(FreeMarkerContent("09_LayerUpload.ftl", null))
        }

        get("/tasks") {
            call.respond(FreeMarkerContent("10_LayerTasks.ftl", null))
        }

        get("/list") {
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

