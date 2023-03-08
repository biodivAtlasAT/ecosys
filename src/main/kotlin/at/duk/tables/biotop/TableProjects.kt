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

object TableProjects : IntIdTable("bt_projects") {
    var name: Column<String> = varchar("name", length = 50)
    var enabled: Column<Boolean> = bool("enabled")
    var epoch: Column<String?> = varchar( "epoch", length = 128).nullable()
    var area: Column<String?> = varchar( "area", length = 128).nullable()
    var resource: Column<String?> = varchar("resource", length = 32).nullable()
    var classId: Column<Int> = integer("class_id").default(-1)
    var classInfo: Column<String?> = varchar("class_info", length = 128).nullable()
    var classMap: Column<String?> = varchar("class_map", length = 128).nullable()
    var geoserverWorkspace: Column<String?> = varchar("geoserver_workspace", length = 128).nullable()
    var geoserverLayer: Column<String?> = varchar("geoserver_layer", length = 128).nullable()
    var geoserverDBFfile: Column<String?> = varchar("geoserver_dbf_file", length = 256).nullable()
    var colTypesCode: Column<String?> = varchar("col_types_code", length = 64).nullable()
    var colTypesCodeType: Column<String?> = varchar("col_types_code_type", length = 64).nullable()
    var colTypesDescription: Column<String?> = varchar("col_types_description", length = 128).nullable()
    var colSpeciesCode: Column<String?> = varchar("col_species_code", length = 64).nullable()
    var speciesFileName : Column<String?> = varchar("species_filename", length = 512).nullable()
    var speciesColCodeName: Column<String?> = varchar("species_col_code_name", length = 64).nullable()
    var speciesColNameName: Column<String?> = varchar("species_col_name_name", length = 64).nullable()
    var hierarchyId: Column<Int> = integer("hierarchy_id").default(-1)
    val created: Column<LocalDateTime> = datetime("created")
    val updated: Column<LocalDateTime?> = datetime("updated").nullable()
    val deleted: Column<LocalDateTime?> = datetime("deleted").nullable()
}