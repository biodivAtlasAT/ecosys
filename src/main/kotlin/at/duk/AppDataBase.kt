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
package at.duk

import com.zaxxer.hikari.HikariConfig
import com.zaxxer.hikari.HikariDataSource
import io.ktor.server.config.*
import org.flywaydb.core.Flyway
import javax.sql.DataSource

class AppDataBase(
    private val config: ApplicationConfig
) {
    lateinit var dataSource: DataSource
    fun init() {
        connectionPool()
        val flyway = Flyway.configure().dataSource(dataSource).load()
        flyway.migrate()
        orm()
    }

    private fun connectionPool() {
        val dbConfig = this.config.config("ktor.database")
        val config = HikariConfig().apply {
            jdbcUrl = dbConfig.property("connection.jdbc").getString()
            username = dbConfig.property("connection.user").getString()
            password = dbConfig.property("connection.password").getString()
            isAutoCommit = false
            maximumPoolSize = 3
            transactionIsolation = "TRANSACTION_REPEATABLE_READ"
            validate()
        }
        dataSource = HikariDataSource(config)
    }

    private fun orm() = org.jetbrains.exposed.sql.Database.connect(dataSource)
}
