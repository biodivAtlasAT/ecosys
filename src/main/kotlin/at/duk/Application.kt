package at.duk

import at.duk.plugins.*
import freemarker.cache.ClassTemplateLoader
import io.ktor.serialization.kotlinx.json.*
import io.ktor.server.application.*
import io.ktor.server.freemarker.*
import io.ktor.server.plugins.contentnegotiation.*
import kotlinx.coroutines.job
import kotlinx.coroutines.launch
import java.io.File
import java.nio.file.Paths


fun main(args: Array<String>): Unit =
    io.ktor.server.netty.EngineMain.main(args)

fun Application.module() {
    install(FreeMarker){
        templateLoader = ClassTemplateLoader(this::class.java.classLoader, "templates")
    }

    configureRouting()
    configureTemplating()
    configureSerialization()
    launch {
        DataCache.loadNavigation(environment.config)
        val dataCacheDirectory = environment.config.propertyOrNull("dataCache.directory")?.getString() ?: Paths.get("").toAbsolutePath().toString()
        val filePath = File(dataCacheDirectory).resolve("AlaNavigation").resolve("navigation.html")

        // Wait until the file is saved - to prevent responses before the navigation is cached!
        if (!File("$filePath").exists())
            this.coroutineContext.job.join()
    }
}