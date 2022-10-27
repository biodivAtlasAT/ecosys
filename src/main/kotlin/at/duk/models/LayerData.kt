package at.duk.models

import com.fasterxml.jackson.annotation.JsonIgnore
import kotlinx.serialization.Serializable

@Serializable
data class LayerData(
    val id: Int,
    val name: String,
    @JsonIgnore val enabled: Boolean,
    @JsonIgnore val spatialLayerId: String,
    val key: String
)
