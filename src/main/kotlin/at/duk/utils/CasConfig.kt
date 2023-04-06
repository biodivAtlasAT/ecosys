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
package at.duk.utils

import io.ktor.server.config.*

class CasConfig(config: ApplicationConfig) {
    val redirectToLoginUrl = config.propertyOrNull("cas.redirectToLoginUrl")?.getString() ?: ""
    val validationUrl = config.propertyOrNull("cas.validationUrl")?.getString() ?: ""
    val enabled = config.propertyOrNull("cas.enabled")?.getString().toBoolean()
    val protectedRoutes: MutableMap<String, List<String>> = mutableMapOf()
    val behindAProxy = config.propertyOrNull("cas.behindAProxy")?.getString().toBoolean()
    val logoutUrl = config.propertyOrNull("cas.logoutUrl")?.getString() ?: ""

    init {
        config.configList("cas.protectedRoutes").forEach { applicationConfig ->
            applicationConfig.keys().forEach {
                protectedRoutes[it.replace("\"", "")] = applicationConfig.tryGetStringList(it)?.toList() ?: emptyList()
            }
        }
    }
}
