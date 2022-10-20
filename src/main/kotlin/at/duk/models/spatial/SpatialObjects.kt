package at.duk.models.spatial

class SpatialObjects : ArrayList<SpatialObjectItem>()

data class SpatialObjectItem(
    val area_km: Double,
    val bbox: String,
    val centroid: String,
    val description: String,
    val featureType: String,
    val fid: String,
    val fieldname: String,
    val id: String,
    val name: String,
    val name_id: Int,
    val pid: String,
    val wmsurl: String
)