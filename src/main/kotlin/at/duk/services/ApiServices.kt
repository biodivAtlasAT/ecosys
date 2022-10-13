package at.duk.services

import at.duk.models.RasterDataRequest
import at.duk.models.RasterDataResponse
import at.duk.models.RasterServiceVal
import at.duk.models.RasterServiceVals
import at.duk.tables.TableRasterData
import at.duk.tables.TableServices
import org.jetbrains.exposed.sql.select
import org.jetbrains.exposed.sql.transactions.transaction

class ApiServices {
    companion object {

        fun generateRasterDataResponseResponse(rasterDataRequest: RasterDataRequest): RasterDataResponse {
            var str = ""

            checkServiceIDsagainstPackageID(rasterDataRequest)
            // 2. union statement for every coord for every raster_data
            val unionStatementsql = generateUnionStatement(rasterDataRequest)
print ("--->: $unionStatementsql")
            var lastServiceId = -1
            val lastListofPoints = mutableListOf<RasterServiceVal>()
            val result = mutableMapOf<Int, MutableList<RasterServiceVal>>()
            val serviceList = mutableListOf<RasterServiceVals>()
            transaction {
                exec(unionStatementsql) { rs ->
                    while (rs.next()) {
                        if (lastServiceId != rs.getInt("service_id")) {
                            if (lastServiceId != -1)
                                result[rs.getInt("service_id")] = lastListofPoints.toMutableList()
                            lastListofPoints.clear()
                            lastServiceId = rs.getInt("service_id")
                        }
                        lastListofPoints.add(RasterServiceVal(rs.getDouble("v"), rs.getString("statistics"), rs.getString("dimension")))
                    }
                    if (lastServiceId != -1)
                        result[lastServiceId] = lastListofPoints.toMutableList()
                }

                TableServices.select { TableServices.deleted eq null }.forEach {
                    println("!!! : ${it[TableServices.id].value}")
                    if (result.containsKey(it[TableServices.id].value)) {
                        val l = result[it[TableServices.id]!!.value] ?: emptyList<RasterServiceVal>().toMutableList()
                        serviceList.add(
                            RasterServiceVals(it[TableServices.id].value, l, it[TableServices.svgPath], l.first().dimension))
                    }
                }
            }
println("=======> $result")
            // {1=[RasterServiceVal(val=0.0, statistics={"0.2":31.0,"0.4":128.0,"0.6":128.0,"0.8":128.0}), RasterServiceVal(val=0.0, statistics={"0.2":31.0,"0.4":128.0,"0.6":128.0,"0.8":128.0})]}
println("=======> $serviceList")
//            [RasterServiceVals(id=1, vals=[RasterServiceVal(val=0.0, statistics={"0.2":31.0,"0.4":128.0,"0.6":128.0,"0.8":128.0}, dimension=kg), RasterServiceVal(val=0.0, statistics={"0.2":31.0,"0.4":128.0,"0.6":128.0,"0.8":128.0}, dimension=kg)], svg=static/svg/nahrung.svg, dim=kg)]

            return RasterDataResponse(serviceList)
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
            /*select 1 as pointId, id, service_id, ST_Value(rast, ST_SetSRID(ST_MakePoint(15.8631722, 48.4062342), 4326)) as v
            from raster_data where service_id in (3, 4) union all select  2 as pointId, id, service_id,ST_Value(rast, ST_SetSRID(ST_MakePoint(15.9631722, 48.5062342), 4326)) as v
            from raster_data where service_id in (3, 4) union all select  3 as pointId, id, service_id,ST_Value(rast, ST_SetSRID(ST_MakePoint(15.7631722, 48.3062342), 4326)) as v
            from raster_data where service_id in (3, 4);*/

            val selStmtList = mutableListOf<String>()
            rasterDataRequest.coordsList.forEachIndexed { index, pair ->
                selStmtList.add("Select $index as pointId, dimension, statistics, id, service_id, ST_Value(rast, ST_SetSRID(ST_MakePoint(${pair.first}, ${pair.second}), 4326)) as v " +
                    "from raster_data where service_id in ${rasterDataRequest.services!!.joinToString(separator = ",", prefix = "(", postfix = ")") { it.toString() }}")
            }
            return selStmtList.joinToString(separator = " union all ", postfix = " order by service_id, pointId") { it }
        }

    }
}