package at.duk.services

import at.duk.models.EcosysPackageDataResponse
import at.duk.models.PackageData
import at.duk.models.ResponseError
import at.duk.tables.TableCategories

import at.duk.tables.TablePackages
import at.duk.tables.TableServices
import io.ktor.http.*
import org.jetbrains.exposed.sql.SqlExpressionBuilder.eq
import org.jetbrains.exposed.sql.insert
import org.jetbrains.exposed.sql.select
import org.jetbrains.exposed.sql.transactions.transaction
import org.jetbrains.exposed.sql.update
import java.io.File
import java.time.LocalDateTime

class AdminServices {
    companion object {
        fun categoryDelete(formParameters: Parameters) = formParameters["id"]?.toIntOrNull().let { id ->
            transaction {
                TableCategories.update({ TableCategories.id eq id }) {
                    it[TableCategories.deleted] = LocalDateTime.now()
                }
            }
        }

        fun categoryInsertOrUpdate(formParameters: Parameters) = formParameters["name"]?.let { name ->
            formParameters["id"]?.toIntOrNull().let { id ->
                transaction {
                    if (id == -1)
                        TableCategories.insert {
                            it[TableCategories.name] = name
                            it[TableCategories.created] = LocalDateTime.now()
                        }
                    else
                        TableCategories.update({ TableCategories.id eq id }) {
                            it[TableCategories.name] = name
                            it[TableCategories.updated] = LocalDateTime.now()
                        }
                }
            }
        }

        fun serviceDelete(formParameters: Parameters) = formParameters["id"]?.toIntOrNull().let { id ->
            transaction {
                TableServices.update({ TableServices.id eq id }) {
                    it[TableServices.deleted] = LocalDateTime.now()
                }
            }
        }

        fun serviceInsertOrUpdate(formParameters: Parameters) = formParameters["name"]?.let { name ->
            val categoryId = formParameters["categoryId"]?.toIntOrNull()?:-1
            formParameters["id"]?.toIntOrNull().let { id ->
                transaction {
                    if (id == -1)
                        TableServices.insert {
                            it[TableServices.name] = name
                            it[TableServices.categoryId] = categoryId
                            it[TableServices.created] = LocalDateTime.now()
                        }
                    else
                        TableServices.update({ TableServices.id eq id }) {
                            it[TableServices.name] = name
                            it[TableServices.categoryId] = categoryId
                            it[TableServices.updated] = LocalDateTime.now()
                        }
                }
            }
        }

        fun resolveSVGPath(str: String?) =  if (str == null)
                "static/svg/dummy.svg"
            else
                "assets/svg/$str"

        fun getUniqueSVGName(svgDataFolder: File): String {
            var tmpFileName = "SVG_${RasterServices.genTempName(15)}.svg"
            while (File(svgDataFolder.resolve(tmpFileName).toString()).exists()) tmpFileName =
                "SVG_${RasterServices.genTempName(15)}.svg"
            return tmpFileName
        }

        fun getSVGDataFolder(dataCacheDirectory: String): File {
            val svgDataFolder = File(dataCacheDirectory).resolve("svg")
            if (!File("$svgDataFolder").exists()) File("$svgDataFolder").mkdir()
            return svgDataFolder
        }

    }
}