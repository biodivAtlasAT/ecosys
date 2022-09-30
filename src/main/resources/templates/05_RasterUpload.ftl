<html>
<#include "common/header.ftl">
<body>
<#assign naviSel = "2">

<h1 class="textcolor">Rasterdaten Upload</h1>
<div class="row">
    <div class="col-md-2">
        <#include "common/navigation.ftl">
    </div>
    <div class="col-md-10">
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