function submit06(id) {
    document.getElementById("rasterTasksId").value = id;
    document.forms.form06submit.submit();
}

function categoryEdit(idx, maxCount, wordSave, wordEdit) {

    if (document.getElementById("bt_"+idx).classList.contains("funcSave")) {
        document.getElementById("saveFormName").value = document.getElementById("name_"+idx).value
        document.getElementById("saveFormId").value = document.getElementById("id_"+idx).textContent
        document.getElementById("categorySave").submit();
    }

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

function categoryDelete(idx) {
    document.getElementById("saveFormId").value = document.getElementById("id_"+idx).textContent
    document.getElementById("saveFormMode").value = 1
    new bootstrap.Modal(document.getElementById('MessageModal'),
        {
            keyboard: false
        }).show()
}
