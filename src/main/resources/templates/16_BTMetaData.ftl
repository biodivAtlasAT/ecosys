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
        <form name="metadataSave" method="POST" action="./saveMetaData" enctype="multipart/form-data">
        <input type="hidden" name="deleteMap" id="deleteMap" value="false">
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
                    Klassifizierung:
                </div>
                <div class="col-md-8 m-2">
                    <select name="classId" id="classId" required>
                        <option value="-1">------------------</option>
                        <#list classesList as class>
                            <option value="${class.id}" <#if "${class.id}" == "${project.classId}">selected<#else></#if>>${class.description}</option>
                        </#list>
                    </select>
                </div>
            </div>
            <div class="row">
                <div class="col-md-3 m-2">&nbsp;</div>
                <div class="col-md-1 m-2">
                    Info:
                </div>
                <div class="col-md-6 m-2">
                    <input type="text" name="classInfo" maxlength="128" size="32"  value="<#if project.classInfo?has_content>${project.classInfo}</#if>">
                </div>
            </div>
            <div class="row">
                <div class="col-md-3 m-2">&nbsp;</div>
                <div class="col-md-1 m-2">
                    Map:
                </div>
                <div class="col-md-6 m-2">
                    <div class="col-md-6 m-2">
                        <#if project.classMap?has_content>
                             <span id="classMapSpan">${project.classMap}</span>
                            <button class="btn btn-sm btn-outline-danger" onclick="deleteBTMap(); return false;">Löschen</button>
                        <#else>
                            <input type="file" size="32" maxlength="512" name="filename" accept=".csv">
                        </#if>
                    </div>
                </div>
            </div>

            <div class="row">
                <div class="col-md-3 m-2">
                    <button type="submit" class="btn btn-sm btn-outline-secondary">Speichern</button>
                </div>
            </div>
            </form>

        </div>

    </div>
</div>

</body>
</html>