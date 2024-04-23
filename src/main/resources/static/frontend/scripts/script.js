
function commonAjaxCall(url, data) {
    $.ajax({
        url: url,
        data: data,
        type: 'POST',
        dataType: 'json',
        success: function(response) {

        },
        error: function(error) {
            console.error('Error:', error);
        }
    });
}
/**
 * This script handles various dynamic interactions and data loading for a biodiversity project.
 */
let url_pathServices = "api/services";
let url_pathLayers = "api/layers";
let url_pathLData = "api/layerData";
let url_pathPackages = "api/packages";
let url_pathRasterData = "api/rasterData";

let LayerMap;
let it_infBt = 0;
let it_mmBt = 0;
let chk_map = 0;
let it_0 = 0;
let it_m = 0;
let chk_cl = 0;
let chk_quint = 1;
let chk_pconn = 0;
let chk_pcSet = 0;
let chk_eSys = 0;
let chk_lMode = 0;
let str_bBox = "";
let submESys = $('#id_submEsys');
let bt_ecosysCB = $('#id_btnecosys');
let bt_Layermode = $('#id_btnLayer');
bt_Layermode.html('Layermodus auswählen');
let opt_packageID = $('#id_packageID').val(0);
let point = [];
let p_point = [];
let polygons = [];
let pLineGroup = L.layerGroup();
let poly = [];
let minimapArr = [];
let minimapBox = [];
let llBounds = [];
let p_point = [];
let popupArr = [];
let iterArr = [];
let tmp_marker_id = new Object();
let marker = [];
let info = $('#info');
let id_newMark = $('#id_btnNewMark');
let id_MarkerConn = $('#id_btnMarkConn');
let bt_close_inf = $('#bt_close');
let bt_close_mark = $('#bt_close_mark');
let cnt_id = $('#cnt_id');
let cnt_main = $('#cnt_main');
let cnt_nav = $('#cnt_nav');
let cnt_map = $('#cnt_map');
let cnt_info = $('#cnt_info');
let iter_conn = 0;
let iter_eSys = 0;
let iter_lMode = 0;
let prevZoom = 0;
let ly_ecosys;
let popupMap = [];
let polygonLayer = [];
let categories = [];
let catID = [];
let chk_lyClick = 0;
let id_fName = '';
let topLayer = [];

/*
let info_icon = $('#info_icon').append('<svg id="ic_info" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48">\n' +
    '  <circle cy="24" cx="24" r="24" fill="#36c"/>\n' +
    '  <g fill="#fff">\n' +
    '    <circle cx="24" cy="11.6" r="4.7"/>\n' +
    '    <path d="m17.4 18.8v2.15h1.13c2.26 0 2.26 1.38 2.26 1.38v15.1s0 1.38-2.26 1.38h-1.13v2.08h14.2v-2.08h-1.13c-2.26 0-2.26-1.38-2.26-1.38v-18.6"/>\n' +
    '  </g>\n' +
    '</svg>');

 */
let info_icon = $('#ic_info');
let do_translate = function () {
    $("[data-i18n]").each(function () {
        let prop = $(this).attr('data-i18n');
        $(this).i18n();
    });
}
func_init_i18n = function () {
    $.i18n().load({
        'en': url_i18n + 'messages.json',
        'de_AT': url_i18n + 'messages_de_AT.json'
    }).done(function () {

        if(location.href.split('lang=')[1] !== undefined) {
            $("html").attr("lang", location.href.split('lang=')[1]);
            $.i18n().locale = location.href.split('lang=')[1];
        } else {
            location.href = "https://ecosys.biodiversityatlas.at/?lang=de_AT";
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
            //
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

            let id_lName = resp['data'][0]['geoserverLayerName'];
// Define the URL for GetLegendGraphic service
            let legendURL = 'https://spatial.biodiversityatlas.at/geoserver/ows?service=WMS&request=GetLegendGraphic&format=image/png&layer=ECO:' + id_lName.toLowerCase() + '&width=20&height=20&legend_options=forceLabels:on';

            // Create a popup element
            let popup = document.createElement('div');
            popup.className = 'legend-popup';
            popup.id = 'id_lPopup_' + p_id;
            popup.innerHTML = '<img style="margin: 1.7em;" src="' + legendURL + '">';

            // Position the popup near the clicked icon
            // You'll need to adjust these values based on your UI layout
            let iconPosition = { top: 50, left: 50 }; // Example values, adjust as needed
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
    switch(p_id) {
        case "Trinkwasserversorgung": window.open( "https://biodiversityatlas.at/wp-content/uploads/2023/10/V05_Trinkwasserversorgung-aus-GW_online-Version_Vorlage-final.pdf");
            break;
        case "Grundwasser verfügbare Ressource": window.open( "https://biodiversityatlas.at/wp-content/uploads/2023/10/V05_Trinkwasserversorgung-aus-GW_online-Version_Vorlage-final.pdf");
            break;
        case "Holzzuwachs stoffliche Nutzung": window.open( "https://biodiversityatlas.at/wp-content/uploads/2023/10/V02_Holzzuwachs_forstl_Nutzung_I2_I3_online-Version_final.pdf");
            break;
        case "Holzzuwachs energetische Nutzung": window.open( "https://biodiversityatlas.at/wp-content/uploads/2023/10/V02_Holzzuwachs_forstl_Nutzung_I2_I3_online-Version_final.pdf");
            break;
        case "Holzzuwachs gesamt": window.open( "https://biodiversityatlas.at/wp-content/uploads/2023/10/V02_Holzzuwachs_forstl_Nutzung_I1_online-Version_final.pdf");
            break;
        case "Landwirtschaftlicher Ertrag Getreide": window.open( "https://biodiversityatlas.at/wp-content/uploads/2023/10/V01_Produktion-pflanzlicher-Rohstoffe_online-Version_final.pdf");
            break;
        case "Landwirtschaftlicher Ertrag Mais": window.open( "https://biodiversityatlas.at/wp-content/uploads/2023/10/V01_Produktion-pflanzlicher-Rohstoffe_online-Version_final.pdf");
            break;
        case "Landwirtschaftlicher Ertrag Soja": window.open( "https://biodiversityatlas.at/wp-content/uploads/2023/10/V01_Produktion-pflanzlicher-Rohstoffe_online-Version_final.pdf");
            break;
        case "Landwirtschaftlicher Ertrag Grünland": window.open( "https://biodiversityatlas.at/wp-content/uploads/2023/10/V01_Produktion-pflanzlicher-Rohstoffe_online-Version_final.pdf");
            break;
        case "Landwirtschaftlicher Ertrag Bestäubung": window.open( "https://biodiversityatlas.at/wp-content/uploads/2023/10/S15_Vielfalt_bestaeubender_Insekten_online_Version_final.pdf");
            break;
        case "Zustand Fließgewässer": window.open( "https://biodiversityatlas.at/wp-content/uploads/2023/10/S14_Natuerliche-Fliessgewaesser_online_Version_final.pdf");
            break;
        case "Unzerschnittene Lebensräume": window.open( "https://biodiversityatlas.at/wp-content/uploads/2023/10/S13_Unzerschnittene-Lebensraeume_online-Version_final.pdf");
            break;
        case "Naturnahe Lebensräume": window.open( "https://biodiversityatlas.at/wp-content/uploads/2023/10/S12_Arten-und_Lebensraumvielfalt_online-Version_final.pdf");
            break;
        case "Waldschutzgebiete": window.open( "https://biodiversityatlas.at/wp-content/uploads/2023/10/S11_NatuerlicheVielfalt_Wald_SchutzgebieteFE_online-Version_final.pdf");
            break;
        case "Objektschutzwald": window.open( "https://biodiversityatlas.at/wp-content/uploads/2023/10/S11_NatuerlicheVielfalt_Wald_SchutzgebieteFE_online-Version_final.pdf");
            break;
        case "Totholz": window.open( "https://biodiversityatlas.at/wp-content/uploads/2023/10/S11_Anteil_Totholz_online-Version_final.pdf");
            break;
        case "High Nature Value Farmland": window.open( "https://biodiversityatlas.at/wp-content/uploads/2023/10/S10_Natuerliche-Vielfalt-in-der-LW_HNVF_online-Version_final.pdf");
            break;
        case "Kohlenstoffvorrat": window.open( "https://biodiversityatlas.at/wp-content/uploads/2023/10/S08_Speicherung-von-CO2_online_Version_final.pdf");
            break;
        case "Selbstreinigungspotenzial Fließgewässer": window.open( "https://biodiversityatlas.at/wp-content/uploads/2023/10/S07_Selbstreinigungspotenzial-von-Fliessgewaessern_online-Version_final.pdf");
            break;
        case "Fruchbarer Boden Landwirtschaft": window.open( "https://biodiversityatlas.at/wp-content/uploads/2023/10/S06_Steckbrief_Fruchtbarer-Boden-LW-Nutzung_online-Version_final.pdf");
            break;
        case "Fruchtbarer Boden Forstwirtschaft": window.open( "https://biodiversityatlas.at/wp-content/uploads/2023/10/S06_Fruchtbarer-Boden_Forstwirtschaft_online-Version_final.pdf");
            break;
        case "Bestäubungspotenzial": window.open( "https://biodiversityatlas.at/wp-content/uploads/2023/10/S05_Bestaeubung-durch-Insekten_online-Version_final.pdf");
            break;
        case "Hochwasserschutz Wasserrückhalt": window.open( "https://biodiversityatlas.at/wp-content/uploads/2023/10/S04_Schutz_vor_HW-Hochwasserretention_online-Version_Vorlage-final.pdf");
            break;
        case "Hochwasserschutz Retention": window.open( "https://biodiversityatlas.at/wp-content/uploads/2023/10/S04_Schutz_vor_HW-Hochwasserretention_online-Version_Vorlage-final.pdf");
            break;
        case "": window.open( "https://biodiversityatlas.at/wp-content/uploads/2023/10/S03_Schutzleistung_Naturgefahren_online-Version_final.pdf");
            break;
        case "Erosionsschutz Landwirtschaft": window.open( "https://biodiversityatlas.at/wp-content/uploads/2023/10/S02_Schutz-vor-Erosion_online-Version_final.pdf");
            break;
        case "Erholung Wegenetz": window.open( "https://biodiversityatlas.at/wp-content/uploads/2023/10/K01_Erholungsleistung-Wander-Rad-Mountainbike_online-Version_final.pdf");
            break;
        case "Erholung Hausgärten": window.open( "https://biodiversityatlas.at/wp-content/uploads/2023/10/K01_Erholungsleistung-Hausgaerten_online-Version_final.pdf");
            break;
        case "Erholungswälder": window.open( "https://biodiversityatlas.at/wp-content/uploads/2023/10/K01_Erholungsleistung-Erholungswaelder_online-Version_final.pdf");
            break;
        case "Erholung Badegewässer": window.open( "https://biodiversityatlas.at/wp-content/uploads/2023/10/K01_Erholungsleistung-Badegewaesser_online-Version_final.pdf");
            break;
    }
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
        reqEcosys = [];
        ecosysName = [];
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

                id_fName = resp['data'][0]['geoserverLayerName'];
                let url_rdataTop = "https://spatial.biodiversityatlas.at/geoserver/wms";
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
                        opacity: 0.54,
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
        let it_x = 0;
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
    $('#id_numBt').on('click' , function() {
        map.closePopup();
        for (it_r = 0; it_r < marker.length; it_r++) {
            marker[it_r].fire('dragend');
        }
    });
});
commonAjaxCall(url_ecosys + url_pathPackages, JSON.stringify({"packageID":opt_packageID.val()}));
opt_packageID = $('#id_packageID').val(1);
commonAjaxCall(url_ecosys + url_pathServices + '?packageID=1', JSON.stringify({"packageID":opt_packageID.val()}));
for(it_se = 0; it_se < 3; it_se++) {
    for(it_i = 0; it_i < sortEsys[it_se].length; it_i++) {
        $("#sortable").append(sortEsys[it_se][it_i]);
    }
}
//$("#sortable").append("<button className='cl_submEsys' type='button' id='id_submEsys' onClick='func_submEsys();' data-i18n='bestätigen'>bestätigen</button>");
/*
commonAjaxCall(url_rdataTop, JSON.stringify({"packageID":opt_packageID.val()}));
    //$("#sortable").append("<button className='cl_submEsys' type='button' id='id_submEsys' onClick='func_submEsys();' data-i18n='bestätigen'>bestätigen</button>");
    map.closePopup();
}
});
});
func_connectTheDots = function (p_marker) {
let c = [];
let pt = [];
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
let reqMarker = [];
let reqEcosys = [];
let reqHashID = [];
let reqRefID = [];
let tmpLatLng = [];
let jsonReq = [];
let tmpMarker = [];
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
        let it_r = 0;
        reqEcosys = [];
        ecosysName = [];
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
                    let it_d = 0;
                    let qtArr = [];
                    let absData = [];
                    //$('#id_esysInf_' + it_e).append("<div id='id_reqInf_" + it_e + "'>" + marker[it_e].getLatLng() + "</div>");
                    d3.select('#id_esysInf_' + m_id)
                        .append('div')
                        .attr('id', 'id_chr_' + m_id)
                        .attr('class', 'cl_chr cl_row');

                    let svgLArr = [];
                    catID = [];
                    let it_n = 0;
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
                    let quantArr = [];
                    let elemAObj = new Object();
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
                            .html('<div class="cl_tDw">' + absData[it_d]['vals'][0]['val'].toFixed(2) + '</div>');
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
                                    //
                                    elemObj = quantArr[it_d].getElementsByTagName("style")[0];
                                    for (it_r = 0; it_r < elemObj.innerHTML.split('}').length; it_r++) {
                                        //
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
                        for (it_s = 0; it_s < 5; it_s++) {
                            if(it_s < absData[it_d]['vals'][0]['quantil'] + 1) {
                                d3.select('#id_chrIcons_' + it_d)
                                    .append('div')
                                    .attr('class', ' cl_quint')
                                    .attr('id', 'id_quint_' + it_d + '_' + it_s)
                                    .html(new XMLSerializer().serializeToString(quantArr[it_d]));
                            } else {
                                d3.select('#id_chrIcons_' + it_d)
                                    .append('div')
                                    .attr('class', ' cl_quint')
                                    .attr('id', 'id_quint_' + it_d + '_' + it_s)
                                    .html('<div style="background-color: #3f3f3f; width: 50px; height: 50px"></div>');
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
        reqEcosys = [];
        $('input.cl_cbEsys:checked').each(function (iter, item) {

            reqEcosys.push(item.id.split('_')[2]);
        });
        packageID = opt_packageID.val();
        services = reqEcosys;
        let latlngs = func_connectTheDots(filteredmarker).map((point) => L.latLng(point));
        let lengths = L.GeometryUtil.accumulatedLengths(latlngs);
        // Reduce all lengths to a single total length
        let totalLength = lengths[lengths.length - 1];

        if(parseInt($('#id_viewP option:selected').val()) === 0) {
            // Get number of points based on desired interval and total length
            let interval = 1000;
            $('#id_numIv').css('display', 'block');
            $('#id_numBt').css('display', 'block');
            $('#id_numMt').css('display', 'block');
            if($('#id_numIv').val() >= 1000) {
                interval = parseInt($('#id_numIv').val()); // input set
            }

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
                        reqRefID.push(new Object([{lat: toFixedTrunc(points[it_e].latLng.lat, 3)}, {lng: toFixedTrunc(points[it_e].latLng.lng, 3)}]));
                        reqMarker.push('(' + parseFloat(points[it_e].latLng.lng.toFixed(3)) + '/' + parseFloat(points[it_e].latLng.lat.toFixed(3)) + ')');
                    }
                    if (points.length === 1 && m_id !== undefined) {
                        reqRefID.push(new Object([{lat: toFixedTrunc(points[it_e].latLng.lat, 3)}, {lng: toFixedTrunc(points[it_e].latLng.lng, 3)}]));
                        reqMarker.push('(' + parseFloat(points[it_e].latLng.lng.toFixed(3)) + '/' + parseFloat(points[it_e].latLng.lat.toFixed(3)) + ')');
                    }
                }
            }

        }
        if(parseInt($('#id_viewP option:selected').val()) === 1) {
            // Get number of points based on desired interval and total length
            $('#id_numIv').css('display', 'none');
            $('#id_numBt').css('display', 'none');
            $('#id_numMt').css('display', 'none');
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
                        reqRefID.push(new Object([{lat: toFixedTrunc(points[it_e].latLng.lat, 3)}, {lng: toFixedTrunc(points[it_e].latLng.lng, 3)}]));
                        reqMarker.push('(' + parseFloat(points[it_e].latLng.lng.toFixed(3)) + '/' + parseFloat(points[it_e].latLng.lat.toFixed(3)) + ')');
                    }
                    if (points.length === 1 && m_id !== undefined) {
                        reqRefID.push(new Object([{lat: toFixedTrunc(points[it_e].latLng.lat, 3)}, {lng: toFixedTrunc(points[it_e].latLng.lng, 3)}]));
                        reqMarker.push('(' + parseFloat(points[it_e].latLng.lng.toFixed(3)) + '/' + parseFloat(points[it_e].latLng.lat.toFixed(3)) + ')');
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
                    let absData = [];
                    for (it_e = 0; it_e < marker.length; it_e++) {
                        $('#id_esysInf_' + it_e).append("<div id='id_reqInf_" + it_e + "'>" + marker[it_e].getLatLng() + "</div>");
                    }
                    catID = [];
                    let it_n = 0;
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
let it_x = 0;
let url_biocache_ws = '';
let url_linkBioc = '';
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
    url_biocache_ws = 'https://biocache.biodiversityatlas.at/ws/occurrence/facets.json?q=*%3A*&qc=&wkt=' + str_bBox + '&facets=taxon_name'; //"https://biocache-ws.biodiversityatlas.at/occurrence/facets.json?q=*:*&qc=&wkt=" + str_bBox + "&facets=taxon_name";
    $.ajax({
        url: url_biocache_ws,
        type: 'GET',
        success: function (resp) {
            if(('.cl_clop') != undefined) {
                $('.cl_clop').remove();
            }
            $('.cl_headID').append('<div class="cl_clop"><a target="_blank" href="' + url_linkBioc + '"<span><i title="Anzahl der Arten im Biodiversitäts-Atlas Österreich welche für diese Rasterzelle verortet sind (Number of species). Bei Klick auf den Link werden alle Fundvorkommen für die Rasterzelle, die im Atlas hinterlegt sind, in einem neuen Tab angezeigt."><span data-i18n="Anzahl der verorteten Arten">Anzahl der verorteten Arten</span> ' + resp[0].count + '</i></span></div>');
            do_translate();
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

    }
});
}
if (chk_lMode == 1) {

}
}
/*
func_mpClick = function () {
let it_x = 0;
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
        let layerName = [];
        $.each(resp.layers, function (index, item) { // Iterates through a collection
            if(item.name === 'gewaessernetz_owk_4326_iso_gesammelt') {
                layerName.push({'id': item.id, 'name': 'Gewässernetz Niederösterreich', 'nRef': item.name});
            }
            if(item.name === 'wegenetz_osm_4326_iso_gesammelt') {
                layerName.push({'id': item.id, 'name': 'Wegenetz Niederösterreich', 'nRef': item.name});
            }

            $("#id_addLayer").append( // Append an object to the inside of the select box
                $("<option></option>") // Yes you can do this.
                    .text(layerName[index].name)
                    .val(layerName[index].id)
                    .attr('tagName', layerName[index].nRef)
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
            'height': '54.7em'
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
            'height': '54.7em'
        }, 100);
        bt_close_mark.html('Minimaps schließen');
        bt_close_mark.attr('data-i18n', 'Minimaps schließen');
        info.show();
    }
    let tt_0 = it_0;
    let svgEmb = '<svg id=\"Ebene_1\" xmlns=\"http://www.w3.org/2000/svg\" xmlns:xlink=\"http://www.w3.org/1999/xlink\" x=\"0px\" y=\"100px\" viewBox=\"0 0 1000 1000\" xml:space=\"preserve\"><style type=\"text/css\">.st0{fill:#FF3333;}.cl_nrT{font-size:20em;fill:#FF3333;}</style><g><text x=\"65%\" y=\"95%\" id=\"id_markNr_' + it_0 + '\" class=\"cl_nrT\">' + it_0 + '</text><path id=\"id_path\" class=\"st0\" d=\"M500,42.7c162.1,0,294,131.9,294,294c0,51.6-13.7,102.4-39.5,147L500,924.7l-254.5-441c-25.8-44.6-39.5-95.4-39.5-147C206,174.5,337.9,42.7,500,42.7L500,42.7z M500,451c63,0,114.3-51.3,114.3-114.3S563,222.4,500,222.4s-114.3,51.3-114.3,114.3S437,451,500,451z M500,10c-180.4,0-326.7,146.3-326.7,326.7c0,59.6,16,115.3,43.9,163.3L500,990l282.8-490c27.8-48.1,43.9-103.8,43.9-163.3C826.6,156.3,680.4,10,500,10L500,10L500,10z M500,418.3c-45.1,0-81.7-36.5-81.7-81.6s36.6-81.6,81.7-81.6s81.6,36.6,81.6,81.6C581.7,381.8,545.1,418.3,500,418.3L500,418.3z\"/></g></svg>';
    marker[it_0] = L.marker([map.getCenter().lat, map.getCenter().lng], {
        clickable: true,
        draggable: true,
        icon: L.divIcon({
            html: svgEmb,
            iconSize: [60, 60],
            iconAnchor: [30, 60],
            popupAnchor: [0, -80]
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

        if(('.cl_clop') != undefined) {
            $('.cl_clop').remove();
        }
        chk_lyClick = 0;
    }).on('click', function() {

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
        let popupHtml = "<div class='cl_popup' id='id_popup_" + it_0 + "'><div class=\"cl_headID\"><span class=\"cl_IDred\"> ID " + it_0 + " </span>Coords: " + p_point[it_0] + "</div><div class='cl_esysInf' id='id_esysInf_" + it_0 + "'></div></div>";
        marker[it_0].addTo(map).bindPopup(popupHtml);

        info.append('<div class="markers" id="marker_' + it_0 + '" onchange="func_updateID($(this))"><div class="minimapNr"><span class=\"cl_IDred\"> ID<br>' + it_0 + '</span></div><button onclick="func_delMark($(this).parent())" type="button" class="cl_delMark" id="del_mark_' + it_0 + '"></button><div class="cl_mark" id="id_mark_' + it_0 + '">Lat: <input type="number" min="-90.000000" max="90.000000" step="0.001" value="' + p_point[it_0].lat.toFixed(3) + '" onchange="func_nPosLatLng(' + it_0 + ');"></input> Lng: <input type="number" min="-90.000000" max="90.000000" step="0.001" value="' + p_point[it_0].lng.toFixed(3) + '" onchange="func_nPosLatLng(' + it_0 + ');"></input></div><div class="cl_cntInf"></div><div class="cl_popupmap" id="popup-map_' + it_0 + '"></div><div class="cl_minimap" id="minimap_' + it_0 + '"></div></div></div></div>');
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
            attributionControl: false,
            center: [48.3805228, 15.9558588],
            zoom: 14
        });
        minimapArr[it_0].addControl(new L.Control.AttrScale({position: 'bottomright', metric: true}));
        $('.cl_minimap').find('.leaflet-control-attribution').css('visibility', 'hidden');
        popupArr[it_0] = L.popup({
            closeOnClick: false,
            autoClose: false
        })
            .setLatLng(p_point[it_0]);
        llBounds[it_0] = L.latLngBounds(L.latLng(marker[it_0].getLatLng().lat - 0.010, marker[it_0].getLatLng().lng - 0.010), L.latLng(marker[it_0].getLatLng().lat + 0.010, marker[it_0].getLatLng().lng + 0.010));
        minimapBox[it_0] = func_createPolygon(llBounds[it_0]);
        //minimapArr[it_0].setView(marker[it_0].getLatLng(),19);
        //
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
            let latlng = marker[tt_0].getLatLng();
            let bbox = map.getBounds().toBBoxString();
            let size = map.getSize();
            let pixelPosition = map.latLngToLayerPoint(marker[tt_0].getLatLng());
            let x = size.x * (pixelPosition.x / size.x);
            let y = size.y * (pixelPosition.y / size.y);
            let url = "https://spatial.biodiversityatlas.at/geoserver/ALA/wms?service=WMS&version=1.1.0&request=GetFeatureInfo&layers=" + ly_ecosys.wmsParams.layers + "&query_layers=" + ly_ecosys.wmsParams.layers + "&bbox=" + bbox + "&width=" + size.x + "&height=" + size.y + "&x=" + x + "&y=" + y + "&info_format=application/json&srs=EPSG:4326&format=image/svg";
            /*commonAjaxCall(url, &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors) */
            let popup = L.popup({
                minWidth: "43em"
            })
                .setLatLng(e.latlng)
                .setContent(popupHtml)
                .openOn(map);


            let qtArr = [];
            let absData = [];

            //$('#id_esysInf_' + it_e).append("<div id='id_reqInf_" + it_e + "'>" + marker[it_e].getLatLng() + "</div>");
            d3.select('#id_esysInf_' + t_id)
                .append('div')
                .attr('id', 'id_chr_' + t_id)
                .attr('class', 'cl_chr cl_row');
            let svgLArr = [];
            catID = [];
            let it_n = 0;
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
            let quantArr = [];
            let elemAObj = new Object();

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
                            //
                            elemObj = quantArr[it_d].getElementsByTagName("style")[0];
                            for (it_r = 0; it_r < elemObj.innerHTML.split('}').length; it_r++) {
                                //
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

                for (it_s = 0; it_s < 5; it_s++) {
                    if(it_s < absData[it_d]['vals']['quantil'] + 1) {
                        d3.select('#id_chrIcons_' + it_d)
                            .append('div')
                            .attr('class', ' cl_quint')
                            .attr('id', 'id_quint_' + it_d + '_' + it_s)
                            .html(new XMLSerializer().serializeToString(quantArr[it_d]));
                    } else {
                        d3.select('#id_chrIcons_' + it_d)
                            .append('div')
                            .attr('class', ' cl_quint')
                            .attr('id', 'id_quint_' + it_d + '_' + it_s)
                            .html('<div style="background-color: #3f3f3f; width: 50px; height: 50px"></div>');
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
    }
});