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
        <form id="hierarchyColors" method="post" action="./typesUpdate">
        <h1 class="text-primary">Biotoptypen - Klassen-Hierarchie</h1>
        <h4>Klasse: ${classData.description}</h4>

        <#if !(projectsList?size = 0) >
            <div class="alert alert-danger" role="alert">
                Achtung: diese Klasse ist bereits den folgenden Projekten zugeordnet:<br>
                <ul>
                <#list projectsList as project>
                    <li>${project.name}</li>
                </#list>
                </ul>
                Bei Änderungen müssen die Projekte neu abgeglichen werden!
            </div>
        </#if>
        <#list typeList as prop>
            <#if prop.levelNumber == 0>
                <div class="row mt-3">
            <#else>
                <div class="row">
            </#if>
                <div class="col-md-2">${indentList[prop.levelNumber]}${prop.keyCode}</div>
                <div class="col-md-4">
                    <#if prop.levelNumber == 0 || prop.checkLeaf>
                        <#if prop.color?has_content>
                            <input type="text" class="class_${prop.keyCode?keep_before(".")}" maxlength="7" size="7" id="colCode_${prop.keyCode}" name="colCode_${prop.keyCode}" value="${prop.color}" onfocusout="colorMe(this, '${prop.keyCode}')">
                            <input type="text" disabled size="4" style="background-color: ${prop.color};" id="color_${prop.keyCode}" name="color_${prop.keyCode}">
                            <#if prop.levelNumber == 0>
                                <button onclick="delegateToChildren('${prop.keyCode}'); return false;">&darr;</button>
                            </#if>
                        <#else>
                            <input type="text" class="class_${prop.keyCode?keep_before(".")}" maxlength="7" size="7" id="colCode_${prop.keyCode}" name="colCode_${prop.keyCode}" value="" onfocusout="colorMe(this, '${prop.keyCode}')">
                            <input type="text" disabled size="4" name="color_${prop.keyCode}" id="color_${prop.keyCode}">
                            <#if prop.levelNumber == 0>
                                <button onclick="delegateToChildren('${prop.keyCode}'); return false;">&darr;</button>
                            </#if>
                        </#if>
                    </#if>
                </div>
                <div class="col-md-6">${prop.description}</div>
            </div>
        </#list>
            <div class="row m-5 col-md-2">
                <button type="submit" class="btn btn-sm btn-outline-secondary">Speichern</button>
            </div>
        </form>

    </div>

</div>
</body>
</html>