package at.duk.routes

import at.duk.DUMMY_SVG_PATH
import at.duk.models.CategoryData
import at.duk.models.ServiceData
import at.duk.services.AdminServices
import at.duk.services.AdminServices.Companion.resolveSVGPath
import at.duk.services.RasterServices
import at.duk.tables.TableCategories
import at.duk.tables.TableRasterData
import at.duk.tables.TableServices
import io.ktor.http.content.*
import io.ktor.server.application.*
import io.ktor.server.config.*
import io.ktor.server.freemarker.*
import io.ktor.server.request.*
import io.ktor.server.response.*
import io.ktor.server.routing.*
import org.jetbrains.exposed.sql.*
import org.jetbrains.exposed.sql.transactions.transaction
import java.io.File
import java.nio.file.Paths
import java.time.LocalDateTime


fun Route.adminRouting(config: ApplicationConfig) {

    route("/admin") {
        get("") {

            call.respond(FreeMarkerContent("01_Start.ftl", null))
        }

        get("/categories") {
            val idsInUse = mutableListOf<Int>()
            val categoriesList = mutableListOf<CategoryData>()

            transaction {
                categoriesList.addAll(
                    TableCategories.select { TableCategories.deleted eq null }.orderBy(TableCategories.name)
                        .map { rs -> CategoryData(rs[TableCategories.id].value, rs[TableCategories.name]) }
                )
                idsInUse.addAll(
                    TableServices.select { TableServices.deleted eq null }.map {
                        it[TableServices.categoryId]
                    }
                )
            }

            call.respond(
                FreeMarkerContent(
                    "02_Categories.ftl",
                    mapOf("result" to categoriesList, "maxCount" to categoriesList.size, "idsInUse" to idsInUse.distinct())
                )
            )
        }

        post("/categoryUpdate") {
            val formParameters = call.receiveParameters()
            when(formParameters["mode"]?.toIntOrNull()?:-1) {
                0 -> if (formParameters["name"] != "")
                        AdminServices.categoryInsertOrUpdate(formParameters)
                1 -> AdminServices.categoryDelete(formParameters)
                else -> { }
            }
            call.respondRedirect("./categories")
        }

        get("/services") {
            val idsInUse = mutableListOf<Int>()
            val servicesList = mutableListOf<ServiceData>()
            val categoriesList = mutableListOf<CategoryData>()

            transaction {
                servicesList.addAll(
                    TableServices.select { TableServices.deleted eq null }.orderBy(TableServices.name)
                        .map { rs -> ServiceData(rs[TableServices.id].value, rs[TableServices.name], null,rs[TableServices.categoryId],
                            resolveSVGPath(rs[TableServices.svgPath]), rs[TableServices.originalSvgName]?:"dummy.svg" ) }
                )
                idsInUse.addAll(
                    TableRasterData.selectAll().map { rs -> rs[TableRasterData.serviceId]?:-1}
                )
                categoriesList.addAll(
                    TableCategories.select { TableCategories.deleted eq null }.orderBy(TableCategories.name)
                        .map { rs -> CategoryData(rs[TableCategories.id].value, rs[TableCategories.name]) }
                )
            }

            call.respond(
                FreeMarkerContent(
                    "03_Services.ftl",
                    mapOf("result" to servicesList, "maxCount" to servicesList.size, "idsInUse" to idsInUse.distinct(), "categoriesList" to categoriesList)
                )
            )
        }

        post("/serviceUpdate") {
            val formParameters = call.receiveParameters()
            when(formParameters["mode"]?.toIntOrNull()?:-1) {
                0 -> if (formParameters["name"] != "" && (formParameters["categoryId"]?.toIntOrNull() ?: -1) != -1)
                    AdminServices.serviceInsertOrUpdate(formParameters)
                1 -> AdminServices.serviceDelete(formParameters)
                else -> { }
            }
            call.respondRedirect("./services")
        }

        post("/serviceSVGDelete") {
            val dataCacheDirectory = config.propertyOrNull("dataCache.directory")?.getString() ?: Paths.get("").toAbsolutePath().toString()
            val svgDataFolder = File(dataCacheDirectory).resolve("svg").toString()
            val id = call.receiveParameters()["id"]?.toIntOrNull()?:-1
            if (id > -1) {
                transaction {
                    TableServices.select { TableServices.id eq id }.first().let { it[TableServices.svgPath] } ?.let { svgPath ->
                        if (File("$svgDataFolder/$svgPath").exists())
                            File("$svgDataFolder/$svgPath").delete()
                    }
                    TableServices.update ({ TableServices.id eq id }) {
                        it[TableServices.svgPath] = null
                        it[TableServices.originalSvgName] = null
                        it[TableServices.updated] = LocalDateTime.now()
                    }
                }
            }
            call.respondRedirect("./services")
        }

        post("/serviceSVGUpdate") {

            val dataCacheDirectory = config.propertyOrNull("dataCache.directory")?.getString() ?: Paths.get("").toAbsolutePath().toString()

            val svgDataFolder = File(dataCacheDirectory).resolve("svg")
            if (!File("$svgDataFolder").exists()) File("$svgDataFolder").mkdir()

            var tmpFileName = "SVG_${RasterServices.genTempName(15)}.svg"
            // to prevent existing names
            while(File(svgDataFolder.resolve(tmpFileName).toString()).exists()) tmpFileName = "SVG_${RasterServices.genTempName(15)}.svg"

            var fileName = ""
            var uploadId = -1
            call.receiveMultipart().forEachPart { part ->
                when (part) {
                    is PartData.FormItem -> {
                        if (part.name == "uploadId") uploadId = part.value.toIntOrNull()?:-1
                    }
                    is PartData.FileItem -> {
                        fileName = part.originalFileName as String
                        val fileBytes = part.streamProvider().readBytes()
                        File(svgDataFolder.resolve(tmpFileName).toString()).writeBytes(fileBytes)
                    }
                    else -> {}
                }
            }
            if(uploadId != -1 && File(svgDataFolder.resolve(tmpFileName).toString()).exists()) {
                transaction {
                    // check for update --> delete svg file!!!
                    TableServices.select { TableServices.id eq uploadId }.first().let { it[TableServices.svgPath] }
                        ?.let { svgPath ->
                            if (File("$svgDataFolder/$svgPath").exists())
                                File("$svgDataFolder/$svgPath").delete()
                        }
                    TableServices.update({ TableServices.id eq uploadId }) {
                        it[TableServices.svgPath] = "$tmpFileName"
                        it[TableServices.originalSvgName] = fileName
                        it[TableServices.updated] = LocalDateTime.now()
                    }
                }
            }

            call.respondRedirect("./services")
        }



        get("/cache/delete") {
            call.respond(FreeMarkerContent("14_CacheDelete.ftl", null))
        }

    }
}

