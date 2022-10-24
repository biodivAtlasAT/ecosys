/*
 * Copyright (C) 2022 Danube University Krems
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     https://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 * SPDX-License-Identifier: Apache-2.0
 * License-Filename: LICENSE
 */
package at.duk.services

import at.duk.models.*
import at.duk.services.AdminServices.resolveSVGPath
import at.duk.tables.TableLayers
import at.duk.tables.TablePackages
import at.duk.tables.TableRasterData
import at.duk.tables.TableServices
import com.fasterxml.jackson.module.kotlin.jacksonObjectMapper
import org.jetbrains.exposed.sql.SqlExpressionBuilder.neq
import org.jetbrains.exposed.sql.select
import org.jetbrains.exposed.sql.transactions.transaction

object ApiServices {
        private val mapper = jacksonObjectMapper()

        fun generatePackageResponse(): String {
            val packageList: MutableList<PackageData> = emptyList<PackageData>().toMutableList()
            transaction {
                TablePackages.select { TablePackages.deleted eq null }.forEach { rs ->
                    packageList.add(
                        PackageData(rs[TablePackages.id].value, rs[TablePackages.name], rs[TablePackages.default])
                    )
                }
            }
            return mapper.writeValueAsString(EcosysPackageDataResponse(ResponseError(0, ""), packageList))
        }

        fun generateLayersResponse(): String {
            val layerList = mutableListOf<LayerData>()
            transaction {
                layerList.addAll(
                    TableLayers.select { TableLayers.enabled eq true }.orderBy(TableLayers.name)
                        .map { rs -> LayerData(rs[TableLayers.id].value, rs[TableLayers.name], true, rs[TableLayers.key] ) }
                )
            }
            return mapper.writeValueAsString(EcosysLayerDataResponse(ResponseError(0, ""), layerList))
        }

        fun generateRasterDataResponseIntersect(): String {


            val dummy = "{\"error\": {\"no\": 0,\"msg\": \"\"},\"data\": [{\"id\": 1,\"vals\": {\"val\": \"13.234\",\"quantil\": \"2\"},\"svg\": \"./svg/empty.svg\",\"dim\": \"km\"},	{\"id\": 4, \"vals\": {\"val\": \"3.22\",\"quantil\": \"4\"},\"svg\": \"./svg/empty.svg\",\"dim\": \"kg\"},]}"
            return dummy

        }

        fun generateServiceResponse(packageId: Int): String {
            val sql = "select s.original_svg_name as original_svg_name, s.svg_path as svg_path, s.id as service_id, " +
                    "s.name as service_name, s.category_id as category_id, c.name as category_name from services s, " +
                    "categories c where s.id in (select distinct (service_id) from raster_data where " +
                    "package_id = $packageId) and s.deleted is null and s.category_id = c.id;"

            val categoryList = mutableMapOf<Int, CategoryData> ()
            val serviceList = mutableListOf<ServiceData>()

            transaction {
                exec(sql) { rs ->
                    while (rs.next()) {
                        if (!categoryList.containsKey(rs.getInt("category_id")))
                            categoryList[rs.getInt("category_id")] =
                                CategoryData(rs.getInt("category_id"), rs.getString("category_name"))
                        val category = categoryList[rs.getInt("category_id")]!!
                        serviceList.add(
                            ServiceData(
                                rs.getInt("service_id"),
                                rs.getString("service_name"), category, category.id,
                                resolveSVGPath(rs.getString("svg_path")), rs.getString("original_svg_name")
                            )
                        )
                    }
                }
            }
            return mapper.writeValueAsString(EcosysServiceDataResponse(ResponseError(0, ""), serviceList))
        }

        fun generateRasterDataResponseResponse(rasterDataRequest: RasterDataRequest): String {

            checkServiceIDsagainstPackageID(rasterDataRequest)

            val unionStatementsql = generateUnionStatement(rasterDataRequest)
            var lastServiceId = -1
            val lastListofPoints = mutableListOf<RasterServiceVal>()
            val result = mutableMapOf<Int, MutableList<RasterServiceVal>>()
            val serviceList = mutableListOf<RasterServiceVals>()
            rasterDataRequest.services
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
                        val l = result[it[TableServices.id].value] ?: emptyList<RasterServiceVal>().toMutableList()
                        serviceList.add(
                            RasterServiceVals(
                                it[TableServices.id].value, l, resolveSVGPath(it[TableServices.svgPath]),
                                l.first().dimension
                            )
                        )
                    }
                }
            }

            return mapper.writeValueAsString(EcosysRasterDataResponse(ResponseError(0, ""), serviceList))
        }

        // Removes possible serviceIDs if they do not belong to the given packageID
        fun checkServiceIDsagainstPackageID(rasterDataRequest: RasterDataRequest) {
            val idsToDelete = rasterDataRequest.services?.toMutableList() ?: emptyList<Int>().toMutableList()
            transaction {
                TableRasterData.select { TableRasterData.packageId eq rasterDataRequest.packageID }.forEach { res ->
                    idsToDelete.remove(res[TableRasterData.serviceId])
                }
                // remove "deleted" services if exist
                TableServices.select { TableServices.deleted neq null }.forEach {
                    idsToDelete.remove(it[TableServices.id].value)
                }
            }
            rasterDataRequest.services?.removeAll(idsToDelete)
            // add only for select statement "in"
            if (rasterDataRequest.services?.isEmpty() == true) rasterDataRequest.services!!.add(-1)
        }

        private fun generateUnionStatement(rasterDataRequest: RasterDataRequest): String {
            val selStmtList = mutableListOf<String>()
            rasterDataRequest.coordsList.forEachIndexed { index, pair ->
                selStmtList.add(
                    "Select $index as pointId, dimension, statistics, id, service_id, " +
                        "ST_Value(rast, ST_Transform(ST_SetSRID(ST_MakePoint(${pair.first}, ${pair.second}), 4326), " +
                        "ST_SRID(rast))) as v from raster_data where package_id = ${rasterDataRequest.packageID} " +
                        "and data_complete is true and service_id in " +
                        rasterDataRequest.services!!.joinToString(separator = ",", prefix = "(", postfix = ")") {
                            it.toString()
                        }
                )
            }

            return selStmtList.joinToString(separator = " union all ", postfix = " order by service_id, pointId") { it }
        }
    }
