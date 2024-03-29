<html lang="de">
<#include "common/header.ftl">
<body>
<#assign naviSel = "8">
<#assign package_id_new = (package_id)!"-1">
<#assign service_id_new = (service_id)!"-1">

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
                <input type="text" size="40" disabled value="${filename}">
            </div>
        </div>
            <div class="row">
                <div class="col-md-2 m-2">
                    Koordinatensystem (berechnet!):
                </div>
                <div class="col-md-6 m-2">
                    <input type="text" size="10" disabled value="<#if srid?has_content>${srid}</#if>">
                </div>
            </div>
        <div class="row">
            <div class="col-md-2 m-2">
                Package:
            </div>
            <div class="col-md-6 m-2">
                <select name="packageId" id="packageId" required>
                    <#if "${package_id_new}" == "-1">
                        <option value="-1">------------------</option>
                    <#else></#if>
                    <#list packageList as package>
                        <option value="${package.id}" <#if "${package.id}" == "${package_id_new}">selected<#else></#if>>${package.name}</option>
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
                    <#if "${service_id_new}" == "-1">
                        <option value="-1">------------------</option>
                    <#else></#if>
                    <#list serviceList as service>
                        <option value="${service.id}" <#if "${service.id}" == "${service_id_new}">selected<#else></#if>>${service.name}</option>
                    </#list>
                </select>
            </div>
        </div>
        <div class="row">
            <div class="col-md-2 m-2">
                Name:
            </div>
            <div class="col-md-6 m-2">
                <input type="text" size="40" maxlength="128" name="name_" value="${name}" required>
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
                Geoserver Layer:
            </div>
            <div class="col-md-6 m-2">
                <input type="text" size="40" maxlength="128" name="geoserverLayerName" value="<#if geoserver_layer_name?has_content>${geoserver_layer_name}<#else></#if>">
            </div>
        </div>
        <div class="row">
            <div class="col-md-6 m-2">
                Obergrenzen für Kategorien (z.B. Quintile):
            </div>
        </div>
        <div class="row">
            <div class="col-md-2 m-2">
                &nbsp;&nbsp;Kategorie 1:
            </div>
            <div class="col-md-6 m-2">
                &lt;= <input type="text" size="5" maxlength="8" name="q1" value="<#if q1?has_content>${q1}<#else></#if>">
            </div>
        </div>
        <div class="row">
            <div class="col-md-2 m-2">
                &nbsp;&nbsp;Kategorie 2:
            </div>
            <div class="col-md-6 m-2">
                &lt;= <input type="text" size="5" maxlength="8" name="q2" value="<#if q2?has_content>${q2}<#else></#if>">
            </div>
        </div>
        <div class="row">
            <div class="col-md-2 m-2">
                &nbsp;&nbsp;Kategorie 3:
            </div>
            <div class="col-md-6 m-2">
                &lt;= <input type="text" size="5" maxlength="8" name="q3" value="<#if q3?has_content>${q3}<#else></#if>">
            </div>
        </div>
        <div class="row">
            <div class="col-md-2 m-2">
                &nbsp;&nbsp;Kategorie 4:
            </div>
            <div class="col-md-6 m-2">
                &lt;= <input type="text" size="5" maxlength="8" name="q4" value="<#if q4?has_content>${q4}<#else></#if>"> &gt; Kategorie 5
            </div>
        </div>
        <div class="row">
            <div class="col-md-2 m-2">
                <input type="submit" class="btn btn-sm btn-outline-primary" value="Speichern" onclick="return submit08check('${combinations}');">
            </div>
        </div>
    </div>
    </form>
</div>

<div class="modal fade" id="MessageModal" tabindex="-1" aria-labelledby="MessageModalLabel" aria-hidden="true">
    <div class="modal-dialog">
        <div class="modal-content">
            <div class="modal-header">
                <h5 class="modal-title" id="exampleModalLabel">Hinweis</h5>
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

<div class="modal fade" id="MessageCombiModal" tabindex="-1" aria-labelledby="MessageCombiModal" aria-hidden="true">
    <div class="modal-dialog">
        <div class="modal-content">
            <div class="modal-header">
                <h5 class="modal-title" id="exampleModalLabel">Rückfrage</h5>
                <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
            </div>
            <div class="modal-body">
                Diese Package / Leistung - Kombination existiert bereits!
            </div>
            <div class="modal-footer">
                <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Schlie&szlig;en</button>
            </div>
        </div>
    </div>
</div>



</body>
</html>