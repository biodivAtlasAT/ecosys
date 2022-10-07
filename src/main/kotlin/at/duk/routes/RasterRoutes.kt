package at.duk.routes

import at.duk.models.RasterTask
import at.duk.services.RasterUpload
import at.duk.tables.*
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
import org.jetbrains.exposed.sql.SqlExpressionBuilder.eq
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

        get("/tasksAction") {
            val rasterTasksId = call.request.queryParameters["rasterTasksId"]
            var rasterDataId = -1
            rasterTasksId?.toInt()?.let { it1 -> rasterDataId = RasterUpload.importIntoRasterData(it1) }
            if (rasterDataId > -1) {
                // val res = TableRasterData.select { TableRasterData.id eq rasterDataId }.first()
                call.respondRedirect("./$rasterDataId")
            }

        }



        get("/list") {
            call.respond(FreeMarkerContent("07_RasterList.ftl", null))
        }

        get("/{id}") {
            println(call.parameters["id"])
            val model = emptyMap<String, Any>().toMutableMap()
            val packageList = emptyList<Map<String, String>>().toMutableList()
            val serviceList = emptyList<Map<String, String>>().toMutableList()
            call.parameters["id"]?.toIntOrNull()?.let {
                transaction {
                    val res = TableRasterData.select { TableRasterData.id eq it }.first()
                    model["id"] = res[TableRasterData.id].toString()
                    model["fileName"] = res[TableRasterData.filename]
                    model["name_"] = res[TableRasterData.name]
                    model["dimension"] = res[TableRasterData.dimension]
                    model["serviceId"] = res[TableRasterData.serviceId]?: -1
                    model["packageId"] = res[TableRasterData.packageId]?: -1

                    TablePackages.select { TablePackages.deleted eq null }.orderBy(TablePackages.name, SortOrder.ASC).forEach {
                        packageList.add(mapOf("id" to it[TablePackages.id].toString(), "name" to it[TablePackages.name]))
                    }
                    model["packageList"] = packageList

                    TableServices.select { TableServices.deleted eq null }.orderBy(TableServices.name, SortOrder.ASC).forEach {
                        serviceList.add(mapOf("id" to it[TableServices.id].toString(), "name" to it[TableServices.name]))
                    }
                    model["serviceList"] = serviceList
                }
            }

            call.respond(FreeMarkerContent("08_RasterData.ftl", model))
        }

        get("/dataAction") {
            val id = call.request.queryParameters["id"]?.toIntOrNull()?:-1
            val name = call.request.queryParameters["name_"].toString()
            val packageId = call.request.queryParameters["packageId"]?.toIntOrNull()?:-1
            val serviceId = call.request.queryParameters["serviceId"]?.toIntOrNull()?:-1
            val dimension = call.request.queryParameters["dimension"]?:""

            if (id > -1 && packageId > -1 && serviceId > -1)
                transaction {
                    TableRasterData.update ({ TableRasterData.id eq id }) {
                        it[TableRasterData.name] = name
                        it[TableRasterData.packageId] = packageId
                        it[TableRasterData.serviceId] = serviceId
                        it[TableRasterData.dimension] = dimension
                        it[TableRasterData.dataComplete] = true
                    }
                }

            call.respondRedirect("./list")
        }



    }
}

