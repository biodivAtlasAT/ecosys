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

import at.duk.tables.TableRasterTasks
import at.duk.tables.TableUploadedRasterData
import at.duk.tables.TableRasterData
import at.duk.tables.TablePackages
import at.duk.tables.biotop.TableProjects
import com.fasterxml.jackson.module.kotlin.jacksonObjectMapper
import io.ktor.http.*
import io.ktor.server.config.*
import koodies.exec.Process
import koodies.exec.error
import koodies.exec.exitCode
import koodies.shell.ShellScript
import org.jetbrains.exposed.dao.id.EntityID
import org.jetbrains.exposed.sql.*
import org.jetbrains.exposed.sql.SqlExpressionBuilder.eq
import org.jetbrains.exposed.sql.javatime.CurrentDateTime
import org.jetbrains.exposed.sql.transactions.transaction
import java.io.File
import java.nio.file.Paths
import java.time.LocalDateTime

object BiotopServices {

    fun projectDelete(formParameters: Parameters) = formParameters["mode"]?.let {
        formParameters["id"]?.toIntOrNull().let { id ->
            transaction {
                TableProjects.update({ TableProjects.id eq id }) {
                    it[TableProjects.deleted] = LocalDateTime.now()
                }
            }
        }
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

}
