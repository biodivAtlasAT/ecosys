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

import at.duk.tables.biotop.TableHierarchy
import com.fasterxml.jackson.annotation.JsonIgnore
import kotlinx.serialization.Serializable
import org.jetbrains.exposed.sql.ResultRow

@Serializable
data class HierarchyData(
    val id: Int,
    val parentId: Int,
    val levelNumber: Int,
    val projectId: Int?,
    val classId: Int?,
    val keyCode: String,
    var mappedKeyCode: String?,
    val sortCode: String?,
    val description: String,
    val category: String?,
    var color: String?,
    var isLeaf: Boolean,
    var hasData: Boolean,
) {
    constructor(
        parentId: Int, levelNumber: Int, projectId: Int, keyCode: String, sortCode: String, description: String
    ) : this(
        -1, parentId, levelNumber, projectId, -1, keyCode,
        null, sortCode, description, null, null, false, false
    )

    // necessary becaus Apache Freemarker cannot check properties with is....
    @JsonIgnore
    val checkLeaf = isLeaf
    var cqlQuery: String? = null
    companion object {
        fun mapRSToHierarchyData(rs: ResultRow): HierarchyData {
            return HierarchyData(
                rs[TableHierarchy.id].value,
                rs[TableHierarchy.parentId],
                rs[TableHierarchy.levelNumber],
                rs[TableHierarchy.projectId],
                rs[TableHierarchy.classId],
                rs[TableHierarchy.keyCode],
                rs[TableHierarchy.mappedKeyCode],
                rs[TableHierarchy.sortCode],
                rs[TableHierarchy.description],
                rs[TableHierarchy.category],
                rs[TableHierarchy.color],
                rs[TableHierarchy.isLeaf],
                rs[TableHierarchy.hasData],
            )
        }
    }
}
