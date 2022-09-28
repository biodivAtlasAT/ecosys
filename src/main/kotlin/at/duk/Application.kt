package at.duk

import at.duk.plugins.*
import io.ktor.server.application.*
import kotlinx.coroutines.job
import kotlinx.coroutines.launch
import java.io.File
import java.nio.file.Paths


fun main(args: Array<String>): Unit =
    io.ktor.server.netty.EngineMain.main(args)

fun Application.module() {
    configureRouting()
    configureTemplating()
    configureSerialization()
    launch {
        DataCache.loadNavigation(environment.config)
        val dataCacheDirectory = environment.config.propertyOrNull("dataCache.directory")?.getString() ?: Paths.get("").toAbsolutePath().toString()
        val filePath = File(dataCacheDirectory).resolve("AlaNavigation").resolve("navigation.html")
        if (!File("$filePath").exists())
            this.coroutineContext.job.join()
    }
}