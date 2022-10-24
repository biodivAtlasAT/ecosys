package at.duk.tables

import at.duk.tables.TablePackages.default
import at.duk.tables.TablePackages.nullable
import org.jetbrains.exposed.dao.id.IntIdTable
import org.jetbrains.exposed.sql.Column
import org.jetbrains.exposed.sql.javatime.datetime
import java.time.LocalDateTime

object TableLayers: IntIdTable("layers") {
    var name: Column<String> = varchar("name", length = 512)
    val key: Column<String> = varchar("key", length = 512)
    val spatialLayerId: Column<String> = varchar("spatial_layer_id", length = 32)
    val enabled: Column<Boolean> = bool("enabled").default(true)
}