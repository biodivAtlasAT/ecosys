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
                            <td>${prop.rc}</td>
                            <td>${prop.message}</td>
                            <td>
                                <#if prop.imported>
                                    IMPORTIERT
                                <#else>
                                    <Button name="bt_${prop.id}" title="${prop.id}" type="submit" onclick="submit06(${prop.id})">Import</Button>
                                </#if>
                            </td>
                            <td>
                                <Button>Löschen</Button>
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
    <form>
</body>
</html>