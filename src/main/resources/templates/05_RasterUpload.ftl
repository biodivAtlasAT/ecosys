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
        <h1 class="text-primary">Rasterdaten Upload</h1>
        <form method="post" enctype="multipart/form-data" action="./uploadAction">
          <label>Wählen Sie eine Textdatei (*.txt, *.html usw.) von Ihrem Rechner aus.
            <input name="datei" type="file" size="50" accept="text/*">
          </label>
          <button>Upload</button>
        </form>
    </div>
</div>

</body>
</html>