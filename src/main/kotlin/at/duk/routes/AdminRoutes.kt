package at.duk.routes

import at.duk.models.CategoryData
import at.duk.services.AdminService
import at.duk.services.AdminService.Companion.categoryUpdate
import at.duk.tables.TableCategories
import at.duk.tables.TableRasterTasks
import at.duk.tables.TableServices
import at.duk.tables.TableUploadedRasterData
import io.ktor.server.application.*
import io.ktor.server.config.*
import io.ktor.server.freemarker.*
import io.ktor.server.request.*
import io.ktor.server.response.*
import io.ktor.server.routing.*
import org.jetbrains.exposed.sql.*
import org.jetbrains.exposed.sql.transactions.transaction
import java.time.LocalDateTime

fun Route.adminRouting(config: ApplicationConfig) {
    route("/admin") {
        get("") {

            call.respond(FreeMarkerContent("01_Start.ftl", null))
        }

        get("/categories") {
            val idsInUse = mutableListOf<Int>()
            val categoriesList: MutableList<CategoryData> = emptyList<CategoryData>().toMutableList()

            transaction {
                categoriesList.addAll(
                    TableCategories.select { TableCategories.deleted eq null }.orderBy(TableCategories.name)
                        .map { rs -> CategoryData(rs[TableCategories.id].value, rs[TableCategories.name]) }
                )
                idsInUse.addAll(
                    TableServices.select { TableServices.deleted eq null }.map { rs -> rs[TableServices.categoryId]}
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
            AdminService.categoryUpdate(call.receiveParameters())
            call.respondRedirect("./categories")
        }

        get("/services") {
            call.respond(FreeMarkerContent("03_Services.ftl", null))
        }

        get("/cache/delete") {
            call.respond(FreeMarkerContent("14_CacheDelete.ftl", null))
        }

    }
}

