package at.duk.models

import io.ktor.server.application.*
import io.ktor.server.request.*

class RasterDataRequest(request: ApplicationRequest) {
    val packageID = request.queryParameters["packageID"]?.toIntOrNull()
    var services = request.queryParameters["services"]?.replace("[","")?. replace("]","")?.split(",")?.map { it.toInt() }?.toMutableList()
    val coords = request.queryParameters["coords"]?.replace("[","")?. replace("]","")?.split(",")?.toList()
    val coordsList: MutableList<Pair<Double, Double>> = emptyList<Pair<Double, Double>>().toMutableList()

    fun initCoordsList() {
        coords?.forEach {
            val lng_lat = it.replace("(","").replace(")","").split("/")
            if (lng_lat.size == 2) {
                val lng = lng_lat[0].toDoubleOrNull()
                val lat = lng_lat[1].toDoubleOrNull()
                lng?.let { lat?.let { coordsList.add(Pair(lng, lat)) }} }
            }
        }
    fun initServicesList() {
        services = services?: listOf(-1).toMutableList()
    }

    fun reqDataExists() = (packageID != null && services != null && services!!.isNotEmpty() && coordsList.isNotEmpty())

}