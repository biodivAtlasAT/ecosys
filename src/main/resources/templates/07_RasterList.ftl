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
                        <th scope="col">Bearbeiten</th>
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
                            <td>${prop.name}</td>
                            <td>
                                <#if prop.dimension?has_content>
                                    ${prop.dimension}
                                <#else>
                                </#if>
                            <td><a href="./${prop.id}" class="btn btn-sm btn-outline-primary" role="button">&nbsp;&nbsp;Edit&nbsp;&nbsp;</a>
                                <a href="./${prop.id}" class="btn btn-sm btn-outline-danger" role="button">Löschen</a></td>
                        </tr>
                    </#list>
                    </tbody>
                </table>
            </div>
        </div>

    </div>
</div>

</body>
</html>