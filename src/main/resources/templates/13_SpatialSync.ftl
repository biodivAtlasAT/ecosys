<html lang="de">
<#include "common/header.ftl">
<body>
<#assign naviSel = "13">

<#include "common/headline.ftl">
<div class="row">
    <div class="col-md-2 m-4">
        <#include "common/navigation.ftl">
    </div>
    <div class="col-md-8 m-4">
        <h1 class="text-primary">Synchronisation mit Spatial-Portal</h1>
        <#if isNotRunning>
            <div class="row col-md-10">
                <hr>
            </div>
            <div class="row">
                <div class="col-md-4">
                    Starten des Synchronisationsvorganges
                </div>
                <div class="col-md-4">
                    <a href="/admin/layer/syncAction" class="btn btn-primary" >Start</a>
                </div>
            </div>
            <div class="row col-md-10 pt-3">
                <hr>
            </div>
        <#else>
            <div class="row">
                <div class="col-md-10 alert alert-primary" role="alert">
                    Der Synchronisationsvorgang läuft!
                </div>
            </div>
        </#if>
        <div class="row">
            <div class="col-md-2">
                Gestartet:
            </div>
            <div class="col-md-4">
                ${started}
            </div>
        </div>
        <div class="row">
            <div class="col-md-2">
                Beendet:
            </div>
            <div class="col-md-4">
                <#if finished?has_content>
                    ${finished}
                </#if>
            </div>
        </div>
        <div class="row col-md-10 pt-3">
            <hr>
        </div>
        <div class="row col-md-10 m-2">
            Logfile (zeigt die aktuellsten 100 Zeilen):
        </div>
        <div class="row">
            <div class="col-md-10 overflow-auto m-2 small" style="border: solid green 1px; max-height: 300px">
                <#if logFile?has_content>${logFile}</#if>
            </div>
        </div>
</div>

</body>
</html>