package at.duk.tables

import at.duk.tables.TablePackages.default
import at.duk.tables.TablePackages.nullable
import org.jetbrains.exposed.dao.id.IntIdTable
import org.jetbrains.exposed.sql.Column
import org.jetbrains.exposed.sql.SqlExpressionBuilder.eq
import org.jetbrains.exposed.sql.javatime.datetime
import org.jetbrains.exposed.sql.select
import org.jetbrains.exposed.sql.transactions.transaction
import org.jetbrains.exposed.sql.update
import java.io.File
import java.time.LocalDateTime

object TableServices: IntIdTable("services") {
    var name: Column<String> = varchar("name", length = 128)
    val created: Column<LocalDateTime> = datetime("created")
    val updated: Column<LocalDateTime?> = datetime("updated").nullable()
    val deleted: Column<LocalDateTime?> = datetime("deleted").nullable()
    var categoryId: Column<Int> = integer("category_id")
    var svgPath: Column<String?> = varchar("svg_path", length = 512).nullable()
    var originalSvgName: Column<String?> = varchar("original_svg_name", length = 128).nullable()

    fun removeSVG(id: Int, svgDataFolder: String) {
        TableServices.select { TableServices.id eq id }.first().let { it[TableServices.svgPath] }
            ?.let { svgPath ->
                if (File("$svgDataFolder/$svgPath").exists())
                    File("$svgDataFolder/$svgPath").delete()
            }
        TableServices.update({ TableServices.id eq id }) {
            it[TableServices.svgPath] = null
            it[TableServices.originalSvgName] = null
            it[TableServices.updated] = LocalDateTime.now()
        }
    }

    private fun updateSVG(id: Int, tmpFileName: String, fileName: String) {
        TableServices.update({ TableServices.id eq id }) {
            it[TableServices.svgPath] = tmpFileName
            it[TableServices.originalSvgName] = fileName
            it[TableServices.updated] = LocalDateTime.now()
        }
    }

    fun updateTableServices(id: Int?, svgDataFolder: File, tmpFileName: String, fileName: String) {
        id?.let {
            if (id > -1 && File(svgDataFolder.resolve(tmpFileName).toString()).exists()) {
                transaction {
                    removeSVG(it, svgDataFolder.path)
                    updateSVG(it, tmpFileName, fileName)
                }
            }
        }
    }


}
