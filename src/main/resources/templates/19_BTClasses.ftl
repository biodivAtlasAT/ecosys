<html lang="de">
<#include "common/header.ftl">
<body>
<#assign naviSel = "19">
<#assign wordSave = "Save">
<#assign wordDelete = "Delete">
<#assign wordEdit = "Edit">

<#include "common/headline.ftl">
<div class="row">
    <div class="col-md-2 m-4">
        <#include "common/navigation.ftl">
    </div>
    <div class="col-md-8 m-4">
        <h1 class="text-primary">Klassen</h1>
        <div class="row">
            <div class="md-col-10">
                <table class="table table-striped" id="classTypeTable">
                    <thead>
                    <tr>
                        <th scope="col">ID</th>
                        <th scope="col">Name</th>
                        <th scope="col"class="text-center">Bearbeiten</th>
                        <th scope="col"class="text-center">Hierarchie/Farben</th>
                        <th scope="col">&nbsp;</th>
                    </tr>
                    </thead>
                    <tbody>
                    <#list result as prop>
                        <tr>
                            <td>
                                <span id="id_${prop.id}">${prop.id}</span>
                            </td>
                            <td>
                                <input type="text" class="noClass" name="name_${prop.id}" id="name_${prop.id}" value="${prop.description}" disabled size="30" maxlength="128">
                                <button id="bt_${prop.id}" class="btn btn-sm btn-outline-primary" style="margin-top:-4px" role="button" onclick='classTypeEdit("${prop.id}", ${maxCount}, "${wordSave}", "${wordEdit}");'>${wordEdit}</button>
                            </td>
                            <td class="text-center">
                                <a href="./classes/${prop.id}" class="btn btn-sm btn-outline-secondary">Daten</a>
                            </td>
                            <td class="text-center">
                                <a href="./classes/${prop.id}/types" class="btn btn-sm btn-outline-secondary" <#if !prop.filename?hasContent>disabled</#if>>Zuordnen</a>
                            </td>
                            <td>
                                <#if !used_class_ids?seqContains(prop.id)>
                                    <button id= "btDel_${prop.id}" class="btn btn-sm btn-outline-danger" role="button" onclick='classDelete("${prop.id}");'>${wordDelete}</button>
                                </#if>
                            </td>
                        </tr>
                    </#list>
                    <tr>
                        <td><span id="id_-1" style="visibility:hidden;">-1</span></td>
                        <td>
                            <input type="text" class="noClass" name="name_-1" id="name_-1" value="" size="30" maxlength="128"  style="background-color: #CEE3F6">
                            <button id="bt_-1" style="margin-top:-4px" class="btn btn-sm btn-primary funcSave" role="button" onclick='classTypeEdit("-1", ${maxCount}, "${wordSave}", "${wordEdit}");'>${wordSave}</button>
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
<form id="classSave" onclick="classSave()" action="./classes/classUpdate" method="post">
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
                <button type="button" class="btn btn-primary" onclick="document.getElementById('classSave').submit();return true;">Löschen</button>
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