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
                    <div class="col-md-2 m-2">
                        Datei:
                    </div>
                    <div class="col-md-3 m-2"><b>${classData.filename}</b></div>
                    <div class="col-md-3 m-2">
                        <button type="button" class="btn btn-sm btn-outline-danger" <#if classIsInUse>disabled</#if> onclick="classTypeDelete();">CSV-Datei löschen</button>
                    </div>
                </div>
            </div>
        <#else>
            <form method="post" id="uploadSVG" enctype="multipart/form-data" action="./${classData.id}/classTypeUpload">
                <div class="row">
                    <div class="col-md-3 m-2">
                        <a href="" onclick="return false;" style="text-decoration:none; color:darkgreen" data-toggle="tooltip"
                           data-placement="top" title="CSV-Datei:
1. Zeile: ID(hierarchisch mit Punkt getrennt);Name;Kategorie (optional)
Folge-Zeilen z.B: 1.2.3;BT Kluftgrundwasser;Biotoptyp">&#x2754;</a>
                        Datei (*.csv):
                    </div>
                    <div class="col-md-7 m-2">
                        <input type="file" size="32" maxlength="512" name="filename" id="filename" accept=".csv">
                    </div>
                </div>
                <div class="row">
                    <div class="col-md-2 m-2">
                        <button type="submit" class="btn btn-sm btn-outline-secondary" onclick="return checkFileInput();" >Speichern</button>
                    </div>
                </div>
            </form>
        </#if>

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
                Soll die CSV-Datei und alle zugehörigen Daten wirklich gelöscht werden?
            </div>
            <div class="modal-footer">
                <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Schlie&szlig;en</button>
                <button type="button" class="btn btn-primary" onclick="document.getElementById('btRemoveClassCSV').submit();return true;">Löschen</button>
            </div>
        </div>
    </div>
</div>


<form id="btRemoveClassCSV" name="btRemoveClassCSV" action="./${classData.id}/typesRemove" method="POST"></form>
</body>
</html>