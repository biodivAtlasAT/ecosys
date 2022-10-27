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
package at.duk.models.spatial

class SpatialLayers : ArrayList<SpatialLayersItem>()

@Suppress("ConstructorParameterNaming")
data class SpatialLayersItem(
    val citation_date: String,
    val classification1: String,
    val classification2: String,
    val datalang: String,
    val description: String,
    val displayname: String,
    val displaypath: String,
    val domain: String,
    val dt_added: Long,
    val enabled: Boolean,
    val environmentalvaluemax: String,
    val environmentalvaluemin: String,
    val environmentalvalueunits: String,
    val grid: Boolean,
    val id: Int,
    val keywords: String,
    val licence_level: String,
    val licence_link: String,
    val licence_notes: String,
    val maxlatitude: Double,
    val maxlongitude: Double,
    val mddatest: String,
    val metadatapath: String,
    val minlatitude: Double,
    val minlongitude: Double,
    val name: String,
    val notes: String,
    val path_orig: String,
    val respparty_role: String,
    val shape: Boolean,
    val source: String,
    val source_link: String,
    val type: String
)
