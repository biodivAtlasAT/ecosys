package at.duk.models

import at.duk.models.spatial.SpatialLayerPart

data class FeatureCollection(
    val type: String,
    val features: List<Feature>
)

data class Feature(
    val type: String,
    val properties: Properties,
    val geometry: SpatialLayerPart,
)

data class Geometry(
    val type: String,
    val coordinates: String
)

data class Properties(
    val pid: String,
    val id: String,
    val name: String,
    val fieldname: String,
    val description: String
)