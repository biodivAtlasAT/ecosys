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

import com.fasterxml.jackson.annotation.JsonIgnore
import com.fasterxml.jackson.annotation.JsonProperty
import com.fasterxml.jackson.module.kotlin.jacksonObjectMapper
import com.fasterxml.jackson.module.kotlin.readValue
import kotlinx.serialization.Serializable

@Serializable
data class RasterDataResponse(val data: MutableList<RasterServiceVals>)

@Serializable
data class RasterServiceVals(val id: Int, val vals: MutableList<RasterServiceVal>, val svg: String, val dim: String)

@Serializable
@Suppress("ConstructorParameterNaming")
data class RasterServiceVal(
    @JsonProperty val `val`: Double?, @JsonIgnore val statistics: String, @JsonIgnore val dimension: String
    ) {

    @JsonProperty var quantil: Int? = null

    init {
        // "0.2":31.0,"0.4":128.0,"0.6":128.0,"0.8":128.0
        `val`?.let {
            val mapper = jacksonObjectMapper()
            val limits: Map<Double, Double> = mapper.readValue(statistics)

            quantil = limits.size // sets max
            run breaking@{
                limits.map { it.value }.forEachIndexed { index, ele ->
                    if (it <= ele) {
                        quantil = index
                        return@breaking
                    }
                }
            }
        }
    }
}

@Serializable
data class ResponseError(val no: Int, val msg: String)

@Serializable
data class EcosysRasterDataResponse(val error: ResponseError, val data: List<RasterServiceVals>)

@Serializable
data class EcosysServiceDataResponse(val error: ResponseError, val services: List<ServiceData>)

@Serializable
data class EcosysPackageDataResponse(val error: ResponseError, val packages: List<PackageData>)

@Serializable
data class EcosysLayerDataResponse(val error: ResponseError, val layers: List<LayerData>)

@Serializable
data class EcosysRasterDataResponseSingle(val error: ResponseError, val data: List<RasterServiceVal>)
