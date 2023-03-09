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
        <h1 class="text-primary">Biotoptypen - Artenliste</h1>
        <h4>Projekt: ${project.name}</h4>

        <#if project.speciesFileName?has_content>
            <form name="speciesDetailsSave" method="GET" action="./speciesDetailsSave">
            <div class="row">
                <div class="col-md-3 m-2">
                    Datei:
                </div>
                <div class="col-md-3 m-2"><b>${project.speciesFileName}</b></div>
            </div>
            <div class="row">
                <div class="col-md-3 m-2">
                </div>
                <div class="col-md-3 m-2">
                    <button type="button" class="btn btn-sm btn-outline-danger" onclick="document.getElementById('btRemoveSpecies').submit();">Datei löschen</button>
                </div>
            </div>
            <div class="row">
                <div class="col-md-3 m-2">
                    Artenspalte in Projekt:
                </div>
                <div class="col-md-4 m-2">
                    <select name="speciesColId" id="speciesColId" required>
                        <option value="">------------------</option>
                        <#list listOfCols as feature>
                            <#if project.speciesColId?has_content>
                                <option value="${feature}" <#if project.speciesColId = feature>selected</#if> >${feature}</option>
                            <#else>
                                <option value="${feature}">${feature}</option>
                            </#if>
                        </#list>
                    </select>
                </div>
            </div>
            <div class="row">
                <div class="col-md-3 m-2">
                    Taxon ID (unique):
                </div>
                <div class="col-md-4 m-2">
                    <select name="speciesColTaxonId" id="speciesColTaxonId" required>
                        <option value="">------------------</option>
                        <#list listOfCols as feature>
                            <#if project.speciesColTaxonId?has_content>
                                <option value="${feature}" <#if project.speciesColTaxonId = feature>selected</#if> >${feature}</option>
                            <#else>
                                <option value="${feature}">${feature}</option>
                            </#if>
                        </#list>
                    </select>
                </div>
            </div>
            <div class="row">
                <div class="col-md-3 m-2">
                    Taxon Name:
                </div>
                <div class="col-md-4 m-2">
                    <select name="speciesColTaxonName" id="speciesColTaxonName" required>
                        <option value="">------------------</option>
                        <#list listOfCols as feature>
                            <#if project.speciesColTaxonName?has_content>
                                <option value="${feature}" <#if project.speciesColTaxonName = feature>selected</#if> >${feature}</option>
                            <#else>
                                <option value="${feature}">${feature}</option>
                            </#if>
                        </#list>
                    </select>
                </div>
            </div>
            <div class="row">
                <div class="col-md-2 m-2">
                    <input type="submit" class="btn btn-sm btn-outline-primary" value="Speichern">
                </div>
            </div>
        </form>

        <#else>
            <form name="speciesFileUpload" method="POST" action="./speciesFileUpload"  enctype="multipart/form-data">
            <div class="row mt-4">
                <div class="row">
                    <div class="col-md-2 m-2">Datei (*.csv):</div>
                    <div class="col-md-7 m-2">
                        <input type="file" size="32" maxlength="512" name="filename" accept=".csv">
                    </div>
                </div>
                <div class="row">
                    <div class="col-md-2 m-2">
                        <button type="submit" class="btn btn-sm btn-outline-secondary" >Speichern</button>
                    </div>
                </div>
            </div>
            </form>
            </#if>

    </div>

</div>
<form id="btRemoveSpecies" name="btRemoveSpecies" action="./removeSpeciesFile" method="POST"></form>
</body>
</html>