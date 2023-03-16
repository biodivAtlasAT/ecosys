package at.duk.services

import at.duk.models.biotop.ProjectData
import com.fasterxml.jackson.module.kotlin.jacksonObjectMapper
import io.ktor.client.*
import io.ktor.client.engine.cio.*
import io.ktor.client.request.*
import io.ktor.client.request.forms.*
import io.ktor.client.statement.*
import io.ktor.http.*
import io.ktor.server.config.*
import org.slf4j.LoggerFactory

class GeoServerService(config: ApplicationConfig) {
    val logger: ch.qos.logback.classic.Logger = LoggerFactory.getLogger(at.duk.services.LayerServices::class.java)
            as ch.qos.logback.classic.Logger

    private var geoserverUrl = ""
    private var workspace = ""
    private var username = ""
    private var password = ""
    private val mapper = jacksonObjectMapper()
    private var isConfigured = false

    init {
        username = config.propertyOrNull("geoserver.username")?.getString() ?: ""
        password = config.propertyOrNull("geoserver.password")?.getString() ?: ""
        workspace = config.propertyOrNull("geoserver.workspace")?.getString() ?: ""
        geoserverUrl = config.propertyOrNull("geoserver.url")?.getString() ?: ""
        isConfigured = username.isNotBlank() && password.isNotBlank() && workspace.isNotBlank() && geoserverUrl.isNotBlank()
    }


    // create style
    suspend fun createStyle(project: ProjectData): Boolean {
        if (!isConfigured) return false
        val client = HttpClient(CIO)
        val url = "$geoserverUrl/rest/styles"
        return client.request(url) {
            basicAuth(username, password)
            method = HttpMethod.Post
            header(HttpHeaders.ContentType, "text/xml")
            setBody("<style><name>${project.geoServerStyleName}</name><workspace>$workspace</workspace><filename>${project.geoServerStyleName}.sld</filename></style>")
        }.status == HttpStatusCode.Created
    }

    suspend fun getStyles(): List<String>? {
        if (!isConfigured) return null
        val client = HttpClient(CIO)
        val url = "$geoserverUrl/rest/workspaces/$workspace/styles"
        val response = client.request(url) {
            basicAuth(username, password)
            method = HttpMethod.Get
            header(HttpHeaders.ContentType, "text/xml")
        }
        return if (response.status == HttpStatusCode.OK)
            mapper.readTree(response.bodyAsText()).path("styles").path("style").map {
                it.path("name").textValue()
            }
        else
            null
    }

    suspend fun putSLDFile(project: ProjectData, sld: String): Boolean {
        if (!isConfigured) return false
        val client = HttpClient(CIO)
        val response: HttpResponse = client.submitForm(
            url = geoserverUrl + "/rest/workspaces/${workspace}/styles/${project.geoServerStyleName}",
        ) {
            basicAuth(username, password)
            setBody(sld)
            headers {
                append(HttpHeaders.ContentType, "application/vnd.ogc.sld+xml")
            }
            method = HttpMethod.Put
        }
        return response.status == HttpStatusCode.OK
    }

    suspend fun setDefaultStyle(project: ProjectData): Boolean {
        if (!isConfigured) return false
        val client = HttpClient(CIO)
        val url = "$geoserverUrl/rest/layers/${project.geoserverWorkspace}:${project.geoserverLayer}"
        val response: HttpResponse = client.request(url) {
            basicAuth(username, password)
            method = HttpMethod.Put
            header(HttpHeaders.ContentType, "text/xml")
            setBody("<layer><defaultStyle><name>$workspace:${project.geoServerStyleName}</name></defaultStyle></layer>")
        }
        return response.status == HttpStatusCode.OK
    }


    suspend fun getListOfLayers(): List<String> {
        if (!isConfigured) return emptyList()

        val listOfLayers = mutableListOf<String>()
        val client = HttpClient(CIO)
        val url = "$geoserverUrl/rest/workspaces/$workspace/layers.json"
        val response: HttpResponse = client.request(url) {
            basicAuth(username, password)
            method = HttpMethod.Get
        }
        if (response.status == HttpStatusCode.OK) {
            response.bodyAsText().split("\"").forEach {
                if (it.startsWith("http"))
                    listOfLayers.add(it.split("/").last().replace(".json", ""))
            }
        }
        return listOfLayers
    }

    suspend fun getListOfFeatures(layer: String?): Map<String, String> {
        if (!isConfigured) return emptyMap()

        layer?.let { name ->
            val client = HttpClient(CIO)
            val url = "$geoserverUrl/rest/workspaces/$workspace/layers/$name.json"
            val response: HttpResponse = client.request(url) {
                method = HttpMethod.Get
                basicAuth(username, password)
            }
            if (response.status == HttpStatusCode.OK)
                return getListOfFeaturesSub(response.bodyAsText())
        }
        return emptyMap()
    }

    private suspend fun getListOfFeaturesSub(resp: String): Map<String, String> {
        val mapOfFeatures = mutableMapOf<String, String>()
        val featureUrl = resp.split("@").first {
            it.startsWith("class\":\"featureType\"")
        }.split("\"").first {
            it.startsWith("http")
        }
        val client2 = HttpClient(CIO)
        val response2: HttpResponse = client2.request(featureUrl) {
            method = HttpMethod.Get
            basicAuth(username, password)
        }
        if (response2.status == HttpStatusCode.OK) {
            return BiotopServices.mapper.readTree(response2.bodyAsText()).path("featureType").path("attributes").path("attribute")
                .associate { it.path("name").textValue() to it.path("binding").textValue() }
        }
        return mapOfFeatures
    }

    suspend fun getLayerDataFromWFSService(project: ProjectData): Map<String, String> {
        if (!isConfigured) return emptyMap()
        // http://127.0.0.1:8081/geoserver/wfs?service=wfs&version=2.0.0&request=GetFeature&typeNames=ECO:bundesland_wgs84_iso&propertyName=BL_KZ,BL
        val matchDict = mutableMapOf<String, String>()
        val client = HttpClient(CIO)
        val url = "$geoserverUrl/wfs?service=wfs&version=2.0.0&request=GetFeature&outputFormat=json&" +
                "typeNames=${project.geoserverWorkspace}:${project.geoserverLayer}&propertyName=${project.colTypesCode},${project.colTypesDescription}"
        val response: HttpResponse = client.request(url) {
            method = HttpMethod.Get
            basicAuth(username, password)
        }
        try {
            if (response.status == HttpStatusCode.OK) {
                BiotopServices.mapper.readTree(response.bodyAsText()).path("features").forEach {
                    val props = it.path("properties")
                    val key = props[project.colTypesCode].asText() //.toString()
                    val value = props[project.colTypesDescription].asText() // .toString()
                    matchDict[key] = value
                }
            }
        } catch (ex: Exception) {
            logger.warn("Response of WFS Request could not be analyzed!\n${response.bodyAsText()}")
        }
        return matchDict
    }


}