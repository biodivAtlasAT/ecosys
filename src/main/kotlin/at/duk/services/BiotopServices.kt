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

import at.duk.tables.TableRasterTasks
import at.duk.tables.TableUploadedRasterData
import at.duk.tables.TableRasterData
import at.duk.tables.TablePackages
import at.duk.tables.biotop.TableProjects
import com.fasterxml.jackson.module.kotlin.jacksonObjectMapper
import io.ktor.client.*
import io.ktor.client.engine.cio.*
import io.ktor.client.request.*
import io.ktor.client.statement.*
import io.ktor.http.*
import io.ktor.server.application.*
import io.ktor.server.config.*
import koodies.exec.Process
import koodies.exec.error
import koodies.exec.exitCode
import koodies.shell.ShellScript
import org.jetbrains.exposed.dao.id.EntityID
import org.jetbrains.exposed.sql.*
import org.jetbrains.exposed.sql.SqlExpressionBuilder.eq
import org.jetbrains.exposed.sql.javatime.CurrentDateTime
import org.jetbrains.exposed.sql.transactions.transaction
import java.io.File
import java.nio.file.Paths
import java.time.LocalDateTime

object BiotopServices {

    fun projectDelete(formParameters: Parameters) = formParameters["mode"]?.let {
        formParameters["id"]?.toIntOrNull().let { id ->
            transaction {
                TableProjects.update({ TableProjects.id eq id }) {
                    it[TableProjects.deleted] = LocalDateTime.now()
                }
            }
        }
    }

    suspend fun getListOfLayers(geoserverUrl: String, geoserverWorkspace: String): List<String> {
        val listOfLayers = mutableListOf<String>()
        val client = HttpClient(CIO)
        val url = "$geoserverUrl/rest/workspaces/$geoserverWorkspace/layers.json"
        val response: HttpResponse = client.request(url) {
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

    suspend fun getListOfFeatures(layer: String?, geoserverUrl: String, geoserverWorkspace: String): List<String> {
        layer?.let { name ->
            val client = HttpClient(CIO)
            val url = "$geoserverUrl/rest/workspaces/$geoserverWorkspace/layers/$name.json"
            val response: HttpResponse = client.request(url) {
                method = HttpMethod.Get
            }
            if (response.status == HttpStatusCode.OK) {
                return getListOfFeaturesSub(response.bodyAsText(), geoserverUrl, geoserverWorkspace)
            }
        }
        return emptyList<String>()
    }
    private suspend fun getListOfFeaturesSub(resp: String, geoserverUrl: String, geoserverWorkspace: String): List<String> {
        val listOfFeatures = mutableListOf<String>()
        val featureUrl = resp.split("@").first {
            it.startsWith("class\":\"featureType\"")}.split("\"").first {
            it.startsWith("http") }
        val client2 = HttpClient(CIO)
        val response2: HttpResponse = client2.request(featureUrl) {
            method = HttpMethod.Get
        }
        if (response2.status == HttpStatusCode.OK) {
            response2.bodyAsText().split("\"attribute\":").forEach {
                if (it.startsWith("[")) {
                    it.split("name\":\"").forEach {
                        val s = it.split("\"").first()
                        if (!s.startsWith("[") && !s.contains("the_geom"))
                            listOfFeatures.add(s)
                    }
                }
            }
        }
        return listOfFeatures
    }

    fun projectInsertOrUpdate(formParameters: Parameters) =
        formParameters["name"]?.let { name ->
            formParameters["id"]?.toIntOrNull().let { id ->
                transaction {
                    if (id == -1) {
                        TableProjects.insert {
                            it[TableProjects.name] = name
                            it[TableProjects.created] = LocalDateTime.now()
                        }
                    } else
                        TableProjects.update({ TableProjects.id eq id }) {
                            it[TableProjects.name] = name
                            it[TableProjects.updated] = LocalDateTime.now()
                        }
                }
            }
        }

}
