package at.duk.tables

import at.duk.tables.TablePackages.clientDefault
import at.duk.tables.TablePackages.nullable
import org.jetbrains.exposed.dao.id.IntIdTable
import org.jetbrains.exposed.sql.Column
import org.jetbrains.exposed.sql.javatime.datetime
import java.time.LocalDateTime

object TableCategories: IntIdTable("categories") {
        var name: Column<String> = varchar("name", length = 128)
        val created: Column<LocalDateTime> = datetime("created")
        val updated: Column<LocalDateTime?> = datetime("updated").nullable()
        val deleted: Column<LocalDateTime?> = datetime("deleted").nullable()
    }
