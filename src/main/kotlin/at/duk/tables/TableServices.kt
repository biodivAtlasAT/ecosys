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
import org.jetbrains.exposed.sql.javatime.datetime
import org.jetbrains.exposed.sql.select
import org.jetbrains.exposed.sql.transactions.transaction
import org.jetbrains.exposed.sql.update
import java.io.File
import java.time.LocalDateTime

object TableServices : IntIdTable("services") {
    var name: Column<String> = varchar("name", length = 128)
    val created: Column<LocalDateTime> = datetime("created")
    val updated: Column<LocalDateTime?> = datetime("updated").nullable()
    val deleted: Column<LocalDateTime?> = datetime("deleted").nullable()
    var categoryId: Column<Int> = integer("category_id")
    var svgPath: Column<String?> = varchar("svg_path", length = 512).nullable()
    var originalSvgName: Column<String?> = varchar("original_svg_name", length = 128).nullable()

    fun removeSVG(id: Int, svgDataFolder: String) {
        TableServices.select { TableServices.id eq id }.first().let { it[TableServices.svgPath] }
            ?.let { svgPath ->
                if (File("$svgDataFolder/$svgPath").exists())
                    File("$svgDataFolder/$svgPath").delete()
            }
        TableServices.update({ TableServices.id eq id }) {
            it[TableServices.svgPath] = null
            it[TableServices.originalSvgName] = null
            it[TableServices.updated] = LocalDateTime.now()
        }
    }

    private fun updateSVG(id: Int, tmpFileName: String, fileName: String) {
        TableServices.update({ TableServices.id eq id }) {
            it[TableServices.svgPath] = tmpFileName
            it[TableServices.originalSvgName] = fileName
            it[TableServices.updated] = LocalDateTime.now()
        }
    }

    fun updateTableServices(id: Int?, svgDataFolder: File, tmpFileName: String, fileName: String) {
        id?.let {
            if (id > -1 && File(svgDataFolder.resolve(tmpFileName).toString()).exists()) {
                transaction {
                    removeSVG(it, svgDataFolder.path)
                    updateSVG(it, tmpFileName, fileName)
                }
            }
        }
    }
}
