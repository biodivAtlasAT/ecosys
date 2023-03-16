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
package at.duk.tables

import org.jetbrains.exposed.dao.id.IntIdTable
import org.jetbrains.exposed.sql.Column

object TableRasterData : IntIdTable("raster_data") {
        val filename: Column<String> = varchar("filename", 512)
        var name: Column<String> = varchar("name", 128)
        val tmpTable: Column<String> = varchar("tmp_table", 128)
        val dataComplete: Column<Boolean> = bool("data_complete")
        val dimension: Column<String> = varchar("dimension", 128)
        val serviceId: Column<Int?> = integer("service_id").nullable()
        val packageId: Column<Int?> = integer("package_id").nullable()
        val rasterTaskId: Column<Int?> = integer("raster_task_id").nullable()
        val uploadedRasterDataId: Column<Int?> = integer("uploaded_raster_data_id").nullable()
        val statistics: Column<String?> = varchar("statistics", 128).nullable()
        val srid: Column<String> = varchar("srid", 128).default("")
        val geoserverLayerName: Column<String?> = varchar("geoserver_layer_name", 128).nullable()
        val geoserverWorkingSpace: Column<String?> = varchar("geoserver_working_space", 32).nullable()
}
