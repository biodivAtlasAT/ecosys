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

import at.duk.tables.biotop.TableProjects
import koodies.docker.Docker
import kotlinx.serialization.Serializable
import org.jetbrains.exposed.sql.IntegerColumnType
import org.jetbrains.exposed.sql.ResultRow
import org.jetbrains.exposed.sql.SqlExpressionBuilder.eq
import org.jetbrains.exposed.sql.select
import org.jetbrains.exposed.sql.transactions.transaction

@Serializable
data class ProjectData(
    val id: Int,
    val name: String,
    val geoserverWorkspace: String? = null,
    val geoserverLayer: String? = null,
    val colTypesCode: String? = null,
    val colSpeciesCode: String? = null
) {
    companion object{
        fun mapRSToProjectData(rs: ResultRow): ProjectData {
            return ProjectData(
                rs[TableProjects.id].value,
                rs[TableProjects.name],
                rs[TableProjects.geoserverWorkspace],
                rs[TableProjects.geoserverLayer],
                rs[TableProjects.colTypesCode]
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
}
