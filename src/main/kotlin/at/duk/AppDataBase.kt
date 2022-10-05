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