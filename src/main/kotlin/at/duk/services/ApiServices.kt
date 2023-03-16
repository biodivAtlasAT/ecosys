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
import at.duk.models.biotop.HierarchyData
import at.duk.models.biotop.ProjectData
import at.duk.models.biotop.SpeciesData
import at.duk.services.AdminServices.resolveSVGPath
import at.duk.services.BiotopServices.setCQLFilter
import at.duk.tables.*
import at.duk.tables.biotop.TableHierarchy
import at.duk.tables.biotop.TableProjects
import at.duk.tables.biotop.TableSpecies
import at.duk.tables.biotop.TableSpeciesGroups
import com.fasterxml.jackson.databind.JsonNode
import com.fasterxml.jackson.databind.node.ObjectNode
import com.fasterxml.jackson.module.kotlin.jacksonObjectMapper
import io.ktor.client.*
import io.ktor.client.engine.cio.*
import io.ktor.client.request.*
import io.ktor.client.statement.*
import io.ktor.http.*
import io.ktor.server.config.*
import kotlinx.serialization.Serializable
import org.jetbrains.exposed.sql.*
import org.jetbrains.exposed.sql.SqlExpressionBuilder.eq
import org.jetbrains.exposed.sql.statements.StatementType
import org.jetbrains.exposed.sql.transactions.transaction
import java.sql.ResultSet

object ApiServices {
    private val mapper = jacksonObjectMapper()

    private fun <T : Any> String.execAndMap(transaction: Transaction, transform: (ResultSet) -> T): List<T> {
        val result = arrayListOf<T>()
        transaction.exec(this, emptyList(), StatementType.SELECT) { rs ->
            while (rs.next()) {
                result += transform(rs)
            }
        }
        return result
    }

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
                    .map { rs ->
                        LayerData(
                            rs[TableLayers.id].value, rs[TableLayers.name], rs[TableLayers.enabled],
                            rs[TableLayers.spatialLayerId], rs[TableLayers.key]
                        )
                    }
            )
        }
        return mapper.writeValueAsString(EcosysLayerDataResponse(ResponseError(0, ""), layerList))
    }

    fun generateRasterDataResponseIntersect(packageId: Int, layerId: Int, layerKey: String): String {
        val rasterServiceValsSingle = mutableListOf<RasterServiceValsSingle>()
        transaction {
            var layerDetailsId = -1
            TableLayerDetails.select {
                TableLayerDetails.layerId eq layerId
                }.andWhere {
                    TableLayerDetails.keyId eq layerKey
                }.also {
                    if (!it.empty())
                        layerDetailsId = it.first()[TableLayerDetails.id].value
            }
            if (layerDetailsId > -1)
                fillRasterServiceValsSingleList(packageId, layerDetailsId, rasterServiceValsSingle)
        }
        return mapper.writeValueAsString(
            EcosysRasterDataResponseSingle(ResponseError(0, ""), rasterServiceValsSingle)
        )
    }

    private fun fillRasterServiceValsSingleList(
        packageId: Int, layerDetailsId: Int, rasterServiceValsSingle: MutableList<RasterServiceValsSingle>
    ) {
        var statistics: String
        var dimension: String
        var rasterId: Int
        var geoerverLayerName: String
        var geoserverWorkingSpace: String

        // for each service in the named package
        transaction {
            getServicesForPackage(packageId).forEach {
                TableRasterData.select { TableRasterData.packageId eq packageId }.andWhere {
                    TableRasterData.serviceId eq it.id
                }.first().also { row ->
                    rasterId = row[TableRasterData.id].value
                    dimension = row[TableRasterData.dimension].toString()
                    statistics = row[TableRasterData.statistics].toString()
                    geoerverLayerName = row[TableRasterData.geoserverLayerName].toString()
                    geoserverWorkingSpace = row[TableRasterData.geoserverWorkingSpace].toString()
                }
                val avg = getAveragePerRaster(layerDetailsId, rasterId)
                // val avg = rasterId?.let { it1 -> getAveragePerRaster(layerDetailsId, it1) }
                rasterServiceValsSingle.add(
                    RasterServiceValsSingle(
                        it.id, RasterServiceVal(avg, statistics, dimension, geoerverLayerName, geoserverWorkingSpace),
                        it.svgPath ?: "", dimension
                    )
                )
            }
        }
    }

    private fun getAveragePerRaster(layerId: Int, rasterId: Int): Double? {
        val sql = "with resultRecords as (" +
            " select ST_ValueCount(gleich) result from ( " +
            " select st_intersection(subRaster.rast, subLayer.rast) as gleich from " +
            " (select ST_AsRaster(layer_details.geom, raster_data.rast) rast from layer_details, raster_data " +
            " where layer_details.id = $layerId and raster_data.id = $rasterId) as subLayer," +
            " (select raster_data.rast from raster_data where raster_data.id = $rasterId) as subRaster) as " +
            "resultRecords) select sum((result::text::raster_values).r_value *(result::text::raster_values).r_count)" +
                " / sum((result::text::raster_values).r_count) as average from resultRecords;"

        var result: List<Pair<String, Double?>> = emptyList()
        transaction {
            result = sql.execAndMap(this) { rs ->
                "average" to rs.getString("average").toDoubleOrNull()
            }
        }
        return result.first().second
    }

    private fun getServicesForPackage(packageId: Int): MutableList<ServiceData> {
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
        return serviceList
    }

    fun generateServiceResponse(packageId: Int): String =
         mapper.writeValueAsString(
             EcosysServiceDataResponse(ResponseError(0, ""), getServicesForPackage(packageId))
         )

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
                    lastListofPoints.add(
                        RasterServiceVal(
                            v, rs.getString("statistics"),
                            rs.getString("dimension"),
                            rs.getString("geoserver_layer_name"),
                            rs.getString("geoserver_working_space")
                        )
                    )
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
                            l.first().dimension, l.first().geoserverLayerName, l.first().geoserverWorkingSpace
                        )
                    )
                }
            }
        }

        return mapper.writeValueAsString(EcosysRasterDataResponse(ResponseError(0, ""), serviceList))
    }

    // Removes possible serviceIDs if they do not belong to the given packageID
    private fun checkServiceIDsagainstPackageID(rasterDataRequest: RasterDataRequest) {
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
                "Select $index as pointId, dimension, statistics, id, geoserver_layer_name, geoserver_working_space, " +
                        "service_id, " +
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

    fun generateProjectsResponse(): String {
        @Serializable
        data class ProjectTemp(val id: Int, val name: String)
        @Serializable
        data class EcosysProjectDataResponse(val error: ResponseError, val projects: List<ProjectTemp>)

        val projectList = emptyList<ProjectTemp>().toMutableList()

        transaction {
            TableProjects.select { TableProjects.deleted eq null }
                .andWhere { TableProjects.enabled eq true }.forEach { rs ->
                projectList.add(
                    ProjectTemp(rs[TableProjects.id].value, rs[TableProjects.name])
                )
            }
        }
        return mapper.writeValueAsString(EcosysProjectDataResponse(ResponseError(0, ""), projectList))
    }

    suspend fun generateProjectResponse(projectId: Int, config: ApplicationConfig): String {
        val collectoryUrl = config.propertyOrNull("atlas.collectory")?.getString() ?: ""
        data class EcosysProjectDataResponse(val error: ResponseError, val projects: ProjectData?)

        val project = ProjectData.getById(projectId)
            ?: return mapper.writeValueAsString(
                EcosysProjectDataResponse(ResponseError(1, "No project found for this id"), null)
            )

        // merge project data with data from data resource from Atlas
        var dataResource: JsonNode? = null
        if (project.resource != "" && project.resource != null) {
            val client = HttpClient(CIO)
            val url = "$collectoryUrl/dataResource/${project.resource}"
            val response: HttpResponse = client.request(url) {
                method = HttpMethod.Get
            }
            if (response.status == HttpStatusCode.OK) {
                dataResource = mapper.readTree(response.bodyAsText())
                // add project metadata to Atlas metadata (for convenience only)
                (dataResource as ObjectNode).put("area", project.area)
                (dataResource as ObjectNode).put("epoch", project.epoch)
            }
        }

        val projectDataJson = mapper.writeValueAsString(project)
        val projectDataJsonTree = mapper.readTree(projectDataJson)
        (projectDataJsonTree as ObjectNode).replace("dataResource", dataResource)

        val node: JsonNode = mapper.createObjectNode()
        (node as ObjectNode).replace("error", mapper.valueToTree(ResponseError(0, "")) as JsonNode)
        node.replace("project", projectDataJsonTree)

        return node.toString()
    }

    suspend fun generateProjectFilterResponse(projectId: Int): String {
        data class EcosysProjectDataResponse(val error: ResponseError, val filter: List<HierarchyData>)

        val hierarchyList = mutableListOf<HierarchyData>()
        transaction {

            TableHierarchy.select { TableHierarchy.projectId eq projectId }.orderBy(TableHierarchy.sortCode)
                .forEach {
                    hierarchyList.add(HierarchyData.mapRSToHierarchyData(it))
                }
        }
        ProjectData.getById(projectId)?.let { hierarchyList.setCQLFilter(it.colTypesCode, it.colTypesCodeType) }

        return mapper.writeValueAsString(EcosysProjectDataResponse(ResponseError(0, ""), hierarchyList))
    }

    suspend fun generateProjectSpeciesResponse(speciesGroupId: String, projectId: Int): String {
        @Serializable
        data class SpeciesGroup(
            val id: String,
            val list: List<SpeciesData>
        )
        data class EcosysProjectSpeciesDataResponse(val error: ResponseError, val speciesGroup: SpeciesGroup)

        val speciesList = mutableListOf<SpeciesData>()

        transaction {
            val complexJoin = Join(
                TableSpeciesGroups, TableSpecies,
                onColumn = TableSpeciesGroups.taxonId, otherColumn = TableSpecies.taxonId,
                joinType = JoinType.INNER,
                additionalConstraint = {
                    (TableSpeciesGroups.projectId eq projectId) and (TableSpeciesGroups.groupCode eq speciesGroupId)
                }
            )

            complexJoin.selectAll().orderBy(TableSpecies.description).forEach { rs ->
                speciesList.add(
                    SpeciesData(rs[TableSpecies.taxonId], rs[TableSpecies.description])
                )
            }
        }
        return mapper.writeValueAsString(
            EcosysProjectSpeciesDataResponse(
                ResponseError(0, ""),
                SpeciesGroup(speciesGroupId, speciesList)
            )
        )
    }
}
