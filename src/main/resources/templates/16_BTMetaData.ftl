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
        <h1 class="text-primary">Biotoptypen - MetaData</h1>
        <h4>Projekt: ${project.name}</h4>
        <form name="metadataSave" method="GET" action="./saveMetaData">
        <div class="row">
            <div class="row mt-4">
                <div class="col-md-3 m-2">
                    freigeschaltet:
                </div>
                <div class="col-md-3 m-2">
                    <input type="checkbox" name="enabled" <#if project.enabled>checked</#if>>
                </div>
            </div>
            <div class="row">
                <div class="col-md-3 m-2">
                    DataResource:
                </div>
                <div class="col-md-8 m-2">
                    <input type="text" name="resource" maxlength="32" size="8"  value="<#if project.resource?has_content>${project.resource}</#if>">
                    &nbsp;Link zu Atlas
                </div>
            </div>
            <div class="row">
                <div class="col-md-3 m-2">
                    Zeitraum d. Aufnahme:
                </div>
                <div class="col-md-8 m-2">
                    <input type="text" name="epoch" maxlength="128" size="32" value="<#if project.epoch?has_content>${project.epoch}</#if>">
                </div>
            </div>
            <div class="row">
                <div class="col-md-3 m-2">
                    Gebiet:
                </div>
                <div class="col-md-8 m-2">
                    <input type="text" name="area" maxlength="128" size="32"  value="<#if project.area?has_content>${project.area}</#if>">
                </div>
            </div>
            <div class="row">
                <div class="col-md-3 m-2">
                    <button type="submit">Speichern</button>
                </div>
            </div>
            </form>

        </div>

    </div>
</div>

</body>
</html>