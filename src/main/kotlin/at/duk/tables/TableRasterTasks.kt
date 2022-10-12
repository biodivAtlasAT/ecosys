package at.duk.tables

import org.jetbrains.exposed.dao.id.IntIdTable
import org.jetbrains.exposed.sql.Column
import org.jetbrains.exposed.sql.javatime.datetime
import java.time.LocalDateTime

object TableRasterTasks : IntIdTable("raster_tasks") {
    val pid: Column<Int> = integer("pid")
    val start: Column<LocalDateTime> = datetime("start")
    val end: Column<LocalDateTime> = datetime("end")
    val uploadedRasterDataId: Column<Int> = integer("uploaded_raster_data_id")
    val rc: Column<Int?> = integer("rc").nullable()
    val message: Column<String> = varchar("message", 4096).default("")
    val imported: Column<Boolean> = bool("imported").default(false)
}

