var url_pathServices = "api/services";
var url_pathLayers = "api/layers";
var url_pathLData = "api/layerData";
var url_pathPackages = "api/packages";
var url_pathRasterData = "api/rasterData";

var LayerMap;
var it_infBt = 0;
var it_mmBt = 0;
var chk_map = 0;
var it_0 = 0;
var it_m = 0;
var chk_cl = 0;
var chk_quint = 1;
var chk_pconn = 0;
var chk_pcSet = 0;
var chk_eSys = 0;
var chk_lMode = 0;
var str_bBox = "";
var submESys = $('#id_submEsys');
var bt_ecosysCB = $('#id_btnecosys');
var bt_Layermode = $('#id_btnLayer');
bt_Layermode.html('Layermodus auswählen');
var opt_packageID = $('#id_packageID').val(0);
var point = new Array();
var p_point = new Array();
var polygons = [];
var pLineGroup = L.layerGroup();
var poly = new Array();
var minimapArr = new Array();
var minimapBox = new Array();
var llBounds = new Array();
var p_point = new Array();
var popupArr = new Array();
var iterArr = new Array();
var tmp_marker_id = new Object();
var marker = new Array();
var info = $('#info');
var id_newMark = $('#id_btnNewMark');
var id_MarkerConn = $('#id_btnMarkConn');
var bt_close_inf = $('#bt_close');
var bt_close_mark = $('#bt_close_mark');
var cnt_id = $('#cnt_id');
var cnt_main = $('#cnt_main');
var cnt_nav = $('#cnt_nav');
var cnt_map = $('#cnt_map');
var cnt_info = $('#cnt_info');
var iter_conn = 0;
var iter_eSys = 0;
var iter_lMode = 0;
var prevZoom = 0;
var ly_ecosys;
var popupMap = new Array();
var polygonLayer = new Array();
var categories = new Array();
var catID = new Array();
var chk_lyClick = 0;
var id_fName = '';
var topLayer = new Array();

/*
var info_icon = $('#info_icon').append('<svg id="ic_info" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48">\n' +
    '  <circle cy="24" cx="24" r="24" fill="#36c"/>\n' +
    '  <g fill="#fff">\n' +
    '    <circle cx="24" cy="11.6" r="4.7"/>\n' +
    '    <path d="m17.4 18.8v2.15h1.13c2.26 0 2.26 1.38 2.26 1.38v15.1s0 1.38-2.26 1.38h-1.13v2.08h14.2v-2.08h-1.13c-2.26 0-2.26-1.38-2.26-1.38v-18.6"/>\n' +
    '  </g>\n' +
    '</svg>');

 */
var info_icon = $('#ic_info');
var do_translate = function () {
    $("[data-i18n]").each(function () {
        var prop = $(this).attr('data-i18n');
        $(this).i18n();
    });
}
func_init_i18n = function () {
    $.i18n().load({
        'en': url_i18n + 'messages.json',
        'de_AT': url_i18n + 'messages_de_AT.json'
    }).done(function () {
        console.log(location.href.split('lang=')[1]);
        if(location.href.split('lang=')[1] !== undefined) {
            $("html").attr("lang", location.href.split('lang=')[1]);
            $.i18n().locale = location.href.split('lang=')[1];
        } else {
            $.i18n().locale = 'de_AT';
        }
        do_translate();
    });
}
func_init_i18n();

$('button').attrchange({
    trackValues: true, /* Default to false, if set to true the event object is
                updated with old and new value.*/
    callback: function (event) {
        if (event['newValue'].length > 1) {
            //console.log($(event['target']));
            $("html").attr("lang", location.href.split('lang=')[1]);
            $.i18n().locale = location.href.split('lang=')[1];
            if ($(event['target']).attr('class') === 'cl_button') {
                $(event['target']).html($.i18n().parse(event['newValue']));
                //$(this).attr('value', prop.replace('[value]', ''));
            }
            if ($(event['target']).attr('class') === 'cl_submEsys') {
                $(event['target']).html($.i18n().parse(event['newValue']));
                //$(this).attr('value', prop.replace('[value]', ''));
            }
        }
        //event               - event object
        //event.attributeName - Name of the attribute modified
        //event.oldValue      - Previous value of the modified attribute
        //event.newValue      - New value of the modified attribute
        //Triggered when the selected elements attribute is added/updated/removed
    }
});
func_legend = function (p_id) {
    packageID = opt_packageID.val();
    $.ajax({
        url: url_ecosys + url_pathRasterData + '?packageID=' + packageID + '&services=[' + p_id + ']&coords=[(15,95/48,38)]',
        headers: {"Accept": "application/json"},
        type: 'POST',
        dataType: "json",
        crossDomain: true,
        beforeSend: function (xhr) {
            xhr.withCredentials = true;
        },
        type: 'POST',
        success: function (resp) {
            console.log(resp['data'][0]['geoserverLayerName']);
            var id_lName = resp['data'][0]['geoserverLayerName'];
// Define the URL for GetLegendGraphic service
            var legendURL = 'https://spatial.biodivdev.at/geoserver/ows?service=WMS&request=GetLegendGraphic&format=image/png&layer=ECO:' + id_lName.toLowerCase() + '&width=20&height=20&legend_options=forceLabels:on';

            // Create a popup element
            var popup = document.createElement('div');
            popup.className = 'legend-popup';
            popup.id = 'id_lPopup_' + p_id;
            popup.innerHTML = '<img style="margin: 1.7em;" src="' + legendURL + '">';

            // Position the popup near the clicked icon
            // You'll need to adjust these values based on your UI layout
            var iconPosition = { top: 50, left: 50 }; // Example values, adjust as needed
            popup.style.top = iconPosition.top + 'px';
            popup.style.left = iconPosition.left + 'px';

            // Add the popup to the document body
            if(!$('#id_lPopup_' + p_id).length) {
                $('#id_divName_' + p_id).parent().parent().append(popup);
            }

            // Add an event listener to close the popup when clicked
            popup.addEventListener('click', function() {
                popup.remove();
            });
        }
    });

};
func_info = function(p_id) {
    console.log('steckbriefe' + p_id);
}
func_cbClick = function (p_id) {
    if ($('.cl_cbEsys:checkbox:checked').length === 0) {
        for(it_tl = 0; it_tl < topLayer.length; it_tl++) {
            if(topLayer[it_tl] !== undefined) {
                map.removeLayer(topLayer[it_tl]);
            }
        }
    }
    if ($('.cl_cbEsys:checkbox:checked').length !== 0) {
        reqEcosys = new Array();
        ecosysName = new Array();
        ecosysName.push($('#id_divName_' + p_id).html());
        reqEcosys.push(p_id);
        packageID = opt_packageID.val();
        services = reqEcosys;
        //$(item).attr('class', $(item).attr('class').split(' ')[0] + ' ' + 'cl_cbNR_' + iter + ' ' + $(item).attr('class').split(' ')[2]);
        $('#id_esys_' + p_id).parent().css('background-color', '#ef932a');
        $.ajax({
            url: url_ecosys + url_pathRasterData + '?packageID=' + packageID + '&services=[' + services + ']&coords=[(15,95/48,38)]',
            headers: {"Accept": "application/json"},
            type: 'POST',
            dataType: "json",
            crossDomain: true,
            beforeSend: function (xhr) {
                xhr.withCredentials = true;
            },
            type: 'POST',
            success: function (resp) {
                console.log(resp['data'][0]['geoserverLayerName']);
                id_fName = resp['data'][0]['geoserverLayerName'];
                var url_rdataTop = "https://spatial.biodivdev.at/geoserver/wms";
                if (!$('#id_esys_' + p_id).is(':checked')) {
                    if (topLayer[p_id] !== undefined) {
                        map.removeLayer(topLayer[p_id]);
                    }
                }
                if ($('#id_esys_' + p_id).is(':checked')) {
                    topLayer[p_id] = L.tileLayer.wms(url_rdataTop, {
                        layers: 'ECO:' + id_fName.toLowerCase(),
                        format: 'image/png',
                        transparent: true,
                        opacity: 0.4,
                        version: '1.1.0'
                    }).addTo(map);
                }
            }
        });
    }
    for(it_esys = 0; it_esys <  $('input.cl_cbEsys').length; it_esys++) {
        if ($('.cl_cbNR_' + it_esys + ':checkbox:checked').length === 0) {
            $('.cl_cbNR_' + it_esys).parent().css('background-color', '#ffffff');
        }
    }
    if(('.cl_clop') != undefined) {
        $('.cl_clop').remove();
    }
    map.closePopup();
    for (it_r = 0; it_r < marker.length; it_r++) {
        marker[it_r].fire('dragend');
    }
};
/*
$("#sortable").sortable({
    group: 'serialization',
    onDrop: function () {
        var it_x = 0;
        if ($('input.cl_cbEsys:checkbox:checked').length !== 0) {
            if (marker.length > 0) {
                $('.cl_esysInf').children().remove();
                for (it_r = 0; it_r < marker.length; it_r++) {
                    if (popupArr[it_r].isOpen()) {
                        it_x = it_r;
                        break;
                    }
                }
                map.closePopup();
                marker[it_x].fire('click');
            }
        } else {
            map.closePopup();
        }
    },
    stop: function() {
       func_cbClick();
    }
});
*/
$(function() {
    $('#id_numIv').on('blur' , function() {
        map.closePopup();
        for (it_r = 0; it_r < marker.length; it_r++) {
            marker[it_r].fire('dragend');
        }
    });
});
$.ajax({
    url: url_ecosys + url_pathPackages,
    headers: {"Accept": "application/json"},
    type: 'GET',
    dataType: "json",
    crossDomain: true,
    beforeSend: function (xhr) {
        xhr.withCredentials = true;
    },
    //data: JSON.stringify({"packageID":opt_packageID.val()}),
    success: function (resp) {
        $("#id_packageID option").remove(); // Remove all <option> child tags.
        $.each(resp.packages, function (index, item) { // Iterates through a collection
            $("#id_packageID").append( // Append an object to the inside of the select box
                $("<option></option>") // Yes you can do this.
                    .text(item.name)
                    .val(item.id)
            );
        });
        opt_packageID = $('#id_packageID').val(1);
    }
});
$.ajax({
    url: url_ecosys + url_pathServices + '?packageID=1',
    headers: {"Accept": "application/json"},
    type: 'GET',
    dataType: "json",
    crossDomain: true,
    beforeSend: function (xhr) {
        xhr.withCredentials = true;
    },
    //data: JSON.stringify({"packageID":opt_packageID.val()}),
    success: function (resp) {
        var it_2, it_3, it_5;
        it_2 = it_3 = it_5 = 0;
        $("#sortable").children().remove();
        //var url_rdataTop = '';
        var sortEsys = new Array();
        for(it_se = 0; it_se < 3; it_se++) {
            sortEsys[it_se] = new Array()
        }
        $.each(resp.services, function (index, item) { // Iterates through a collection
            categories[index] = new Object();
            categories[index].servID = item.id;
            categories[index].catID = item['category']['id'];

            //console.log(id_fName.toLowerCase());
            //url_rdataTop = "https://spatial.biodivdev.at/geoserver/ALA/wms?service=WMS&version=1.1.0&request=GetFeatureInfo&layers=" + id_fName.toLowerCase() + "&info_format=application/json&srs=EPSG:4326&format=image/svg";

            if(categories[index].catID === 5) {
                if(it_5 === 0) {
                    sortEsys[0].push('<div class="cl_descrH">' + item['category']['name'] + '</div>');
                    it_5 = 1;
                }
                sortEsys[0].push("<li id='id_wrapEsys_" + index + "' class='cl_catL_" + item['category']['id'] + " cl_catR_" + item['category']['id'] + " cl_wrapEsys ui-state-default'><div class='cl_innerCOB'><span class='ui-icon ui-icon-arrowthick-2-n-s'></span><input class='cl_cbEsys cl_cbNR_" + index + " cl_cob_" + item['category']['id'] + "' type='checkbox' id='id_esys_" + item.id + "' onchange='func_cbClick(" + item.id + ");'></input><div class='cl_SName' id='id_divName_" + item.id + "' style='float: left' data-i18n='" + item.name + "'>" + item.name + "</div><div style=\"color: white; float: left; margin-left: 0.3em\" class=\"cl_ptleg\" onclick='func_legend(" + item.id + ");'><b style='background-color:black'>L.</b></div><svg xmlns=\"http://www.w3.org/2000/svg\" onclick=\"func_info(" + item.id + ");\" viewBox=\"0 0 48 48\" width=\"1.3em\" style=\"margin-right:0.8em\" class=\"cl_ptinfo\"><circle cy=\"24\" cx=\"24\" r=\"24\" fill=\"#36c\"></circle><g fill=\"#fff\"><circle cx=\"24\" cy=\"11.6\" r=\"4.7\"></circle><path d=\"m17.4 18.8v2.15h1.13c2.26 0 2.26 1.38 2.26 1.38v15.1s0 1.38-2.26 1.38h-1.13v2.08h14.2v-2.08h-1.13c-2.26 0-2.26-1.38-2.26-1.38v-18.6\"></path></g></svg></div></li>");
            }
            if(categories[index].catID === 3) {
                if(it_3 === 0) {
                    sortEsys[1].push('<div class="cl_descrH">' + item['category']['name'] + '</div>');
                    it_3 = 1;
                }
                sortEsys[1].push("<li id='id_wrapEsys_" + index + "' class='cl_catL_" + item['category']['id'] + " cl_catR_" + item['category']['id'] + " cl_wrapEsys ui-state-default'><div class='cl_innerCOB'><span class='ui-icon ui-icon-arrowthick-2-n-s'></span><input class='cl_cbEsys cl_cbNR_" + index + " cl_cob_" + item['category']['id'] + "' type='checkbox' id='id_esys_" + item.id + "' onchange='func_cbClick(" + item.id + ");'></input><div class='cl_SName' id='id_divName_" + item.id + "' style='float: left' data-i18n='" + item.name + "'>" + item.name + "</div><div style=\"color: white; float: left; margin-left: 0.3em\" class=\"cl_ptleg\" onclick='func_legend(" + item.id + ");'><b style='background-color: black'>L.</b></div><svg xmlns=\"http://www.w3.org/2000/svg\" onclick=\"func_info(" + item.id + ");\" viewBox=\"0 0 48 48\" width=\"1.3em\" style=\"margin-right:0.8em\" class=\"cl_ptinfo\"><circle cy=\"24\" cx=\"24\" r=\"24\" fill=\"#36c\"></circle><g fill=\"#fff\"><circle cx=\"24\" cy=\"11.6\" r=\"4.7\"></circle><path d=\"m17.4 18.8v2.15h1.13c2.26 0 2.26 1.38 2.26 1.38v15.1s0 1.38-2.26 1.38h-1.13v2.08h14.2v-2.08h-1.13c-2.26 0-2.26-1.38-2.26-1.38v-18.6\"></path></g></svg></div></li>");
            }
            if(categories[index].catID === 2) {
                if(it_2 === 0) {
                    sortEsys[2].push('<div class="cl_descrH">' + item['category']['name'] + '</div>');
                    it_2 = 1;
                }
                sortEsys[2].push("<li id='id_wrapEsys_" + index + "' class='cl_catL_" + item['category']['id'] + " cl_catR_" + item['category']['id'] + " cl_wrapEsys ui-state-default'><div class='cl_innerCOB'><span class='ui-icon ui-icon-arrowthick-2-n-s'></span><input class='cl_cbEsys cl_cbNR_" + index + " cl_cob_" + item['category']['id'] + "' type='checkbox' id='id_esys_" + item.id + "' onchange='func_cbClick(" + item.id + ");'></input><div class='cl_SName' id='id_divName_" + item.id + "' style='float: left' data-i18n='" + item.name + "'>" + item.name + "</div><div style=\"color: white; float: left; margin-left: 0.3em\" class=\"cl_ptleg\" onclick='func_legend(" + item.id + ");'><b style='background-color: black'>L.</b></div><svg xmlns=\"http://www.w3.org/2000/svg\" onclick=\"func_info(" + item.id + ");\" viewBox=\"0 0 48 48\" width=\"1.3em\" style=\"margin-right:0.8em\" class=\"cl_ptinfo\"><circle cy=\"24\" cx=\"24\" r=\"24\" fill=\"#36c\"></circle><g fill=\"#fff\"><circle cx=\"24\" cy=\"11.6\" r=\"4.7\"></circle><path d=\"m17.4 18.8v2.15h1.13c2.26 0 2.26 1.38 2.26 1.38v15.1s0 1.38-2.26 1.38h-1.13v2.08h14.2v-2.08h-1.13c-2.26 0-2.26-1.38-2.26-1.38v-18.6\"></path></g></svg></div></li>");
            }
        });
        for(it_se = 0; it_se < 3; it_se++) {
            for(it_i = 0; it_i < sortEsys[it_se].length; it_i++) {
                $("#sortable").append(sortEsys[it_se][it_i]);
            }
        }
        //$("#sortable").append("<button className='cl_submEsys' type='button' id='id_submEsys' onClick='func_submEsys();' data-i18n='bestätigen'>bestätigen</button>");
        /*
        $.ajax({
            url: url_rdataTop,
            success: function (data) {
                console.log(data);
            }
        });
         */
        map.closePopup();
    }
});
$('#id_mapLayer').change(function () {
    chk_map = $(this).val();
    func_initMap();
});
opt_packageID.on('change', function () {
    $.ajax({
        url: url_ecosys + url_pathServices + '?packageID=' + opt_packageID.val(),
        headers: {"Accept": "application/json"},
        type: 'GET',
        dataType: "json",
        crossDomain: true,
        beforeSend: function (xhr) {
            xhr.withCredentials = true;
        },
        //data: JSON.stringify({"packageID":opt_packageID.val()}),
        success: function (resp) {
            $("#sortable").children().remove();
            $.each(resp.services, function (index, item) { // Iterates through a collection
                console.log(resp);
                categories[index] = new Object();
                categories[index].servID = item.id;
                categories[index].catID = item['category']['id'];
                $("#sortable").append("<li id='id_wrapEsys_" + index + "' class='cl_catL_" + item['category']['id'] + " cl_catR_" + item['category']['id'] + " cl_wrapEsys ui-state-default'><div class='cl_innerCOB'><span class='ui-icon ui-icon-arrowthick-2-n-s'></span><input class='cl_cbEsys cl_cbNR_" + index + " cl_cob_" + item['category']['id'] + "' id='id_esys_" + item.id + "' type='checkbox' onchange='func_cbClick(" + item.id + ");'></input><div class='cl_SName' id='id_divName_" + item.id + "' style='float: left' data-i18n='" + item.name + "'>" + item.name + "</div><div style=\"color: white; float: left; margin-left: 0.3em\" class=\"cl_ptleg\" onclick='func_legend(" + item.id + ");'><b style='background-color: black'>L.</b></div><svg xmlns=\"http://www.w3.org/2000/svg\" onclick=\"func_info(" + item.id + ");\" viewBox=\"0 0 48 48\" width=\"1.3em\" style=\"margin-right:0.8em\" class=\"cl_ptinfo\"><circle cy=\"24\" cx=\"24\" r=\"24\" fill=\"#36c\"></circle><g fill=\"#fff\"><circle cx=\"24\" cy=\"11.6\" r=\"4.7\"></circle><path d=\"m17.4 18.8v2.15h1.13c2.26 0 2.26 1.38 2.26 1.38v15.1s0 1.38-2.26 1.38h-1.13v2.08h14.2v-2.08h-1.13c-2.26 0-2.26-1.38-2.26-1.38v-18.6\"></path></g></svg></div></li>");
            });
            //$("#sortable").append("<button className='cl_submEsys' type='button' id='id_submEsys' onClick='func_submEsys();' data-i18n='bestätigen'>bestätigen</button>");
            map.closePopup();
        }
    });
});
func_connectTheDots = function (p_marker) {
    var c = [];
    var pt = new Array();
    for (i in p_marker) {
        if (p_marker[i] != undefined) {
            pt[i] = p_marker[i].getLatLng();
            c.push([pt[i].lat, pt[i].lng]);
        }
    }
    return c;
}
func_widthChk = function (m_th) {
    filteredmarker = m_th.filter(x => x !== undefined);
    if (chk_pconn === 1) {
        cnt_info.animate({
            'height': 8.5 + (parseInt((filteredmarker.length - 1) / 2) * 20) + 'em'
        }, 100);
        $('.cl_footer').css('margin-top', (8.5 + parseInt((filteredmarker.length + 1) / 2) * 20) + 'em');
    }
    if (chk_pconn === 0) {
        cnt_info.animate({
            'height': 0 + (parseInt((filteredmarker.length - 1) / 3) * 20) + 'em'
        }, 100);
        $('.cl_footer').css('margin-top', (0 + parseInt((filteredmarker.length - 1) / 3) * 20) + 'em');
    }
}
func_updatePolyLine = function () {
    filteredmarker = marker.filter(x => x !== undefined);
    pLineGroup.removeLayer(poly);
    poly = L.polyline(func_connectTheDots(marker), {color: 'red'});
    pLineGroup.addLayer(poly);
    pLineGroup.addTo(map);
    // req calc bounds Boxes
    if (!$('input.cl_cbEsys:checked').length) {
        //alert("Bitte wählen sie zuerst eine Ökosystemleistung aus!");
        //bt_ecosysCB.click();
    } else {
        func_reqEcosys(marker);
    }
}

function toFixedTrunc(x, n) {
    x = Math.floor(x * Math.pow(10.0, n)) / Math.pow(10.0, n);
    return x;
}

func_reqEcosys = function (m_th, m_id) {
    $('.cl_esysInf').children().remove();
    var reqMarker = new Array();
    var reqEcosys = new Array();
    var reqHashID = new Array();
    var reqRefID = new Array();
    var tmpLatLng = new Array();
    var jsonReq = new Array();
    var tmpMarker = new Array();
    filteredmarker = m_th.filter(x => x !== undefined);
    if (filteredmarker.length) {
        for (it_e = 0; it_e < m_th.length; it_e++) {
            if (m_th[it_e] != undefined) {
                if (m_th.length > 1 && m_id === undefined) {
                    reqHashID.push(new Object([{lat: toFixedTrunc(m_th[it_e].getLatLng().lat, 6)}, {lng: toFixedTrunc(m_th[it_e].getLatLng().lng, 6)}]));
                    reqMarker.push('(' + parseFloat(m_th[it_e].getLatLng().lng) + '/' + parseFloat(m_th[it_e].getLatLng().lat) + ')');
                }
                if (m_th.length === 1 && m_id !== undefined) {
                    reqHashID.push(new Object([{lat: toFixedTrunc(m_th[it_e].getLatLng().lat, 6)}, {lng: toFixedTrunc(m_th[it_e].getLatLng().lng, 6)}]));
                    reqMarker.push('(' + parseFloat(m_th[it_e].getLatLng().lng) + '/' + parseFloat(m_th[it_e].getLatLng().lat) + ')');
                }
            }
        }
        if (filteredmarker.length === 1) {
            chk_pcSet = 0;
        }
        if (reqMarker.length) {
            if (chk_pcSet === 0) {
                var it_r = 0;
                reqEcosys = new Array();
                ecosysName = new Array();
                $('input.cl_cbEsys:checked').each(function (iter, item) {
                    ecosysName.push($('#id_divName_' + item.id.split('_')[2]).html());
                    reqEcosys.push(item.id.split('_')[2]);
                });
                packageID = opt_packageID.val();
                services = reqEcosys;
                coords = reqMarker;



                if (reqEcosys.length > 0) {
                    $.ajax({
                        url: url_ecosys + url_pathRasterData + '?packageID=' + packageID + '&services=[' + services + ']&coords=[' + coords + ']',
                        headers: {"Accept": "application/json"},
                        type: 'POST',
                        dataType: "json",
                        crossDomain: true,
                        beforeSend: function (xhr) {
                            xhr.withCredentials = true;
                        },
                        type: 'POST',
                        success: function (resp) {
                            // into request and use response formated
                            var it_d = 0;
                            var qtArr = new Array();
                            var absData = new Array();
                            //$('#id_esysInf_' + it_e).append("<div id='id_reqInf_" + it_e + "'>" + marker[it_e].getLatLng() + "</div>");
                            d3.select('#id_esysInf_' + m_id)
                                .append('div')
                                .attr('id', 'id_chr_' + m_id)
                                .attr('class', 'cl_chr cl_row');

                            var svgLArr = new Array();
                            catID = new Array();
                            var it_n = 0;
                            for (it_d = 0; it_d < reqEcosys.length; it_d++) {
                                catID[it_n] = new Object();
                                for (it_f = 0; it_f < resp['data'].length; it_f++) {
                                    if (parseInt(reqEcosys[it_d]) === resp['data'][it_f]['id']) {
                                        absData.push(resp['data'][it_f]);
                                        svgLArr.push(resp['data'][it_f]['svg']);
                                        continue;
                                    }
                                }
                                catID[it_n].catID = parseInt($('#id_esys_' + parseInt(reqEcosys[it_d])).parent().parent().attr('class').split('cl_catL_')[1].split(' ')[0]);
                                it_n++;
                            }
                            var quantArr = new Array();
                            var elemAObj = new Object();
                            for (it_d = 0; it_d < absData.length; it_d++) {
                                d3.select('#id_chr_' + m_id)
                                    .append('div')
                                    .attr('id', 'id_descr_' + it_d)
                                    .attr('class', 'cl_catL_' + catID[it_d].catID + ' cl_descr cl_column cl_table_' + it_d)
                                    .attr('data-i18n', ecosysName[it_d])
                                    .html('<div class="cl_tDw">' + ecosysName[it_d] + '<div>');
                                d3.select('#id_chr_' + m_id)
                                    .append('div')
                                    .attr('id', 'id_chrIcons_' + it_d)
                                    .attr('class', ' cl_fixedW cl_column');
                                d3.select('#id_chr_' + m_id)
                                    .append('div')
                                    .attr('id', 'id_value_' + it_d)
                                    .attr('class', ' cl_value cl_column cl_table_' + it_d)
                                    .html('<div class="cl_tDw">' + absData[it_d]['vals'][0]['val'] + '</div>');
                                d3.select('#id_chr_' + m_id)
                                    .append('div')
                                    .attr('id', 'id_dimension_' + it_d)
                                    .attr('class', 'cl_catR_' + catID[it_d].catID + ' cl_dimension cl_column cl_table_' + it_d)
                                    .html('<div class="cl_tDw">' + absData[it_d]['dim'] + '</div>');
                                $.ajax({
                                    url: url_ecosys + svgLArr[it_d],
                                    dataType: "xml",
                                    type: 'GET',
                                    async: false,
                                    success: function (data) {
                                        quantArr.push(data);
                                    }
                                });
                            }
                            for (it_d = 0; it_d < quantArr.length; it_d++) {
                                quantArr[it_d].getElementsByTagName("svg")[0].removeAttribute('id');
                                quantArr[it_d].getElementsByTagName("svg")[0].setAttribute("width", "50");
                                quantArr[it_d].getElementsByTagName("svg")[0].setAttribute("height", "50");
                                for (it_t = 0; it_t < $(quantArr[it_d].getElementsByTagName("svg")[0]).children().length; it_t++) {
                                    if ($(quantArr[it_d].getElementsByTagName("svg")[0]).children()[it_t].getAttribute('class') !== null) {
                                        for (it_h = 0; it_h < quantArr[it_d].getElementsByClassName($(quantArr[it_d].getElementsByTagName("svg")[0]).children()[it_t].getAttribute('class')).length; it_h++) {
                                            //console.log(quantArr[it_d].getElementsByClassName($(quantArr[it_d].getElementsByTagName("svg")[0]).children()[it_t].getAttribute('class'))[it_h]);
                                            elemObj = quantArr[it_d].getElementsByTagName("style")[0];
                                            for (it_r = 0; it_r < elemObj.innerHTML.split('}').length; it_r++) {
                                                //console.log( elemObj.innerHTML.split('}')[it_r].split('{')[0].replace('.', ''));
                                                if (quantArr[it_d].getElementsByClassName(elemObj.innerHTML.split('}')[it_r].split('{')[0].replace('.', '')).length > 0) {
                                                    quantArr[it_d].getElementsByClassName(elemObj.innerHTML.split('}')[it_r].split('{')[0].replace('.', ''))[0].setAttribute('style', elemObj.innerHTML.split('}')[it_r].split('{')[1]);
                                                }
                                            }
                                            for (it_r = 0; it_r < elemObj.innerHTML.split('}').length; it_r++) {
                                                if (quantArr[it_d].getElementsByClassName(elemObj.innerHTML.split('}')[it_r].split('{')[0].replace('.', '')).length > 0) {
                                                    quantArr[it_d].getElementsByClassName(elemObj.innerHTML.split('}')[it_r].split('{')[0].replace('.', ''))[0].removeAttribute('class');
                                                }
                                            }
                                        }
                                    }
                                }
                                if (quantArr[it_d].getElementsByTagName("style")[0] !== undefined) {
                                    quantArr[it_d].getElementsByTagName("style")[0].remove();
                                }
                                if( absData[it_d]['vals'][0]['val'] > 0) {
                                    for (it_s = 0; it_s < absData[it_d]['vals'][0]['quantil'] + 1; it_s++) {
                                        d3.select('#id_chrIcons_' + it_d)
                                            .append('div')
                                            .attr('class', ' cl_quint')
                                            .attr('id', 'id_quint_' + it_d + '_' + it_s)
                                            .html(new XMLSerializer().serializeToString(quantArr[it_d]));
                                    }
                                }
                                if( absData[it_d]['vals'][0]['val'] === 0) {
                                    d3.select('#id_chrIcons_' + it_d)
                                        .append('div')
                                        .attr('class', ' cl_quint')
                                        .attr('id', 'id_quint_' + it_d + '_' + 0);
                                }
                            }
                        }
                    });
                }
                if (chk_pconn === 1) {
                    if (filteredmarker.length > 1) {
                        chk_pcSet = 1;
                    }
                }
            }

            if (chk_pcSet === 1) {
                reqEcosys = new Array();
                $('input.cl_cbEsys:checked').each(function (iter, item) {
                    console.log(item.id);
                    reqEcosys.push(item.id.split('_')[2]);
                });
                packageID = opt_packageID.val();
                services = reqEcosys;
                var latlngs = func_connectTheDots(filteredmarker).map((point) => L.latLng(point));
                var lengths = L.GeometryUtil.accumulatedLengths(latlngs);
                // Reduce all lengths to a single total length
                var totalLength = lengths[lengths.length - 1];
                console.log(totalLength);
                if(parseInt($('#id_viewP option:selected').val()) === 0) {
                    // Get number of points based on desired interval and total length
                    var interval = 1000;
                    $('#id_numIv').css('display', 'block');
                    if($('#id_numIv').val() >= 1000) {
                        interval = parseInt($('#id_numIv').val()); // input set
                    }
                    console.log(totalLength);
                    const totalPoints = Math.floor(totalLength / interval);

                    // Get rations of each point along the polyline
                    const ratios = [];
                    for (let i = 0; i <= totalPoints; i++) {
                        const ratio = i / totalPoints;
                        ratios.push(ratio);
                    }

                    const points = ratios.map((ratio) =>
                        L.GeometryUtil.interpolateOnLine(map, latlngs, ratio)
                    );
                    points.forEach((point) => {
                        L.marker(point.latLng);
                    });
                    reqMarker = [];
                    for (it_e = 0; it_e < points.length; it_e++) {
                        if (points[it_e] != undefined) {
                            if (points.length > 1 && m_id === undefined) {
                                reqRefID.push(new Object([{lat: toFixedTrunc(points[it_e].latLng.lat, 6)}, {lng: toFixedTrunc(points[it_e].latLng.lng, 6)}]));
                                reqMarker.push('(' + parseFloat(points[it_e].latLng.lng) + '/' + parseFloat(points[it_e].latLng.lat) + ')');
                            }
                            if (points.length === 1 && m_id !== undefined) {
                                reqRefID.push(new Object([{lat: toFixedTrunc(points[it_e].latLng.lat, 6)}, {lng: toFixedTrunc(points[it_e].latLng.lng, 6)}]));
                                reqMarker.push('(' + parseFloat(points[it_e].latLng.lng) + '/' + parseFloat(points[it_e].latLng.lat) + ')');
                            }
                        }
                    }

                }
                if(parseInt($('#id_viewP option:selected').val()) === 1) {
                    // Get number of points based on desired interval and total length
                    $('#id_numIv').css('display', 'none');
                    const totalPoints = m_th.length - 1;

                    // Get rations of each point along the polyline
                    const ratios = [];
                    for (let i = 0; i <= totalPoints; i++) {
                        const ratio = i / totalPoints;
                        ratios.push(ratio);
                    }

                    const points = ratios.map((ratio) =>
                        L.GeometryUtil.interpolateOnLine(map, latlngs, ratio)
                    );
                    points.forEach((point) => {
                        L.marker(point.latLng);
                    });
                    reqMarker = [];
                    for (it_e = 0; it_e < points.length; it_e++) {
                        if (points[it_e] != undefined) {
                            if (points.length > 1 && m_id === undefined) {
                                reqRefID.push(new Object([{lat: toFixedTrunc(points[it_e].latLng.lat, 6)}, {lng: toFixedTrunc(points[it_e].latLng.lng, 6)}]));
                                reqMarker.push('(' + parseFloat(points[it_e].latLng.lng) + '/' + parseFloat(points[it_e].latLng.lat) + ')');
                            }
                            if (points.length === 1 && m_id !== undefined) {
                                reqRefID.push(new Object([{lat: toFixedTrunc(points[it_e].latLng.lat, 6)}, {lng: toFixedTrunc(points[it_e].latLng.lng, 6)}]));
                                reqMarker.push('(' + parseFloat(points[it_e].latLng.lng) + '/' + parseFloat(points[it_e].latLng.lat) + ')');
                            }
                        }
                    }
                }
                coords = reqMarker;
                if (reqEcosys.length > 0) {
                    $.ajax({
                        url: url_ecosys + url_pathRasterData + '?packageID=' + packageID + '&services=[' + services + ']&coords=[' + coords + ']',
                        dataType: "json",
                        type: 'POST',
                        success: function (resp) {
                            // into request and use response formated
                            var absData = new Array();
                            for (it_e = 0; it_e < marker.length; it_e++) {
                                $('#id_esysInf_' + it_e).append("<div id='id_reqInf_" + it_e + "'>" + marker[it_e].getLatLng() + "</div>");
                            }
                            catID = new Array();
                            var it_n = 0;
                            for (it_d = 0; it_d < reqEcosys.length; it_d++) {
                                catID[it_n] = new Object();
                                for (it_f = 0; it_f < resp['data'].length; it_f++) {
                                    if (parseInt(reqEcosys[it_d]) === resp['data'][it_f]['id']) {
                                        absData.push(resp['data'][it_f]);
                                        continue;
                                    }
                                }
                                catID[it_n].catID = parseInt($('#id_esys_' + parseInt(reqEcosys[it_d])).parent().parent().attr('class').split('cl_catL_')[1].split(' ')[0]);
                                it_n++;
                            }
                            func_initChart(absData, reqHashID, reqRefID, parseInt($('#id_viewQ option:selected').val()), catID);
                        }
                    });
                }
            }
            // layer id - line point area - alle auf dem Weg befindlichen ecosys
        }
    }
}
func_reqSpecies = function () {
    var it_x = 0;
    var url_biocache_ws = '';
    var url_linkBioc = '';
    if ($('input.cl_cbEsys:checked').length !== 0) {
        if (marker.length > 0) {
            $('.cl_esysInf').children().remove();
            for (it_r = 0; it_r < marker.length; it_r++) {
                if (marker[it_r]._map.hasLayer(marker[it_r]._popup)) {
                    it_x = it_r;
                    break;
                }
            }
            llBounds[it_x] = L.latLngBounds(L.latLng(marker[it_x].getLatLng().lat - 0.010, marker[it_x].getLatLng().lng - 0.010), L.latLng(marker[it_x].getLatLng().lat + 0.010, marker[it_x].getLatLng().lng + 0.010));
            minimapBox[it_x] = func_createPolygon(llBounds[it_x]);
            if (minimapBox[it_x] !== undefined) {
                str_bBox = "MULTIPOLYGON(((" + minimapBox[it_x]._latlngs[0][0].lng + "%20" + minimapBox[it_x]._latlngs[0][0].lat + "," + minimapBox[it_x]._latlngs[0][1].lng + "%20" + minimapBox[it_x]._latlngs[0][1].lat + "," + minimapBox[it_x]._latlngs[0][2].lng + "%20" + minimapBox[it_x]._latlngs[0][2].lat + "," + minimapBox[it_x]._latlngs[0][3].lng + "%20" + minimapBox[it_x]._latlngs[0][3].lat + "," + minimapBox[it_x]._latlngs[0][0].lng + "%20" + minimapBox[it_x]._latlngs[0][3].lat + "," + minimapBox[it_x]._latlngs[0][0].lng + "%20" + minimapBox[it_x]._latlngs[0][0].lat + ")))";
            }
            url_linkBioc = "https://biocache.biodiversityatlas.at/occurrences/search?q=*%3A*&qc=&wkt=" + str_bBox;
            url_biocache_ws = 'https://biocache-ws.biodiversityatlas.at/occurrence/facets.json?q=*:*&qc=&wkt=' + str_bBox + '&facets=taxon_name'; //"https://biocache-ws.biodiversityatlas.at/occurrence/facets.json?q=*:*&qc=&wkt=" + str_bBox + "&facets=taxon_name";
            $.ajax({
                url: url_biocache_ws,
                type: 'GET',
                success: function (resp) {
                    if(('.cl_clop') != undefined) {
                        $('.cl_clop').remove();
                    }
                    $('.cl_headID').append('<div class="cl_clop"><a target="_blank" href="' + url_linkBioc + '"<span><i data-i18n="Unterschiedliche Arten">Unterschiedliche Arten: ' + resp[0].count + '</i></span></div>');
                }
            });
        }
    } else {
        map.closePopup();
    }
}
func_deletePolyLine = function () {
    pLineGroup.removeLayer(poly);
}
func_switchMod = function () {

    if (chk_lMode == 0) {
        $.ajax({
            url: url_ecosys + url_pathServices,
            headers: {"Accept": "application/json"},
            type: 'GET',
            dataType: "json",
            crossDomain: true,
            beforeSend: function (xhr) {
                xhr.withCredentials = true;
            },
            success: function (resp) {
                console.log(resp);
            }
        });
    }
    if (chk_lMode == 1) {
        console.log("Markermodus");
    }
}
/*
func_mpClick = function () {
    var it_x = 0;
    if ($('input.cl_cbEsys:checked').length !== 0) {
        if (marker.length > 0) {
            $('.cl_esysInf').children().remove();
            for (it_r = 0; it_r < marker.length; it_r++) {
                if (marker[it_r]._map.hasLayer(marker[it_r]._popup)) {
                    marker[it_r].fire('click');
                }
            }
            map.closePopup();
        }
    } else {
        map.closePopup();
    }
}
*/
/*
func_getPolygonBounds = function() {
    map.eachLayer(function (layer) {
        if (layer instanceof L.Polygon && !(layer instanceof L.Rectangle)) {
            polygons.push(layer.getLatLngs()) //Returns an array of arrays of geographical points in each polygon.
            polygons.push(layer.getBounds()) //Returns a GeoJSON representation of the polygon (GeoJSON Polygon Feature).
        }
    })
}
 */
//bt_Layermode.on('click', function () {
//if (chk_lMode === 0) {
$.ajax({
    url: url_ecosys + url_pathLayers,
    headers: {"Accept": "application/json"},
    type: 'GET',
    dataType: "json",
    crossDomain: true,
    beforeSend: function (xhr) {
        xhr.withCredentials = true;
    },
    success: function (resp) {
        $("#id_addLayer option").remove(); // Remove all <option> child tags.
        $("#id_addLayer").append("<option class='cl_option' id='id_defLy' selected='true' value='noL'>Kein Layer</option>");
        $("#id_defLy").attr('data-i18n', 'Kein Layer');
        $.each(resp.layers, function (index, item) { // Iterates through a collection
            $("#id_addLayer").append( // Append an object to the inside of the select box
                $("<option></option>") // Yes you can do this.
                    .text(item.name)
                    .val(item.id)
            );
        });
        do_translate();
    }
});
//bt_Layermode.html('Markermodus auswählen');
//bt_Layermode.attr('data-i18n', 'Markermodus auswählen');
$('#id_mod_1').css('display', 'none');
$('#id_mod_2').css('display', 'block');
func_switchMod();
/*
cnt_map.animate({
    'height': '100%'
}, 100);
cnt_info.animate({
    'height': '0%',
}, 100);

 */
bt_close_mark.html('Minimaps öffnen');
bt_close_mark.attr('data-i18n', 'Minimaps öffnen');
//info.hide();
$('.cl_footer').css('margin-top', '0%');
it_mmBt = ++it_mmBt % 2;
//}
//if (chk_lMode === 1) {
//bt_Layermode.html('Layermodus auswählen');
//bt_Layermode.attr('data-i18n', 'Layermodus auswählen');
$('#id_mod_1').css('display', 'block');
//$('#id_mod_2').css('display', 'none');
//func_switchMod();
//bt_close_mark.click();
//}
chk_lMode = ++iter_lMode % 2;
//});
bt_ecosysCB.on('click', function () {
    if (chk_eSys === 0) {
        map.closePopup();
        bt_ecosysCB.html('Ökosystemleistungen schließen');
        bt_ecosysCB.attr('data-i18n', 'Ökosystemleistungen schließen');
        //$('.cl_ecosys').css('visibility', 'visible');
    }
    if (chk_eSys === 1) {
        bt_ecosysCB.html('Ökosystemleistungen auswählen');
        bt_ecosysCB.attr('data-i18n', 'Ökosystemleistungen auswählen');
        //$('.cl_ecosys').css('visibility', 'hidden');
    }
    chk_eSys = ++iter_eSys % 2;
});
/*
id_newMark.hover(function () {
    $(this).css('cursor', 'pointer').attr('title', 'neuen Marker setzen');
}, function () {
    $(this).css('cursor', 'auto');
});
 */
id_newMark.on('click', function (e) {
    chk_cl = 0;
    map.closePopup();
    bt_close_mark.css('display', 'block');
    if (it_mmBt == 1) {
        cnt_map.animate({
            'height': '100%'
        }, 100);
        cnt_info.animate({
            'height': '0%',
        }, 100);
        bt_close_mark.show();
        bt_close_mark.html('Minimaps öffnen');
        bt_close_mark.attr('data-i18n', 'Minimaps öffnen');
        info.hide();
        $('.cl_footer').css('margin-top', '0%');
        it_mmBt = ++it_mmBt % 2;
    }
    if (it_mmBt == 0) {
        cnt_map.animate({
            'height': '78%'
        }, 100);
        bt_close_mark.html('Minimaps schließen');
        bt_close_mark.attr('data-i18n', 'Minimaps schließen');
        info.show();
    }
    var tt_0 = it_0;
    let svgEmb = '<svg id=\"Ebene_1\" xmlns=\"http://www.w3.org/2000/svg\" xmlns:xlink=\"http://www.w3.org/1999/xlink\" x=\"0px\" y=\"100px\" viewBox=\"0 0 1000 1000\" xml:space=\"preserve\"><style type=\"text/css\">.st0{fill:#FF3333;}.cl_nrT{font-size:20em;fill:#FF3333;}</style><g><text x=\"65%\" y=\"95%\" id=\"id_markNr_' + it_0 + '\" class=\"cl_nrT\">' + it_0 + '</text><path id=\"id_path\" class=\"st0\" d=\"M500,42.7c162.1,0,294,131.9,294,294c0,51.6-13.7,102.4-39.5,147L500,924.7l-254.5-441c-25.8-44.6-39.5-95.4-39.5-147C206,174.5,337.9,42.7,500,42.7L500,42.7z M500,451c63,0,114.3-51.3,114.3-114.3S563,222.4,500,222.4s-114.3,51.3-114.3,114.3S437,451,500,451z M500,10c-180.4,0-326.7,146.3-326.7,326.7c0,59.6,16,115.3,43.9,163.3L500,990l282.8-490c27.8-48.1,43.9-103.8,43.9-163.3C826.6,156.3,680.4,10,500,10L500,10L500,10z M500,418.3c-45.1,0-81.7-36.5-81.7-81.6s36.6-81.6,81.7-81.6s81.6,36.6,81.6,81.6C581.7,381.8,545.1,418.3,500,418.3L500,418.3z\"/></g></svg>';
    marker[it_0] = L.marker([marker[it_0 - 1] !== undefined ? marker[it_0 - 1].getLatLng().lat + 0.002 : map.getCenter().lat, marker[it_0 - 1] !== undefined ? marker[it_0 - 1].getLatLng().lng + 0.002 : map.getCenter().lng], {
        clickable: true,
        draggable: true,
        icon: L.divIcon({
            html: svgEmb,
            iconSize: [30, 30],
            iconAnchor: [15, 30],
            popupAnchor: [0, -50]
        })
    }).on('dragstart', function (e) {
    }).on('drag', function (e) {
        chk_cl = 0;
        //$('.markers').change();
    }).on('drop', function (e) {
        chk_cl = 1;
        $('.markers').change();

    }).on('dragend', function (e) {
        chk_cl = 2;
        $('.markers').change();
        if (chk_pconn === 1) {
            func_updatePolyLine();
            //$('#ic_info').attr('visibility','hidden');
            /*
            cnt_main.animate({
                'width': '65%'
            }, 100);
             */
            cnt_info.animate({
                'width': '100em'
            }, 100);
            cnt_nav.animate({
                'width': '52em', 'display': 'block'
            }, 100);
        }
    }).on('mouseup', function () {
        console.log('0');
        if(('.cl_clop') != undefined) {
            $('.cl_clop').remove();
        }
        chk_lyClick = 0;
    }).on('click', function() {
        console.log('1');
        chk_lyClick = 1;
    });
    if (marker[it_0] !== undefined) {
        filteredmarker = marker.filter(x => x !== undefined);
        if (filteredmarker.length > 1 && it_infBt === 1) {
            if (info_icon.css('visibility') === 'hidden') {
                it_infBt = ++it_infBt % 2;
            }
        }
        func_widthChk(marker);
        point[it_0] = map.latLngToLayerPoint(marker[it_0].getLatLng());
        point[it_0] = map.layerPointToLatLng(point[it_0]);
        p_point[it_0] = point[it_0];
        // page 14 Map.locate <watch, enableHighAccuracy, maxZoom>
        var popupHtml = "<div class='cl_popup' id='id_popup_" + it_0 + "'><div class=\"cl_headID\"><span class=\"cl_IDred\"> ID " + it_0 + " </span>Coords: " + p_point[it_0] + "</div><div class='cl_esysInf' id='id_esysInf_" + it_0 + "'></div></div>";
        marker[it_0].addTo(map).bindPopup(popupHtml);

        info.append('<div class="markers" id="marker_' + it_0 + '" onchange="func_updateID($(this))"><div class="minimapNr"><span class=\"cl_IDred\"> ID<br>' + it_0 + '</span></div><button onclick="func_delMark($(this).parent())" type="button" class="cl_delMark" id="del_mark_' + it_0 + '"></button><div class="cl_mark" id="id_mark_' + it_0 + '">Lat: <input type="number" min="-90.000000" max="90.000000" step="0.000001" value="' + p_point[it_0].lat + '" onchange="func_nPosLatLng(' + it_0 + ');"></input> Lng: <input type="number" min="-90.000000" max="90.000000" step="0.000001" value="' + p_point[it_0].lng + '" onchange="func_nPosLatLng(' + it_0 + ');"></input></div><div class="cl_cntInf"></div><div class="cl_popupmap" id="popup-map_' + it_0 + '"></div><div class="cl_minimap" id="minimap_' + it_0 + '"></div></div></div></div>');
        minimapArr[it_0] = L.map('minimap_' + it_0, {
            doubleClickZoom: false,
            closePopupOnClick: false,
            dragging: false,
            zoomControl: false,
            zoomSnap: true,
            zoomDelta: 1,
            trackResize: false,
            touchZoom: false,
            scrollWheelZoom: false,
            center: [48.3805228, 15.9558588],
            zoom: 14
        });
        popupArr[it_0] = L.popup({
            closeOnClick: false,
            autoClose: false
        })
            .setLatLng(p_point[it_0]);
        llBounds[it_0] = L.latLngBounds(L.latLng(marker[it_0].getLatLng().lat - 0.010, marker[it_0].getLatLng().lng - 0.010), L.latLng(marker[it_0].getLatLng().lat + 0.010, marker[it_0].getLatLng().lng + 0.010));
        minimapBox[it_0] = func_createPolygon(llBounds[it_0]);

        //minimapArr[it_0].setView(marker[it_0].getLatLng(),19);
        //console.log(minimapBox[it_0]);
        $('#minimap_' + it_0).append(minimapArr[it_0]);
        iterArr.push({'id': it_0, 'text': info, 'minimap': minimapArr[it_0]});
        mapLink =
            '<a href="http://www.esri.com/">Esri</a>';
        wholink =
            'i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community';
        L.tileLayer(
            'http://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
                attribution: '&copy; ' + mapLink + ', ' + wholink,
            }).addTo(minimapArr[it_0]);
        //minimapArr[it_0].fitBounds(minimapBox[it_0]);
        if (chk_pconn === 0) {
            if (!$('input.cl_cbEsys:checked').length) {

                //alert("Bitte wählen sie zuerst eine Ökosystemleistung aus!");
                bt_ecosysCB.click();
            } else {
                filteredmarker = marker.filter(x => x !== undefined);
                for (it_r = 0; it_r < filteredmarker.length; it_r++) {
                    filteredmarker[it_r].fire('dragend');
                }
            }
            //func_reqSpecies();
        }
        if (ly_ecosys !== undefined) {
            var latlng = marker[tt_0].getLatLng();
            var bbox = map.getBounds().toBBoxString();
            var size = map.getSize();
            var pixelPosition = map.latLngToLayerPoint(marker[tt_0].getLatLng());
            var x = size.x * (pixelPosition.x / size.x);
            var y = size.y * (pixelPosition.y / size.y);
            var url = "https://spatial.biodiversityatlas.at/geoserver/ALA/wms?service=WMS&version=1.1.0&request=GetFeatureInfo&layers=" + ly_ecosys.wmsParams.layers + "&query_layers=" + ly_ecosys.wmsParams.layers + "&bbox=" + bbox + "&width=" + size.x + "&height=" + size.y + "&x=" + x + "&y=" + y + "&info_format=application/json&srs=EPSG:4326&format=image/svg";
            $.ajax({
                url: url,
                success: function (data) {

                    // Get the feature that was clicked
                    var clickedFeature = data.features[0];

                    // Create a new map object within the popup
                    if (popupMap[tt_0] != undefined) popupMap[tt_0].remove();
                    popupMap[tt_0] = L.map('popup-map_' + tt_0, {
                        dragging: false,
                        zoomControl: false
                    }).setView(latlng, 6);

                    // Create a marker at the clicked point

                    // Add a TileLayer to the popup map
                    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                        attribution: 'Map data © <a href="https://openstreetmap.org">OpenStreetMap</a> contributors',
                    }).addTo(popupMap[tt_0]);

                    if (clickedFeature !== undefined) {
                        // Create a GeoJSON layer for the clicked polygon
                        polygonLayer[tt_0] = L.geoJSON(clickedFeature.geometry).addTo(popupMap[tt_0]);

                        // Fit the map view to the extent of the polygon layer
                        popupMap[tt_0].fitBounds(polygonLayer[tt_0].getBounds());
                    }
                }
            });
            $('.cl_popupmap').css('display', 'block');
        } else {
            $('.cl_popupmap').css('display', 'none');
        }
        if ($('#id_addLayer option:selected').val() === 'noL') {
            $('.cl_popupmap').css('display', 'none');
        }
    }
    if (chk_pconn === 1) {
        func_updatePolyLine();
    }
    it_0++;
});
id_MarkerConn.on('click', function (th) {
    filteredmarker = marker.filter(x => x !== undefined);
    if (filteredmarker.length > 1) {
        if (it_infBt === 1) {
            if (info_icon.css('visibility') === 'visible') {
                /*
                cnt_main.animate({
                    'width': '65%'
                }, 100);
                 */
                cnt_info.animate({
                    'width': '100em'
                }, 100);
                cnt_nav.animate({
                    'width': '52em', 'display': 'block'
                }, 100);
                cnt_info.animate({
                    'height': 8.5 + (parseInt((filteredmarker.length - 1) / 2) * 20) + 'em'
                }, 100);
                $('.cl_footer').css('margin-top', (8.5 + parseInt((filteredmarker.length - 1) / 2) * 20) + 'em');
                it_infBt = ++it_infBt % 2;
            }
        }
        if (chk_pconn === 0) {
            chk_pcSet = 1;
            info_icon.css('visibility', 'visible');
            if ($('.cl_cbEsys:checkbox:checked').length === 0) {
                alert("Bitte wählen sie zuerst eine Ökosystemleistung aus!");
                bt_ecosysCB.click();
            }
            if ($('.cl_cbEsys:checkbox:checked').length > 0) {
                func_updatePolyLine();
                id_MarkerConn.val("Verbindung verbergen");
            }
        }
        if (chk_pconn === 1) {
            chk_pcSet = 0;
            info_icon.css('visibility', 'hidden');
            func_deletePolyLine();
            /*
            cnt_main.animate({
                'width': '100%'
            }, 100);
            */
            cnt_info.animate({
                'width': '88em'
            }, 100);
            cnt_info.animate({
                'width': '88em'
            }, 100);
            cnt_nav.animate({
                'width': '0em', 'display': 'none'
            }, 100);
            id_MarkerConn.val("Verbindung setzen");
            if (it_infBt % 2 == 0) {
                cnt_info.animate({
                    'height': 8.5 + (parseInt((filteredmarker.length - 1) / 2) * 20) + 'em'
                }, 100);
                $('.cl_footer').css('margin-top', (8.5 + parseInt((filteredmarker.length - 1) / 2) * 20) + 'em');
            }
            if (it_infBt % 2 == 1) {
                cnt_info.animate({
                    'height': 0 + (parseInt((filteredmarker.length - 1) / 3) * 20) + 'em'
                }, 100);
            }
            $('.cl_footer').css('margin-top', (0 + parseInt((filteredmarker.length - 1) / 3) * 20) + 'em');
        }
        if (chk_pconn === 0) {
            if ($('.cl_cbEsys:checkbox:checked').length !== 0) {
                if (it_infBt % 2 == 0) {
                    /*
                    cnt_main.animate({
                        'width': '65%'
                    }, 100);
                    */
                    info_icon.css('visibility', 'visible');
                    cnt_info.animate({
                        'width': '48em'
                    }, 100);
                    cnt_nav.animate({
                        'width': '52em', 'display': 'block'
                    }, 100);
                    cnt_info.animate({
                        'height': 8.5 + (parseInt((filteredmarker.length - 1) / 2) * 20) + 'em'
                    }, 100);
                    $('.cl_footer').css('margin-top', (8.5 + parseInt((filteredmarker.length - 1) / 2) * 20) + 'em');
                }
            }
        }
        if (it_infBt % 2 == 1) {
            /*
            cnt_main.animate({
                'width': '100%'
            }, 100);

             */
            cnt_info.animate({
                'width': '88em'
            }, 100);
            cnt_nav.animate({
                'width': '0em', 'display': 'none'
            }, 100);
            cnt_info.animate({
                'height': 0 + (parseInt((filteredmarker.length - 1) / 3) * 20) + 'em'
            }, 100);
            $('.cl_footer').css('margin-top', (0 + parseInt((filteredmarker.length - 1) / 3) * 20) + 'em');
        }
        if ($('.cl_cbEsys:checkbox:checked').length > 0) {
            if (info_icon.css('visibility') === 'visible') {
                it_infBt = ++it_infBt % 2;
            }
            chk_pconn = ++iter_conn % 2;
        }

    }
});
func_createPolygon = function (latLngBounds) {
    var center = latLngBounds.getCenter()
    latlngs = [];

    latlngs.push(latLngBounds.getSouthWest());//bottom left
    latlngs.push({lat: latLngBounds.getSouth(), lng: center.lng});//bottom center
    latlngs.push(latLngBounds.getSouthEast());//bottom right
    latlngs.push({lat: center.lat, lng: latLngBounds.getEast()});// center right
    latlngs.push(latLngBounds.getNorthEast());//top right
    latlngs.push({lat: latLngBounds.getNorth(), lng: map.getCenter().lng});//top center
    latlngs.push(latLngBounds.getNorthWest());//top left
    latlngs.push({lat: map.getCenter().lat, lng: latLngBounds.getWest()});//center left

    return new L.polygon(latlngs);
}

function toRadian(degree) {
    return degree * Math.PI / 180;
}

func_getDistance = function (origin, destination) {
    // return distance in meters
    var lon1 = toRadian(origin.lng),
        lat1 = toRadian(origin.lat),
        lon2 = toRadian(destination.lng),
        lat2 = toRadian(destination.lat);
    var deltaLat = lat2 - lat1;
    var deltaLon = lon2 - lon1;
    var a = Math.pow(Math.sin(deltaLat / 2), 2) + Math.cos(lat1) * Math.cos(lat2) * Math.pow(Math.sin(deltaLon / 2), 2);
    var c = 2 * Math.asin(Math.sqrt(a));
    var EARTH_RADIUS = 6371;
    return c * EARTH_RADIUS * 1000;
}
func_addDistances = function (m_th) {
    var res = 0.0;
    for (it_m = 0; it_m < m_th.length - 1; it_m++) {
        res += func_getDistance(m_th[it_m].getLatLng(), m_th[it_m + 1].getLatLng());
    }
    return res;
}
d3.selection.prototype.moveToBack = function () {
    return this.each(function () {
        var firstChild = this.parentNode.firstChild;
        if (firstChild) {
            this.parentNode.insertBefore(this, firstChild);
        }
    });
};
d3.selection.prototype.moveToFront = function () {
    return this.each(function () {
        this.parentNode.appendChild(this);
    });
};

function func_toggleMarkers() {
    for (var i = 0; i < markers.length; i++) {
        var marker = markers[i];
        if (marker.isVisible()) {
            marker.setOpacity(0); // hide the marker
            marker.setVisible(false);
        } else {
            marker.setOpacity(1); // show the marker
            marker.setVisible(true);
        }
    }
}

func_initChart = function (data, p_hashID, p_refID, chk_quint, p_catID) {
    var it_n = 0;
    if ($(".cl_svg").length > 0) {
        $(".cl_svg").remove();
    }
    filteredmarker = marker.filter(x => x !== undefined);
    if (filteredmarker.length > 1) {
        var div_nav = d3.select("#id_nav");
        var svg = new Array();
        var margin = {top: 20, right: 20, bottom: 20, left: 20}, width = 600, height = 320;
        var xScale = [];
        var yScale = [];
        var xAxis = [];
        var yAxis = [];
        var distance = 0.0;
        var xStep = [];
        var yStep = [];
        var yMax = [];
        distance = func_addDistances(marker); // Array of points
        var cntID = new Array();
        for (it_o = 0; it_o < p_refID.length; it_o++) {
            cntID[it_o] = 0;
        }
        console.log(p_hashID.length);
        for (it_m = 0; it_m < p_hashID.length; it_m++) {
            console.log(p_hashID[it_m] + 'compared');
            for (it_o = 0; it_o < p_refID.length; it_o++) {
                console.log(p_refID[it_o] + 'this');
                if ((Math.abs(p_hashID[it_m][0]['lat'] - p_refID[it_o][0]['lat']) <= 0.01) && Math.abs(p_hashID[it_m][1]['lng'] - p_refID[it_o][1]['lng']) <= 0.01) {
                    cntID[it_o] = 1;
                    break;
                }
            }
        }
        for (it_d = 0; it_d < data.length; it_d++) {
            xAxis[it_d] = [];
            yAxis[it_d] = [];
            xStep[it_d] = [];
            yStep[it_d] = [];
            yMax[it_d] = 5;
            for (it_n = 0; it_n < data[0]['vals'].length; it_n++) {
                xStep[it_d][it_n] = it_n * (distance * 0.002 / (data[0]['vals'].length)); //
            }
            if (chk_quint === 0) {
                for (it_n = 0; it_n < data[it_d]['vals'].length; it_n++) {
                    yStep[it_d][it_n] = data[it_d]['vals'][it_n]['val'];
                    if (yMax[it_d] <= yStep[it_d][it_n]) {
                        yMax[it_d] = yStep[it_d][it_n];
                    }
                }
            }
            if (chk_quint === 1) {
                for (it_n = 0; it_n < data[it_d]['vals'].length; it_n++) {
                    if(data[it_d]['vals'][it_n]['val'] > 0) {
                        yStep[it_d][it_n] = data[it_d]['vals'][it_n]['quantil'] + 1;
                    }
                    if(data[it_d]['vals'][it_n]['val'] === 0) {
                        yStep[it_d][it_n] = 0;
                    }
                }
            }
            console.log(yMax[it_d]);
            xScale[it_d] = d3.scaleLinear().domain([0, distance * 0.002]).range([0, width - margin.left - margin.right]);
            yScale[it_d] = d3.scaleLinear().domain([0, yMax[it_d]]).range([height - margin.top - margin.bottom, 0]);
            xAxis[it_d] = d3.axisBottom(xScale[it_d]).ticks(0);
            yAxis[it_d] = d3.axisRight(yScale[it_d]).ticks(10);

            div_nav
                .append("svg")
                .attr("id", "id_svg_e_" + it_d)
                .attr("class", "cl_svg")
                .attr('viewBox', '0 0 ' + (width + margin.left + margin.right) + ' ' + (height + margin.top + margin.bottom))
                .append("g");

            svg[it_d] = d3.select('#id_svg_e_' + it_d);

            svg[it_d].append('text')
                .attr('dx', margin.left)
                .attr('dy', 12)
                .attr('stroke', '#222222')
                .attr('font-style', 'italic')
                .text($('#id_divName_' + data[it_d]['id']).html());

            svg[it_d].append("g")
                .attr("class", "x-axis")
                .attr("transform", "translate(" + margin.left + "," + (height - margin.bottom) + ")")
                .call(xAxis[it_d]);

            svg[it_d].append("text")
                .attr("class", "x-text")
                .attr("transform", "translate(" + margin.left + "," + (height + margin.bottom) + ")")
                .text("Distanz: " + parseInt(distance * 0.001) + "km Dimension: " + data[it_d]['dim']);

// Y axis
            svg[it_d].append("g")
                .attr("class", "y-axis")
                .attr("transform", "translate(" + (width - margin.right) + "," + margin.top + ")")
                .call(yAxis[it_d]);

            svg[it_d].append("g")
                .attr('id', 'id_grLine_' + it_d)

            for (it_n = 0; it_n < data[it_d]['vals'].length; it_n++) {
                // function(d), not just line function
                //console.log(xStep[it_d][it_n]);
                //console.log(yStep[it_d][it_n]);
                d3.selectAll('#id_grLine_' + it_d)
                    .append("line")
                    .attr("class", "cl_Lines")
                    .attr('id', 'id_line_' + it_d + '_' + it_n)
                    .attr('display', 'none')
                    .attr("x1", margin.left + xScale[it_d](xStep[it_d][it_n]))
                    .attr("x2", width)
                    .attr('y1', yScale[it_d](yStep[it_d][it_n]) + margin.bottom)
                    .attr('y2', yScale[it_d](yStep[it_d][it_n]) + margin.bottom)
                    .attr('stroke', '#6666ff')
                    .attr('stroke-dasharray', '4')
            }
            svg[it_d].append("g")
                .attr('id', 'id_grText_' + it_d)
            if (chk_quint === 0) {
                for (it_n = 0; it_n < data[it_d]['vals'].length; it_n++) {
                    // function(d), not just line function
                    //console.log(xStep[it_d][it_n]);
                    //console.log(yStep[it_d][it_n]);
                    d3.selectAll('#id_grText_' + it_d)
                        .append("text")
                        .attr("class", "cl_Texts")
                        .attr('id', 'id_text_' + it_d + '_' + it_n)
                        .attr('display', 'none')
                        .attr("x", margin.left + xScale[it_d](xStep[it_d][it_n]))
                        .attr('y', -3 + yScale[it_d](yStep[it_d][it_n]) + margin.bottom)
                        .attr('dy', 32)
                        .attr('dx', 3)
                        .attr('width', xScale[it_d](xStep[it_d][1]))
                        .attr("height", 60)
                        .attr('font-size', 30)
                        .attr('stroke', '#6666ff')
                        .attr('fill', '#111111')
                        .attr('font-style', 'italic')
                        .text(yStep[it_d][it_n] + " " + data[it_d]['dim'])
                }
            }
            if (chk_quint === 1) {
                for (it_n = 0; it_n < data[it_d]['vals'].length; it_n++) {
                    // function(d), not just line function
                    //console.log(xStep[it_d][it_n]);
                    //console.log(yStep[it_d][it_n]);
                    d3.selectAll('#id_grText_' + it_d)
                        .append("text")
                        .attr("class", "cl_Texts")
                        .attr('id', 'id_text_' + it_d + '_' + it_n)
                        .attr('display', 'none')
                        .attr("x", margin.left + xScale[it_d](xStep[it_d][it_n]))
                        .attr('y', -3 + yScale[it_d](yStep[it_d][it_n]) + margin.bottom)
                        .attr('dy', 32)
                        .attr('dx', 3)
                        .attr('width', xScale[it_d](xStep[it_d][1]))
                        .attr("height", 60)
                        .attr('font-size', 30)
                        .attr('stroke', '#6666ff')
                        .attr('fill', '#111111')
                        .attr('font-style', 'italic')
                        .text(yStep[it_d][it_n])
                }
            }
            // Add Y axis
            svg[it_d].append("g")
                .attr('id', 'id_grRect_' + it_d)

            for (it_n = 0; it_n < data[it_d]['vals'].length; it_n++) {
                // function(d), not just line function
                //console.log(xStep[it_d][it_n]);
                //console.log(yStep[it_d][it_n]);
                if (cntID[it_n] === 1) {
                    if (p_catID[it_d].catID === 2) {
                        d3.selectAll('#id_grRect_' + it_d)
                            .append("rect")
                            .attr('class', 'cl_rCol_1 cl_Rect')
                            .attr('id', 'id_bar_' + it_d + '_' + it_n)
                            .attr("x", margin.left + xScale[it_d](xStep[it_d][it_n]))
                            .attr('y', yScale[it_d](yStep[it_d][it_n]) + margin.bottom)
                            .attr('width', xScale[it_d](xStep[it_d][1]))
                            .attr("height", height - yScale[it_d](yStep[it_d][it_n]) - margin.top - margin.bottom)
                            .attr('y_value', yStep[it_d][it_n])
                            .attr('fill', '#98BB1E')
                            .attr('fill-opacity', 0.7)
                            .on('mouseover', function () {
                                var tmp = $(this).attr('id');
                                $('#id_text_' + tmp.split('_')[2] + '_' + tmp.split('_')[3]).attr('display', 'block');
                                $('#id_line_' + tmp.split('_')[2] + '_' + tmp.split('_')[3]).attr('display', 'block');
                                d3.select('#id_bar_' + tmp.split('_')[2] + '_' + tmp.split('_')[3]).attr('stroke', '#98BB1E');
                                d3.select('#id_grRect_' + tmp.split('_')[2]).moveToBack();

                            })
                            .on('mouseout', function () {
                                var tmp = $(this).attr('id');
                                $('#id_text_' + tmp.split('_')[2] + '_' + tmp.split('_')[3]).attr('display', 'none');
                                $('#id_line_' + tmp.split('_')[2] + '_' + tmp.split('_')[3]).attr('display', 'none');
                                d3.select('#id_bar_' + tmp.split('_')[2] + '_' + tmp.split('_')[3]).attr('stroke', '#98BB1E');
                            });
                    }
                    if (p_catID[it_d].catID === 5) {
                        d3.selectAll('#id_grRect_' + it_d)
                            .append("rect")
                            .attr('class', 'cl_rCol_1 cl_Rect')
                            .attr('id', 'id_bar_' + it_d + '_' + it_n)
                            .attr("x", margin.left + xScale[it_d](xStep[it_d][it_n]))
                            .attr('y', yScale[it_d](yStep[it_d][it_n]) + margin.bottom)
                            .attr('width', xScale[it_d](xStep[it_d][1]))
                            .attr("height", height - yScale[it_d](yStep[it_d][it_n]) - margin.top - margin.bottom)
                            .attr('y_value', yStep[it_d][it_n])
                            .attr('fill', '#F9B100')

                            .on('mouseover', function () {
                                var tmp = $(this).attr('id');
                                $('#id_text_' + tmp.split('_')[2] + '_' + tmp.split('_')[3]).attr('display', 'block');
                                $('#id_line_' + tmp.split('_')[2] + '_' + tmp.split('_')[3]).attr('display', 'block');
                                d3.select('#id_bar_' + tmp.split('_')[2] + '_' + tmp.split('_')[3]).attr('fill', '#F9B100');
                                d3.select('#id_grRect_' + tmp.split('_')[2]).moveToBack();

                            })
                            .on('mouseout', function () {
                                var tmp = $(this).attr('id');
                                $('#id_text_' + tmp.split('_')[2] + '_' + tmp.split('_')[3]).attr('display', 'none');
                                $('#id_line_' + tmp.split('_')[2] + '_' + tmp.split('_')[3]).attr('display', 'none');
                                d3.select('#id_bar_' + tmp.split('_')[2] + '_' + tmp.split('_')[3]).attr('fill', '#F9B100');
                            });
                    }
                    if (p_catID[it_d].catID === 3) {
                        d3.selectAll('#id_grRect_' + it_d)
                            .append("rect")
                            .attr('class', 'cl_rCol_1 cl_Rect')
                            .attr('id', 'id_bar_' + it_d + '_' + it_n)
                            .attr("x", margin.left + xScale[it_d](xStep[it_d][it_n]))
                            .attr('y', yScale[it_d](yStep[it_d][it_n]) + margin.bottom)
                            .attr('width', xScale[it_d](xStep[it_d][1]))
                            .attr("height", height - yScale[it_d](yStep[it_d][it_n]) - margin.top - margin.bottom)
                            .attr('y_value', yStep[it_d][it_n])
                            .attr('fill', '#9F2538')

                            .on('mouseover', function () {
                                var tmp = $(this).attr('id');
                                $('#id_text_' + tmp.split('_')[2] + '_' + tmp.split('_')[3]).attr('display', 'block');
                                $('#id_line_' + tmp.split('_')[2] + '_' + tmp.split('_')[3]).attr('display', 'block');
                                d3.select('#id_bar_' + tmp.split('_')[2] + '_' + tmp.split('_')[3]).attr('fill', '#9F2538');
                                d3.select('#id_grRect_' + tmp.split('_')[2]).moveToBack();

                            })
                            .on('mouseout', function () {
                                var tmp = $(this).attr('id');
                                $('#id_text_' + tmp.split('_')[2] + '_' + tmp.split('_')[3]).attr('display', 'none');
                                $('#id_line_' + tmp.split('_')[2] + '_' + tmp.split('_')[3]).attr('display', 'none');
                                d3.select('#id_bar_' + tmp.split('_')[2] + '_' + tmp.split('_')[3]).attr('fill', '#9F2538');
                            });
                    }
                }
                if (cntID[it_n] === 0) {
                    if (p_catID[it_d].catID === 2) {
                        d3.selectAll('#id_grRect_' + it_d)
                            .append("rect")
                            .attr("class", "cl_Rects")
                            .attr('id', 'id_bar_' + it_d + '_' + it_n)
                            .attr("x", margin.left + xScale[it_d](xStep[it_d][it_n]))
                            .attr('y', yScale[it_d](yStep[it_d][it_n]) + margin.bottom)
                            .attr('width', xScale[it_d](xStep[it_d][1]))
                            .attr("height", height - yScale[it_d](yStep[it_d][it_n]) - margin.top - margin.bottom)
                            .attr('y_value', yStep[it_d][it_n])
                            .attr('fill', '#aaaaaa')

                            .on('mouseover', function () {
                                var tmp = $(this).attr('id');
                                $('#id_text_' + tmp.split('_')[2] + '_' + tmp.split('_')[3]).attr('display', 'block');
                                $('#id_line_' + tmp.split('_')[2] + '_' + tmp.split('_')[3]).attr('display', 'block');
                                d3.select('#id_bar_' + tmp.split('_')[2] + '_' + tmp.split('_')[3]).attr('fill', '#98BB1E');
                                d3.select('#id_grRect_' + tmp.split('_')[2]).moveToBack();

                            })
                            .on('mouseout', function () {
                                var tmp = $(this).attr('id');
                                $('#id_text_' + tmp.split('_')[2] + '_' + tmp.split('_')[3]).attr('display', 'none');
                                $('#id_line_' + tmp.split('_')[2] + '_' + tmp.split('_')[3]).attr('display', 'none');
                                d3.select('#id_bar_' + tmp.split('_')[2] + '_' + tmp.split('_')[3]).attr('fill', '#aaaaaa');
                            });
                    }
                    if (p_catID[it_d].catID === 5) {
                        d3.selectAll('#id_grRect_' + it_d)
                            .append("rect")
                            .attr("class", "cl_Rects")
                            .attr('id', 'id_bar_' + it_d + '_' + it_n)
                            .attr("x", margin.left + xScale[it_d](xStep[it_d][it_n]))
                            .attr('y', yScale[it_d](yStep[it_d][it_n]) + margin.bottom)
                            .attr('width', xScale[it_d](xStep[it_d][1]))
                            .attr("height", height - yScale[it_d](yStep[it_d][it_n]) - margin.top - margin.bottom)
                            .attr('y_value', yStep[it_d][it_n])
                            .attr('fill', '#aaaaaa')

                            .on('mouseover', function () {
                                var tmp = $(this).attr('id');
                                $('#id_text_' + tmp.split('_')[2] + '_' + tmp.split('_')[3]).attr('display', 'block');
                                $('#id_line_' + tmp.split('_')[2] + '_' + tmp.split('_')[3]).attr('display', 'block');
                                d3.select('#id_bar_' + tmp.split('_')[2] + '_' + tmp.split('_')[3]).attr('fill', '#F9B100');
                                d3.select('#id_grRect_' + tmp.split('_')[2]).moveToBack();

                            })
                            .on('mouseout', function () {
                                var tmp = $(this).attr('id');
                                $('#id_text_' + tmp.split('_')[2] + '_' + tmp.split('_')[3]).attr('display', 'none');
                                $('#id_line_' + tmp.split('_')[2] + '_' + tmp.split('_')[3]).attr('display', 'none');
                                d3.select('#id_bar_' + tmp.split('_')[2] + '_' + tmp.split('_')[3]).attr('fill', '#aaaaaa');
                            });
                    }
                    if (p_catID[it_d].catID === 3) {
                        d3.selectAll('#id_grRect_' + it_d)
                            .append("rect")
                            .attr("class", "cl_Rects")
                            .attr('id', 'id_bar_' + it_d + '_' + it_n)
                            .attr("x", margin.left + xScale[it_d](xStep[it_d][it_n]))
                            .attr('y', yScale[it_d](yStep[it_d][it_n]) + margin.bottom)
                            .attr('width', xScale[it_d](xStep[it_d][1]))
                            .attr("height", height - yScale[it_d](yStep[it_d][it_n]) - margin.top - margin.bottom)
                            .attr('y_value', yStep[it_d][it_n])
                            .attr('fill', '#aaaaaa')

                            .on('mouseover', function () {
                                var tmp = $(this).attr('id');
                                $('#id_text_' + tmp.split('_')[2] + '_' + tmp.split('_')[3]).attr('display', 'block');
                                $('#id_line_' + tmp.split('_')[2] + '_' + tmp.split('_')[3]).attr('display', 'block');
                                d3.select('#id_bar_' + tmp.split('_')[2] + '_' + tmp.split('_')[3]).attr('fill', '#9F2538');
                                d3.select('#id_grRect_' + tmp.split('_')[2]).moveToBack();

                            })
                            .on('mouseout', function () {
                                var tmp = $(this).attr('id');
                                $('#id_text_' + tmp.split('_')[2] + '_' + tmp.split('_')[3]).attr('display', 'none');
                                $('#id_line_' + tmp.split('_')[2] + '_' + tmp.split('_')[3]).attr('display', 'none');
                                d3.select('#id_bar_' + tmp.split('_')[2] + '_' + tmp.split('_')[3]).attr('fill', '#aaaaaa');
                            });
                    }
                }
            }
            res = 0.0;
        }
    } else {
        console.log("<1");
    }
    if(chk_pconn === 1) {
        cnt_info.animate({
            'width': '48em'
        }, 100);
    }
}
func_delMark = function (th) {
    marker[parseInt(th.attr('id').split('_')[1])] = undefined;
    minimapArr[parseInt(th.attr('id').split('_')[1])] = undefined;
    point[parseInt(th.attr('id').split('_')[1])] = undefined;
    p_point[parseInt(th.attr('id').split('_')[1])] = undefined;
    llBounds[parseInt(th.attr('id').split('_')[1])] = undefined;

    map.removeLayer(filteredmarker[parseInt(th.attr('id').split('_')[1])]);

    filteredmarker = marker.filter(x => x !== undefined);
    if (filteredmarker.length === 1) {
        if (chk_pconn === 1) {
            func_updatePolyLine();
            chk_pcSet = 0;
            info_icon.css('visibility', 'hidden');
            func_deletePolyLine();
            /*
            cnt_main.animate({
                'width': '100%'
            }, 100);

             */
            cnt_info.animate({
                'width': '88em'
            }, 100);
            cnt_nav.animate({
                'width': '0em', 'display': 'none'
            }, 100);
            cnt_info.animate({
                'height': 0 + (parseInt((filteredmarker.length - 1) / 3) * 20) + 'em'
            }, 100);
            $('.cl_footer').css('margin-top', (0 + parseInt((filteredmarker.length - 1) / 3) * 20) + 'em');
            id_MarkerConn.val("Verbindung setzen");
            iter_conn = 0;
        }
        if (id_MarkerConn.val() === 'Verbindung setzen') {
            it_infBt = ++it_infBt % 2;
        }
        chk_pconn = 0;
    }
    /*
    if (chk_pconn === 1) {
        func_updatePolyLine();
    }
    */

    //console.log(marker);
    th.remove();

    filteredmarker = marker.filter(x => x !== undefined);
    filteredminimaps = minimapArr.filter(x => x !== undefined);
    filteredPoint = point.filter(x => x !== undefined);
    filteredp_Point = p_point.filter(x => x !== undefined);
    filteredllBounds = llBounds.filter(x => x !== undefined);
    filteredpopupMap = popupMap.filter(x => x !== undefined);
    filteredpolygonLayer = polygonLayer.filter(x => x !== undefined);

    for (it_r = 0; it_r < filteredmarker.length; it_r++) {
        map.removeLayer(filteredmarker[it_r]);
    }

    marker = new Array();
    point = new Array();
    p_point = new Array();
    llBounds = new Array();
    minimapArr = new Array();
    popupMap = new Array();
    polygonLayer = new Array();

    info.children().remove();
    for (it_r = 0; it_r < filteredmarker.length; it_r++) {
        let svgEmb = '<svg id=\"Ebene_1\" xmlns=\"http://www.w3.org/2000/svg\" xmlns:xlink=\"http://www.w3.org/1999/xlink\" x=\"0px\" y=\"100px\" viewBox=\"0 0 1000 1000\" xml:space=\"preserve\"><style type=\"text/css\">.st0{fill:#FF3333;}.cl_nrT{font-size:20em;fill:#FF3333;}</style><g><text x=\"65%\" y=\"95%\" id=\"id_markNr_' + it_r + '\" class=\"cl_nrT\">' + it_r + '</text><path id=\"id_path\" class=\"st0\" d=\"M500,42.7c162.1,0,294,131.9,294,294c0,51.6-13.7,102.4-39.5,147L500,924.7l-254.5-441c-25.8-44.6-39.5-95.4-39.5-147C206,174.5,337.9,42.7,500,42.7L500,42.7z M500,451c63,0,114.3-51.3,114.3-114.3S563,222.4,500,222.4s-114.3,51.3-114.3,114.3S437,451,500,451z M500,10c-180.4,0-326.7,146.3-326.7,326.7c0,59.6,16,115.3,43.9,163.3L500,990l282.8-490c27.8-48.1,43.9-103.8,43.9-163.3C826.6,156.3,680.4,10,500,10L500,10L500,10z M500,418.3c-45.1,0-81.7-36.5-81.7-81.6s36.6-81.6,81.7-81.6s81.6,36.6,81.6,81.6C581.7,381.8,545.1,418.3,500,418.3L500,418.3z\"/></g></svg>';
        marker[it_r] = L.marker([filteredmarker[it_r].getLatLng().lat, filteredmarker[it_r].getLatLng().lng], {
            clickable: true,
            draggable: true,
            icon: L.divIcon({
                html: svgEmb,
                iconSize: [30, 30],
                iconAnchor: [15, 30],
                popupAnchor: [0, -50]
            })
        }).on('dragstart', function (e) {
        }).on('drag', function (e) {
            chk_cl = 0;
            //$('.markers').change();
        }).on('drop', function (e) {
            chk_cl = 1;
            $('.markers').change();
        }).on('dragend', function (e) {
            chk_cl = 2;
            $('.markers').change();
            if (chk_pconn === 1) {
                func_updatePolyLine();
                //$('#ic_info').attr('visibility','hidden');
                /*
                cnt_main.animate({
                    'width': '65%'
                }, 100);
                */
                cnt_info.animate({
                    'width': '48em'
                }, 100);
                cnt_nav.animate({
                    'width': '52em', 'display': 'block'
                }, 100);
            }
        });
    }
    filteredmarker = marker.filter(x => x !== undefined);
    if (filteredmarker.length > 1 && it_infBt === 1) {
        if (info_icon.css('visibility') === 'hidden') {
            it_infBt = ++it_infBt % 2;
        }
    }
    func_widthChk(filteredmarker);
    for (it_r = 0; it_r < filteredmarker.length; it_r++) {
        point[it_r] = map.latLngToLayerPoint(marker[it_r].getLatLng());
        point[it_r] = map.layerPointToLatLng(point[it_r]);
        p_point[it_r] = point[it_r];
        // page 14 Map.locate <watch, enableHighAccuracy, maxZoom>
        marker[it_r].addTo(map).bindPopup("<div class='cl_popup' id='id_popup_" + it_r + "'><div class=\"cl_headID\"><span class=\"cl_IDred\"> ID " + it_r + " </span> Coords: " + p_point[it_r] + "</div><div class='cl_esysInf' id='id_esysInf_" + it_r + "'></div></div>");
        info.append('<div class="markers" id="marker_' + it_r + '" onchange="func_updateID($(this))"><div class="minimapNr"><span class=\"cl_IDred\"> ID<br>' + it_r + '</span></div><button onclick="func_delMark($(this).parent())" type="button" class="cl_delMark" id="del_mark_' + it_r + '"></button><div class="cl_mark" id="id_mark_' + it_r + '">Lat: <input type="number" min="-90.000000" max="90.000000" step="0.000001" value="' + p_point[it_r].lat + '" onchange="func_nPosLatLng(' + it_r + ');"></input> Lng: <input type="number" min="-90.000000" max="90.000000" step="0.000001" value="' + p_point[it_r].lng + '" onchange="func_nPosLatLng(' + it_r + ');"></input></div><div class="cl_cntInf"></div><div class="cl_popupmap" id="popup-map_' + it_r + '"></div><div class="cl_minimap" id="minimap_' + it_r + '"></div></div></div></div>');
        minimapArr[it_r] = L.map('minimap_' + it_r, {
            doubleClickZoom: false,
            closePopupOnClick: false,
            dragging: false,
            zoomControl: false,
            zoomSnap: true,
            zoomDelta: 1,
            trackResize: false,
            touchZoom: false,
            scrollWheelZoom: false,
            center: [p_point[it_r].lat, p_point[it_r].lng],
            zoom: 14
        });
        popupArr[it_r] = L.popup({
            closeOnClick: false,
            autoClose: false
        })
            .setLatLng(p_point[it_r]);
        llBounds[it_r] = L.latLngBounds(L.latLng(marker[it_r].getLatLng().lat - 0.010, marker[it_r].getLatLng().lng - 0.010), L.latLng(marker[it_r].getLatLng().lat + 0.010, marker[it_r].getLatLng().lng + 0.010));
        minimapBox[it_r] = func_createPolygon(llBounds[it_r]);
        //minimapArr[it_r].setView(marker[it_r].getLatLng(),19);
        //console.log(minimapBox[it_r]);
        $('#minimap_' + it_r).append(minimapArr[it_r]);
        iterArr.push({'id': it_r, 'text': info, 'minimap': minimapArr[it_r]});
        mapLink =
            '<a href="http://www.esri.com/">Esri</a>';
        wholink =
            'i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community';
        L.tileLayer(
            'http://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
                attribution: '&copy; ' + mapLink + ', ' + wholink,
            }).addTo(minimapArr[it_r]);
        //minimapArr[it_r].fitBounds(minimapBox[it_r]);
        if (chk_pconn === 0) {
            info_icon.css('visibility', 'hidden');
            if (!$('input.cl_cbEsys:checked').length) {

                bt_ecosysCB.click();
            } else {
                //func_reqEcosys();
            }
            //func_reqSpecies();
        }
        filteredmarker[it_r].fire('dragend');
    }
    if (chk_pconn === 1) {
        func_updatePolyLine();
    }
    if (chk_pconn === 0) {
        /*
        cnt_main.animate({
            'width': '100%'
        }, 100);

         */
        cnt_info.animate({
            'width': '88em'
        }, 100);
        cnt_nav.animate({
            'width': '0em', 'display': 'none'
        }, 100);
        cnt_info.animate({
            'height': 0 + (parseInt((filteredmarker.length - 1) / 3) * 20) + 'em'
        }, 100);
        $('.cl_footer').css('margin-top', (0 + parseInt((filteredmarker.length - 1) / 3) * 20) + 'em');
    }
    if (chk_pconn === 1) {
        if (info_icon.css('visibility') === 'visible') {
            cnt_info.animate({
                'height': 8.5 + (parseInt((filteredmarker.length - 1) / 2) * 20) + 'em'
            }, 100);
            $('.cl_footer').css('margin-top', (8.5 + parseInt((filteredmarker.length - 1) / 2) * 20) + 'em');
        }
        if (info_icon.css('visibility') === 'hidden') {
            /*
            cnt_main.animate({
                'width': '100%'
            }, 100);

             */
            cnt_info.animate({
                'width': '88em'
            }, 100);
            cnt_nav.animate({
                'width': '0em', 'display': 'none'
            }, 100);
            cnt_info.animate({
                'height': 0 + (parseInt((filteredmarker.length - 1) / 3) * 20) + 'em'
            }, 100);
            $('.cl_footer').css('margin-top', (0 + parseInt((filteredmarker.length - 1) / 3) * 20) + 'em');
        }
    }
    if (filteredmarker.length === 0) {
        cnt_map.animate({
            'height': '100%'
        }, 100);
        cnt_info.animate({
            'height': '0%',
        }, 100);
        bt_close_mark.hide();
        info.hide();
        $('.cl_footer').css('margin-top', '0%');
        it_mmBt = ++it_mmBt % 2;
    }
    it_0 = filteredmarker.length;
};
func_updateID = function (tmpT) {
    point[parseInt(tmpT.attr('id').split('_')[1])] = map.latLngToLayerPoint(marker[parseInt(tmpT.attr('id').split('_')[1])].getLatLng());
    point[parseInt(tmpT.attr('id').split('_')[1])] = map.layerPointToLatLng(point[parseInt(tmpT.attr('id').split('_')[1])]);
    $('#id_mark_' + parseInt(tmpT.attr('id').split('_')[1])).html("Lat: <input id='id_lat_" + parseInt(tmpT.attr('id').split('_')[1]) + "' type='number' min='-90.000000' max='90.000000' step='0.000001' value='" + point[parseInt(tmpT.attr('id').split('_')[1])].lat + "' onchange='func_nPosLatLng(" + parseInt(tmpT.attr('id').split('_')[1]) + ");'></input> Lng: <input type='number' id='id_lng_" + parseInt(tmpT.attr('id').split('_')[1]) + "' min='-90.000000' max='90.000000' step='0.000001' value='" + point[parseInt(tmpT.attr('id').split('_')[1])].lng + "' onchange='func_nPosLatLng(" + parseInt(tmpT.attr('id').split('_')[1]) + ");'/>");
    p_point[parseInt(tmpT.attr('id').split('_')[1])] = point[parseInt(tmpT.attr('id').split('_')[1])];

    marker[parseInt(tmpT.attr('id').split('_')[1])].bindPopup("<div class='cl_popup' id='id_popup_" + parseInt(tmpT.attr('id').split('_')[1]) + "'><div id='id_coords'><div class=\"cl_headID\"><span class=\"cl_IDred\"> ID " + parseInt(tmpT.attr('id').split('_')[1]) + "</span> Coords: " + p_point[parseInt(tmpT.attr('id').split('_')[1])] + "</div><div class='cl_esysInf' id='id_esysInf_" + parseInt(tmpT.attr('id').split('_')[1]) + "'></div></div>", {
        minWidth: "43em"
    });
    minimapArr[parseInt(tmpT.attr('id').split('_')[1])].setView(point[parseInt(tmpT.attr('id').split('_')[1])], 14);

    var tt_0 = parseInt(tmpT.attr('id').split('_')[1]);
    if (ly_ecosys !== undefined) {
        // Assuming you have a Leaflet map object named "map"
        var latlng = p_point[tt_0];
        var pt = map.latLngToContainerPoint(latlng);
        var size = map.getSize();
        var params = {
            request: 'GetFeatureInfo',
            service: 'WMS',
            version: '1.1.1',
            layers: ly_ecosys.wmsParams.layers,
            styles: '',
            bbox: map.getBounds().toBBoxString(),
            width: size.x,
            height: size.y,
            format: 'image/png',
            transparent: true,
            opacity: 0.4,
            query_layers: ly_ecosys.wmsParams.layers,
            info_format: 'application/json',
            feature_count: 1,
            x: Math.round(pt.x),
            y: Math.round(pt.y)
        };

        var url = 'https://spatial.biodiversityatlas.at/geoserver/ALA/wms?' + Object.keys(params).map(function (key) {
            return encodeURIComponent(key) + '=' + encodeURIComponent(params[key]);
        }).join('&');
        /*
        var latlng = marker[tt_0].getLatLng();
        var bbox = map.getBounds().toBBoxString();
        var size = map.getSize();
        var url = "https://spatial.biodiversityatlas.at/geoserver/ALA/wms?service=WMS&version=1.1.0&request=GetFeatureInfo&layers=" + ly_ecosys.wmsParams.layers + "&query_layers=" + ly_ecosys.wmsParams.layers + "&info_format=application/json&srs=EPSG:4326&format=image/svg";
         */
        $.ajax({
            url: url,
            success: function (data) {

                // Get the feature that was clicked
                result = data.features[0]['properties'];
                var clickedFeature = data.features[0];

                // Create a new map object within the popup
                if (popupMap[tt_0] != undefined) popupMap[tt_0].remove();
                popupMap[tt_0] = L.map('popup-map_' + tt_0, {
                    dragging: false,
                    zoomControl: false
                }).setView(latlng, map.getZoom());

                // Create a marker at the clicked point

                // Add a TileLayer to the popup map
                L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                    attribution: 'Map data © <a href="https://openstreetmap.org">OpenStreetMap</a> contributors'
                }).addTo(popupMap[tt_0]);

                L.marker(marker[tt_0].getLatLng(), {
                    clickable: false,
                    draggable: false,
                    icon: L.divIcon({
                        html: "<svg width='4' height='4'> <circle cx='2' cy='2' r='2' fill='none' stroke='#ff0000' stroke-width='1' /> </svg>",
                        iconSize: [4, 4],
                        iconAnchor: [0, 0],
                        popupAnchor: [-15, -15]
                    })
                }).addTo(popupMap[tt_0]);

                // Create a GeoJSON layer for the clicked polygon
                if (clickedFeature !== undefined) {
                    polygonLayer[tt_0] = L.geoJSON(clickedFeature.geometry).addTo(popupMap[tt_0]);
                    //popupMap[tt_0].setZoom(map.getZoom());
                    // Fit the map view to the extent of the polygon layer
                    popupMap[tt_0].flyToBounds(polygonLayer[tt_0].getBounds(), { duration: 0 });
                    console.log("update");
                }
            }
        });
        $('.cl_popupmap').css('display', 'block');
    } else {
        $('.cl_popupmap').css('display', 'none');
    }
    if ($('#id_addLayer option:selected').val() === 'noL') {
        $('.cl_popupmap').css('display', 'none');
    }
};
latlngToTilePixel = function (latlng, crs, zoom, tileSize, pixelOrigin) {
    var point = new Object();
    const layerPoint = crs.latLngToPoint(latlng, zoom).floor()
    const tile = layerPoint.divideBy(tileSize).floor()
    const tileCorner = tile.multiplyBy(tileSize).subtract(pixelOrigin)
    const tilePixel = layerPoint.subtract(pixelOrigin).subtract(tileCorner)
    console.log(layerPoint);
    console.log(tile);
    console.log(tileCorner);
    console.log(tilePixel);
    point.x = tile;
    point.y = tilePixel;
    return point;
}
func_nPosLatLng = function (id_val) {
    marker[id_val].setLatLng(L.latLng($('#id_lat_' + id_val).val(), $('#id_lng_' + id_val).val()));
    if (chk_pconn === 1) {
        func_updatePolyLine();
    }
}
func_submEsys = function () {
    console.log($('input.cl_cbEsys:checked').length);
    if ($('input.cl_cbEsys:checked').length) {
        func_updatePolyLine();
        bt_ecosysCB.click();
    } else {
        //alert("Bitte wählen sie zuerst eine Ökosystemleistung aus!");
    }
};
func_selectQ = function () {
    func_reqEcosys(marker);

    //func_reqSpecies();
};
func_selectP = function () {
    func_reqEcosys(marker);
    //func_reqSpecies();
};
if(chk_pconn === 0) {
    info_icon.css('visibility', 'hidden');
}
info_icon.on('click', function (e) {
    if (chk_pconn === 1) {
        if (it_infBt == 0) {
            /*
            cnt_main.animate({
                'width': '65%'
            }, 100);

             */
            cnt_info.animate({
                'width': '48em'
            }, 100);
            cnt_nav.animate({
                'width': '52em', 'display': 'block'
            }, 100);
            cnt_info.animate({
                'height': 8.5 + (parseInt((filteredmarker.length - 1) / 2) * 20) + 'em'
            }, 100);
            $('.cl_footer').css('margin-top', (8.5 + parseInt((filteredmarker.length - 1) / 2) * 20) + 'em');
        }
        if (it_infBt == 1) {
            /*
            cnt_main.animate({
                'width': '100%'
            }, 100);

             */
            cnt_info.animate({
                'width': '88em'
            }, 100);
            cnt_nav.animate({
                'width': '0em', 'display': 'none'
            }, 100);
            cnt_info.animate({
                'height': 0 + (parseInt((filteredmarker.length - 1) / 3) * 20) + 'em'
            }, 100);
            $('.cl_footer').css('margin-top', (0 + parseInt((filteredmarker.length - 1) / 3) * 20) + 'em');
        }
        it_infBt = ++it_infBt % 2;
    }
});
bt_close_mark.on('click', function (e) {
    filteredmarker = marker.filter(x => x !== undefined);
    if (filteredmarker.length > 0 && marker[0] !== undefined) {
        if (it_mmBt == 0) {
            cnt_map.animate({
                'height': '100%'
            }, 100);
            cnt_info.animate({
                'height': '0%',
            }, 100);
            bt_close_mark.html('Minimaps öffnen');
            bt_close_mark.attr('data-i18n', 'Minimaps öffnen');
            info.hide();
        }
        if (it_mmBt == 1) {
            cnt_map.animate({
                'height': '78%'
            }, 100);
            if (chk_pconn === 0) {
                cnt_info.animate({
                    'height': 0 + ((filteredmarker.length - 1 / 3) * 20) + 'em'
                }, 100);
            }
            if (chk_pconn === 1) {
                cnt_info.animate({
                    'height': 8.5 + ((filteredmarker.length - 1 / 2) * 20) + 'em'
                }, 100);
            }
            bt_close_mark.html('Minimaps schließen');
            bt_close_mark.attr('data-i18n', 'Minimaps schließen');
            info.show();
        }
        it_mmBt = ++it_mmBt % 2;
    }
});
var map = L.map('map', {
    center: [48.3805228, 15.9558588],
    zoom: 8
});
map.locate({
    setView: false
});
map.on('popupopen', function (e) {
    if (!$('input.cl_cbEsys:checked').length) {
        //("Bitte wählen sie zuerst eine Ökosystemleistung aus!");
        bt_ecosysCB.click();
    } else {
        chk_pcSet = 0;
        func_reqEcosys(new Array(marker[$(e.popup._content).attr('id').split('_')[2]]), $(e.popup._content).attr('id').split('_')[2]);
        if(chk_lyClick === 1) {
            func_reqSpecies();
        }
    }
});
map.on('popupclose', function (e) {
    chk_lyClick = 0;
});
map.on('zoomend', function (e) {
    var currZoom = map.getZoom();
    var diff = prevZoom - currZoom;
    prevZoom = currZoom;
});
/*
map.on('locationfound', function(e) {
    alert('Location found: ' + e.latlng.lat + ' ' + e.latlng.lng);
});
map.on('locationerror', function(e) {
    alert('Location error: ' + e.message + '[' + e.code + ']');
});

 */
func_initMap = function () {
    cnt_nav.css('width', '0em');
    cnt_info.css('width', '88em');
    if (LayerMap !== undefined) {
        map.removeLayer(LayerMap);
    }
    for(it_tl = 0; it_tl < topLayer.length; it_tl++) {
        if(topLayer[it_tl] !== undefined) {
            map.removeLayer(topLayer[it_tl]);
        }
    }
    if (chk_map == 0) {
        LayerMap = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        }).addTo(map);
        if ($('.cl_cbEsys:checkbox:checked').length !== 0) {
            for(it_tl = 0; it_tl < topLayer.length; it_tl++) {
                if(topLayer[it_tl] !== undefined) {
                    topLayer[it_tl].addTo(map);
                }
            }
        }
    }
    if (chk_map == 1) {
        LayerMap = L.tileLayer('https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png', {
            attribution: 'Map data: &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, <a href="http://viewfinderpanoramas.org">SRTM</a> | Map style: &copy; <a href="https://opentopomap.org">OpenTopoMap</a> (<a href="https://creativecommons.org/licenses/by-sa/3.0/">CC-BY-SA</a>)'
            // page 14 Map.locate <watch, enableHighAccuracy, maxZoom>
        }).addTo(map);
        if ($('.cl_cbEsys:checkbox:checked').length !== 0) {
            for(it_tl = 0; it_tl < topLayer.length; it_tl++) {
                if(topLayer[it_tl] !== undefined) {
                    topLayer[it_tl].addTo(map);
                }
            }
        }
    }
    if (chk_map == 2) {
        mapLink =
            '<a href="http://www.esri.com/">Esri</a>';
        wholink =
            'i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community';
        LayerMap = L.tileLayer(
            'http://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
                attribution: '&copy; ' + mapLink + ', ' + wholink
            }).addTo(map);
        if ($('.cl_cbEsys:checkbox:checked').length !== 0) {
            for(it_tl = 0; it_tl < topLayer.length; it_tl++) {
                if(topLayer[it_tl] !== undefined) {
                    topLayer[it_tl].addTo(map);
                }
            }
        }
    }
    if (ly_ecosys !== undefined) {
        var layer_name = $('#id_addLayer option:selected').text();
        if ($('#id_addLayer option:selected').val() === 'noL') {
            map.removeLayer(ly_ecosys);
            for(it_l = 0; it_l < popupMap.length; it_l++) {
                popupMap[it_l].removeLayer(popupArr[it_l]);
            }
        }
        ly_ecosys = L.tileLayer.wms('https://spatial.biodiversityatlas.at/geoserver/ALA/wms', {
            format: 'image/svg',
            opacity: 0.3,
            layers: "ALA:" + layer_name
        });
        ly_ecosys.addTo(map);
    }

    $('#id_addLayer').change(function () {
        if (ly_ecosys !== undefined) {
            map.removeLayer(ly_ecosys);
        }
        var layer_name = $('#id_addLayer option:selected').text();
        ly_ecosys = L.tileLayer.wms('https://spatial.biodiversityatlas.at/geoserver/ALA/wms', {
            format: 'image/svg',
            opacity: 0.3,
            layers: "ALA:" + layer_name
        });
        ly_ecosys.addTo(map);
        if (ly_ecosys !== undefined) {
            filteredmarker = marker.filter(x => x !== undefined);
            for (it_r = 0; it_r < filteredmarker.length; it_r++) {
                filteredmarker[it_r].fire('dragend');
            }
        }

    });    /*
    var it_p = 0;
    map.on('click', function (e) {
    });

     */
}
map.on('click', function(e) {
    //console.log(e.latlng);
    var pt = map.latLngToContainerPoint(e.latlng);
    var size = map.getSize();
    if(ly_ecosys !== undefined) {
        var params = {
            request: 'GetFeatureInfo',
            service: 'WMS',
            version: '1.1.1',
            layers: ly_ecosys.wmsParams.layers,
            styles: '',
            bbox: map.getBounds().toBBoxString(),
            width: size.x,
            height: size.y,
            format: 'image/png',
            transparent: true,
            query_layers: ly_ecosys.wmsParams.layers,
            info_format: 'application/json',
            feature_count: 1,
            x: Math.round(pt.x),
            y: Math.round(pt.y)
        };

        var url_wms = 'https://spatial.biodiversityatlas.at/geoserver/ALA/wms?' + Object.keys(params).map(function (key) {
            return encodeURIComponent(key) + '=' + encodeURIComponent(params[key]);
        }).join('&');
        /*
        var latlng = marker[tt_0].getLatLng();
        var bbox = map.getBounds().toBBoxString();
        var size = map.getSize();
        var url = "https://spatial.biodiversityatlas.at/geoserver/ALA/wms?service=WMS&version=1.1.0&request=GetFeatureInfo&layers=" + ly_ecosys.wmsParams.layers + "&query_layers=" + ly_ecosys.wmsParams.layers + "&info_format=application/json&srs=EPSG:4326&format=image/svg";
         */
        $.ajax({
            url: url_wms,
            type: 'GET',
            success: function (data) {
                // Get the feature that was clicked
                result = data.features[0]['properties'];
                console.log(result);
                var url_esys;
                var descrName;
                if(result['PB'] !== undefined) {
                    url_esys = 'https://ecosys.biodivdev.at/' + url_pathLData + '?packageID=' + opt_packageID.val() + '&layerID=' + $('#id_addLayer option:selected').val() + '&layerKey=' + result['PB'];
                    descrName = result['PB'];
                }
                if(result['HRNAME'] !== undefined) {
                    url_esys = 'https://ecosys.biodivdev.at/' + url_pathLData + '?packageID=' + opt_packageID.val() + '&layerID=' + $('#id_addLayer option:selected').val() + '&layerKey=' + result['HRNAME'];
                    descrName = result['HRNAME'];
                }
                if(result['VIERTELNAM'] !== undefined) {
                    url_esys = 'https://ecosys.biodivdev.at/' + url_pathLData + '?packageID=' + opt_packageID.val() + '&layerID=' + $('#id_addLayer option:selected').val() + '&layerKey=' + result['VIERTELNAM'];
                    descrName = result['VIERTELNAM'];
                }


                /*
                var latlng = marker[tt_0].getLatLng();
                var bbox = map.getBounds().toBBoxString();
                var size = map.getSize();
                var url = "https://spatial.biodiversityatlas.at/geoserver/ALA/wms?service=WMS&version=1.1.0&request=GetFeatureInfo&layers=" + ly_ecosys.wmsParams.layers + "&query_layers=" + ly_ecosys.wmsParams.layers + "&info_format=application/json&srs=EPSG:4326&format=image/svg";
                 */
                var it_r = 0;
                reqEcosys = new Array();
                ecosysName = new Array();
                $('input.cl_cbEsys:checked').each(function (iter, item) {
                    ecosysName.push($('#id_divName_' + item.id.split('_')[2]).html());
                    reqEcosys.push(item.id.split('_')[2]);
                    console.log(item.id);
                });
                packageID = opt_packageID.val();
                services = reqEcosys;
                $.ajax({
                    url: url_esys,
                    type: 'GET',
                    success: function (resp) {
                        var t_id = 'a';
                        d3.select('#id_esysInf_' + t_id).remove();
                        var it_d = 0;
                        var popupHtml = "<div class='cl_popup' id='id_popup_" + t_id + "'><div class=\"cl_headID\"><span class=\"cl_IDred\"></span>Bezeichnung: " + descrName + "</div><div class='cl_esysInf' id='id_esysInf_" + t_id + "'></div></div>";

                        /*
                        const coords0 = data.features[0].geometry.coordinates[0];
                        console.log(coords0[0]);

                        // Create WKT of the polygon
                        var phead = 'POLYGON((';
                        var ptail =  '))';
                        var pbody = "";
                        var cur_xy = "";
                        for(it_0 = 0; it_0 < coords0[0].length; it_0++) {
                            if(it_0 < coords0[0].length - 1) {
                                cur_xy = coords0[0][it_0][0].toFixed(4) + ' ' + coords0[0][it_0][1].toFixed(4) + ',';
                            }
                            if(it_0 === coords0[0].length - 1) {
                                cur_xy = coords0[0][it_0][0].toFixed(4) + ' ' + coords0[0][it_0][1].toFixed(4);
                            }
                            pbody += cur_xy;
                        }

                        var wkt_str = phead+pbody+cur_xy+ptail;
                        //var str_bBox = ""; //"MULTIPOLYGON(((" + polygonLayer[it_x]._latlngs[0][0].lng + "%20" + polygonLayer[it_x]._latlngs[0][0].lat + "," + polygonLayer[it_x]._latlngs[0][1].lng + "%20" + polygonLayer[it_x]._latlngs[0][1].lat + "," + polygonLayer[it_x]._latlngs[0][2].lng + "%20" + polygonLayer[it_x]._latlngs[0][2].lat + "," + polygonLayer[it_x]._latlngs[0][3].lng + "%20" + polygonLayer[it_x]._latlngs[0][3].lat + "," + polygonLayer[it_x]._latlngs[0][0].lng + "%20" + polygonLayer[it_x]._latlngs[0][3].lat + "," + polygonLayer[it_x]._latlngs[0][0].lng + "%20" + polygonLayer[it_x]._latlngs[0][0].lat + ")))";
                        var url_linkBioc = "https://biocache.biodiversityatlas.at/occurrences/search?q=*%3A*&qc=&wkt=" + wkt_str;
                        var url_biocache_ws = 'https://biocache-ws.biodiversityatlas.at/occurrence/facets.json?q=*:*&qc=&wkt=' + wkt_str + '&facets=taxon_name'; //"https://biocache-ws.biodiversityatlas.at/occurrence/facets.json?q=*:*&qc=&wkt=" + str_bBox + "&facets=taxon_name";
                        $.ajax({
                            url: url_biocache_ws,
                            type: 'GET',
                            success: function (resp) {
                                if(('.cl_clop') != undefined) {
                                    $('.cl_clop').remove();
                                }
                                $('.cl_headID').append('<div class="cl_clop"><a target="_blank" href="' + url_linkBioc + '"<span><i data-i18n="Unterschiedliche Arten">Unterschiedliche Arten: ' + resp[0].count + '</i></span></div>');
                            }
                        });
                        */
                        var popup = L.popup({
                            minWidth: "43em"
                        })
                            .setLatLng(e.latlng)
                            .setContent(popupHtml)
                            .openOn(map);


                        var qtArr = new Array();
                        var absData = new Array();

                        //$('#id_esysInf_' + it_e).append("<div id='id_reqInf_" + it_e + "'>" + marker[it_e].getLatLng() + "</div>");
                        d3.select('#id_esysInf_' + t_id)
                            .append('div')
                            .attr('id', 'id_chr_' + t_id)
                            .attr('class', 'cl_chr cl_row');
                        var svgLArr = new Array();
                        catID = new Array();
                        var it_n = 0;
                        for (it_d = 0; it_d < reqEcosys.length; it_d++) {
                            catID[it_n] = new Object();
                            for (it_f = 0; it_f < resp['data'].length; it_f++) {
                                if (parseInt(reqEcosys[it_d]) === resp['data'][it_f]['id']) {
                                    absData.push(resp['data'][it_f]);
                                    svgLArr.push(resp['data'][it_f]['svg']);
                                    continue;
                                }
                            }
                            catID[it_n].catID = parseInt($('#id_esys_' + parseInt(reqEcosys[it_d])).parent().parent().attr('class').split('cl_catL_')[1].split(' ')[0]);
                            it_n++;
                        }
                        var quantArr = new Array();
                        var elemAObj = new Object();
                        console.log(absData);
                        for (it_d = 0; it_d < absData.length; it_d++) {
                            d3.select('#id_chr_' + t_id)
                                .append('div')
                                .attr('id', 'id_descr_' + it_d)
                                .attr('class', 'cl_catL_' + catID[it_d].catID + ' cl_descr cl_column cl_table_' + it_d)
                                .attr('data-i18n', ecosysName[it_d])
                                .html('<div class="cl_tDw">' + ecosysName[it_d] + '<div>');
                            d3.select('#id_chr_' + t_id)
                                .append('div')
                                .attr('id', 'id_chrIcons_' + it_d)
                                .attr('class', ' cl_fixedW cl_column');
                            d3.select('#id_chr_' + t_id)
                                .append('div')
                                .attr('id', 'id_value_' + it_d)
                                .attr('class', ' cl_value cl_column cl_table_' + it_d)
                                .html('<div class="cl_tDw">' + parseInt(absData[it_d]['vals']['val']) + '</div>');
                            d3.select('#id_chr_' + t_id)
                                .append('div')
                                .attr('id', 'id_dimension_' + it_d)
                                .attr('class', 'cl_catR_' + catID[it_d].catID + ' cl_dimension cl_column cl_table_' + it_d)
                                .html('<div class="cl_tDw">' + absData[it_d]['dim'] + '</div>');
                            $.ajax({
                                url: url_ecosys + svgLArr[it_d],
                                dataType: "xml",
                                type: 'GET',
                                async: false,
                                success: function (data) {
                                    quantArr.push(data);
                                }
                            });
                        }

                        for (it_d = 0; it_d < quantArr.length; it_d++) {
                            quantArr[it_d].getElementsByTagName("svg")[0].removeAttribute('id');
                            quantArr[it_d].getElementsByTagName("svg")[0].setAttribute("width", "50");
                            quantArr[it_d].getElementsByTagName("svg")[0].setAttribute("height", "50");
                            for (it_t = 0; it_t < $(quantArr[it_d].getElementsByTagName("svg")[0]).children().length; it_t++) {
                                if ($(quantArr[it_d].getElementsByTagName("svg")[0]).children()[it_t].getAttribute('class') !== null) {
                                    for (it_h = 0; it_h < quantArr[it_d].getElementsByClassName($(quantArr[it_d].getElementsByTagName("svg")[0]).children()[it_t].getAttribute('class')).length; it_h++) {
                                        //console.log(quantArr[it_d].getElementsByClassName($(quantArr[it_d].getElementsByTagName("svg")[0]).children()[it_t].getAttribute('class'))[it_h]);
                                        elemObj = quantArr[it_d].getElementsByTagName("style")[0];
                                        for (it_r = 0; it_r < elemObj.innerHTML.split('}').length; it_r++) {
                                            //console.log( elemObj.innerHTML.split('}')[it_r].split('{')[0].replace('.', ''));
                                            if (quantArr[it_d].getElementsByClassName(elemObj.innerHTML.split('}')[it_r].split('{')[0].replace('.', '')).length > 0) {
                                                quantArr[it_d].getElementsByClassName(elemObj.innerHTML.split('}')[it_r].split('{')[0].replace('.', ''))[0].setAttribute('style', elemObj.innerHTML.split('}')[it_r].split('{')[1]);
                                            }
                                        }
                                        for (it_r = 0; it_r < elemObj.innerHTML.split('}').length; it_r++) {
                                            if (quantArr[it_d].getElementsByClassName(elemObj.innerHTML.split('}')[it_r].split('{')[0].replace('.', '')).length > 0) {
                                                quantArr[it_d].getElementsByClassName(elemObj.innerHTML.split('}')[it_r].split('{')[0].replace('.', ''))[0].removeAttribute('class');
                                            }
                                        }
                                    }
                                }
                            }
                            if (quantArr[it_d].getElementsByTagName("style")[0] !== undefined) {
                                quantArr[it_d].getElementsByTagName("style")[0].remove();
                            }
                            if(absData[it_d]['vals']['val'] > 0) {

                                for (it_s = 0; it_s < absData[it_d]['vals']['quantil'] + 1; it_s++) {
                                    d3.select('#id_chrIcons_' + it_d)
                                        .append('div')
                                        .attr('class', ' cl_quint')
                                        .attr('id', 'id_quint_' + it_d + '_' + it_s)
                                        .html(new XMLSerializer().serializeToString(quantArr[it_d]));
                                }
                            }
                            if(absData[it_d]['vals']['val'] === 0) {
                                d3.select('#id_chrIcons_' + it_d)
                                    .append('div')
                                    .attr('class', ' cl_quint')
                                    .attr('id', 'id_quint_' + it_d + '_' + 0);
                            }
                        }
                    }
                });
            }
        })
    }
});