package at.duk.tables

import org.jetbrains.exposed.dao.id.IntIdTable
import org.jetbrains.exposed.sql.Column


object TableRasterData: IntIdTable("raster_data") {
        val filename: Column<String> = varchar("filename", 512)
        val name: Column<String> = varchar("name", 128)
        val tmpTable: Column<String> = varchar("tmp_table", 128)
        val dataComplete: Column<Boolean> = bool("data_complete")
}