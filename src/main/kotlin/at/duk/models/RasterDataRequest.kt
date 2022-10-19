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
package at.duk.models

import io.ktor.server.request.*

class RasterDataRequest(request: ApplicationRequest) {
    val packageID = request.queryParameters["packageID"]?.toIntOrNull()
    var services = request.queryParameters["services"]?.replace("[", "")
        ?.replace("]", "")?.split(",")?.map { it.toInt() }?.toMutableList()
    val coords = request.queryParameters["coords"]?.replace("[", "")
        ?.replace("]", "")?.split(",")?.toList()
    val coordsList: MutableList<Pair<Double, Double>> = emptyList<Pair<Double, Double>>().toMutableList()

    fun initCoordsList() {
        coords?.forEach {
            val lngLat = it.replace("(", "").replace(")", "").split("/")
            if (lngLat.size == 2) {
                val lng = lngLat[0].toDoubleOrNull()
                val lat = lngLat[1].toDoubleOrNull()
                lng?.let {
                    lat?.let { coordsList.add(Pair(lng, lat)) }
                }
            }
        }
    }

    fun initServicesList() {
        services = services ?: listOf(-1).toMutableList()
    }

    fun reqDataExists() = (packageID != null && services != null && services!!.isNotEmpty() && coordsList.isNotEmpty())
}
