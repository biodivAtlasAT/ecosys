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

import at.duk.services.AdminServices.getProjectDataFolderName
import at.duk.tables.biotop.TableClasses
import at.duk.tables.biotop.TableHierarchy
import at.duk.tables.biotop.TableProjects
import io.ktor.client.*
import io.ktor.client.engine.cio.*
import io.ktor.client.request.*
import io.ktor.client.statement.*
import io.ktor.http.*
import koodies.text.toLowerCase
import org.jetbrains.exposed.sql.*
import org.jetbrains.exposed.sql.transactions.transaction
import java.io.File
import java.time.LocalDateTime

object BiotopServices {

    fun projectDelete(formParameters: Parameters, dataCacheDirectory: String) = formParameters["mode"]?.let {
        formParameters["id"]?.toIntOrNull()?.let { id ->
            transaction {
                TableHierarchy.deleteWhere { TableHierarchy.projectId eq id }
                File(getProjectDataFolderName(dataCacheDirectory, id)).deleteRecursively()
                // todo: delete bt_species, bt_speciesgroups and bt_speciesjoingroups when "Arten" are implemented

                TableProjects.update({ TableProjects.id eq id }) {
                    it[TableProjects.deleted] = LocalDateTime.now()
                }
            }
        }
    }

    suspend fun getListOfLayers(geoserverUrl: String?, geoserverWorkspace: String): List<String> {
        val listOfLayers = mutableListOf<String>()
        geoserverUrl?.let {
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
        }
        return listOfLayers
    }

    suspend fun getListOfFeatures(layer: String?, geoserverUrl: String?, geoserverWorkspace: String): List<String> {
        geoserverUrl?.let {
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
        }
        return emptyList<String>()
    }
    private suspend fun getListOfFeaturesSub(resp: String, geoserverUrl: String?, geoserverWorkspace: String): List<String> {
        val listOfFeatures = mutableListOf<String>()
        val featureUrl = resp.split("@").first {
            it.startsWith("class\":\"featureType\"")}.split("\"").first {
            it.startsWith("http") }
        geoserverUrl?.let {
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

    fun classInsertOrUpdate(formParameters: Parameters) =
        formParameters["name"]?.let { name ->
            formParameters["id"]?.toIntOrNull()?.let { id ->
                transaction {
                    if (id == -1) {
                        TableClasses.insert {
                            it[TableClasses.description] = name
                            it[TableClasses.created] = LocalDateTime.now()
                        }
                    } else
                        TableClasses.update({ TableClasses.id eq id }) {
                            it[TableClasses.description] = name
                            it[TableClasses.updated] = LocalDateTime.now()
                        }
                }
            }
        }
    fun classCSVProcessing(filePath: String, classId: Int): String {
        var report = "result of CSV-Import:\n"
        val content = File(filePath).readLines()

        report += "Analyized lines: ${content.size}"

        // 1. check structure
        //    header and lines (id must contain . ); at least two columns
        csvCheckCols(content)
        // 2. generate data structure
        val items = mutableMapOf<String, Triple<String, String?, String?>>()
        var longestKeyPart = 1
        content.forEachIndexed { ind, line ->
            val eles = line.split(";")
            val key = eles[0]
            if(items.containsKey(key))
                report += "Schlüssel \"$key\" existiert mehrfach!"
            if (ind > 0 && key[key.length-1] != '.') {
                items[key] = Triple(eles[1], null, if (eles.size > 2) eles[2] else null)
                key.split(".").forEach { if (it.length > longestKeyPart) longestKeyPart = it.length }
            }
        }
        // check
        items.forEach { (k, v) ->
            if(k.contains("."))
                items[k] = Triple(v.first, k.substring(0, k.lastIndexOf(".")), v.third)
            else
                items[k] = Triple(v.first, "", v.third)
        }
        if (items.filterValues { it.second == null }.isNotEmpty()) report += "Items with no valid parent found!\n"

        transaction {
            TableHierarchy.deleteWhere { TableHierarchy.classId eq classId and (TableHierarchy.projectId eq -1) }
            val keyMap = mutableMapOf<String, Int>()
            items.toSortedMap().forEach { (k, v) ->
                val id = TableHierarchy.insertAndGetId {
                    it[TableHierarchy.classId] = classId
                    it[TableHierarchy.keyCode] = k
                    it[TableHierarchy.description] = v.first
                    it[TableHierarchy.category] = v.third
                    val x = k.count { letter -> letter == '.' }
                    it[TableHierarchy.levelNumber] = k.count { letter -> letter == '.' }
                    it[TableHierarchy.sortCode] = getSortCode(k, longestKeyPart)
                }
                keyMap[k] = id.value
            }
            // set parentId
            TableHierarchy.select { TableHierarchy.classId eq classId and (TableHierarchy.projectId eq -1) }.forEach {
                keyMap[items[it[TableHierarchy.keyCode]]?.second]?.let { parentId ->
                    TableHierarchy.update({ TableHierarchy.id eq it[TableHierarchy.id] }) { it2 ->
                        it2[TableHierarchy.parentId] = parentId
                    }
                }
            }
        }
        // 3. generate dependencies (parent, level, order by Id)
        // 4. delete & save into database
        // 5. create type for api which can be used for displaying the content
        return report
    }

    fun csvCheckCols(content: List<String>): Boolean {
        content.forEachIndexed { ind, line ->
            val eles = line.split(";")
            if (eles.size < 2) return false
            if (ind == 0 && (eles[0].toLowerCase() != "id" || eles[1].toLowerCase() != "name")) return false
        }
        return true
    }

    private fun getSortCode(k: String, longestKeyPart: Int): String {
        val newKey = mutableListOf<String>()
        k.split(".").forEach {
            var newKeyPart = it
            for (i in it.length..longestKeyPart)
                newKeyPart = "0" + newKeyPart
            newKey.add(newKeyPart)
        }
        return newKey.joinToString(separator = ".")
    }

    fun classTypesDelete(classId: Int, dataCacheDirectory: String) {
        transaction {
            TableHierarchy.deleteWhere { TableHierarchy.classId eq classId and (TableHierarchy.projectId eq -1) }
            TableClasses.update({ TableClasses.id eq classId }) {
                it[TableClasses.filename] = null
                it[TableClasses.updated] = LocalDateTime.now()
            }
            File(AdminServices.getClassesDataFolderName(dataCacheDirectory, classId)).deleteRecursively()
            // todo sld-file in geoserver löschen
        }


    }
    fun classDelete(formParameters: Parameters, dataCacheDirectory: String) = formParameters["mode"]?.let {
        formParameters["id"]?.toIntOrNull()?.let { classId ->
            classTypesDelete(classId, dataCacheDirectory)
            transaction {
                TableClasses.update({ TableClasses.id eq classId }) {
                    it[TableClasses.deleted] = LocalDateTime.now()
                }
                TableProjects.update({ TableProjects.classId eq classId }) {
                    it[TableProjects.classId] = -1
                    it[TableProjects.updated] = LocalDateTime.now()
                }
            }
        }
    }



}
