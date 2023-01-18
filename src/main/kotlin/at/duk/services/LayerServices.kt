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

import at.duk.models.spatial.SpatialLayersItem
import at.duk.models.spatial.SpatialLayers
import at.duk.models.spatial.SpatialObjects
import at.duk.models.spatial.SpatialFields
import at.duk.models.spatial.SpatialLayerPart
import at.duk.tables.TableLayerDetails
import at.duk.tables.TableLayers
import com.fasterxml.jackson.module.kotlin.jacksonObjectMapper
import com.fasterxml.jackson.module.kotlin.readValue
import io.ktor.server.config.*
import org.jetbrains.exposed.sql.deleteWhere
import org.jetbrains.exposed.sql.insertAndGetId
import org.jetbrains.exposed.sql.select
import org.jetbrains.exposed.sql.transactions.transaction
import org.jetbrains.exposed.sql.update
import org.slf4j.LoggerFactory
import java.io.File
import java.nio.file.Paths
import java.text.SimpleDateFormat
import java.util.Date

@Suppress("TooManyFunctions")
object LayerServices {
    val logger: ch.qos.logback.classic.Logger = LoggerFactory.getLogger(at.duk.services.LayerServices::class.java)
            as ch.qos.logback.classic.Logger
    private val mapper = jacksonObjectMapper()

    @Suppress("SwallowedException", "TooGenericExceptionCaught")
    suspend fun fetchLayerFromSpatial(config: ApplicationConfig) {
        if (!preSyncChecks(config)) return
        val spatialUrl = config.propertyOrNull("dataCache.spatialPortalWS")!!
        val layersToSync = prepareDatabase(config)
        if (layersToSync.isEmpty()) return

        logger.info("Synchronization started!")
        syncStartUp(config)

        val spatialLayers = loadShapes(spatialUrl.getString())
        logger.info("${spatialLayers.size} Layers(s) are available in Spatial Portal")
        logger.info(
            "${layersToSync.size} Layers(s) will be synchronized due to configuration \"dataCache.layersToSync\""
        )

        spatialLayers.filter { it.id in layersToSync }.forEach { spatialLayer ->
            logger.info("Synchronize layer \"cl${spatialLayer.id}\" - \"cl${spatialLayer.name}\"")
            try {
                val spatialFields = loadSpatialFields(spatialUrl.getString(), spatialLayer.id) ?: return@forEach
                val layerId = insertOrUpdateTableLayers(spatialLayer, spatialFields.sid)

                transaction {
                    TableLayerDetails.deleteWhere { TableLayerDetails.layerId eq layerId }
                    loadSpatialObjects(spatialUrl.getString(), spatialLayer.id).forEach { spatialObject ->
                        Thread.sleep(1000)
                        loadSpatialLayerPart(spatialUrl.getString(), spatialObject.pid)?.let { spatialLayerPart ->
                            Thread.sleep(1000)
                            val key = spatialFields.objects.first { it.pid == spatialObject.pid }.id
                            val geomJson = mapper.writeValueAsString(spatialLayerPart)
                            exec(
                                "insert into layer_details (layer_id, sequence, key_id, geom) values " +
                                   "($layerId, ${spatialObject.pid}, '$key', ST_GeomFromGeoJSON('$geomJson'))"
                            )
                        }
                    }
                }
                logger.info("Layer \"cl${spatialLayer.id}\" - \"cl${spatialLayer.name}\" successfully synchronized!")
            } catch (ex: Exception) {
                logger.warn("layer \"cl${spatialLayer.id}\" - \"cl${spatialLayer.name}\" NOT synchronized!")
            }
        }

        syncFinished(config)
        logger.info("Synchronization finished!")
    }

    private fun prepareDatabase(config: ApplicationConfig): List<Int> {
        val layersToSync = config.propertyOrNull("dataCache.layersToSync")?.getString()?.replace(" ", "")?.
            split(",")?.filter { it.toIntOrNull() != null }?.map { it.toInt() } ?: emptyList()

        if (layersToSync.isEmpty()) {
            logger.info("No layers to sync - due to configuration!")
            logger.info("Database tables remain unchanged!")
            return emptyList()
        }
        transaction {
            val idsToDelete = TableLayers.select {
                TableLayers.spatialLayerId notInList(layersToSync.toMutableList().map { "cl$it" })
            }.map { it[TableLayers.id].value }
            TableLayerDetails.deleteWhere { TableLayerDetails.layerId inList(idsToDelete) }
            TableLayers.deleteWhere { TableLayers.id inList(idsToDelete) }
        }
        return layersToSync
    }

    private fun preSyncChecks(config: ApplicationConfig): Boolean {
        if (checkIfSyncAlreadyRunning(config)) {
            logger.info("Synchronization is already running --> terminated!")
            return false
        }
        val spatialUrl = config.propertyOrNull("dataCache.spatialPortalWS")
        if (spatialUrl == null) {
            logger.info("Configuration for \"dataCache.spatialPortalWS\" is missing!")
            return false
        }
        return true
    }

    private fun insertOrUpdateTableLayers(spatialLayerItem: SpatialLayersItem, spatialFieldsId: String): Int {
        var layerId: Int = -1
        transaction {
            TableLayers.select { TableLayers.spatialLayerId eq "cl${spatialLayerItem.id}" }.forEach {
                layerId = it[TableLayers.id].value
            }
            if (layerId == -1) {
                layerId = TableLayers.insertAndGetId {
                    it[TableLayers.name] = spatialLayerItem.name
                    it[TableLayers.spatialLayerId] = "cl${spatialLayerItem.id}"
                    it[TableLayers.key] = spatialFieldsId
                }.value
            } else {
                TableLayers.update({ TableLayers.id eq layerId }) {
                    it[TableLayers.name] = spatialLayerItem.name
                    it[TableLayers.key] = spatialFieldsId
                }
            }
        }
        return layerId
    }

    @Suppress("SwallowedException")
    private fun loadShapes(spatialUrl: String): SpatialLayers =
        try {
            mapper.readValue(java.net.URL("$spatialUrl/layers/shapes"))
        } catch (ex: java.io.FileNotFoundException) {
            logger.warn("$spatialUrl/layers/shapes - URL not configured correctly)")
            SpatialLayers()
        }

    @Suppress("SwallowedException")
    private fun loadSpatialObjects(spatialUrl: String, spatialLayerItemId: Int): SpatialObjects =
        try {
            mapper.readValue(java.net.URL("$spatialUrl/objects/cl$spatialLayerItemId"))
        } catch (ex: java.io.FileNotFoundException) {
            logger.warn("$spatialUrl/objects/cl$spatialLayerItemId - URL not configured correctly)")
            SpatialObjects()
        }

    @Suppress("SwallowedException")
    private fun loadSpatialFields(spatialUrl: String, spatialLayerItemId: Int): SpatialFields? =
        try {
            mapper.readValue(java.net.URL("$spatialUrl/field/cl$spatialLayerItemId"))
        } catch (ex: java.io.FileNotFoundException) {
            logger.warn("$spatialUrl/field/cl$spatialLayerItemId - URL not configured correctly)")
            null
        }

    @Suppress("SwallowedException")
    private fun loadSpatialLayerPart(spatialUrl: String, spatialObjectId: String): SpatialLayerPart? =
        try {
            mapper.readValue(java.net.URL("$spatialUrl/shape/geojson/$spatialObjectId"))
        } catch (ex: java.io.FileNotFoundException) {
            logger.warn("$spatialUrl/shape/geojson/$spatialObjectId - URL not configured correctly)")
            null
        }

    fun getFileTimeStamp(config: ApplicationConfig, fileName: String): String? {
        val file = File(getDataCacheSyncDirectory(config).resolve(fileName).toString())
        if (file.exists())
            return SimpleDateFormat("dd-MM-yyyy HH:mm:ss").format(Date(file.lastModified())).toString()
        else
            return null
    }

    fun syncStartUp(config: ApplicationConfig) {
        File(getDataCacheSyncDirectory(config).resolve("sync.finished").toString()).also {
            if (it.exists()) it.delete()
        }
        File(getDataCacheSyncDirectory(config).resolve("sync.started").toString()).also {
            if (it.exists()) it.delete()
        }
        File(getDataCacheSyncDirectory(config).resolve("sync.started").toString()).createNewFile()
    }

    private fun syncFinished(config: ApplicationConfig) {
        File(getDataCacheSyncDirectory(config).resolve("sync.finished").toString()).createNewFile()
    }

    fun checkIfSyncAlreadyRunning(config: ApplicationConfig) =
            File(getDataCacheSyncDirectory(config).resolve("sync.started").toString()).exists() &&
            !File(getDataCacheSyncDirectory(config).resolve("sync.finished").toString()).exists()

    fun getDataCacheSyncDirectory(config: ApplicationConfig): File {
        val dataCacheDirectory = config.propertyOrNull("dataCache.directory")?.getString() ?: Paths.get("")
            .toAbsolutePath().toString()
        val dataCacheDirectorySync = File(dataCacheDirectory).resolve("sync")
        if (!dataCacheDirectorySync.exists())
            dataCacheDirectorySync.mkdir()
        return dataCacheDirectorySync
    }

    fun getSyncLogFile(config: ApplicationConfig): String? {
        val logDirectory = config.propertyOrNull("logDirectory")?.getString() ?: Paths.get("")
            .toAbsolutePath().toString()
        return if (File(logDirectory).exists()) {
            val logFile = File(logDirectory).resolve("sync.log")
            val lines = logFile.readLines()
            return if (lines.size > 100)
                lines.slice(lines.size - 100 until lines.size).joinToString(separator = "<br>")
            else
                lines.joinToString(separator = "<br>")
        } else {
            null
        }
    }
}
