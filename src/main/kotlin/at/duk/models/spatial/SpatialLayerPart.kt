package at.duk.models.spatial

data class SpatialLayerPart(
    val type: String,
    val coordinates: List<List<List<List<Double>>>>
)