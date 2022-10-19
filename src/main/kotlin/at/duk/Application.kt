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
import freemarker.cache.ClassTemplateLoader
import io.ktor.server.application.*
import io.ktor.server.freemarker.*
import kotlinx.coroutines.job
import kotlinx.coroutines.launch
import java.io.File
import java.nio.file.Paths

const val DUMMY_SVG_PATH = "static/svg/dummy.svg"

fun main(args: Array<String>): Unit =
    io.ktor.server.netty.EngineMain.main(args)

fun Application.module() {
    val database = AppDataBase(environment.config)
    database.init()

    install(FreeMarker) {
        templateLoader = ClassTemplateLoader(this::class.java.classLoader, "templates")
    }

    configureRouting()
    configureTemplating()
    configureSerialization()
    launch {
        DataCache.loadNavigation(environment.config)
        val dataCacheDirectory = environment.config.propertyOrNull("dataCache.directory")?.getString()
            ?: Paths.get("").toAbsolutePath().toString()
        val filePath = File(dataCacheDirectory).resolve("AlaNavigation").resolve("navigation.html")

        // Wait until the file is saved - to prevent responses before the navigation is cached!
        if (!File("$filePath").exists())
            this.coroutineContext.job.join()
    }
}
