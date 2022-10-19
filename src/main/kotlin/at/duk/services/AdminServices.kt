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

import at.duk.tables.TableCategories
import at.duk.tables.TableServices
import io.ktor.http.*
import org.jetbrains.exposed.sql.insert
import org.jetbrains.exposed.sql.transactions.transaction
import org.jetbrains.exposed.sql.update
import java.io.File
import java.time.LocalDateTime

object AdminServices {
    fun categoryDelete(formParameters: Parameters) = formParameters["id"]?.toIntOrNull().let { id ->
        transaction {
            TableCategories.update({ TableCategories.id eq id }) {
                it[TableCategories.deleted] = LocalDateTime.now()
            }
        }
    }

    fun categoryInsertOrUpdate(formParameters: Parameters) = formParameters["name"]?.let { name ->
        formParameters["id"]?.toIntOrNull().let { id ->
            transaction {
                if (id == -1)
                    TableCategories.insert {
                        it[TableCategories.name] = name
                        it[TableCategories.created] = LocalDateTime.now()
                    }
                else
                    TableCategories.update({ TableCategories.id eq id }) {
                        it[TableCategories.name] = name
                        it[TableCategories.updated] = LocalDateTime.now()
                    }
            }
        }
    }

    fun serviceDelete(formParameters: Parameters) = formParameters["id"]?.toIntOrNull().let { id ->
        transaction {
            TableServices.update({ TableServices.id eq id }) {
                it[TableServices.deleted] = LocalDateTime.now()
            }
        }
    }

    fun serviceInsertOrUpdate(formParameters: Parameters) = formParameters["name"]?.let { name ->
        val categoryId = formParameters["categoryId"]?.toIntOrNull() ?: -1
        formParameters["id"]?.toIntOrNull().let { id ->
            transaction {
                if (id == -1)
                    TableServices.insert {
                        it[TableServices.name] = name
                        it[TableServices.categoryId] = categoryId
                        it[TableServices.created] = LocalDateTime.now()
                    }
                else
                    TableServices.update({ TableServices.id eq id }) {
                        it[TableServices.name] = name
                        it[TableServices.categoryId] = categoryId
                        it[TableServices.updated] = LocalDateTime.now()
                    }
            }
        }
    }

    fun resolveSVGPath(str: String?) = if (str == null)
            "static/svg/dummy.svg"
        else
            "assets/svg/$str"

    fun getUniqueSVGName(svgDataFolder: File): String {
        var tmpFileName = "SVG_${RasterServices.genTempName(15)}.svg"
        while (File(svgDataFolder.resolve(tmpFileName).toString()).exists()) tmpFileName =
            "SVG_${RasterServices.genTempName(15)}.svg"
        return tmpFileName
    }

    fun getSVGDataFolder(dataCacheDirectory: String): File {
        val svgDataFolder = File(dataCacheDirectory).resolve("svg")
        if (!File("$svgDataFolder").exists()) File("$svgDataFolder").mkdir()
        return svgDataFolder
    }
}
