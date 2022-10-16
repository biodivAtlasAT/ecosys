<html lang="de">
<#include "common/header.ftl">
<body>
<#assign naviSel = "2">
<#assign wordSave = "Save">
<#assign wordDelete = "Delete">
<#assign wordEdit = "Edit">

<#include "common/headline.ftl">
<div class="row">
    <div class="col-md-2 m-4">
        <#include "common/navigation.ftl">
    </div>
    <div class="col-md-8 m-4">
        <h1 class="text-primary">Kategorien</h1>
        <div class="row">
            <div class="md-col-10">
                <table class="table table-striped" id="categoryTable">
                    <thead>
                    <tr>
                        <th scope="col">ID</th>
                        <th scope="col">Name</th>
                        <th scope="col">&nbsp;</th>
                    </tr>
                    </thead>
                    <tbody>
                    <#list result as prop>
                        <tr>
                            <td style="text-align:right">
                                <span id="id_${prop.id}">${prop.id}</span>
                            </td>
                            <td>
                                <input type="text" class="noClass" name="name_${prop.id}" id="name_${prop.id}" value="${prop.name}" disabled size="50" maxlength="128">
                                <button id="bt_${prop.id}" class="btn btn-sm btn-outline-primary" style="margin-top:-4px" role="button" onclick='categoryEdit("${prop.id}", ${maxCount}, "${wordSave}", "${wordEdit}");'>${wordEdit}</button>
                            </td>
                            <td>
                                <button id= "btDel_${prop.id}" class="btn btn-sm btn-outline-danger" role="button" onclick='categoryDelete("${prop.id}", <#if idsInUse?seq_contains(prop.id)>true<#else>false</#if>);'>${wordDelete}</button>
                            </td>
                        </tr>
                    </#list>
                    <tr>
                        <td><span id="id_-1" style="visibility:hidden;">-1</span></td>
                        <td>
                            <input type="text" class="noClass" name="name_-1" id="name_-1" value="" size="50" maxlength="128">
                            <button id="bt_-1" style="margin-top:-4px" class="btn btn-sm btn-primary funcSave" role="button" onclick='categoryEdit("-1", ${maxCount}, "${wordSave}", "${wordEdit}");'>${wordSave}</button>
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

<form id="categorySave" onclick="categorySave()" action="./categoryUpdate" method="post">
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
                    <button type="button" class="btn btn-primary" onclick="document.getElementById('categorySave').submit();return true;">Löschen</button>
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
                Der Eintrag darf nicht gelöscht werden, da er noch einer (Ökosystem-)Leistung zugeordnet ist!
            </div>
            <div class="modal-footer">
                <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Schlie&szlig;en</button>
            </div>
        </div>
    </div>
</div>


</body>
</html>