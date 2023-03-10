package at.duk.models.biotop

import com.fasterxml.jackson.annotation.JsonIgnore
import kotlinx.serialization.Serializable

@Serializable
data class SpeciesData(
    val taxonId: Int,
    val description: String?
) {
    @JsonIgnore val id: Int = -1
    @JsonIgnore val projectId: Int = -1
}
