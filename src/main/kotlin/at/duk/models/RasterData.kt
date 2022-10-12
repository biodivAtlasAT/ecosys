package at.duk.models

data class RasterData(
    val id: Int,
    val name: String,
    val dimension: String,
    val serviceName: String,
    val packageName: String,
    val dataCompleted: Boolean
)