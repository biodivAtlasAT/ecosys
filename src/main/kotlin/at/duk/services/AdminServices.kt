package at.duk.services

import at.duk.models.EcosysPackageDataResponse
import at.duk.models.PackageData
import at.duk.models.ResponseError
import at.duk.tables.TableCategories

import at.duk.tables.TablePackages
import io.ktor.http.*
import org.jetbrains.exposed.sql.SqlExpressionBuilder.eq
import org.jetbrains.exposed.sql.insert
import org.jetbrains.exposed.sql.select
import org.jetbrains.exposed.sql.transactions.transaction
import org.jetbrains.exposed.sql.update
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


    }
}