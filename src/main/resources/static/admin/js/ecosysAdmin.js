function submit06(id) {
    document.getElementById("rasterTasksId").value = id;
    document.forms.form06submit.submit();
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

function serviceSVHUpload(idx) {
    new bootstrap.Modal(document.getElementById('UploadModal'),
        {
            keyboard: false
        }).show()
}