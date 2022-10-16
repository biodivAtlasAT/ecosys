package at.duk.tables

import at.duk.tables.TablePackages.default
import at.duk.tables.TablePackages.nullable
import org.jetbrains.exposed.dao.id.IntIdTable
import org.jetbrains.exposed.sql.Column
import org.jetbrains.exposed.sql.javatime.datetime
import java.time.LocalDateTime

object TableServices: IntIdTable("services") {
    var name: Column<String> = varchar("name", length = 128)
    val created: Column<LocalDateTime> = datetime("created")
    val updated: Column<LocalDateTime?> = datetime("updated").nullable()
    val deleted: Column<LocalDateTime?> = datetime("deleted").nullable()
    var categoryId: Column<Int> = integer("category_id")
    var svgPath: Column<String?> = varchar("svg_path", length = 512).nullable()
    var originalSvgName: Column<String?> = varchar("original_svg_name", length = 128).nullable()
}
