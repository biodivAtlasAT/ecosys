<html lang="de">
<#include "common/header.ftl">
<body>
<#assign naviSel = "20">

<#include "common/headline.ftl">
<div class="row">
    <div class="col-md-2 m-4">
        <#include "common/navigation.ftl">
    </div>
    <div class="col-md-8 m-4">
        <h1 class="text-primary">Biotoptypen - Klasse</h1>
        <h4>Name: ${classData.description}</h4>

        <#if report?has_content>
        <div class="row">
            <div class="row mt-4">
                <div class="col-md-8 m-2">
                    ${report}
                </div>
            </div>
        </div>
        </#if>

        <#if classData.filename?has_content>
            <div class="row">
                <div class="row mt-4">
                    <div class="col-md-3 m-2">
                        Datei:
                    </div>
                    <div class="col-md-3 m-2"><b>${classData.filename}</b></div>
                    <div class="col-md-3 m-2">
                        <button type="button" class="btn btn-sm btn-outline-danger" onclick="document.getElementById('btRemoveClassFile').submit();">CSV-Datei löschen</button>
                    </div>
                </div>
            </div>
        <#else>
            <form method="post" id="uploadSVG" enctype="multipart/form-data" action="./${classData.id}/classTypeUpload">
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
            </form>
        </#if>

    </div>

</div>
<form id="btRemoveLayer" name="btRemoveLayer" action="./notImplemented" method="POST"></form>
</body>
</html>