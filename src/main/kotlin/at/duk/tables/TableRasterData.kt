package at.duk.tables

import org.jetbrains.exposed.dao.id.IntIdTable
import org.jetbrains.exposed.sql.Column


object TableRasterData: IntIdTable("raster_data") {
        val filename: Column<String> = varchar("filename", 512)
        var name: Column<String> = varchar("name", 128)
        val tmpTable: Column<String> = varchar("tmp_table", 128)
        val dataComplete: Column<Boolean> = bool("data_complete")
        val dimension: Column<String> = varchar("dimension", 128)
        val serviceId: Column<Int?> = integer("service_id").nullable()
        val packageId: Column<Int?> = integer("package_id").nullable()
        val rasterTaskId: Column<Int?> = integer("raster_task_id").nullable()
        val uploadedRasterDataId: Column<Int?> = integer("uploaded_raster_data_id").nullable()
}