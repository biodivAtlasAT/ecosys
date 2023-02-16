<html lang="de">
<#include "common/header.ftl">
<body>
<#assign naviSel = "15">

<#include "common/headline.ftl">
<div class="row">
    <div class="col-md-2 m-4">
        <#include "common/navigation.ftl">
    </div>
    <div class="col-md-8 m-4">
        <h1 class="text-primary">Biotoptypen - MetaData - Preview</h1>
        <h4>Projekt: ${project.name}</h4>

        <#if !dataResourceExists>
            <div class="alert alert-danger" role="alert">
                Die zugeordnete "Data Resource" aus dem Collectory existiert nicht oder der Zugriff ist derzeit nicht möglich!
            </div>
        </#if>

        <div class="alert alert-dark" role="alert">
            ${json}
        </div>

    </div>
</div>

</body>
</html>