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

import at.duk.plugins.configureRouting
import at.duk.plugins.configureTemplating
import at.duk.plugins.configureSerialization
import at.duk.services.LayerServices
import at.duk.services.LayerServices.getDataCacheSyncDirectory
import at.duk.services.LayerServices.logger
import freemarker.cache.ClassTemplateLoader
import io.ktor.http.*
import io.ktor.server.application.*
import io.ktor.server.freemarker.*
import io.ktor.server.plugins.cors.routing.*
import kotlinx.coroutines.job
import kotlinx.coroutines.launch
import java.io.File
import java.io.IOException
import java.nio.file.Files
import java.nio.file.Paths

const val DUMMY_SVG_PATH = "static/svg/dummy.svg"

fun main(args: Array<String>): Unit =
    io.ktor.server.netty.EngineMain.main(args)

fun Application.module() {
    val dataCacheDirectory = environment.config.propertyOrNull("dataCache.directory")?.getString()
    if (dataCacheDirectory == null) {
        log.error("----------------- dataCache.directory configuration is missing! ---------------")
        return
    } else {
        if(!File(dataCacheDirectory).exists()) {
            try {
                Files.createDirectories(Paths.get(dataCacheDirectory))
            } catch (ex: IOException) {
                log.error("Directory for datache.directory could not be created!")
                return
            }
        }
    }

    val database = AppDataBase(environment.config)
    database.init()
    install(CORS) {
        anyHost()
        allowHeader(HttpHeaders.AccessControlAllowOrigin)
        allowHeader(HttpHeaders.ContentType)
    }
    install(FreeMarker) {
        templateLoader = ClassTemplateLoader(this::class.java.classLoader, "templates")
    }
    configureRouting()
    configureTemplating()
    configureSerialization()
    if (LayerServices.checkIfSyncAlreadyRunning(environment.config)) {
        getDataCacheSyncDirectory(environment.config).resolve("sync.started").delete()
    }

    launch {
        DataCache.loadNavigation(environment.config)
        val filePath = File(dataCacheDirectory).resolve("AlaNavigation").resolve("navigation.html")

        // Wait until the file is saved - to prevent responses before the navigation is cached!
        if (!File("$filePath").exists())
            this.coroutineContext.job.join()
    }
}
