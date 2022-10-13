package at.duk.models

import com.fasterxml.jackson.annotation.JsonIgnore
import com.fasterxml.jackson.annotation.JsonProperty
import kotlinx.serialization.Serializable

@Serializable
data class RasterDataResponse(val data: MutableList<RasterServiceVals>)

@Serializable
data class RasterServiceVals(val id: Int, val vals: MutableList<RasterServiceVal>, val svg: String, val dim: String)

@Serializable
data class RasterServiceVal(@JsonProperty val `val`: Double?, @JsonIgnore val statistics: String, @JsonIgnore val dimension: String) {
    @JsonProperty val quantil = 99
}


