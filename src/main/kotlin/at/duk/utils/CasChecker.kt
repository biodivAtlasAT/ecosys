package at.duk.utils

import io.ktor.client.*
import io.ktor.client.engine.cio.*
import io.ktor.client.request.*
import io.ktor.client.statement.*
import io.ktor.http.*
import io.ktor.server.application.*
import io.ktor.server.plugins.*
import io.ktor.server.response.*
import io.ktor.server.sessions.*
import org.w3c.dom.Document
import org.xml.sax.InputSource
import java.io.StringReader
import javax.xml.parsers.DocumentBuilderFactory

object CasChecker {
    suspend fun Auth(call: ApplicationCall, casConfig: CasConfig) {
        call.request.origin.apply {
            var inCycle = false
            val pos = uri.indexOf("?")
            val newUri = if (pos > 0) uri.substring(0, pos) else uri

            val neededRoles = mutableListOf<String>()

            casConfig.protectedRoutes.filterKeys { k ->
                newUri.startsWith(k)
            }.also {
                if (!it.isNullOrEmpty())
                    neededRoles.addAll(it.values.first())
            }

            if (neededRoles.isNotEmpty()) {
                //val necessaryRoles = casConfig.protectedRoutes[newUri]
                val necessaryRoles = neededRoles
                if (call.request.queryParameters.contains("ticket")) {
                    val ticket = call.parameters["ticket"]
                    var origin = "$scheme://$host:$port$newUri"
                    if (casConfig.behindAProxy)
                        origin = "https://$host$newUri"

                    val client = HttpClient(CIO)
                    val response: HttpResponse = client.request {
                        url("${casConfig.validationUrl}?service=$origin&ticket=$ticket")
                    }

                    if (response.status == HttpStatusCode.OK) {
                        val factory = DocumentBuilderFactory.newInstance()
                        val builder = factory.newDocumentBuilder()
                        println(response.bodyAsText())
                        val doc = builder.parse(InputSource(StringReader(response.bodyAsText()))) as Document
                        val firstname = doc.getElementsByTagName("cas:firstname").item(0).firstChild.nodeValue
                        val lastname = doc.getElementsByTagName("cas:lastname").item(0).firstChild.nodeValue
                        val user = doc.getElementsByTagName("cas:user").item(0).firstChild.nodeValue
                        val authority = doc.getElementsByTagName("cas:authority").item(0).firstChild.nodeValue
                        val userSession =
                            UserSession("JSESSIONID", "$ticket", firstname, lastname, user, authority.split(","))
                        call.sessions.set(userSession)
                        val serv = if (casConfig.behindAProxy) "https://$host" else "$scheme://$host:$port"
                        if (necessaryRoles?.intersect(userSession.roles.toSet())?.size == 0)
                            call.respondRedirect("$serv/notAuthorized", false)
                        else {
                            call.respondRedirect("$serv$newUri", false)
                            inCycle = true
                        }
                    }
                }
                //if (casConfig.protectedRoutes.containsKey(newUri) && !inCycle) {
                if (!inCycle) {
                    var alreadyRedir = false
                    if (call.request.cookies["JSESSIONID"] == null) {
                        var url = "${casConfig.redirectToLoginUrl}?service=$scheme://$host:$port$uri"
                        if (casConfig.behindAProxy)
                            url = "${casConfig.redirectToLoginUrl}?service=https://$host$uri"
                        call.respondRedirect(url, false)
                        alreadyRedir = true
                    }

                    if (!alreadyRedir) {
                        val userSession = call.sessions.get<UserSession>()
                        if (necessaryRoles != null && userSession?.roles?.intersect(necessaryRoles.toSet())?.size == 0) {
                            val serv = if (casConfig.behindAProxy) "https://$host" else "$scheme://$host:$port"
                            call.respondRedirect("$serv/notAuthorized", false)
                        }
                    }
                }
            }
        }
    }
}