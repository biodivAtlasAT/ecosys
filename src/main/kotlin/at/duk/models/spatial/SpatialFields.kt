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

@Suppress("ConstructorParameterNaming")
data class SpatialFields(
    val addtomap: Boolean,
    val analysis: Boolean,
    val defaultlayer: Boolean,
    val desc: String,
    val enabled: Boolean,
    val id: String,
    val indb: Boolean,
    val intersect: Boolean,
    val last_update: Any?,
    val layerbranch: Boolean,
    val name: String,
    val namesearch: Boolean,
    val number_of_objects: Int,
    val objects: List<Object>,
    val sdesc: String,
    val sid: String,
    val sname: String,
    val spid: String,
    val type: String,
    val wms: Any?
)

@Suppress("ConstructorParameterNaming")
data class Object(
    val area_km: Double,
    val bbox: String,
    val description: String,
    val fid: String,
    val fieldname: String,
    val id: String,
    val name: String,
    val pid: String,
    val wmsurl: String
)
