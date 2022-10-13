package at.duk.services

import at.duk.models.*
import at.duk.tables.TableRasterData
import at.duk.tables.TableServices
import com.fasterxml.jackson.module.kotlin.jacksonObjectMapper
import org.jetbrains.exposed.sql.select
import org.jetbrains.exposed.sql.transactions.transaction

class ApiServices {
    companion object {

        private val mapper = jacksonObjectMapper()
        fun generateRasterDataResponseResponse(rasterDataRequest: RasterDataRequest): String {

            checkServiceIDsagainstPackageID(rasterDataRequest)

            val unionStatementsql = generateUnionStatement(rasterDataRequest)
            var lastServiceId = -1
            val lastListofPoints = mutableListOf<RasterServiceVal>()
            val result = mutableMapOf<Int, MutableList<RasterServiceVal>>()
            val serviceList = mutableListOf<RasterServiceVals>()
            transaction {
                exec(unionStatementsql) { rs ->
                    while (rs.next()) {
                        if (lastServiceId != rs.getInt("service_id")) {
                            if (lastServiceId != -1)
                                result[lastServiceId] = lastListofPoints.toMutableList()
                            lastListofPoints.clear()
                            lastServiceId = rs.getInt("service_id")
                        }
                        val v = if (rs.getObject("v") == null) null else rs.getDouble("v")
                        lastListofPoints.add(RasterServiceVal(v, rs.getString("statistics"), rs.getString("dimension")))
                    }
                    if (lastServiceId != -1)
                        result[lastServiceId] = lastListofPoints.toMutableList()
                }

                TableServices.select { TableServices.deleted eq null }.forEach {
                    if (result.containsKey(it[TableServices.id].value)) {
                        val l = result[it[TableServices.id]!!.value] ?: emptyList<RasterServiceVal>().toMutableList()
                        serviceList.add(
                            RasterServiceVals(it[TableServices.id].value, l, it[TableServices.svgPath], l.first().dimension))
                    }
                }
            }

            return mapper.writeValueAsString(EcosysRasterDataResponse(ResponseError(0, ""), RasterDataResponse(serviceList)))

        }

        // Removes possible serviceIDs if they not belonging zo the given packageID
        fun checkServiceIDsagainstPackageID(rasterDataRequest: RasterDataRequest) {
            val idsToDelete = rasterDataRequest.services?.toMutableList() ?: emptyList<Int>().toMutableList()
            transaction {
                TableRasterData.select {TableRasterData.packageId eq rasterDataRequest.packageID }.forEach { res ->
                    idsToDelete.remove(res[TableRasterData.serviceId])
                }
                // remove "deleted" services if exist
                TableServices.select { TableServices.deleted neq null }.forEach {
                    idsToDelete.remove(it[TableServices.id].value)
                }
            }
            rasterDataRequest.services?.removeAll(idsToDelete)
        }

        private fun generateUnionStatement(rasterDataRequest: RasterDataRequest): String {
            val selStmtList = mutableListOf<String>()
            rasterDataRequest.coordsList.forEachIndexed { index, pair ->
                selStmtList.add("Select $index as pointId, dimension, statistics, id, service_id, ST_Value(rast, ST_SetSRID(ST_MakePoint(${pair.first}, ${pair.second}), 4326)) as v " +
                    "from raster_data where service_id in ${rasterDataRequest.services!!.joinToString(separator = ",", prefix = "(", postfix = ")") { it.toString() }}")
            }
            return selStmtList.joinToString(separator = " union all ", postfix = " order by service_id, pointId") { it }
        }

    }
}