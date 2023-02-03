function submit06(id, mode) {
    document.getElementById("rasterTasksId").value = id;
    document.getElementById("mode").value = mode;
    document.forms.form06submit.submit();
}

function submit08check(combinations) {
    const combi = combinations.split(",");

    let pIdSel = document.getElementById('packageId');
    let pId = pIdSel.options[pIdSel.selectedIndex].value;

    let sIdSel = document.getElementById('serviceId');
    let sId = sIdSel.options[sIdSel.selectedIndex].value;

    if (pId === "-1" || sId === "-1") {
        new bootstrap.Modal(document.getElementById('MessageModal'),
            {
                keyboard: false
            }).show()
        return false;
    }

    let newCombi = "" + pId + "_" +sId;
    let ok = true;
    for (let i = 0; i< combi.length; i++) {
        if (combi[i].trim() === newCombi) ok = false
    }

    if(!ok) {
        new bootstrap.Modal(document.getElementById('MessageCombiModal'),
            {
                keyboard: false
            }).show()
        return false;
    }
    return true;
}

function submit11(id) {
    document.getElementById("chkId").value = id;
    document.getElementById("form11").submit();
}

function categoryEdit(idx, maxCount, wordSave, wordEdit) {
    // if the "save" button is clicked, submit the form
    if (document.getElementById("bt_"+idx).classList.contains("funcSave")) {
        document.getElementById("saveFormName").value = document.getElementById("name_"+idx).value
        document.getElementById("saveFormId").value = document.getElementById("id_"+idx).textContent
        document.getElementById("categorySave").submit();
    }

    // get every input field (via the class name "noClass")
    // and disable the fields
    let eles = document.getElementsByClassName("noClass");
    for (let i = 0; i < eles.length; i++) {
        eles[i].disabled = true;
        eles[i].style.backgroundColor = 'white';
        let calcId = eles[i].id.substring(5);

        if (document.getElementById("bt_"+calcId).classList.contains("funcSave"))
            document.getElementById("bt_"+calcId).classList.remove("funcSave")
        document.getElementById("bt_" + calcId).classList.remove('btn-primary');
        document.getElementById("bt_" + calcId).classList.add('btn-outline-primary');
        document.getElementById("bt_" + calcId).textContent = wordEdit;
        if (calcId > -1)
            document.getElementById("btDel_" + calcId).style.visibility = "visible";
    }
    // enable the input field and the button
    let inpId = "name_"+idx;
    document.getElementById(inpId).style.backgroundColor = '#CEE3F6';
    document.getElementById(inpId).disabled = false;
    document.getElementById(inpId).focus();
    let btEdit = "bt_"+idx;
    document.getElementById(btEdit).textContent = wordSave;
    document.getElementById("saveFormMode").value = 0
    document.getElementById(btEdit).classList.remove('btn-outline-primary');
    document.getElementById(btEdit).classList.add('btn-primary')
    document.getElementById(btEdit).classList.add('funcSave')
    if (idx > -1)
        document.getElementById("btDel_"+idx).style.visibility = "hidden";

}

function categoryDelete(idx, allowed) {
    if (allowed) {
        new bootstrap.Modal(document.getElementById('MessageModalNotAllowed'),
            {
                keyboard: false
            }).show()
        return;
    }

    document.getElementById("saveFormId").value = document.getElementById("id_"+idx).textContent
    document.getElementById("saveFormMode").value = 1
    new bootstrap.Modal(document.getElementById('MessageModal'),
        {
            keyboard: false
        }).show()
}

function packageEdit(idx, maxCount, wordSave, wordEdit) {
    // if the "save" button is clicked, submit the form
    let boolVal;
    if (document.getElementById("bt_" + idx).classList.contains("funcSave")) {
        document.getElementById("saveFormName").value = document.getElementById("name_" + idx).value
        document.getElementById("saveFormId").value = document.getElementById("id_" + idx).textContent
        document.getElementById("saveFormDefault").value = document.getElementById("rb_" + idx).checked
        document.getElementById("packageSave").submit();
    }

    // get every input field (via the class name "noClass")
    // and disable the fields
    let eles = document.getElementsByClassName("noClass");
    for (let i = 0; i < eles.length; i++) {
        eles[i].disabled = true;
        eles[i].style.backgroundColor = 'white';
        let calcId = eles[i].id.substring(5);

        document.getElementById("rb_" + calcId).disabled = true;
        if (document.getElementById("bt_"+calcId).classList.contains("funcSave"))
            document.getElementById("bt_"+calcId).classList.remove("funcSave")
        document.getElementById("bt_" + calcId).classList.remove('btn-primary');
        document.getElementById("bt_" + calcId).classList.add('btn-outline-primary');
        document.getElementById("bt_" + calcId).textContent = wordEdit;
        if (calcId > -1)
            document.getElementById("btDel_" + calcId).style.visibility = "visible";

    }
    // enable the input field and the button
    let inpId = "name_"+idx;
    document.getElementById(inpId).style.backgroundColor = '#CEE3F6';
    document.getElementById(inpId).disabled = false;
    document.getElementById(inpId).focus();
    let btEdit = "bt_"+idx;
    document.getElementById(btEdit).textContent = wordSave;
    document.getElementById("saveFormMode").value = 0
    document.getElementById(btEdit).classList.remove('btn-outline-primary');
    document.getElementById(btEdit).classList.add('btn-primary')
    document.getElementById(btEdit).classList.add('funcSave')
    document.getElementById("rb_" + idx).disabled = false;

    if (idx > -1)
        document.getElementById("btDel_"+idx).style.visibility = "hidden";

}

function packageDelete(idx, allowed) {
    if (allowed) {
        new bootstrap.Modal(document.getElementById('MessageModalNotAllowed'),
            {
                keyboard: false
            }).show()
        return;
    }

    document.getElementById("saveFormId").value = document.getElementById("id_"+idx).textContent
    document.getElementById("saveFormMode").value = 1
    new bootstrap.Modal(document.getElementById('MessageModal'),
        {
            keyboard: false
        }).show()
}

function serviceEdit(idx, maxCount, wordSave, wordEdit) {
    // if the "save" button is clicked, submit the form
    let boolVal;
    if (document.getElementById("bt_" + idx).classList.contains("funcSave")) {
        document.getElementById("saveFormName").value = document.getElementById("name_" + idx).value
        document.getElementById("saveFormId").value = document.getElementById("id_" + idx).textContent
        document.getElementById("saveFormCategoryId").value = document.getElementById("categoryId_" + idx).value
        if (document.getElementById("categoryId_" + idx).value === "-1")
            new bootstrap.Modal(document.getElementById('MessageModalNoId'),
                {
                    keyboard: false
                }).show()
        else
            document.getElementById("serviceSave").submit();
    }

    // get every input field (via the class name "noClass")
    // and disable the fields
    let eles = document.getElementsByClassName("noClass");
    for (let i = 0; i < eles.length; i++) {
        eles[i].disabled = true;
        eles[i].style.backgroundColor = 'white';
        let calcId = eles[i].id.substring(5);

        document.getElementById("categoryId_" + calcId).disabled = true;
        document.getElementById("categoryId_" + calcId).style.backgroundColor = 'white';
        if (document.getElementById("bt_"+calcId).classList.contains("funcSave"))
            document.getElementById("bt_"+calcId).classList.remove("funcSave")
        document.getElementById("bt_" + calcId).classList.remove('btn-primary');
        document.getElementById("bt_" + calcId).classList.add('btn-outline-primary');
        document.getElementById("bt_" + calcId).textContent = wordEdit;
        if (calcId > -1)
            document.getElementById("btDel_" + calcId).style.visibility = "visible";

    }
    // enable the input field and the button
    let inpId = "name_"+idx;
    document.getElementById(inpId).style.backgroundColor = '#CEE3F6';
    document.getElementById(inpId).disabled = false;
    document.getElementById(inpId).focus();
    let btEdit = "bt_"+idx;
    document.getElementById(btEdit).textContent = wordSave;
    document.getElementById("saveFormMode").value = 0
    document.getElementById(btEdit).classList.remove('btn-outline-primary');
    document.getElementById(btEdit).classList.add('btn-primary')
    document.getElementById(btEdit).classList.add('funcSave')
    document.getElementById("categoryId_" + idx).disabled = false;
    document.getElementById("categoryId_" + idx).style.backgroundColor = '#CEE3F6';

    if (idx > -1)
        document.getElementById("btDel_"+idx).style.visibility = "hidden";

}

function serviceDelete(idx, allowed) {
    if (allowed) {
        new bootstrap.Modal(document.getElementById('MessageModalNotAllowed'),
            {
                keyboard: false
            }).show()
        return;
    }

    document.getElementById("saveFormId").value = document.getElementById("id_"+idx).textContent
    document.getElementById("saveFormMode").value = 1
    new bootstrap.Modal(document.getElementById('MessageModal'),
        {
            keyboard: false
        }).show()
}

function serviceSVGUpload(idx) {
    document.getElementById("uploadId").value = idx
    new bootstrap.Modal(document.getElementById('UploadModal'),
        {
            keyboard: false
        }).show()
}

function serviceSVGDelete(idx) {
    document.getElementById("serviceSVGDeleteFormId").value = idx
    new bootstrap.Modal(document.getElementById('svgModalDelete'),
        {
            keyboard: false
        }).show()
}

function rasterTaskDelete(idx) {
    document.getElementById("rasterTasksId").value = idx
    document.getElementById("mode").value = 1
    new bootstrap.Modal(document.getElementById('MessageModal'),
        {
            keyboard: false
        }).show()
}

function rasterDelete(idx) {
    document.getElementById("rasterId").value = idx
    new bootstrap.Modal(document.getElementById('MessageModal'),
        {
            keyboard: false
        }).show()
}

function addRefreshToHead() {
    console.log(";;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;")
    const meta = document.createElement('meta');
    meta.httpEquiv = "refresh";
    meta.content = "2";
    document.getElementsByTagName('head')[0].appendChild(meta);
}

function projectEdit(idx, maxCount, wordSave, wordEdit) {
    // if the "save" button is clicked, submit the form
    let boolVal;
    if (document.getElementById("bt_" + idx).classList.contains("funcSave")) {
        document.getElementById("saveFormName").value = document.getElementById("name_" + idx).value
        document.getElementById("saveFormId").value = document.getElementById("id_" + idx).textContent
        document.getElementById("projectSave").submit();
    }

    // get every input field (via the class name "noClass")
    // and disable the fields
    let eles = document.getElementsByClassName("noClass");
    for (let i = 0; i < eles.length; i++) {
        eles[i].disabled = true;
        eles[i].style.backgroundColor = 'white';
        let calcId = eles[i].id.substring(5);

        if (document.getElementById("bt_"+calcId).classList.contains("funcSave"))
            document.getElementById("bt_"+calcId).classList.remove("funcSave")
        document.getElementById("bt_" + calcId).classList.remove('btn-primary');
        document.getElementById("bt_" + calcId).classList.add('btn-outline-primary');
        document.getElementById("bt_" + calcId).textContent = wordEdit;
        if (calcId > -1)
            document.getElementById("btDel_" + calcId).style.visibility = "visible";

    }
    // enable the input field and the button
    let inpId = "name_"+idx;
    document.getElementById(inpId).style.backgroundColor = '#CEE3F6';
    document.getElementById(inpId).disabled = false;
    document.getElementById(inpId).focus();
    let btEdit = "bt_"+idx;
    document.getElementById(btEdit).textContent = wordSave;
    document.getElementById("saveFormMode").value = 0
    document.getElementById(btEdit).classList.remove('btn-outline-primary');
    document.getElementById(btEdit).classList.add('btn-primary')
    document.getElementById(btEdit).classList.add('funcSave')

    if (idx > -1)
        document.getElementById("btDel_"+idx).style.visibility = "hidden";
}

function projectDelete(idx, allowed) {
    if (allowed) {
        new bootstrap.Modal(document.getElementById('MessageModalNotAllowed'),
            {
                keyboard: false
            }).show()
        return;
    }

    document.getElementById("saveFormId").value = document.getElementById("id_"+idx).textContent
    document.getElementById("saveFormMode").value = 1
    new bootstrap.Modal(document.getElementById('MessageModal'),
        {
            keyboard: false
        }).show()
}

function btRedirect(url) {
    var e = document.getElementById("layer");
    window.location = url+'?layer='+e.value;
}
