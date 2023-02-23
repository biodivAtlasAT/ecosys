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
package at.duk.tables.biotop

import org.jetbrains.exposed.dao.id.IntIdTable
import org.jetbrains.exposed.sql.Column
import org.jetbrains.exposed.sql.javatime.datetime
import java.time.LocalDateTime

object TableHierarchy : IntIdTable("bt_hierarchy") {
    var parentId: Column<Int> = integer("parent_id").default(-1)
    var levelNumber: Column<Int> = integer("level_number").default(0)
    var projectId: Column<Int> = integer("project_id").default(-1)
    var classId: Column<Int> = integer("class_id").default(-1)
    var keyCode: Column<String> = varchar("key_code", length = 64)
    var mappedKeyCode: Column<String?> = varchar("mapped_key_code", length = 64).nullable().default(null)
    var sortCode: Column<String?> = varchar("sort_code", length = 128).nullable().default(null)
    var description: Column<String> = varchar("description", length = 512)
    var category: Column<String?> = varchar("category", length = 128).nullable().default(null)
    var color: Column<String?> = varchar("color", length = 32).nullable().default(null)
    var isLeaf: Column<Boolean> = bool("is_leaf").default(false)
    var hasData: Column<Boolean> = bool("has_data").default(false)
}