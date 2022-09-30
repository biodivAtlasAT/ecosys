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

fun Route.rasterRouting(config: ApplicationConfig) {
    route("/admin/raster") {

        get("/packages") {
            call.respond(FreeMarkerContent("04_Packages.ftl", null))
        }

        get("/upload") {
            call.respond(FreeMarkerContent("05_RasterUpload.ftl", null))
        }

        post("/uploadAction") {
            val dataCacheDirectory = config.propertyOrNull("dataCache.directory")?.getString() ?: Paths.get("").toAbsolutePath().toString()
            val cachePath = File(dataCacheDirectory).resolve("rasterData").resolve("uploads")
            if (!File("$cachePath").exists())
                File("$cachePath").mkdir()

            val multipartData = call.receiveMultipart()
            var fileDescription = ""
            var fileName = ""
            multipartData.forEachPart { part ->
                when (part) {
                    is PartData.FormItem -> {
                        fileDescription = part.value
                    }

                    is PartData.FileItem -> {
                        fileName = part.originalFileName as String
                        var fileBytes = part.streamProvider().readBytes()
                        File("$cachePath/$fileName").writeBytes(fileBytes)
                    }

                    else -> {}
                }
            }
            call.respondRedirect("/test")
        }

        get("/tasks") {
            call.respond(FreeMarkerContent("06_RasterTasks.ftl", null))
        }

        get("/list") {
            call.respond(FreeMarkerContent("07_RasterList.ftl", null))
        }

        get("/data") {
            call.respond(FreeMarkerContent("08_RasterData.ftl", null))
        }


    }
}

