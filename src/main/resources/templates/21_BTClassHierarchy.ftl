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
        <h1 class="text-primary">Biotoptypen - Klassen-Hierarchie</h1>
        <h4>Klasse: ${classData.description}</h4>
        <#list typeList as prop>
            <div class="row">
                <div class="col-md-2">${indentList[prop.levelNumber]}${prop.keyCode}</div>
                <div class="col-md-8">${prop.description}</div>
            </div>
        </#list>

    </div>

</div>
</body>
</html>