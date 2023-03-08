<html lang="de">
<#include "common/header.ftl">
<body>
<#assign naviSel = "21">

<#include "common/headline.ftl">
<div class="row">
    <div class="col-md-2 m-4">
        <#include "common/navigation.ftl">
    </div>
    <div class="col-md-8 m-4">
        <h1 class="text-primary">Biotoptypen - Projekt-Filter</h1>
        <h4>Klasse: ${project.name}</h4>
        <#list typeList as prop>
            <div class="row">
                <div class="col-md-2">
                    ${indentList[prop.levelNumber]}${prop.keyCode}
                    <#if prop.hasData>
                        <#if prop.cqlQuery?has_content>
                            <a href="${checkUrl?replace("my_cql_filter", "CQL_FILTER=${prop.cqlQuery}")}" target="_geoserver" title="Link to Geoserver" style="text-decoration:none"><img src="/static/admin/img/geoserver_icon.png" title="Link to GeoServer"></a>

                        <#else>
                            <a href="${checkUrl?replace("my_cql_filter", "")}" target="_geoserver" title="Link to Geoserver" style="text-decoration:none"><img src="/static/admin/img/geoserver_icon.png" title="Link to GeoServer"></a>
                        </#if>
                    </#if>
                </div>
                <div class="col-md-2">
                    <#if prop.color?has_content && prop.checkLeaf>
                        <input type="text" disabled size="4" style="background-color: ${prop.color};" id="color_${prop.keyCode}" name="color_${prop.keyCode}">
                    </#if>
                </div>
                <div class="col-md-7">${indentList[prop.levelNumber]}${prop.description}</div>
            </div>
        </#list>

    </div>

</div>
</body>
</html>