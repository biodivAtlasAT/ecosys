<html lang="de">
<#include "common/header.ftl">
<body>
<#assign naviSel = "3">
<#assign wordSave = "Speichern">
<#assign wordDelete = "Löschen">
<#assign wordEdit = "Bearbeiten">

<#include "common/headline.ftl">
<div class="row">
    <div class="col-md-2 m-4">
        <#include "common/navigation.ftl">
    </div>
    <div class="col-md-8 m-4">
        <h1 class="text-primary">Services</h1>
        <div class="row">
            <div class="md-col-10">
                <table class="table table-striped" id="serviceTable">
                    <thead>
                    <tr>
                        <th scope="col">ID</th>
                        <th scope="col">Name</th>
                        <th scope="col">Kategorie</th>
                        <th scope="col">&nbsp;</th>
                        <th scope="col">&nbsp;</th>
                        <th scope="col" colspan="3" style="text-align:center;border-left:2px solid blue;">Symbol(SVG)</th>

                    </tr>
                    </thead>
                    <tbody>
                    <#list result as prop>
                        <tr>
                            <td style="text-align:right">
                                <span id="id_${prop.id}">${prop.id}</span>
                            </td>
                            <td>
                                <input type="text" class="noClass" name="name_${prop.id}" id="name_${prop.id}" value="${prop.name}" disabled size="30" maxlength="128">
                            </td>
                            <td>
                                <select name="categoryId" id="categoryId_${prop.id}" disabled style="max-width:200px">
                                    <#list categoriesList as category>
                                        <option value="${category.id}" <#if "${category.id}" == "${prop.categoryId}">selected<#else></#if>>${category.name}</option>
                                    </#list>
                                </select>

                            </td>
                            <td>
                                <button id="bt_${prop.id}" class="btn btn-sm btn-outline-primary" style="margin-top:-4px" role="button" onclick='serviceEdit("${prop.id}", ${maxCount}, "${wordSave}", "${wordEdit}");'>${wordEdit}</button>
                            </td>
                            <td>
                                <button id= "btDel_${prop.id}" class="btn btn-sm btn-outline-danger" style="margin-top:-4px" role="button" onclick='serviceDelete("${prop.id}", <#if idsInUse?seq_contains(prop.id)>true<#else>false</#if>);'>${wordDelete}</button>
                            </td>
                            <td style="border-left:2px solid blue;">
                                <img src="/${prop.svgPath}" style="width: 40px" alt="${prop.originalSvgName}" title="${prop.originalSvgName}">
                            </td>
                            <td>
                                <button class="btn btn-sm btn-outline-primary" onclick="serviceSVGUpload(${prop.id});">Upload</button>
                            </td>
                            <td>
                                <button class="btn btn-sm btn-outline-danger" onclick="serviceSVGDelete(${prop.id});">Delete</button>
                            </td>
                        </tr>
                    </#list>
                    <tr>
                        <td><span id="id_-1" style="visibility:hidden;">-1</span></td>
                        <td>
                            <input type="text" class="noClass" name="name_-1" id="name_-1" value="" size="30" maxlength="128" style="background-color: #CEE3F6">
                        </td>
                        <td>
                            <select name="categoryId_-1" id="categoryId_-1" style="background-color:#CEE3F6; max-width:200px">
                                <option value="-1">------------------</option>
                                <#list categoriesList as category>
                                    <option value="${category.id}" <#if "${category.id}" == "-1">selected<#else></#if>>${category.name}</option>
                                </#list>
                            </select>

                        </td>
                        <td>
                            <button id="bt_-1" style="margin-top:-4px" class="btn btn-sm btn-primary funcSave" role="button" onclick='serviceEdit("-1", ${maxCount}, "${wordSave}", "${wordEdit}");'>${wordSave}</button>
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
<form id="serviceSave" onclick="serviceSave()" action="./serviceUpdate" method="post">
    <input type="hidden" id="saveFormName" name="name">
    <input type="hidden" id="saveFormId" name="id" value="-1">
    <input type="hidden" id="saveFormCategoryId" name="categoryId" value="-1">
    <input type="hidden" id="saveFormMode" name="mode" value="0">
</form>

<form id="serviceSVGDelete" onclick="serviceSVGDelete()" action="./serviceSVGDelete" method="post">
    <input type="hidden" id="serviceSVGDeleteFormId" name="id" value="-1">
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
                <button type="button" class="btn btn-primary" onclick="document.getElementById('serviceSave').submit();return true;">Löschen</button>
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
                Der Eintrag darf nicht gelöscht werden, weil er noch einem Rasterdatensatz zugeordnet ist!<br>
            </div>
            <div class="modal-footer">
                <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Schlie&szlig;en</button>
            </div>
        </div>
    </div>
</div>

<div class="modal fade" id="MessageModalNoId" tabindex="-1" aria-labelledby="MessageModalNoId" aria-hidden="true">
    <div class="modal-dialog">
        <div class="modal-content">
            <div class="modal-header">
                <h5 class="modal-title" id="exampleModalLabel">Information</h5>
                <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
            </div>
            <div class="modal-body">
                Kategorie wurde nicht ausgewählt!
            </div>
            <div class="modal-footer">
                <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Schlie&szlig;en</button>
            </div>
        </div>
    </div>
</div>

<div class="modal fade" id="UploadModal" tabindex="-1" aria-labelledby="UploadModalLabel" aria-hidden="true">
    <div class="modal-dialog">
        <div class="modal-content">
            <div class="modal-header">
                <h5 class="modal-title" id="exampleModalLabel">Upload eines Symbolbildes im SVG Format</h5>
                <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
            </div>
            <div class="modal-body">
                <form method="post" id="uploadSVG" enctype="multipart/form-data" action="./serviceSVGUpdate">
                    <div class="row">
                        <div class="col-md-2 m-2">Datei (*.svg):</div>
                        <div class="col-md-7 m-2">
                            <input type="file" size="32" maxlength="512" name="filename" accept=".svg">
                            <input type="hidden" name="uploadId" id="uploadId" value="-1">
                        </div>
                    </div>
                </form>
            </div>
            <div class="modal-footer">
                <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Schlie&szlig;en</button>
                <button type="button" class="btn btn-primary" onclick="document.getElementById('uploadSVG').submit();return true;">Upload</button>
            </div>
        </div>
    </div>
</div>

<div class="modal fade" id="svgModalDelete" tabindex="-1" aria-labelledby="svgModalDelete" aria-hidden="true">
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
                <button type="button" class="btn btn-primary" onclick="document.getElementById('serviceSVGDelete').submit();return true;">Löschen</button>
            </div>
        </div>
    </div>
</div>

</body>
</html>