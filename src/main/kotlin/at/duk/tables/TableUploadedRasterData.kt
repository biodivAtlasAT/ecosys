package at.duk.tables

import org.jetbrains.exposed.dao.id.IntIdTable
import org.jetbrains.exposed.sql.Column


object TableUploadedRasterData: IntIdTable("uploaded_Raster_Data") {
        val filename: Column<String> = varchar("filename", 512)
        val name: Column<String> = varchar("name", 128)
        val tmpTable: Column<String> = varchar("tmp_table", 128)
    }