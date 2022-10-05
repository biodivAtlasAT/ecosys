<html lang="de">
<#include "common/header.ftl">
<body>
<#assign naviSel = "5">

<#include "common/headline.ftl">
<div class="row">
    <div class="col-md-2 m-4">
        <#include "common/navigation.ftl">
    </div>
    <div class="col-md-8 m-4">
    <form method="post" enctype="multipart/form-data" action="./uploadAction">
        <h1 class="text-primary mb-5">Rasterdaten Upload</h1>
        <div class="row">
            <div class="col-md-2 m-2">Bezeichnung:</div>
            <div class="col-md-7 m-2"><input type="text" size="32" maxlength="128" name="description"></div>
        </div>
        <div class="row">
            <div class="col-md-2 m-2">Datei:</div>
            <div class="col-md-7 m-2"><input type="file" size="32" maxlength="512" name="filename"></div>
        </div>
        <div class="row">
            <div class="col-md-2 m-2"><button>Upload</button></div>
        </div>
        </form>
    </div>
</div>

</body>
</html>