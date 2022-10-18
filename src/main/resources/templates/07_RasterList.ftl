<html lang="de">
<#include "common/header.ftl">
<body>
<#assign naviSel = "7">

<#include "common/headline.ftl">
<div class="row">
    <div class="col-md-2 m-4">
        <#include "common/navigation.ftl">
    </div>
    <div class="col-md-8 m-4">
        <h1 class="text-primary">Raster Liste</h1>
        <div class="row">
            <div class="md-col-10">
                <table class="table table-striped">
                    <thead>
                    <tr>
                        <th scope="col">ID</th>
                        <th scope="col">Package</th>
                        <th scope="col">Leistung</th>
                        <th scope="col">Name</th>
                        <th scope="col">Dimension</th>
                        <th scope="col" colspan="2">Bearbeiten</th>
                    </tr>
                    </thead>
                    <tbody>
                    <#list result as prop>
                        <tr>
                            <th scope="row">${prop.id}</th>
                            <td>
                                <#if prop.packageName?has_content>
                                    ${prop.packageName}
                                <#else>
                                </#if>
                            </td>
                            <td>
                                <#if prop.serviceName?has_content>
                                    ${prop.serviceName}
                                <#else>
                                </#if>
                            </td>
                            <td><b>${prop.name}</b></td>
                            <td>
                                <#if prop.dimension?has_content>
                                    ${prop.dimension}
                                <#else>
                                </#if>
                            <td>
                                <a href="./${prop.id}" class="btn btn-sm btn-outline-primary" role="button">&nbsp;&nbsp;Edit&nbsp;&nbsp;</a>
                            </td>
                            <td>
                                <button class="btn btn-sm btn-outline-danger" role="button" onclick="rasterDelete('${prop.id}')">Löschen</button></td>
                            </td>
                        </tr>
                    </#list>
                    </tbody>
                </table>
            </div>
        </div>

    </div>
</div>

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
                <button type="button" class="btn btn-primary" onclick="document.getElementById('form07submit').submit();return true;">Löschen</button>
            </div>
        </div>
    </div>
</div>
<form name="form07submit" id="form07submit" action="./rasterListAction">
    <input type="hidden" name="rasterId" id="rasterId" value="">
<form>

</body>
</html>