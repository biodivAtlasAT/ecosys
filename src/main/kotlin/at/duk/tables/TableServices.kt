package at.duk.tables

import org.jetbrains.exposed.dao.id.IntIdTable
import org.jetbrains.exposed.sql.Column
import org.jetbrains.exposed.sql.javatime.datetime

object TableServices: IntIdTable("services") {
    val name = TableServices.varchar("name", length = 128)
    val created = datetime("created")
    val updated = datetime("updated").nullable()
    val deleted = datetime("deleted").nullable()
    val categoryId = TableServices.integer("category_id")
    val svgPath = TableServices.varchar("svg_path", length = 512)

}