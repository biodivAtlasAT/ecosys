<html lang="de">
<#include "common/header.ftl">
<body>
<#assign naviSel = "11">

<#include "common/headline.ftl">
<div class="row">
    <div class="col-md-2 m-4">
        <#include "common/navigation.ftl">
    </div>
    <div class="col-md-8 m-4">
        <h1 class="text-primary">Layer List</h1>
        <div class="row">
            <div class="md-col-10">
                <table class="table table-striped">
                    <thead>
                    <tr>
                        <th scope="col">ID</th>
                        <th scope="col">Name</th>
                        <th scope="col">Spatial-Layer</th>
                        <th scope="col">Key</th>
                        <th scope="col">aktiv</th>
                    </tr>
                    </thead>
                    <tbody>
                    <#list result as prop>
                        <tr>
                            <th scope="row">${prop.id}</th>
                            <td>${prop.name}</td>
                            <td>${prop.spatialLayerId}</td>
                            <td>${prop.key}</td>
                            <td><input id="chk_${prop.id}" onclick="submit11(${prop.id})" type="checkbox" <#if prop.enabled>checked</#if>><td>
                        </tr>
                    </#list>
                    </tbody>
                </table>
            </div>
        </div>


    </div>
</div>
<form id="form11" name="form11" action="./listUpdate">
    <input type="hidden" id="chkId" name="chkId" value ="-1">
</form>

</body>
</html>