package at.duk.routes

import at.duk.models.RasterTask
import at.duk.services.RasterUpload
import at.duk.tables.TableRasterTasks
import io.ktor.http.content.*
import io.ktor.server.application.*
import io.ktor.server.config.*
import io.ktor.server.freemarker.*
import io.ktor.server.request.*
import io.ktor.server.response.*
import io.ktor.server.routing.*
import org.jetbrains.exposed.sql.Query
import org.jetbrains.exposed.sql.SortOrder
import org.jetbrains.exposed.sql.selectAll
import org.jetbrains.exposed.sql.transactions.transaction
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
            RasterUpload.uploadIntoRasterTasks(fileDescription, fileName, cachePath)
            call.respondRedirect("./tasks")
        }

        get("/tasks") {
            val result = mutableListOf<RasterTask>()
            transaction {
                val res = TableRasterTasks.selectAll().orderBy(TableRasterTasks.start, SortOrder.DESC).limit(40)
                res.forEach {
                    println("!!!!! ${it[TableRasterTasks.id]}")
                    result.add(RasterTask(it[TableRasterTasks.id].value,
                        it[TableRasterTasks.pid],
                        it[TableRasterTasks.start],
                        it[TableRasterTasks.end],
                        it[TableRasterTasks.uploadedRasterDataId], "Hallo!",
                        it[TableRasterTasks.rc],
                        it[TableRasterTasks.message],
                        it[TableRasterTasks.imported]))
                }
            }


            call.respond(FreeMarkerContent("06_RasterTasks.ftl", mapOf("result" to result)))
        }

        get("/list") {
            call.respond(FreeMarkerContent("07_RasterList.ftl", null))
        }

        get("/data") {
            call.respond(FreeMarkerContent("08_RasterData.ftl", null))
        }


    }
}

