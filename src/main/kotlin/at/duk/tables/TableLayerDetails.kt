package at.duk.tables

import at.duk.tables.TablePackages.default
import at.duk.tables.TablePackages.nullable
import org.jetbrains.exposed.dao.id.IntIdTable
import org.jetbrains.exposed.sql.Column
import org.jetbrains.exposed.sql.javatime.datetime
import java.time.LocalDateTime

object TableLayerDetails: IntIdTable("layer_details") {
    val sequence: Column<Int> = integer("sequence")
    val layerId: Column<Int> = integer("layer_id")
    val keyId: Column<String> = varchar("key_id", length = 128)
}