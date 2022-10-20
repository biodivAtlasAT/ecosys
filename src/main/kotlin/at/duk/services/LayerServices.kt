package at.duk.services

import at.duk.DataCache
import at.duk.models.Properties
import at.duk.models.spatial.SpatialFields
import at.duk.models.spatial.SpatialLayerPart
import at.duk.models.spatial.SpatialLayers
import at.duk.models.spatial.SpatialObjects
import at.duk.tables.TableLayers
import at.duk.tables.TableUploadedRasterData
import com.fasterxml.jackson.module.kotlin.jacksonObjectMapper
import com.fasterxml.jackson.module.kotlin.readValue
import io.ktor.client.*
import io.ktor.client.engine.cio.*
import io.ktor.client.request.*
import io.ktor.client.statement.*
import io.ktor.http.*
import io.ktor.server.config.*
import org.jetbrains.exposed.sql.insertAndGetId
import org.jetbrains.exposed.sql.transactions.transaction
import java.io.File

object LayerServices {
    suspend fun fetchLayerFromSpatial(config: ApplicationConfig) {

        // 1. Get a list with all contextual layers --> JSON Array with "id" e.g. "10033" and "enabled=true"
        config.propertyOrNull("dataCache.spatialPortalWS")?.let { config ->
            val urlShapes = config.getString() + "/layers/shapes"
            val mapper = jacksonObjectMapper()
            val spatialLayers: SpatialLayers = mapper.readValue(java.net.URL(urlShapes))
            spatialLayers.forEach { sl ->
                println("ID: ${sl.id} Name: ${sl.name}")
                if (sl.id == 10033) {
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

                    spatialObjects.forEach {  obj->
                        println("PID: " + obj.pid)
                        /*if(obj.pid.toInt() == 6915 || obj.pid.toInt() == 6916) {*/
                        if(obj.pid.toInt() > 0) {
                            val urlGeoJson = config.getString() + "/shape/geojson/${obj.pid}"
                            val spatialLayerPart: SpatialLayerPart = mapper.readValue(java.net.URL(urlGeoJson))
                         //   println(spatialLayerPart)
                            val properties = mutableListOf<Properties>()
                            spatialFields.objects.forEach { fieldObj ->
                                if(fieldObj.pid == obj.pid) {
                                    println("Name ${fieldObj.id} - ${fieldObj.name} - ${fieldObj.description} - ${fieldObj.fieldname}")

                                    //properties = "{ \"id\":\"${fieldObj.id}\",  \"name\":\"${fieldObj.name}\",  \"fieldname\":\"${fieldObj.fieldname}\", \"description\":\"${fieldObj.description}\"}"

                                    properties.add(Properties(obj.pid, fieldObj.id, fieldObj.name, fieldObj.fieldname, fieldObj.description))
                                }
                            }
                            val geomJson = mapper.writeValueAsString(spatialLayerPart)
                            val sql = "insert into layer_details (layer_id, sequence, properties, geom) values " +
                                    "($layerId, ${obj.pid}, '${mapper.writeValueAsString(properties.first())}', ST_GeomFromGeoJSON('$geomJson'))"
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