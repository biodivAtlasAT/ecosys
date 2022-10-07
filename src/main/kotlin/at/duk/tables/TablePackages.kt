package at.duk.tables

import org.jetbrains.exposed.dao.id.IntIdTable
import org.jetbrains.exposed.sql.javatime.datetime

object TablePackages: IntIdTable("packages") {
    val name = TablePackages.varchar("name", length = 50)
    val default = TablePackages.bool("default").clientDefault { false }
    val created = datetime("created")
    val updated = datetime("updated").nullable()
    val deleted = datetime("deleted").nullable()
}