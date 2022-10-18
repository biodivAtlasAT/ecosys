<html lang="de">
<#include "common/header.ftl">
<body>
<#assign naviSel = "8">

<#include "common/headline.ftl">
<div class="row">
    <div class="col-md-2 m-4">
        <#include "common/navigation.ftl">
    </div>
    <div class="col-md-8 m-4">
        <form action="./dataAction">
            <input type="hidden" name="id" value="${id}">
        <h1 class="text-primary">Raster Daten</h1>
        <div class="row">
            <div class="col-md-2 m-2">
                ID:
            </div>
            <div class="col-md-6 m-2">
                <input type="text" size="5" disabled value="${id}">
            </div>
        </div>
        <div class="row">
            <div class="col-md-2 m-2">
                Dateiname:
            </div>
            <div class="col-md-6 m-2">
                <input type="text" size="40" disabled value="${fileName}">
            </div>
        </div>
        <div class="row">
            <div class="col-md-2 m-2">
                Package:
            </div>
            <div class="col-md-6 m-2">
                <select name="packageId" id="packageId" required>
                    <#if "${packageId}" == "-1">
                        <option value="-1">------------------</option>
                    <#else></#if>
                    <#list packageList as package>
                        <option value="${package.id}" <#if "${package.id}" == "${packageId}">selected<#else></#if>>${package.name}</option>
                    </#list>
                </select>
            </div>
        </div>
        <div class="row">
            <div class="col-md-2 m-2">
                Öko-Leistungen:
            </div>
            <div class="col-md-6 m-2">
                <select name="serviceId" id="serviceId" required>
                    <#if "${serviceId}" == "-1">
                        <option value="-1">------------------</option>
                    <#else></#if>
                    <#list serviceList as service>
                        <option value="${service.id}" <#if "${service.id}" == "${serviceId}">selected<#else></#if>>${service.name}</option>
                    </#list>
                </select>
            </div>
        </div>
        <div class="row">
            <div class="col-md-2 m-2">
                Name:
            </div>
            <div class="col-md-6 m-2">
                <input type="text" size="40" maxlength="128" name="name_" value="${name_}" required>
            </div>
        </div>
        <div class="row">
            <div class="col-md-2 m-2">
                Dimension:
            </div>
            <div class="col-md-6 m-2">
                <input type="text" size="40" maxlength="128" name="dimension" value="<#if dimension?has_content>${dimension}<#else></#if>">
            </div>
        </div>
        <div class="row">
            <div class="col-md-2 m-2">
                <input type="submit" class="btn btn-sm btn-outline-primary" value="Speichern" onclick="return submit08check();">
            </div>
        </div>
    </div>
    </form>
</div>

<div class="modal fade" id="MessageModal" tabindex="-1" aria-labelledby="MessageModalLabel" aria-hidden="true">
    <div class="modal-dialog">
        <div class="modal-content">
            <div class="modal-header">
                <h5 class="modal-title" id="exampleModalLabel">Rückfrage</h5>
                <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
            </div>
            <div class="modal-body">
                Sowohl das Package als auch die Leistung muss zugeordnet werden!
            </div>
            <div class="modal-footer">
                <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Schlie&szlig;en</button>
            </div>
        </div>
    </div>
</div>


</body>
</html>