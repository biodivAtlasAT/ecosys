package at.duk.routes

import io.ktor.server.application.*
import io.ktor.server.response.*
import io.ktor.server.routing.*

fun Route.apiRouting() {
    route("/api/packages") {
        get("") {
            call.respond("1")
        }
    }
}
