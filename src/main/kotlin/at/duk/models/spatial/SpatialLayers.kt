package at.duk.models.spatial

class SpatialLayers : ArrayList<SpatialLayersItem>()

data class SpatialLayersItem(
    val citation_date: String,
    val classification1: String,
    val classification2: String,
    val datalang: String,
    val description: String,
    val displayname: String,
    val displaypath: String,
    val domain: String,
    val dt_added: Long,
    val enabled: Boolean,
    val environmentalvaluemax: String,
    val environmentalvaluemin: String,
    val environmentalvalueunits: String,
    val grid: Boolean,
    val id: Int,
    val keywords: String,
    val licence_level: String,
    val licence_link: String,
    val licence_notes: String,
    val maxlatitude: Double,
    val maxlongitude: Double,
    val mddatest: String,
    val metadatapath: String,
    val minlatitude: Double,
    val minlongitude: Double,
    val name: String,
    val notes: String,
    val path_orig: String,
    val respparty_role: String,
    val shape: Boolean,
    val source: String,
    val source_link: String,
    val type: String
)