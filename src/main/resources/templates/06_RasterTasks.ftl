<html lang="de">
<#include "common/header.ftl">
<body>
<#assign naviSel = "6">

<#include "common/headline.ftl">
<div class="row">
    <div class="col-md-2 m-4">
        <#include "common/navigation.ftl">
    </div>
    <div class="col-md-8 m-4">
        <h1 class="text-primary">Raster Tasks</h1>
        <div class="row">
            <div class="md-col-10">
                <table class="table table-striped">
                    <thead>
                    <tr>
                        <th scope="col">PID</th>
                        <th scope="col">Start</th>
                        <th scope="col">Ende</th>
                        <th scope="col">Name</th>
                        <th scope="col">RC</th>
                        <th scope="col">Meldung</th>
                        <th scope="col">Import</th>
                        <th scope="col">Löschen</th>
                    </tr>
                    </thead>
                    <tbody>
                    <#list result as prop>
                        <tr>
                            <th scope="row">${prop.pid}</th>
                            <td>${prop.start}</td>
                            <td>
                                <#if prop.end?has_content>
                                    ${prop.end}
                                <#else>

                                </#if>
                            <td>${prop.name}</td>
                            <td>
                                <#if prop.rc?has_content>${prop.rc}
                                <#else>

                                </#if>
                            </td>
                            <td>${prop.message}</td>
                            <td>
                                <#if prop.rc?has_content>
                                    <#if prop.imported>
                                        IMPORTIERT
                                    <#else>
                                        <#if prop.rc == 0>
                                            <Button class="btn btn-sm btn-outline-primary" name="bt_${prop.id}" title="${prop.id}" type="submit" onclick="submit06(${prop.id}, 0)">Import</Button>
                                        </#if>
                                    </#if>
                                </#if>
                            </td>
                            <td>
                                <#if prop.imported>

                                <#else>
                                    <#if prop.rc?has_content>
                                        <Button class="btn btn-sm btn-outline-danger" onclick='rasterTaskDelete("${prop.id}")'>Löschen</Button>
                                    </#if>
                                </#if>

                            </td>
                        </tr>
                    </#list>
                    </tbody>
                </table>
            </div>
        </div>
    </div>

</div>

    <form name="form06submit" id="form06submit" action="./tasksAction">
        <input type="hidden" name="rasterTasksId" id="rasterTasksId" value="">
        <input type="hidden" name="mode" id="mode" value="0">
    <form>

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
                    <button type="button" class="btn btn-primary" onclick="document.getElementById('form06submit').submit();return true;">Löschen</button>
                </div>
            </div>
        </div>
    </div>



</body>
</html>