<html lang="de">
<#include "common/header.ftl">
<body>
<#assign naviSel = "15">
<#assign wordSave = "Save">
<#assign wordDelete = "Delete">
<#assign wordEdit = "Edit">

<#include "common/headline.ftl">
<div class="row">
    <div class="col-md-2 m-4">
        <#include "common/navigation.ftl">
    </div>
    <div class="col-md-8 m-4">
        <h1 class="text-primary">Projekte</h1>
        <#if errorList?size != 0>
            <div class="alert alert-danger" role="alert">
                <ul>
                <#list errorList as msg>
                    <li>${msg}</li>
                </#list>
                </ul>
            </div>
        </#if>
        <div class="row">
            <div class="md-col-10">
                <table class="table table-striped" id="projectTable">
                    <thead>
                    <tr>
                        <th scope="col">ID</th>
                        <th scope="col">Projet</th>
                        <th scope="col" class="text-center">Metadaten</th>
                        <th scope="col" class="text-center">GeoServer</th>
                        <th scope="col">Arten</th>
                        <th scope="col">&nbsp;</th>
                    </tr>
                    </thead>
                    <tbody>
                    <#list result as prop>
                        <tr>
                            <td style="text-align:right; border-right-width: 3px; border-right-style: solid; border-right-color: <#if prop.enabled>green<#else>red</#if>">
                                <span id="id_${prop.id}">${prop.id}</span>
                            </td>
                            <td>
                                <input type="text" class="noClass" name="name_${prop.id}" id="name_${prop.id}" value="${prop.name}" disabled size="30" maxlength="128">
                                <button id="bt_${prop.id}" class="btn btn-sm btn-outline-primary" style="margin-top:-4px" role="button" onclick='projectEdit("${prop.id}", ${maxCount}, "${wordSave}", "${wordEdit}");'>${wordEdit}</button>
                            </td>
                            <td class="text-center">
                                <a href="./${prop.id}/metadata" class="btn btn-sm btn-outline-secondary">Edit</a>
                                <a href="./${prop.id}/metadataJson" title="Metadaten anzeigen" class="btn btn-sm btn-outline-secondary" onclick='showMetaData("${prop.id}");'>&#x29DD;</a>
                            </td>
                            <td class="text-center">
                                <a href="./${prop.id}/server" title="Geo Server zuordnen" class="btn btn-sm btn-outline-secondary">&#x21C4;</a>
                                <a href="./${prop.id}/matching" title="Daten mit Geo Server abgleichen" class="btn btn-sm btn-outline-secondary <#if !prop.syncEnabled> disabled</#if>">&#x21BB;</a>
                                <a href="./${prop.id}/types" title="Filter anzeigen" class="btn btn-sm btn-outline-secondary <#if !prop.hasSyncWithClassification>disabled</#if>">&#9782;</a>
                            </td>
                            <td>
                                <a href="./${prop.id}/species" class="btn btn-sm btn-outline-secondary">Arten</a>
                            </td>
                            <td>
                                <button id= "btDel_${prop.id}" title="${wordDelete}" class="btn btn-sm btn-outline-danger" role="button" onclick='projectDelete("${prop.id}");'>&#x2717;</button>
                            </td>
                        </tr>
                    </#list>
                    <tr>
                        <td><span id="id_-1" style="visibility:hidden;">-1</span></td>
                        <td>
                            <input type="text" class="noClass" name="name_-1" id="name_-1" value="" size="30" maxlength="128"  style="background-color: #CEE3F6">
                            <button id="bt_-1" style="margin-top:-4px" class="btn btn-sm btn-primary funcSave" role="button" onclick='projectEdit("-1", ${maxCount}, "${wordSave}", "${wordEdit}");'>${wordSave}</button>
                        </td>
                        <td>&nbsp;
                        </td>
                    </tr>
                    </tbody>
                </table>
            </div>
        </div>
    </div>

</div>
<form id="projectSave" onclick="projectSave()" action="./projectUpdate" method="post">
    <input type="hidden" id="saveFormName" name="name">
    <input type="hidden" id="saveFormId" name="id" value="-1">
    <input type="hidden" id="saveFormMode" name="mode" value="0">
</form>


<div class="modal fade" id="MessageModal" tabindex="-1" aria-labelledby="MessageModalLabel" aria-hidden="true">
    <div class="modal-dialog">
        <div class="modal-content">
            <div class="modal-header">
                <h5 class="modal-title" id="exampleModalLabel">Rückfrage</h5>
                <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
            </div>
            <div class="modal-body">
                Soll der Eintrag wirklich gelöscht werden?
            </div>
            <div class="modal-footer">
                <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Schlie&szlig;en</button>
                <button type="button" class="btn btn-primary" onclick="document.getElementById('projectSave').submit();return true;">Löschen</button>
            </div>
        </div>
    </div>
</div>


<div class="modal fade" id="MessageModalNotAllowed" tabindex="-1" aria-labelledby="MessageModalNotAllowedLabel" aria-hidden="true">
    <div class="modal-dialog">
        <div class="modal-content">
            <div class="modal-header">
                <h5 class="modal-title" id="exampleModalLabel">Information</h5>
                <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
            </div>
            <div class="modal-body">
                Der Eintrag darf nicht gelöscht werden, weil:<br><br>- er noch einem Rasterdatensatz zugeordnet ist!<br>
                oder<br>
                - dieser als Defaultwert gesetzt wurde!
            </div>
            <div class="modal-footer">
                <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Schlie&szlig;en</button>
            </div>
        </div>
    </div>
</div>

</body>
</html>