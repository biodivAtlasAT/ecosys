package at.duk.routes

import at.duk.models.EcosysRasterDataResponse
import at.duk.models.RasterDataRequest
import at.duk.models.ResponseError
import at.duk.services.ApiServices
import com.fasterxml.jackson.module.kotlin.jacksonObjectMapper
import io.ktor.http.*
import io.ktor.server.application.*
import io.ktor.server.response.*
import io.ktor.server.routing.*

fun Route.apiRouting() {

    val badRequestData = "{'error':{'no':2,'msg':'Parameters not valid!'}}"

    route("/api") {
        get("/packages") {
            call.respondText(ApiServices.generatePackageResponse(), ContentType.parse("application/json"), HttpStatusCode.OK)
        }

        get("/services") {
            call.request.queryParameters["packageID"]?.toIntOrNull()?.let {
                call.respondText(ApiServices.generateServiceResponse(it), ContentType.parse("application/json"), HttpStatusCode.OK)
                return@get
            }
            val str = "{'error':{'no':1,'msg':'no packageID found!'}}"
            call.respondText(str, ContentType.parse("application/json"), HttpStatusCode.OK)
        }

        get("/rasterData") {
            val reqParam = RasterDataRequest(call.request).also {
                it.initCoordsList()
                it.initServicesList()
                if (!it.reqDataExists())
                    call.respondText(badRequestData, ContentType.parse("application/json"), HttpStatusCode.OK)
            }
            call.respondText(ApiServices.generateRasterDataResponseResponse(reqParam), ContentType.parse("application/json"), HttpStatusCode.OK)
        }
    }
}

