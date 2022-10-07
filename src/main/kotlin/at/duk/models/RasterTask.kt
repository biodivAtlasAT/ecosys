package at.duk.models

import java.time.LocalDateTime

data class RasterTask(
    val id: Int,
    val pid: Int,
    val start: String,
    val end: String?,
    val uploadedRasterDataId: Int,
    val name: String?,
    val rc: Int?,
    val message: String?,
    val imported: Boolean?
)
