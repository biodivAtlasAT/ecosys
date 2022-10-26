package at.duk.services

import at.duk.models.spatial.*
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
import java.util.*

object LayerServices {
    val logger: ch.qos.logback.classic.Logger = LoggerFactory.getLogger(at.duk.services.LayerServices::class.java) as ch.qos.logback.classic.Logger
    private val mapper = jacksonObjectMapper()

    suspend fun fetchLayerFromSpatial2(config: ApplicationConfig) {
        if (!preSyncChecks(config)) return
        val spatialUrl = config.propertyOrNull("dataCache.spatialPortalWS")!!

        logger.info("Synchronization started!")
        syncStartUp(config)

        val spatialLayers = loadShapes(spatialUrl.getString())
        logger.info("${spatialLayers.size} Layers(s) will be synchronized")

        spatialLayers.forEach { spatialLayer ->
            if (spatialLayer.id == 10057)
                return@forEach
            logger.info("Synchronize layer \"cl${spatialLayer.id}\" - \"cl${spatialLayer.name}\"")
            try {
                val spatialFields = loadSpatialFields(spatialUrl.getString(), spatialLayer.id) ?: return@forEach
                val layerId = insertOrUpdateTableLayers(spatialLayer, spatialFields.id)

                transaction {
                    TableLayerDetails.deleteWhere { TableLayerDetails.layerId eq layerId }
                    loadSpatialObjects(spatialUrl.getString(), spatialLayer.id).forEach { spatialObject ->
                        loadSpatialLayerPart(spatialUrl.getString(), spatialObject.pid)?.let { spatialLayerPart ->
                            val key = spatialFields.objects.first { it.pid == spatialObject.pid }.id
                            val geomJson = mapper.writeValueAsString(spatialLayerPart)
                            exec("insert into layer_details (layer_id, sequence, key_id, geom) values " +
                                   "($layerId, ${spatialObject.pid}, '${key}', ST_GeomFromGeoJSON('$geomJson'))")
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

    private fun preSyncChecks(config: ApplicationConfig) : Boolean {
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
            TableLayers.select {TableLayers.spatialLayerId eq "cl$spatialLayerItem.id"}.forEach {
                layerId = it[TableLayers.id].value
            }
            if (layerId == -1) {
                layerId = TableLayers.insertAndGetId {
                    it[TableLayers.name] = spatialLayerItem.name
                    it[TableLayers.spatialLayerId] = "cl${spatialLayerItem.id}"
                    it[TableLayers.key] = spatialFieldsId
                }.value
            } else {
                TableLayers.update ({ TableLayers.id eq layerId }) {
                    it[TableLayers.name] = spatialLayerItem.name
                    it[TableLayers.key] = spatialFieldsId
                }
            }
        }
        return layerId
    }

    private fun loadShapes(spatialUrl: String): SpatialLayers =
        try {
            mapper.readValue(java.net.URL("$spatialUrl/layers/shapes"))
        } catch (ex: java.io.FileNotFoundException) {
            logger.warn("${spatialUrl}/layers/shapes - URL not configured correctly)")
            SpatialLayers()
        }

    private fun loadSpatialObjects(spatialUrl: String, spatialLayerItemId: Int): SpatialObjects =
        try {
            mapper.readValue(java.net.URL("$spatialUrl/objects/cl$spatialLayerItemId"))
        } catch (ex: java.io.FileNotFoundException) {
            logger.warn("$spatialUrl/objects/cl$spatialLayerItemId - URL not configured correctly)")
            SpatialObjects()
        }

    private fun loadSpatialFields(spatialUrl: String, spatialLayerItemId: Int): SpatialFields? =
        try {
            mapper.readValue(java.net.URL("$spatialUrl/field/cl$spatialLayerItemId"))
        } catch (ex: java.io.FileNotFoundException) {
            logger.warn("$spatialUrl/field/cl$spatialLayerItemId - URL not configured correctly)")
            null
        }

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
            return SimpleDateFormat("dd-MM-yyyy HH-mm-ss").format(Date(file.lastModified())).toString()
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
        (File(getDataCacheSyncDirectory(config).resolve("sync.started").toString()).exists() &&
            !File(getDataCacheSyncDirectory(config).resolve("sync.finished").toString()).exists())

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
            //logFile.readText().replace("\n", "<br>")
            val lines = logFile.readLines()
            return if (lines.size > 100)
                lines.slice(lines.size - 100 until lines.size).joinToString(separator = "<br>")
            else
                lines.joinToString(separator = "<br>")
        } else {
            null
        }
    }

    suspend fun fetchLayerFromSpatial(config: ApplicationConfig) {
        val dataCacheDirectory = config.propertyOrNull("dataCache.directory")?.getString() ?:
            Paths.get("").toAbsolutePath().toString()


        // 1. Get a list with all contextual layers --> JSON Array with "id" e.g. "10033" and "enabled=true"
        config.propertyOrNull("dataCache.spatialPortalWS")?.let { config ->
            val urlShapes = config.getString() + "/layers/shapes"
            val mapper = jacksonObjectMapper()
            val spatialLayers: SpatialLayers = mapper.readValue(java.net.URL(urlShapes))
            spatialLayers.forEach { sl ->
                println("ID: ${sl.id} Name: ${sl.name}")
                if (sl.id == 10033 || sl.id == 10034 || sl.id == 10053) {
                    var layerId: Int = -1
                    transaction {
                        layerId = TableLayers.insertAndGetId {
                            it[TableLayers.name] = sl.name
                        }.value
                    }

                    val urlObjects = config.getString() + "/objects/cl"+sl.id
                    val spatialObjects: SpatialObjects = mapper.readValue(java.net.URL(urlObjects))
                    val urlFields = config.getString() + "/field/cl"+sl.id
                    val spatialFields: SpatialFields = mapper.readValue(java.net.URL(urlFields))

                    transaction {
                        TableLayers.update ({ TableLayers.id eq layerId }){ table ->
                            table[key] = spatialFields.sid
                            table[spatialLayerId] = "cl"+sl.id
                        }
                    }

                    spatialObjects.forEach {  obj->
                        println("PID: " + obj.pid)
                        /*if(obj.pid.toInt() == 6915 || obj.pid.toInt() == 6916) {*/
                        if(obj.pid.toInt() > 0) {
                            val urlGeoJson = config.getString() + "/shape/geojson/${obj.pid}"
                            val spatialLayerPart: SpatialLayerPart = mapper.readValue(java.net.URL(urlGeoJson))
                         //   println(spatialLayerPart)
                            //val properties = mutableListOf<Properties>()


                            var key = ""
                            spatialFields.objects.forEach { fieldObj ->
                                if(fieldObj.pid == obj.pid) {
                            //        println("Name ${fieldObj.id} - ${fieldObj.name} - ${fieldObj.description} - ${fieldObj.fieldname}")

                                    //properties = "{ \"id\":\"${fieldObj.id}\",  \"name\":\"${fieldObj.name}\",  \"fieldname\":\"${fieldObj.fieldname}\", \"description\":\"${fieldObj.description}\"}"

                                    //properties.add(Properties(obj.pid, fieldObj.id, fieldObj.name, fieldObj.fieldname, fieldObj.description))
                                    key = fieldObj.id
                                }
                            }
                            val geomJson = mapper.writeValueAsString(spatialLayerPart)
                            val sql = "insert into layer_details (layer_id, sequence, key_id, geom) values " +
                                    "($layerId, ${obj.pid}, '${key}', ST_GeomFromGeoJSON('$geomJson'))"
//                            println("SQL: $sql")
                            transaction {
                                exec(sql)
                            }

                        }
                    }


                }
            }
        }



    }
}