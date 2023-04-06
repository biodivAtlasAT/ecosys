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
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext
import org.w3c.dom.Document
import org.xml.sax.InputSource
import java.io.StringReader
import javax.xml.parsers.DocumentBuilderFactory

object CasChecker {
    suspend fun authenticate(call: ApplicationCall, casConfig: CasConfig) {
        call.request.origin.apply {
            var inCycle = false
            val pos = uri.indexOf("?")
            val newUri = if (pos > 0) uri.substring(0, pos) else uri

            val neededRoles = casConfig.protectedRoutes
                .toSortedMap(compareBy<String> { it.length * -1 }.thenBy { it })
                .filterKeys { k -> newUri.startsWith(k) }
                .takeIf { it.isNotEmpty() }?.values?.first() ?: emptyList()

            if (neededRoles.isNotEmpty()) {
                if (call.request.queryParameters.contains("ticket")) {
                    val ticket = call.parameters["ticket"]
                    val origin = getOrigin(this, casConfig.behindAProxy, newUri)

                    val client = HttpClient(CIO)
                    val response: HttpResponse = client.request {
                        url("${casConfig.validationUrl}?service=$origin&ticket=$ticket")
                    }
                    if (response.status == HttpStatusCode.OK) {
                        if (setSessionValues(call, response, ticket, neededRoles)) {
                            call.respondRedirect(origin, false)
                            inCycle = true
                        } else {
                            call.respondRedirect(getNotAuthorized(this, casConfig.behindAProxy), false)
                            return@apply
                        }
                    }
                }
                if (!inCycle) {
                    if (call.request.cookies["JSESSIONID"] == null) {
                        call.respondRedirect(
                            "${casConfig.redirectToLoginUrl}?service=" +
                                    getOrigin(this, casConfig.behindAProxy, uri),
                            false
                        )
                    } else {
                        if (call.sessions.get<UserSession>()?.roles?.intersect(neededRoles.toSet())?.size == 0) {
                            call.respondRedirect(getNotAuthorized(this, casConfig.behindAProxy), false)
                        }
                    }
                }
            }
        }
    }

    private fun getOrigin(cp: RequestConnectionPoint, behindAProxy: Boolean, newUri: String) =
        "${getDestService(cp, behindAProxy)}$newUri"

    private fun getNotAuthorized(cp: RequestConnectionPoint, behindAProxy: Boolean) =
        "${getDestService(cp, behindAProxy)}/notAuthorized"

    private fun getDestService(rp: RequestConnectionPoint, behindAProxy: Boolean) =
        if (behindAProxy) "https://${rp.serverHost}" else "${rp.scheme}://${rp.serverHost}:${rp.serverPort}"

    private suspend fun setSessionValues(
        call: ApplicationCall,
        response: HttpResponse,
        ticket: String?,
        neededRoles: List<String>
    ): Boolean {
        val factory = DocumentBuilderFactory.newInstance()
        val builder = factory.newDocumentBuilder()
        val doc = withContext(Dispatchers.IO) {
            builder.parse(InputSource(StringReader(response.bodyAsText())))
        } as Document

        doc.getElementsByTagName("cas:authenticationFailure")?.let {
            if (it.length != 0) return false
        }

        val firstname = doc.getElementsByTagName("cas:firstname").item(0).firstChild.nodeValue
        val lastname = doc.getElementsByTagName("cas:lastname").item(0).firstChild.nodeValue
        val user = doc.getElementsByTagName("cas:user").item(0).firstChild.nodeValue
        val authority = doc.getElementsByTagName("cas:authority").item(0).firstChild.nodeValue
        val userSession =
            UserSession("JSESSIONID", "$ticket", firstname, lastname, user, authority.split(","))
        call.sessions.set(userSession)

        if (neededRoles.intersect(userSession.roles.toSet()).isEmpty()) return false
        return true
    }
}
