package at.duk.tables

import at.duk.tables.TablePackages.clientDefault
import at.duk.tables.TablePackages.nullable
import org.jetbrains.exposed.dao.id.IntIdTable
import org.jetbrains.exposed.sql.javatime.datetime

class TableCategories {
    object TableCategories: IntIdTable("categories") {
        val name = TableCategories.varchar("name", length = 128)
        val created = datetime("created")
        val updated = datetime("updated").nullable()
        val deleted = datetime("deleted").nullable()
    }
}