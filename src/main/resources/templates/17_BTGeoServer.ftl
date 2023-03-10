<html lang="de">
<#include "common/header.ftl">
<body>
<#assign naviSel = "15">

<#include "common/headline.ftl">
<div class="row">
    <div class="col-md-2 m-4">
        <#include "common/navigation.ftl">
    </div>
    <div class="col-md-8 m-4">
        <h1 class="text-primary">Biotoptypen - Geoserver</h1>
        <h4>Projekt: ${project.name}</h4>

        <#if project.geoserverLayer?has_content>
            <div class="row">
                <div class="col-md-3 m-2">
                    Geoserver-Layer:
                </div>
                <div class="col-md-3 m-2"><b>${project.geoserverLayer}</b></div>
                <div class="col-md-3 m-2">
                    <button type="button" class="btn btn-sm btn-outline-danger" onclick="document.getElementById('btRemoveLayer').submit();">Zuordnung löschen</button>
                </div>
            </div>
            <div class="row">
                <div class="col-md-3 m-2">
                    Spalte für Biotop-Typ:
                </div>
                <div class="col-md-4 m-2"><b><#if project.colTypesCode="-1">nicht zugeordnet!<#else>${project.colTypesCode}</#if></b></div>
            </div>
            <#if project.colTypesDescription?has_content >
            <div class="row">
                <div class="col-md-3 m-2">
                    Spalte für Biotop-Bezeichnung:
                </div>
                <div class="col-md-4 m-2"><b><#if project.colTypesDescription="-1">nicht zugeordnet!<#else>${project.colTypesDescription}</#if></b></div>
            </div>
            </#if>

            <#if project.colSpeciesCode?has_content >
                <div class="row">
                    <div class="col-md-3 m-2">
                        Spalte für Artenliste:
                    </div>
                    <div class="col-md-4 m-2"><b><#if project.colTypesDescription="-1">nicht zugeordnet!<#else>${project.colSpeciesCode}</#if></b></div>
                </div>
            </#if>

        <#else>
            <form name="geoserverSave" method="GET" action="./saveGeoserverData">
            <input type="hidden" name="workspace" value="${workspace}">
            <div class="row mt-4">
                <div class="col-md-2 m-2">
                    Geoserver-Layer:
                </div>
                <div class="col-md-4 m-2">
                    <select name="layer" id="layer" required>
                        <option value="-1">------------------</option>
                        <#list listOfLayers as layer>
                            <option value="${layer}" <#if selectedLayer?has_content && "${selectedLayer}" == "${layer}"> selected <#else></#if> >${layer}</option>
                        </#list>
                    </select>
                </div>
                <div class="col-md-2 m-2">
                    <button type="button" onclick="btRedirect('${urlRedirect}'); return false;">Bestätigen</button>
                </div>
            </div>
            <#if (listOfFeatures?size > 0)>
                <div class="row">
                    <div class="col-md-3 m-2">
                        Spalte für Biotop-Typ:
                    </div>
                    <div class="col-md-4 m-2">
                        <select name="typeFeature" id="typeFeature" required onchange="checkFeatures(); return false;">
                            <option value="-1">------------------</option>
                            <#list listOfFeatures as feature>
                                <#if feature != "the_geom">
                                    <option value="${feature}">${feature}</option>
                                </#if>
                            </#list>
                        </select>
                    </div>
                </div>
                <div class="row">
                    <div class="col-md-3 m-2">
                        Spalte für Biotop-Bezeichnung:
                    </div>
                    <div class="col-md-4 m-2">
                        <select name="nameFeature" id="nameFeature" required onchange="checkFeatures(); return false;">
                            <option value="-1">------------------</option>
                            <#list listOfFeatures as feature>
                                <#if feature != "the_geom">
                                    <option value="${feature}">${feature}</option>
                                </#if>
                            </#list>
                        </select>
                    </div>
                </div>
                <div class="row">
                    <div class="col-md-3 m-2">
                        Spalte für Artenliste:
                    </div>
                    <div class="col-md-4 m-2">
                        <select name="speciesFeature" id="speciesFeature" required>
                            <option value="-1">------------------</option>
                            <#list listOfFeatures as feature>
                                <#if feature != "the_geom">
                                    <option value="${feature}">${feature}</option>
                                </#if>
                            </#list>
                        </select>
                    </div>
                </div>

                <div class="row">
                    <div class="col-md-3 m-2">
                        <button id="saveButton" class="btn btn-sm btn-outline-primary disabled" type="submit">Speichern</button>
                    </div>
                </div>
                </form>

            </#if>

        </#if>




    </div>

</div>
<form id="btRemoveLayer" name="btRemoveLayer" action="./removeGeoserverData" method="POST"></form>
</body>
</html>