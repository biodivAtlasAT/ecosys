package at.duk.tables

import at.duk.tables.TableCategories.nullable
import org.jetbrains.exposed.dao.id.IntIdTable
import org.jetbrains.exposed.sql.Column
import org.jetbrains.exposed.sql.javatime.datetime
import java.time.LocalDateTime

object TablePackages: IntIdTable("packages") {
    var name: Column<String> = varchar("name", length = 50)
    var default: Column<Boolean> = bool("default").default(false)
    val created: Column<LocalDateTime> = datetime("created")
    val updated: Column<LocalDateTime?> = datetime("updated").nullable()
    val deleted: Column<LocalDateTime?> = datetime("deleted").nullable()

}