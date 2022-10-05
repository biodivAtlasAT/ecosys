package at.duk.tables

import org.jetbrains.exposed.dao.id.IntIdTable
import org.jetbrains.exposed.sql.javatime.datetime

object Packages: IntIdTable() {
    val name = Packages.varchar("name", length = 50)
    val default = Packages.bool("default").clientDefault { false }
    val created = datetime("created")
    val updated = datetime("updated")
    val deleted = datetime("deleted")
}