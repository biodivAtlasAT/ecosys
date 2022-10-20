package at.duk.models.spatial

data class SpatialFields(
    val addtomap: Boolean,
    val analysis: Boolean,
    val defaultlayer: Boolean,
    val desc: String,
    val enabled: Boolean,
    val id: String,
    val indb: Boolean,
    val intersect: Boolean,
    val last_update: Any?,
    val layerbranch: Boolean,
    val name: String,
    val namesearch: Boolean,
    val number_of_objects: Int,
    val objects: List<Object>,
    val sdesc: String,
    val sid: String,
    val sname: String,
    val spid: String,
    val type: String,
    val wms: Any?
)

data class Object(
    val area_km: Double,
    val bbox: String,
    val description: String,
    val fid: String,
    val fieldname: String,
    val id: String,
    val name: String,
    val pid: String,
    val wmsurl: String
)