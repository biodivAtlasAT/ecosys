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
package at.duk.models.biotop

data class StyleData(val project: ProjectData, val hierarchyList: List<HierarchyData>, val defaultColor: String) {

    val hEADER = "<?xml version=\"1.0\" encoding=\"UTF-8\"?><sld:StyledLayerDescriptor " +
            "xmlns=\"http://www.opengis.net/sld\" xmlns:sld=\"http://www.opengis.net/sld\" " +
            "xmlns:gml=\"http://www.opengis.net/gml\" xmlns:ogc=\"http://www.opengis.net/ogc\" version=\"1.0.0\">\n" +
            "  <sld:NamedLayer>\n" +
            "    <sld:Name>Default Styler</sld:Name>\n" +
            "    <sld:UserStyle>\n" +
            "      <sld:Name>Default Styler</sld:Name>\n" +
            "      <sld:FeatureTypeStyle>\n" +
            "        <sld:Name>name</sld:Name>\n" +
            "        <sld:FeatureTypeName>Feature</sld:FeatureTypeName>"

    val fOOTER = "</sld:FeatureTypeStyle>\n" +
            "    </sld:UserStyle>\n" +
            "  </sld:NamedLayer>\n" +
            "</sld:StyledLayerDescriptor>"

    val rULE = "        <sld:Rule>\n" +
            "          <sld:Title>myTitle</sld:Title>\n" +
            "          <ogc:Filter>\n" +
            "            <ogc:PropertyIsEqualTo>\n" +
            "              <ogc:PropertyName>myPropertyName</ogc:PropertyName>\n" +
            "              <ogc:Literal>myLiteral</ogc:Literal>\n" +
            "            </ogc:PropertyIsEqualTo>\n" +
            "          </ogc:Filter>\n" +
            "          <sld:PolygonSymbolizer>\n" +
            "            <sld:Fill>\n" +
            "              <sld:CssParameter name=\"fill\">myColor</sld:CssParameter>\n" +
            "            </sld:Fill>\n" +
            "            <sld:Stroke/>\n" +
            "          </sld:PolygonSymbolizer>\n" +
            "        </sld:Rule>\n"

    fun generateSLD(): String {
        val sb = StringBuilder(hEADER)

        hierarchyList.filter { it.isLeaf && it.hasData }.forEach {
            val key = it.mappedKeyCode ?: it.keyCode
            val color = it.color ?: defaultColor
            val rule = rULE.replace("myTitle", it.description)
                .replace("myPropertyName", project.colTypesCode!!)
                .replace("myLiteral", key)
                .replace("myColor", color)
            sb.append(rule)
        }

        sb.append(fOOTER)

        return sb.toString()
    }
}
