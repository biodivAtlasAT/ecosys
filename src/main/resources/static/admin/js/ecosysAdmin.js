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

function classTypeEdit(idx, maxCount, wordSave, wordEdit) {
    // if the "save" button is clicked, submit the form
    let boolVal;
    if (document.getElementById("bt_" + idx).classList.contains("funcSave")) {
        document.getElementById("saveFormName").value = document.getElementById("name_" + idx).value
        document.getElementById("saveFormId").value = document.getElementById("id_" + idx).textContent
        document.getElementById("classSave").submit();
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

function classTypeDelete() {
    new bootstrap.Modal(document.getElementById('MessageModal'),
        {
            keyboard: false
        }).show()
}

function speciesFileDelete() {
    new bootstrap.Modal(document.getElementById('MessageModal'),
        {
            keyboard: false
        }).show()
}


function classDelete(idx) {
    document.getElementById("saveFormId").value = document.getElementById("id_"+idx).textContent
    document.getElementById("saveFormMode").value = 1
    new bootstrap.Modal(document.getElementById('MessageModal'),
        {
            keyboard: false
        }).show()
}

function deleteBTMap() {
    f = document.getElementById("classMapSpan")
    f.style.color = "red"
    f.style.textDecoration = "line-through"
    document.getElementById("deleteMap").value = true
}

function colorMe(ele, keyCode) {
    console.log(ele.value);
    if(ele.value !== "") {
        console.log("color_"+keyCode);
        console.log(document.getElementById("color_"+keyCode));
        document.getElementById("color_"+keyCode).style.backgroundColor = ele.value;

    }

}

function delegateToChildren(keyCode) {
    sp = keyCode.split(".");
    liste = document.getElementsByClassName("class_"+sp[0]);
    console.log(liste.length)

    color = document.getElementById("colCode_"+sp[0]).value; // = hex value of color of root node
    if (color === "") return;

    // color = "#FF0000";
    const [hsl_h, hsl_s, hsl_l] = hexToHSL(color);
    console.log(color);
    console.log(hsl_h);
    console.log(hsl_s);
    console.log(hsl_l);
    min_l = 20;
    max_l = 90;
    stepWidth = (max_l - min_l) / liste.length;
    actual_l = min_l;
    actual_s = hsl_s;

    for (i = 0; i < liste.length; i++) {
        id = liste[i].id;
        if (id === "colCode_"+sp[0]) continue;
        console.log(id);
        //dummy set
        newColor = HSLToHex(hsl_h, actual_s, actual_l);
        document.getElementById(id).value = newColor;


        eleCodeId = "color_"+id.split("_")[1];
        document.getElementById(eleCodeId).style.backgroundColor = newColor;
        actual_l += stepWidth;
        if (actual_l > 90) {
            actual_l = min_l;
            if (actual_s < 50)
                actual_s +=50;
            else
                actual_s -=50;
        }

    }

}

function hexToHSL(H) {
    // Convert hex to RGB first
    let r = 0, g = 0, b = 0;
    if (H.length == 4) {
        r = "0x" + H[1] + H[1];
        g = "0x" + H[2] + H[2];
        b = "0x" + H[3] + H[3];
    } else if (H.length == 7) {
        r = "0x" + H[1] + H[2];
        g = "0x" + H[3] + H[4];
        b = "0x" + H[5] + H[6];
    }
    // Then to HSL
    r /= 255;
    g /= 255;
    b /= 255;
    let cmin = Math.min(r,g,b),
        cmax = Math.max(r,g,b),
        delta = cmax - cmin,
        h = 0,
        s = 0,
        l = 0;

    if (delta == 0)
        h = 0;
    else if (cmax == r)
        h = ((g - b) / delta) % 6;
    else if (cmax == g)
        h = (b - r) / delta + 2;
    else
        h = (r - g) / delta + 4;

    h = Math.round(h * 60);

    if (h < 0)
        h += 360;

    l = (cmax + cmin) / 2;
    s = delta == 0 ? 0 : delta / (1 - Math.abs(2 * l - 1));
    s = +(s * 100).toFixed(1);
    l = +(l * 100).toFixed(1);

    //return "hsl(" + h + "," + s + "%," + l + "%)";
    return [h, s, l];
}

function HSLToHex(h,s,l) {
    s /= 100;
    l /= 100;

    let c = (1 - Math.abs(2 * l - 1)) * s,
        x = c * (1 - Math.abs((h / 60) % 2 - 1)),
        m = l - c/2,
        r = 0,
        g = 0,
        b = 0;

    if (0 <= h && h < 60) {
        r = c; g = x; b = 0;
    } else if (60 <= h && h < 120) {
        r = x; g = c; b = 0;
    } else if (120 <= h && h < 180) {
        r = 0; g = c; b = x;
    } else if (180 <= h && h < 240) {
        r = 0; g = x; b = c;
    } else if (240 <= h && h < 300) {
        r = x; g = 0; b = c;
    } else if (300 <= h && h < 360) {
        r = c; g = 0; b = x;
    }
    // Having obtained RGB, convert channels to hex
    r = Math.round((r + m) * 255).toString(16);
    g = Math.round((g + m) * 255).toString(16);
    b = Math.round((b + m) * 255).toString(16);

    // Prepend 0s, if necessary
    if (r.length == 1)
        r = "0" + r;
    if (g.length == 1)
        g = "0" + g;
    if (b.length == 1)
        b = "0" + b;

    return "#" + r + g + b;
}

function checkFeatures() {
    var typeFeature = document.getElementById("typeFeature").value;
    var nameFeature = document.getElementById("nameFeature").value;
    var saveButton = document.getElementById("saveButton")

    console.log(typeFeature);
    console.log(nameFeature);
    if (typeFeature === "-1" || nameFeature === "-1") saveButton.classList.add("disabled");
    if (typeFeature !== "-1" && nameFeature !== "-1") saveButton.classList.remove("disabled");

}