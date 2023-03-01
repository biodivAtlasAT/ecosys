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
import kotlinx.css.header

class GeoServerService(config: ApplicationConfig) {

    private var geoserverUrl = ""
    private var workspace = ""
    private var username = ""
    private var password = ""
    private val mapper = jacksonObjectMapper()

    init {
        username = config.propertyOrNull("geoserver.username")?.getString() ?: ""
        password = config.propertyOrNull("geoserver.password")?.getString() ?: ""
        workspace = config.propertyOrNull("geoserver.workspace")?.getString() ?: ""
        geoserverUrl = config.propertyOrNull("geoserver.url")?.getString() ?: ""
    }


    // create style
    suspend fun createStyle(project: ProjectData): Boolean {
        val client = HttpClient(CIO)
        val url = "$geoserverUrl/rest/styles"
        return client.request(url) {
            basicAuth(username, password)
            method = HttpMethod.Post
            header(HttpHeaders.ContentType, "text/xml")
            setBody("<style><name>${project.geoServerStyleName}</name><filename>${project.geoServerStyleName}.sld</filename></style>")
        }.status == HttpStatusCode.Created
    }

    suspend fun getStyles(): List<String>? {
        val client = HttpClient(CIO)
        val url = "$geoserverUrl/rest/styles"
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
        val client = HttpClient(CIO)
        val response: HttpResponse = client.submitForm(
            url = geoserverUrl + "/rest/styles/${project.geoServerStyleName}",
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
        val client = HttpClient(CIO)
        val url = "$geoserverUrl/rest/layers/${project.geoserverWorkspace}:${project.geoserverLayer}"
        val response: HttpResponse = client.request(url) {
            basicAuth(username, password)
            method = HttpMethod.Put
            header(HttpHeaders.ContentType, "text/xml")
            setBody("<layer><defaultStyle><name>${project.geoServerStyleName}</name></defaultStyle></layer>")
        }
        return response.status == HttpStatusCode.OK
    }

}