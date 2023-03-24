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
import kotlinx.css.a
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

            val neededRoles = casConfig.protectedRoutes
                                .toSortedMap(compareBy<String> { it.length * -1 }.thenBy { it })
                                .filterKeys { k -> newUri.startsWith(k) }
                                .takeIf { it.isNotEmpty() }?.values?.first()

            if (!neededRoles.isNullOrEmpty()) {
                if (call.request.queryParameters.contains("ticket")) {
                    val ticket = call.parameters["ticket"]
                    var origin = "$scheme://$serverHost:$serverPort$newUri"
                    if (casConfig.behindAProxy)
                        origin = "https://$serverHost$newUri"

                    val client = HttpClient(CIO)
                    val response: HttpResponse = client.request {
                        url("${casConfig.validationUrl}?service=$origin&ticket=$ticket")
                    }

                    if (response.status == HttpStatusCode.OK) {
                        val factory = DocumentBuilderFactory.newInstance()
                        val builder = factory.newDocumentBuilder()
                        println(response.bodyAsText())
                        val doc = builder.parse(InputSource(StringReader(response.bodyAsText()))) as Document

                        doc.getElementsByTagName("cas:authenticationFailure")?.let {
                            if (it.length != 0) {
                                val authFailure = it.item(0).firstChild.nodeValue
                                println(authFailure)
                                val serv = if (casConfig.behindAProxy) "https://$serverHost" else "$scheme://$serverHost:$serverPort"
                                call.respondRedirect("$serv/notAuthorized1", false)
                                return@apply
                            }
                        }

                        val firstname = doc.getElementsByTagName("cas:firstname").item(0).firstChild.nodeValue
                        val lastname = doc.getElementsByTagName("cas:lastname").item(0).firstChild.nodeValue
                        val user = doc.getElementsByTagName("cas:user").item(0).firstChild.nodeValue
                        val authority = doc.getElementsByTagName("cas:authority").item(0).firstChild.nodeValue
                        val userSession =
                            UserSession("JSESSIONID", "$ticket", firstname, lastname, user, authority.split(","))
                        call.sessions.set(userSession)
                        val serv = if (casConfig.behindAProxy) "https://$serverHost" else "$scheme://$serverHost:$serverPort"
                        if (neededRoles.intersect(userSession.roles.toSet()).isEmpty())
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
                        var url = "${casConfig.redirectToLoginUrl}?service=$scheme://$serverHost:$serverPort$uri"
                        if (casConfig.behindAProxy)
                            url = "${casConfig.redirectToLoginUrl}?service=https://$serverHost$uri"
                        call.respondRedirect(url, false)
                        alreadyRedir = true
                    }

                    if (!alreadyRedir) {
                        val userSession = call.sessions.get<UserSession>()
                        if (neededRoles != null && userSession?.roles?.intersect(neededRoles.toSet())?.size == 0) {
                            val serv = if (casConfig.behindAProxy) "https://$serverHost" else "$scheme://$serverHost:$serverPort"
                            call.respondRedirect("$serv/notAuthorized", false)
                        }
                    }
                }
            }
        }
    }

    suspend fun AlaLogout(casConfig: CasConfig) {
        val client = HttpClient(CIO)
        val response: HttpResponse = client.request {
            url(casConfig.logoutUrl)
        }

        println(response)
    }

}