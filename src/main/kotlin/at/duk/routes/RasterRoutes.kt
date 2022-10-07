package at.duk.routes

import at.duk.models.RasterTask
import at.duk.services.RasterUpload
import at.duk.tables.TableRasterTasks
import at.duk.tables.TableUploadedRasterData
import io.ktor.http.content.*
import io.ktor.server.application.*
import io.ktor.server.config.*
import io.ktor.server.freemarker.*
import io.ktor.server.request.*
import io.ktor.server.response.*
import io.ktor.server.routing.*
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.launch
import org.jetbrains.exposed.dao.id.EntityID
import org.jetbrains.exposed.sql.*
import org.jetbrains.exposed.sql.javatime.CurrentDateTime
import org.jetbrains.exposed.sql.transactions.transaction
import java.io.File
import java.nio.file.Paths
import java.time.format.DateTimeFormatter

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
            if (!File("$cachePath").exists()) File("$cachePath").mkdir()
            val tmpName = RasterUpload.genTempName()
            if (!File("$cachePath/$tmpName").exists()) File("$cachePath/$tmpName").mkdir()

            val multipartData = call.receiveMultipart()
            var fileDescription = ""
            var fileName = ""
            multipartData.forEachPart { part ->
                when (part) {
                    is PartData.FormItem -> { fileDescription = part.value }
                    is PartData.FileItem -> {
                        fileName = part.originalFileName as String
                        var fileBytes = part.streamProvider().readBytes()
                        File("$cachePath/$tmpName/$fileName").writeBytes(fileBytes)
                    }
                    else -> {}
                }
            }

            lateinit var id: EntityID<Int>
            lateinit var rasterTasksId: EntityID<Int>

            transaction {
                id = TableUploadedRasterData.insertAndGetId {
                    it[filename] = fileName
                    it[name] = fileDescription
                    it[tmpTable] = "table_$tmpName"
                }
                rasterTasksId = TableRasterTasks.insertAndGetId {
                    it[pid] = 0
                    it[start] = CurrentDateTime
                    it[uploadedRasterDataId] = id.value
                }
            }

            launch(Dispatchers.Default) {
                RasterUpload.uploadIntoRasterTasks(fileName, config, tmpName, rasterTasksId)
            }
            call.respondRedirect("./tasks")
        }

        get("/tasks") {
            val result = mutableListOf<RasterTask>()
            transaction {
                val complexJoin = Join(
                    TableRasterTasks, TableUploadedRasterData,
                    onColumn = TableRasterTasks.uploadedRasterDataId, otherColumn = TableUploadedRasterData.id,
                    joinType = JoinType.INNER)

                val res = complexJoin.selectAll().orderBy(TableRasterTasks.start, SortOrder.DESC).limit(40)
                res.forEach {
                    val ende = it[TableRasterTasks.end]
                    var endeStr: String? = null
                    if (ende != null)
                        endeStr = ende.format(DateTimeFormatter.ofPattern("dd/MM/YYYY HH:mm:ss"))

                    result.add(RasterTask(it[TableRasterTasks.id].value,
                        it[TableRasterTasks.pid],
                        it[TableRasterTasks.start].format(DateTimeFormatter.ofPattern("dd/MM/YYYY HH:mm:ss")),
                        //it[TableRasterTasks.end].format(DateTimeFormatter.ofPattern("dd/MM/YYYY HH:mm:ss"))?:"",
                        endeStr,
                        it[TableRasterTasks.uploadedRasterDataId],
                        it[TableUploadedRasterData.name],
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

