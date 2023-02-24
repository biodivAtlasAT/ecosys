package at.duk.models.biotop

import java.awt.event.HierarchyListener

data class StyleData(val project: ProjectData, val hierarchyList: List<HierarchyData>) {

    val HEADER = "<?xml version=\"1.0\" encoding=\"UTF-8\"?><sld:StyledLayerDescriptor xmlns=\"http://www.opengis.net/sld\" xmlns:sld=\"http://www.opengis.net/sld\" xmlns:gml=\"http://www.opengis.net/gml\" xmlns:ogc=\"http://www.opengis.net/ogc\" version=\"1.0.0\">\n" +
            "  <sld:NamedLayer>\n" +
            "    <sld:Name>Default Styler</sld:Name>\n" +
            "    <sld:UserStyle>\n" +
            "      <sld:Name>Default Styler</sld:Name>\n" +
            "      <sld:FeatureTypeStyle>\n" +
            "        <sld:Name>name</sld:Name>\n" +
            "        <sld:FeatureTypeName>Feature</sld:FeatureTypeName>"

    val FOOTER = "</sld:FeatureTypeStyle>\n" +
            "    </sld:UserStyle>\n" +
            "  </sld:NamedLayer>\n" +
            "</sld:StyledLayerDescriptor>"

    val RULE = "        <sld:Rule>\n" +
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
        val sb = StringBuilder(HEADER)

        hierarchyList.filter { it.isLeaf }.forEach {
            val rule = RULE.replace("myTitle",it.description)
                .replace("myPropertyName", project.colTypesCode!!)
                .replace("myLiteral", it.mappedKeyCode!!)
                .replace("myColor", it.color!!)
            sb.append(rule)
        }

        sb.append(FOOTER)

        return sb.toString()
    }


}