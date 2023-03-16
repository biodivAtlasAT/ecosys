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
package at.duk.models.biotop

import at.duk.services.BiotopServices.projectIsSynchronized
import at.duk.tables.biotop.TableProjects
import kotlinx.serialization.Serializable
import org.jetbrains.exposed.sql.ResultRow
import org.jetbrains.exposed.sql.select
import org.jetbrains.exposed.sql.transactions.transaction

const val GEOSERVER_PROJECT_PREFIX = "ecosys_project_"
@Serializable
data class ProjectData(
    val id: Int,
    val name: String,
    var enabled: Boolean = false,
    var epoch: String? = null,
    var area: String? = null,
    var resource: String? = null,
    var classId: Int = -1,
    var classInfo: String? = null,
    var classMap: String? = null,
    val geoserverWorkspace: String? = null,
    val geoserverLayer: String? = null,
    val colTypesCode: String? = null,
    val colTypesCodeType: String? = null,
    val colTypesDescription: String? = null,
    val colSpeciesCode: String? = null,
    val speciesFileName: String? = null,
    var speciesColId: String? = null,
    var speciesColTaxonId: String? = null,
    var speciesColTaxonName: String? = null,
) {
    val geoServerStyleName = GEOSERVER_PROJECT_PREFIX + id

    companion object {
        public fun mapRSToProjectData(rs: ResultRow): ProjectData {
            return ProjectData(
                rs[TableProjects.id].value,
                rs[TableProjects.name],
                rs[TableProjects.enabled],
                rs[TableProjects.epoch],
                rs[TableProjects.area],
                rs[TableProjects.resource],
                rs[TableProjects.classId],
                rs[TableProjects.classInfo],
                rs[TableProjects.classMap],
                rs[TableProjects.geoserverWorkspace],
                rs[TableProjects.geoserverLayer],
                rs[TableProjects.colTypesCode],
                rs[TableProjects.colTypesCodeType],
                rs[TableProjects.colTypesDescription],
                rs[TableProjects.colSpeciesCode],
                rs[TableProjects.speciesFileName],
                rs[TableProjects.speciesColId],
                rs[TableProjects.speciesColTaxonId],
                rs[TableProjects.speciesColTaxonName],
            )
        }
        fun getById(id: Int): ProjectData? {
            var project: ProjectData? = null
            transaction {
                TableProjects.select { TableProjects.id eq id }.limit(1).map { rs ->
                    project = mapRSToProjectData(rs)
                }
            }
            return project
        }
    }
    val hasMatchTable = this.classMap != null && this.classMap != ""
    val hasSyncWithClassification = projectIsSynchronized(this.id)
    val syncEnabled = geoserverLayer != null && classId != -1
}
