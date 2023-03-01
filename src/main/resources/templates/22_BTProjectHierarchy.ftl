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
                <div class="col-md-2">${indentList[prop.levelNumber]}${prop.keyCode}</div>
                <div class="col-md-3">
                    <#if prop.color?has_content && prop.checkLeaf>
                        <input type="text" disabled maxlength="6" size="6" style="background-color: ${prop.color};" id="color_${prop.keyCode}" name="color_${prop.keyCode}">
                    </#if>
                </div>
                <div class="col-md-7">${prop.description}</div>
            </div>
        </#list>

    </div>

</div>
</body>
</html>