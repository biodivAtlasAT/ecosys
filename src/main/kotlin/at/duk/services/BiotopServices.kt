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

import at.duk.models.biotop.HierarchyData
import at.duk.models.biotop.ProjectData
import at.duk.services.AdminServices.getProjectDataFolderName
import at.duk.tables.biotop.TableClasses
import at.duk.tables.biotop.TableHierarchy
import at.duk.tables.biotop.TableProjects
import com.fasterxml.jackson.module.kotlin.jacksonObjectMapper
import io.ktor.client.*
import io.ktor.client.engine.cio.*
import io.ktor.client.request.*
import io.ktor.client.statement.*
import io.ktor.http.*
import io.ktor.server.config.*
import koodies.text.toLowerCase
import org.jetbrains.exposed.sql.*
import org.jetbrains.exposed.sql.transactions.transaction
import java.io.File
import java.time.LocalDateTime

object BiotopServices {
    private const val ROOT_NODE = "999"
    private const val EXT_ROOT_NODE = "$ROOT_NODE."

    val mapper = jacksonObjectMapper()

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

    suspend fun getListOfFeatures(layer: String?, geoserverUrl: String?, geoserverWorkspace: String): Map<String, String> {
        geoserverUrl?.let {
            layer?.let { name ->
                val client = HttpClient(CIO)
                val url = "$geoserverUrl/rest/workspaces/$geoserverWorkspace/layers/$name.json"
                val response: HttpResponse = client.request(url) {
                    method = HttpMethod.Get
                }
                if (response.status == HttpStatusCode.OK) {
                    return getListOfFeaturesSub(response.bodyAsText(), geoserverUrl)
                }
            }
        }
        return emptyMap<String, String>()
    }
    private suspend fun getListOfFeaturesSubOld(resp: String, geoserverUrl: String?, geoserverWorkspace: String): List<String> {
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

    private suspend fun getListOfFeaturesSub(resp: String, geoserverUrl: String?): Map<String, String> {
        val mapOfFeatures = mutableMapOf<String, String>()
        val featureUrl = resp.split("@").first {
            it.startsWith("class\":\"featureType\"")}.split("\"").first {
            it.startsWith("http") }
        geoserverUrl?.let {
            val client2 = HttpClient(CIO)
            val response2: HttpResponse = client2.request(featureUrl) {
                method = HttpMethod.Get
            }
            if (response2.status == HttpStatusCode.OK) {
                return mapper.readTree(response2.bodyAsText()).path("featureType").path("attributes").path("attribute")
                    .associate { it.path("name").textValue() to it.path("binding").textValue() }
                }
        }
        return mapOfFeatures
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

        val hierarchyList = mutableListOf<HierarchyData>()
        transaction {
            TableHierarchy.select { TableHierarchy.classId eq classId and (TableHierarchy.projectId eq -1) }
                .orderBy(TableHierarchy.sortCode)
                .forEach {
                    hierarchyList.add(HierarchyData.mapRSToHierarchyData(it))
                }
        }
        hierarchyList.setIsLeaf()
        transaction {
            hierarchyList.filter { it.isLeaf }.forEach {
                TableHierarchy.update({ TableHierarchy.id eq it.id }) { it ->
                    it[TableHierarchy.isLeaf] = true
                }
            }
        }
        return report
    }

    fun createHierarchieFromContent(content: List<String>, classId: Int?, projectId: Int?): String {
        var report = ""
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
            classId?.let {
                TableHierarchy.deleteWhere { TableHierarchy.classId eq classId and (TableHierarchy.projectId eq -1) }
            }
            projectId?.let {
                TableHierarchy.deleteWhere { TableHierarchy.projectId eq projectId }
            }
            val keyMap = mutableMapOf<String, Int>()
            items.toSortedMap().forEach { (k, v) ->
                val id = TableHierarchy.insertAndGetId {
                    it[TableHierarchy.classId] = classId?:-1
                    it[TableHierarchy.projectId] = projectId?:-1
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
            classId?.let {
                TableHierarchy.select { TableHierarchy.classId eq classId and (TableHierarchy.projectId eq -1) }
                    .forEach {
                        keyMap[items[it[TableHierarchy.keyCode]]?.second]?.let { parentId ->
                            TableHierarchy.update({ TableHierarchy.id eq it[TableHierarchy.id] }) { it2 ->
                                it2[TableHierarchy.parentId] = parentId
                            }
                        }
                    }
            }
            projectId?.let {
                TableHierarchy.select { TableHierarchy.projectId eq projectId }
                    .forEach {
                        keyMap[items[it[TableHierarchy.keyCode]]?.second]?.let { parentId ->
                            TableHierarchy.update({ TableHierarchy.id eq it[TableHierarchy.id] }) { it2 ->
                                it2[TableHierarchy.parentId] = parentId
                            }
                        }
                    }
            }
        }





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

    fun matchFeatures(config: ApplicationConfig, project: ProjectData, matchDict: Map<String, String>) {
        val hierarchyList = mutableListOf<HierarchyData>()
        val content = mutableListOf<String>()  // imitates the lines of an uploaded file

        // Prepare Hierarchy as csv-file to use the same import mechanism
        content.add("id;name")
        if (project.classId != -1)
            transaction {
                TableHierarchy.select { TableHierarchy.classId eq project.classId and (TableHierarchy.projectId eq -1) }
                    .orderBy(TableHierarchy.sortCode)
                    .forEach {
                        content.add("${it[TableHierarchy.keyCode]};${it[TableHierarchy.description]}")
                        hierarchyList.add(HierarchyData.mapRSToHierarchyData(it))
                    }
            }

        val matchTable = getMatchTable(config, project)
        integrateDataFromShapeFile(project, matchTable, content, matchDict, hierarchyList)
        createHierarchieFromContent(content, null, project.id) // - saves the hierarchy
        delegateHasDataFlag(hierarchyList, project)
        matchFeaturesPost(project, matchTable)
    }

    private fun integrateDataFromShapeFile(
        project: ProjectData,
        matchTable: Map<String, String>,
        content: MutableList<String>,
        matchDict: Map<String, String>,
        hierarchyList: List<HierarchyData>
    ) {
        var needsRootItem = false
        // check if there is some data from the shape file
        matchDict.forEach { (k, v) ->
            val compareKey = if (project.hasMatchTable && matchTable.containsKey(k)) matchTable[k]!! else k

            val itemList = hierarchyList.filter { it.keyCode == compareKey }
            if (itemList.isEmpty()) {
                needsRootItem = true
                content.add("${EXT_ROOT_NODE}${compareKey.replace(".", "_")};$v")  // replace necessary to break hierarchy rule
            } else {
                hierarchyList.first { it.keyCode == compareKey }.also {
                    it.hasData = true
                    content.add("${it.keyCode};${it.description}")
                }
            }
        }
        if (needsRootItem) content.add("${ROOT_NODE};Nicht zugeordnet")
    }
    private fun delegateHasDataFlag(hierarchyList: List<HierarchyData>, project: ProjectData) {
        transaction {
            hierarchyList.filter { it.hasData }.forEach {
                TableHierarchy.update({ TableHierarchy.keyCode eq it.keyCode and (TableHierarchy.projectId eq project.id) }) {
                    it[TableHierarchy.hasData] = true
                }
            }
            TableHierarchy.select { TableHierarchy.projectId eq project.id and (TableHierarchy.keyCode eq ROOT_NODE) }
                .forEach { rs ->
                    TableHierarchy.update({ TableHierarchy.parentId eq rs[TableHierarchy.id].value and (TableHierarchy.projectId eq project.id) }) {
                        it[TableHierarchy.hasData] = true
                    }
                }
        }
    }

    public fun getHierarchyListFromDB(project: ProjectData): List<HierarchyData> = transaction {
            TableHierarchy.select { TableHierarchy.projectId eq project.id }.orderBy(TableHierarchy.sortCode)
                .map { HierarchyData.mapRSToHierarchyData(it) }
        }

    private fun getHierarchyMapFromDBForClassId(classId: Int): Map<String, HierarchyData> = transaction {
        TableHierarchy.select { TableHierarchy.classId eq classId }.orderBy(TableHierarchy.sortCode)
            .associate { HierarchyData.mapRSToHierarchyData(it).keyCode to HierarchyData.mapRSToHierarchyData(it) }
    }


    fun List<HierarchyData>.setIsLeaf() {
        this.forEach { tl ->
            tl.isLeaf = this.filter { tl.id == it.parentId }.isEmpty()
        }
    }
    fun List<HierarchyData>.setHasData() {
        val hasDataItems = this.filter { it.hasData }.toMutableList()
        hasDataItems.forEach {
            setHasDataRecursively(it, this)
        }
    }

    fun List<HierarchyData>.setColors(hierarchyDataMap: Map<String, HierarchyData>) {
        this.forEach {
            it.color = hierarchyDataMap[it.keyCode]?.color
        }
    }

    private fun getChildrenKeyCodes(hdList: List<HierarchyData>, hierarchyData: HierarchyData): List<String> {
        val keyCodesList = mutableListOf<String>()
        val actLevel = hierarchyData.levelNumber
        var inside = false

        hdList.forEach {
            if (it === hierarchyData) {
                inside = true
                return@forEach
            }
            if (inside) {
                if (it.levelNumber <= actLevel)
                    inside = false
                else
                    if (it.hasData && it.isLeaf)
                        keyCodesList.add(it.mappedKeyCode ?: it.keyCode)
            }
        }

        return keyCodesList
    }
    fun List<HierarchyData>.setCQLFilter(colTypesCode: String?, colTypesCodeType: String?) {
        val numberOfDataLeaves = this.count { it.isLeaf && it.hasData }
        val stringDelim = if (colTypesCodeType == "java.lang.String") "'" else ""

        this.filter { !it.isLeaf }.forEach { hierarchyData ->
            val kl = getChildrenKeyCodes(this, hierarchyData)
            if (kl.size == numberOfDataLeaves) // if node contains all subnodes, then do not save a cql-filter; the filter may contain to many characters for an URL-Parameter
                hierarchyData.cqlQuery = null
            else
                hierarchyData.cqlQuery = kl.joinToString(",", "$colTypesCode in (", ")") { "$stringDelim$it$stringDelim" }
        }

        this.filter { it.isLeaf && it.hasData }.forEach {
            it.cqlQuery = "$colTypesCode=$stringDelim${it.mappedKeyCode?:it.keyCode}$stringDelim"
        }
        this.filter { !it.isLeaf && !it.hasData }.forEach {
            it.cqlQuery = null
        }

    }

    private fun matchFeaturesPost(project: ProjectData, matchTable: Map<String, String>) {
        val hierarchyList = getHierarchyListFromDB(project).also {
            it.setIsLeaf()
            it.setHasData()
            it.setColors(getHierarchyMapFromDBForClassId(project.classId))
        }
        // set matchCode from matchTable
        matchTable.forEach {(k, v) ->
            hierarchyList.find { it.keyCode == v }?.also {
                it.mappedKeyCode = k
            }
        }

        transaction {
            hierarchyList.forEach { hd ->
                if (hd.hasData || hd.isLeaf || hd.mappedKeyCode != null) {
                    TableHierarchy.update({ TableHierarchy.id eq hd.id }) {
                        it[TableHierarchy.hasData] = hd.hasData
                        it[TableHierarchy.isLeaf] = hd.isLeaf
                        it[TableHierarchy.mappedKeyCode] = hd.mappedKeyCode
                        it[TableHierarchy.color] = hd.color
                    }
                }
                if (hd.keyCode.startsWith(EXT_ROOT_NODE)) {
                    TableHierarchy.update({ TableHierarchy.id eq hd.id }) {
                        it[TableHierarchy.mappedKeyCode] = hd.keyCode.replace(EXT_ROOT_NODE, "").replace("_", ".")
                    }
                }
            }
        }


    }

    private fun setHasDataRecursively(hd: HierarchyData, hierarchyList: List<HierarchyData>) {
        hierarchyList.forEach {
            if (hd.parentId == it.id) {
                it.hasData = true
                setHasDataRecursively(it, hierarchyList)
            }
        }
    }


    // for later use - if properties of a layer cannot be retrieved from WFS Service
    private fun getValuesFromDBF(project: ProjectData): Map<String, String> {
        val matchDict = mutableMapOf<String, String>()
       /* val fis = FileInputStream(project.geoserverDBFfile)
        val dbfReader = DbaseFileReader(
            fis.channel,
            false, Charset.forName("ISO-8859-1")
        )

        var keyColIndex = -1
        var nameColIndex = -1
        for(i in 0 until dbfReader.header.numFields) {
            if (dbfReader.header.getFieldName(i) == project.colTypesCode)
                keyColIndex = i
            if (dbfReader.header.getFieldName(i) == project.colTypesDescription)
                nameColIndex = i
        }


        if (keyColIndex != -1 && nameColIndex != -1) {
            while (dbfReader.hasNext()) {
                val fields = dbfReader.readEntry()
                val key = fields[keyColIndex]?.toString()
                val name = fields[nameColIndex]?.toString()
                if (key != null && name != null)
                    matchDict[key] = name
               // println("$key: $name")
            }
        }
        dbfReader.close()
        fis.close()
*/
        return matchDict
    }

    private fun getMatchTable(config: ApplicationConfig, project: ProjectData): Map<String, String> {
        val dict = mutableMapOf<String, String>()
        val dataCacheDirectory = config.propertyOrNull("dataCache.directory")?.getString() ?: ""
        val projectPath = getProjectDataFolderName(dataCacheDirectory, project.id)
        if(project.hasMatchTable) {
            if (File(projectPath).resolve(project.classMap!!).exists()) {
                val content = File(projectPath).resolve(project.classMap!!).readLines()
                content.forEachIndexed { index, s ->
                    if (index > 0) {
                        val arr = s.split(";")
                        dict[arr[0]] = arr[1]
                    }
                }
            }
        }
        return dict
    }

    suspend fun getLayerDataFromWFSService(project: ProjectData, config:ApplicationConfig): Map<String, String> {
        // http://127.0.0.1:8081/geoserver/wfs?service=wfs&version=2.0.0&request=GetFeature&typeNames=ECO:bundesland_wgs84_iso&propertyName=BL_KZ,BL
        val matchDict = mutableMapOf<String, String>()
        config.propertyOrNull("geoserver.url")?.getString()?.let { geoserverUrl ->
            val client = HttpClient(CIO)
            val url = "$geoserverUrl/wfs?service=wfs&version=2.0.0&request=GetFeature&outputFormat=json&" +
                    "typeNames=${project.geoserverWorkspace}:${project.geoserverLayer}&propertyName=${project.colTypesCode},${project.colTypesDescription}"
            val response: HttpResponse = client.request(url) {
                method = HttpMethod.Get
            }
            try {
                if (response.status == HttpStatusCode.OK) {
                    mapper.readTree(response.bodyAsText()).path("features").forEach {
                        val props = it.path("properties")
                        val key = props[project.colTypesCode].asText() //.toString()
                        val value = props[project.colTypesDescription].asText() // .toString()
                        matchDict[key] = value
                    }
                }
            } catch (ex: Exception) { println("Response of WFS Request could not be analyzed!\nresponse.bodyAsText()")  }
        }
        return matchDict
    }
}
