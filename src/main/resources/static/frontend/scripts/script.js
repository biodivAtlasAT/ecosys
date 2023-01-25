//var url_ecosys = "https://ecosys.biodivdev.at/";

var url_pathServices = "api/services";
var url_pathLayers = "api/layers";
var url_pathPackages = "api/packages";
var url_pathRasterData = "api/rasterData";

var it_infBt = 0;
var it_mmBt = 0;
var chk_map = 2;
var it_0 = 0;
var it_m = 0;
var chk_cl = 0;
var chk_pconn = 0;
var chk_pcSet = 0;
var chk_eSys = 0;
var chk_lMode = 0;
var str_bBox = "";
var submESys = $('#id_submEsys');
var bt_ecosysCB = $('#id_btnecosys');
var bt_Layermode = $('#id_btnLayer');
bt_Layermode.attr('data-i18n', '[value]Layermodus auswählen');
var opt_packageID = $('#id_packageID').val(1);
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
var info_icon = $('#info_icon').append('<svg id="ic_info" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48">\n' +
    '  <circle cy="24" cx="24" r="24" fill="#36c"/>\n' +
    '  <g fill="#fff">\n' +
    '    <circle cx="24" cy="11.6" r="4.7"/>\n' +
    '    <path d="m17.4 18.8v2.15h1.13c2.26 0 2.26 1.38 2.26 1.38v15.1s0 1.38-2.26 1.38h-1.13v2.08h14.2v-2.08h-1.13c-2.26 0-2.26-1.38-2.26-1.38v-18.6"/>\n' +
    '  </g>\n' +
    '</svg>');
var do_translate = function () {
    $("[data-i18n]").each(function () {
        var prop = $(this).attr('data-i18n');
        if ($(this).attr('class') === 'cl_button') {
            $(this).attr('data-i18n', prop).i18n();
            //$(this).attr('value', prop.replace('[value]', ''));
        }
        if ($(this).attr('class') === 'cl_option') {
            $(this).html(prop).i18n();
        }
    });
}
func_init_i18n = function() {
    $.i18n().load({
        'en': i18n_path_to_messages + 'i18n/messages.json',
        'de_AT': i18n_path_to_messages + 'i18n/messages_de_AT.json'
    }).done(function () {
        console.log(location.href.split('lang=')[1]);
        $("html").attr("lang", location.href.split('lang=')[1]);
        $.i18n().locale = location.href.split('lang=')[1];
        do_translate();
    });
}
func_init_i18n();
$('input').attrchange({
        trackValues: true, /* Default to false, if set to true the event object is
                updated with old and new value.*/
        callback: function (event) {
            if(event['newValue'].split('[value]').length > 1) {
                //console.log($(event['target']));
                $("html").attr("lang", location.href.split('lang=')[1]);
                $.i18n().locale = location.href.split('lang=')[1];
                if ($(event['target']).attr('class') === 'cl_button') {
                    $(event['target']).val($.i18n().parse(event['newValue'].split('[value]')[1]));
                    //$(event['target']).attr('data-i18n', event['newValue']).i18n();
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
        console.log(resp);
        $("#id_packageID option").remove(); // Remove all <option> child tags.
        $.each(resp.packages, function (index, item) { // Iterates through a collection
            $("#id_packageID").append( // Append an object to the inside of the select box
                $("<option></option>") // Yes you can do this.
                    .text(item.name)
                    .val(item.id)
            );
        });
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
        console.log(resp);
        $.each(resp.services, function (index, item) { // Iterates through a collection
            $(".cl_ecosys").append("<div><input class='cl_cbEsys' id='id_esys_" + item.id + "' type='checkbox'>" + item.name + "</input></div>");
        });
        $(".cl_ecosys").append("<input class='cl_submEsys' type='button' id='id_submEsys' onclick='func_submEsys();' value='bestätigen'/>");
    }
});
$('#id_mapLayer').change(function () {
    chk_map = $(this).val();
    func_initMap();
});
opt_packageID.on('change', function () {
    $(".cl_ecosys").children().remove();
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
            console.log(resp);
            $.each(resp.services, function (index, item) { // Iterates through a collection
                $(".cl_ecosys").append("<div><input class='cl_cbEsys' id='id_esys_" + item.id + "' type='checkbox'>" + item.name + "</input></div>");
            });
            $(".cl_ecosys").append("<input class='cl_submEsys' type='button' id='id_submEsys' onclick='func_submEsys();' value='bestätigen'/>");
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
    if (!$(".cl_cbEsys:checkbox:checked").length) {
        alert("Bitte wählen sie zuerst eine Ökosystemleistung aus!");
        bt_ecosysCB.click();
    } else {
        func_reqEcosys(marker);
    }
    func_reqSpecies();
}
func_reqEcosys = function (m_th, m_id) {
    $('.cl_esysInf').children().remove();
    var reqMarker = new Array();
    var reqEcosys = new Array();
    var tmpLatLng = new Array();
    var jsonReq = new Array();
    filteredmarker = m_th.filter(x => x !== undefined);
    if (filteredmarker.length) {
        for (it_e = 0; it_e < m_th.length; it_e++) {
            if (m_th[it_e] != undefined) {
                if (m_th.length > 1 && m_id === undefined) {
                    reqMarker.push('(' + parseFloat(m_th[it_e].getLatLng().lng) + '/' + parseFloat(m_th[it_e].getLatLng().lat) + ')');
                }
                if (m_th.length === 1 && m_id !== undefined) {
                    reqMarker.push('(' + parseFloat(m_th[it_e].getLatLng().lng) + '/' + parseFloat(m_th[it_e].getLatLng().lat) + ')');
                }
            }
        }
        if (filteredmarker.length === 1) {
            chk_pcSet = 0;
        }
        if (reqMarker.length) {
            if (chk_pcSet === 0) {
                reqEcosys = new Array();
                $(".cl_cbEsys:checkbox:checked").each(function (iter, item) {
                    console.log('inner');
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
                            var qtArr = new Array();
                            for (it_e = 0; it_e < marker.length; it_e++) {
                                //$('#id_esysInf_' + it_e).append("<div id='id_reqInf_" + it_e + "'>" + marker[it_e].getLatLng() + "</div>");
                                d3.select('#id_esysInf_' + it_e)
                                    .append('div')
                                    .attr('id', 'id_chr_' + it_e)
                                    .attr('class', 'cl_chr cl_row');
                                for(it_d = 0; it_d < resp['data'].length; it_d++) {
                                        if(resp['data'][it_d]['svg'] === 'static/svg/dummy.svg') {
                                            d3.select('#id_chr_' + it_e)
                                                .append('div')
                                                .attr('id', 'id_descr_' + it_d)
                                                .attr('class', 'cl_descr cl_column cl_table_' + it_d)
                                                .html('Beschreibungstag');
                                                console.log(resp['data'][it_d]);
                                            d3.select('#id_chr_' + it_e)
                                                .append('div')
                                                .attr('id', 'id_chrIcons_' + it_d)
                                                .attr('class', 'cl_fixedW cl_column')
                                            for(it_s = 0; it_s < resp['data'][it_d]['vals'][0]['quantil']; it_s++) {
                                                d3.select('#id_chrIcons_' + it_d)
                                                    .append('div')
                                                    .attr('class', 'cl_quint')
                                                    .attr('id', 'id_quint_' + it_e + '_' + it_s);
                                                qtArr[it_s] = '<svg version="1.1" id="id_svg_' + it_s + '" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" x="0px" y="0px"\n' +
                                                    '\t viewBox="0 0 144.773 144.773" style="enable-background:new 0 0 144.773 144.773;" xml:space="preserve">\n' +
                                                    '<g>\n' +
                                                    '\t<circle style="fill:#2E5871;" cx="72.387" cy="72.386" r="72.386"/>\n' +
                                                    '\t<g>\n' +
                                                    '\t\t<defs>\n' +
                                                    '\t\t\t<circle id="SVGID_1_" cx="72.387" cy="72.386" r="72.386"/>\n' +
                                                    '\t\t</defs>\n' +
                                                    '\t\t<clipPath id="SVGID_2_">\n' +
                                                    '\t\t\t<use xlink:href="#SVGID_1_"  style="overflow:visible;"/>\n' +
                                                    '\t\t</clipPath>\n' +
                                                    '\t\t<g style="clip-path:url(#SVGID_2_);">\n' +
                                                    '\t\t\t<g>\n' +
                                                    '\t\t\t\t<path style="fill:#F1C9A5;" d="M107.053,116.94c-4.666-8.833-34.666-14.376-34.666-14.376s-30,5.543-34.666,14.376\n' +
                                                    '\t\t\t\t\tc-3.449,12.258-6.334,27.833-6.334,27.833h41h41C113.387,144.773,111.438,128.073,107.053,116.94z"/>\n' +
                                                    '\t\t\t\t<path style="fill:#E4B692;" d="M72.387,102.564c0,0,30,5.543,34.666,14.376c4.386,11.133,6.334,27.833,6.334,27.833h-41V102.564\n' +
                                                    '\t\t\t\t\tz"/>\n' +
                                                    '\t\t\t\t<rect x="64.22" y="84.606" style="fill:#F1C9A5;" width="16.334" height="27.336"/>\n' +
                                                    '\t\t\t\t<rect x="72.387" y="84.606" style="fill:#E4B692;" width="8.167" height="27.336"/>\n' +
                                                    '\t\t\t\t<path style="opacity:0.1;fill:#DDAC8C;" d="M64.22,97.273c1.469,4.217,7.397,6.634,11.751,6.634\n' +
                                                    '\t\t\t\t\tc1.575,0,3.107-0.264,4.583-0.747V84.606H64.22V97.273z"/>\n' +
                                                    '\t\t\t\t<path style="fill:#FFFFFF;" d="M107.053,116.94c-2.726-5.158-14.082-9.191-23.065-11.656c-0.351,6.11-5.402,10.96-11.601,10.96\n' +
                                                    '\t\t\t\t\tc-6.198,0-11.249-4.85-11.601-10.96c-8.983,2.465-20.34,6.498-23.066,11.656c-3.449,12.258-6.334,27.833-6.334,27.833h41h41\n' +
                                                    '\t\t\t\t\tC113.387,144.773,111.438,128.073,107.053,116.94z"/>\n' +
                                                    '\t\t\t\t<path style="fill:#F1C9A5;" d="M93.387,67.357c0-17.074-9.402-26.783-21-26.783c-11.598,0-21,9.709-21,26.783\n' +
                                                    '\t\t\t\t\tc0,7.153,2.188,22.991,5.924,26.219c2.565,2.279,10.938,6.183,15.033,6.183h0.001c0.014,0,0.028-0.002,0.043-0.002\n' +
                                                    '\t\t\t\t\tc0.014,0,0.028,0.002,0.041,0.002h0.002c4.096,0,12.469-3.903,15.033-6.183C91.348,89.474,93.387,73.923,93.387,67.357z"/>\n' +
                                                    '\t\t\t\t<path style="fill:#E4B692;" d="M72.388,99.757c0.014,0,0.028,0.002,0.041,0.002h0.002c4.096,0,12.469-3.903,15.033-6.183\n' +
                                                    '\t\t\t\t\tc3.884-4.103,5.923-19.653,5.923-26.219c0-17.074-9.402-26.783-21-26.783L72.388,99.757L72.388,99.757z"/>\n' +
                                                    '\t\t\t\t<path style="fill:#E4B692;" d="M90.19,79.197c-3.807-0.398-6.377-4.5-5.732-9.156c0.637-4.66,4.242-8.12,8.051-7.724\n' +
                                                    '\t\t\t\t\tc3.805,0.396,6.371,4.496,5.729,9.156C97.599,76.134,93.997,79.591,90.19,79.197z"/>\n' +
                                                    '\t\t\t\t<path style="fill:#F1C9A5;" d="M46.685,71.474c-0.643-4.66,1.924-8.76,5.727-9.156c3.81-0.397,7.416,3.063,8.055,7.724\n' +
                                                    '\t\t\t\t\tc0.643,4.656-1.93,8.758-5.734,9.156C50.925,79.591,47.323,76.134,46.685,71.474z"/>\n' +
                                                    '\t\t\t\t<path style="fill:#FB6020;" d="M37.721,116.94c-3.449,12.258-6.334,27.833-6.334,27.833h29.777\n' +
                                                    '\t\t\t\t\tc-5.054-22.305-5.249-38.023-5.249-38.053C48.095,109.196,39.97,112.684,37.721,116.94z"/>\n' +
                                                    '\t\t\t\t<path style="fill:#FB6020;" d="M107.053,116.94c4.67,11.533,6.334,27.833,6.334,27.833H83.609\n' +
                                                    '\t\t\t\t\tc5.054-22.305,5.249-38.023,5.249-38.053C96.679,109.196,104.804,112.684,107.053,116.94z"/>\n' +
                                                    '\t\t\t</g>\n' +
                                                    '\t\t\t<path style="fill:#915F2C;" d="M52.672,78.725c0,0,3.067,10.331,6.388,12.085c1.533,0,2.683,0,2.683,0l3.32-4.705l7.281-2.029\n' +
                                                    '\t\t\t\tv15.684h-9.453l-9.452-8.488L52.672,78.725z"/>\n' +
                                                    '\t\t\t<path style="fill:#915F2C;" d="M92.059,78.725c0,0-3.067,10.331-6.388,12.085c-1.533,0-2.683,0-2.683,0l-3.32-4.705l-7.281-2.029\n' +
                                                    '\t\t\t\tv15.684h9.453l9.452-8.488L92.059,78.725z"/>\n' +
                                                    '\t\t\t<path style="fill:#FFFFFF;" d="M75.755,89.241c0,0-0.5-2.226-3.417-2.226c-2.667,0-3.417,2.226-3.417,2.226H75.755z"/>\n' +
                                                    '\t\t\t<path style="fill:#915F2C;" d="M51.42,62.366c0,0,2.783,0.579,4.581,2.669c-0.317-3.657-1.02-15.805,3.42-18.853\n' +
                                                    '\t\t\t\tc4.44-3.047,6.517,0.131,12.966,0.131c0-4.789,0-8.882,0-8.882s-7.751,0-10.482,0c-2.732,0-11.401,1.306-11.401,9.491\n' +
                                                    '\t\t\t\tC50.503,55.108,51.42,62.366,51.42,62.366z"/>\n' +
                                                    '\t\t\t<path style="fill:#915F2C;" d="M93.353,62.366c0,0-2.783,0.579-4.581,2.669c0.317-3.657,1.02-15.805-3.42-18.853\n' +
                                                    '\t\t\t\tc-4.439-3.047-6.517,0.131-12.966,0.131c0-4.789,0-8.882,0-8.882s7.751,0,10.482,0c2.732,0,11.401,1.306,11.401,9.491\n' +
                                                    '\t\t\t\tC94.27,55.108,93.353,62.366,93.353,62.366z"/>\n' +
                                                    '\t\t</g>\n' +
                                                    '\t</g>\n' +
                                                    '</g>\n' +
                                                    '<g>\n' +
                                                    '</g>\n' +
                                                    '<g>\n' +
                                                    '</g>\n' +
                                                    '<g>\n' +
                                                    '</g>\n' +
                                                    '<g>\n' +
                                                    '</g>\n' +
                                                    '<g>\n' +
                                                    '</g>\n' +
                                                    '<g>\n' +
                                                    '</g>\n' +
                                                    '<g>\n' +
                                                    '</g>\n' +
                                                    '<g>\n' +
                                                    '</g>\n' +
                                                    '<g>\n' +
                                                    '</g>\n' +
                                                    '<g>\n' +
                                                    '</g>\n' +
                                                    '<g>\n' +
                                                    '</g>\n' +
                                                    '<g>\n' +
                                                    '</g>\n' +
                                                    '<g>\n' +
                                                    '</g>\n' +
                                                    '<g>\n' +
                                                    '</g>\n' +
                                                    '<g>\n' +
                                                    '</g>\n' +
                                                    '</svg>\n';

                                                d3.select('#id_quint_' + it_e + '_' + it_s)
                                                    .html('<div class="cl_qtArr">' + qtArr[it_s] + '</div>');
                                            }
                                            d3.select('#id_chr_' + it_e)
                                                .append('div')
                                                .attr('id', 'id_value_' + it_d)
                                                .attr('class', 'cl_value cl_column cl_table_' + it_d)
                                                .html('<div>' + resp['data'][it_d]['vals'][0]['val'] + '</div>');
                                            d3.select('#id_chr_' + it_e)
                                                .append('div')
                                                .attr('id', 'id_dimension_' + it_d)
                                                .attr('class', 'cl_dimension cl_column cl_table_' + it_d)
                                                .html('<div>' + resp['data'][it_d]['dim'] + '</div>');
                                        }
                                    }
                                }
                            }
                    });
                }
            }
            if (chk_pcSet === 1) {
                reqEcosys = new Array();
                $(".cl_cbEsys:checkbox:checked").each(function (iter, item) {
                    console.log('inner');
                    reqEcosys.push(item.id.split('_')[2]);
                });
                packageID = opt_packageID.val();
                services = reqEcosys;

                const latlngs = func_connectTheDots(filteredmarker).map((point) => L.latLng(point));
                const lengths = L.GeometryUtil.accumulatedLengths(latlngs);
                // Reduce all lengths to a single total length
                const totalLength = lengths.reduce((a, b) => a + b, 0);

                // Get number of points based on desired interval and total length
                const interval = 1000; // 1000m
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
                            reqMarker.push('(' + parseFloat(points[it_e].latLng.lng) + '/' + parseFloat(points[it_e].latLng.lat) + ')');
                        }
                        if (points.length === 1 && m_id !== undefined) {
                            reqMarker.push('(' + parseFloat(points[it_e].latLng.lng) + '/' + parseFloat(points[it_e].latLng.lat) + ')');
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
                            console.log(resp);
                            for (it_e = 0; it_e < marker.length; it_e++) {
                                $('#id_esysInf_' + it_e).append("<div id='id_reqInf_" + it_e + "'>" + marker[it_e].getLatLng() + "</div>");
                            }
                            func_initChart(resp['data']);
                        }
                    });
                }
            }
            // layer id - line point area - alle auf dem Weg befindlichen ecosys
        }
    }
}
func_reqSpecies = function () {
    str_bBox = "";
    str_bBox = "POLYGON((\"";
    for (it_p = 0; it_p < minimapBox.length; it_p++) {
        if (minimapBox[it_p] !== undefined) {
            str_bBox += "" + minimapBox[it_p]._latlngs[0][0].lat + "," + minimapBox[it_p]._latlngs[0][0].lng + " " + minimapBox[it_p]._latlngs[0][1].lat + "," + minimapBox[it_p]._latlngs[0][1].lng + " " + minimapBox[it_p]._latlngs[0][2].lat + "," + minimapBox[it_p]._latlngs[0][2].lng + " " + minimapBox[it_p]._latlngs[0][3].lat + "," + minimapBox[it_p]._latlngs[0][3].lng + "";
        }
    }
    str_bBox += "\"))";
    console.log(str_bBox);
    /*
    URL="https://biocache-ws.biodivdev.at/occurrences/search?q=*:*&pageSize=1&spatial&wkt=" + str_bBox;
    $.ajax({
        url: URL,
        type: 'GET',
        success: function (resp) {
            console.log(resp.occurrences);
        }
    });
     */

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
func_getPolygonBounds = function() {
    map.eachLayer(function (layer) {
        if (layer instanceof L.Polygon && !(layer instanceof L.Rectangle)) {
            polygons.push(layer.getLatLngs()) //Returns an array of arrays of geographical points in each polygon.
            polygons.push(layer.getBounds()) //Returns a GeoJSON representation of the polygon (GeoJSON Polygon Feature).
        }
    })
}
 */
bt_Layermode.on('click', function () {
    if (chk_lMode === 0) {
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
                $.each(resp.layers, function (index, item) { // Iterates through a collection
                    $("#id_addLayer").append( // Append an object to the inside of the select box
                        $("<option></option>") // Yes you can do this.
                            .text(item.name)
                            .val(item.id)
                    );
                });
            }
        });
        bt_Layermode.attr('data-i18n', '[value]Markermodus auswählen');
        $('#id_mod_1').css('display', 'none');
        $('#id_mod_2').css('display', 'block');
        func_switchMod();
        cnt_map.animate({
            'height': '100%'
        }, 100);
        cnt_info.animate({
            'height': '0%',
        }, 100);
        bt_close_mark.val('Minimaps öffnen');
        info.hide();
        $('.cl_footer').css('margin-top', '0%');
        it_mmBt = ++it_mmBt % 2;
    }
    if (chk_lMode === 1) {
        bt_Layermode.attr('data-i18n', '[value]Layermodus auswählen');
        $('#id_mod_1').css('display', 'block');
        $('#id_mod_2').css('display', 'none');
        func_switchMod();
        bt_close_mark.click();
    }
    chk_lMode = ++iter_lMode % 2;
});
bt_ecosysCB.on('click', function () {
    if (chk_eSys === 0) {
        map.closePopup();
        bt_ecosysCB.attr('data-i18n', '[value]Ökosystemleistungen schließen');
        bt_ecosysCB.val('Ökosystemleistungen schließen');
        $('.cl_ecosys').css('visibility', 'visible');
    }
    if (chk_eSys === 1) {
        bt_ecosysCB.attr('data-i18n', '[value]Ökosystemleistungen auswählen');
        bt_ecosysCB.val('Ökosystemleistungen auswählen');
        $('.cl_ecosys').css('visibility', 'hidden');
    }
    chk_eSys = ++iter_eSys % 2;
})
id_newMark.hover(function () {
    $(this).css('cursor', 'pointer').attr('title', 'neuen Marker setzen');
}, function () {
    $(this).css('cursor', 'auto');
});
id_newMark.on('click', function (e1) {
    chk_cl = 0;
    bt_close_mark.css('display', 'block');
    if (it_mmBt == 1) {
        cnt_map.animate({
            'height': '100%'
        }, 100);
        cnt_info.animate({
            'height': '0%',
        }, 100);
        bt_close_mark.show();
        bt_close_mark.val('Minimaps öffnen');
        info.hide();
        $('.cl_footer').css('margin-top', '0%');
        it_mmBt = ++it_mmBt % 2;
    }
    if (it_mmBt == 0) {
        cnt_map.animate({
            'height': '65%'
        }, 100);
        bt_close_mark.val('Minimaps schließen');
        info.show();
    }
    let svgEmb = '<svg id=\"Ebene_1\" xmlns=\"http://www.w3.org/2000/svg\" xmlns:xlink=\"http://www.w3.org/1999/xlink\" x=\"0px\" y=\"100px\" viewBox=\"0 0 1000 1000\" xml:space=\"preserve\"><style type=\"text/css\">.st0{fill:#FF3333;}.cl_nrT{font-size:20em;fill:#FF3333;}</style><g><text x=\"65%\" y=\"95%\" id=\"id_markNr_' + it_0 + '\" class=\"cl_nrT\">' + it_0 + '</text><path id=\"id_path\" class=\"st0\" d=\"M500,42.7c162.1,0,294,131.9,294,294c0,51.6-13.7,102.4-39.5,147L500,924.7l-254.5-441c-25.8-44.6-39.5-95.4-39.5-147C206,174.5,337.9,42.7,500,42.7L500,42.7z M500,451c63,0,114.3-51.3,114.3-114.3S563,222.4,500,222.4s-114.3,51.3-114.3,114.3S437,451,500,451z M500,10c-180.4,0-326.7,146.3-326.7,326.7c0,59.6,16,115.3,43.9,163.3L500,990l282.8-490c27.8-48.1,43.9-103.8,43.9-163.3C826.6,156.3,680.4,10,500,10L500,10L500,10z M500,418.3c-45.1,0-81.7-36.5-81.7-81.6s36.6-81.6,81.7-81.6s81.6,36.6,81.6,81.6C581.7,381.8,545.1,418.3,500,418.3L500,418.3z\"/></g></svg>';
    marker[it_0] = L.marker([marker[it_0 - 1] !== undefined ? marker[it_0 - 1].getLatLng().lat + 0.05 : 48.3805228, marker[it_0 - 1] !== undefined ? marker[it_0 - 1].getLatLng().lng + 0.05 : 15.9558588], {
        clickable: true,
        draggable: true,
        icon: L.divIcon({
            html: svgEmb,
            iconSize: [30, 30],
            iconAnchor: [15, 30],
            popupAnchor: [0, -80]
        })
    }).on('dragstart', function (e) {
    }).on('drag', function (e) {
        chk_cl = 0;
        $('.markers').change();
    }).on('drop', function (e) {
        chk_cl = 1;
        $('.markers').change();
    }).on('dragend', function (e) {
        chk_cl = 2;
        $('.markers').change();
        if (chk_pconn === 1) {
            func_updatePolyLine();
            //$('#ic_info').attr('visibility','hidden');
            cnt_main.animate({
                'width': '65%'
            }, 100);
            cnt_nav.animate({
                'width': '35%'
            }, 100);
        }
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
        marker[it_0].addTo(map).bindPopup("<div class='cl_popup' id='id_popup_" + it_0 + "'><div class=\"cl_headID\">ID " + it_0 + " Coords: " + p_point[it_0] + "</div><div class='cl_esysInf' id='id_esysInf_" + it_0 + "'></div></div>");
        info.append('<div class="markers" id="marker_' + it_0 + '" onchange="func_updateID($(this))"><div class="minimapNr">ID<br>' + it_0 + '</div><input onclick="func_delMark($(this).parent())" type="button" class="cl_delMark" id="del_mark_' + it_0 + '" value="Marker löschen"/><div class="cl_mark" id="id_mark_' + it_0 + '">Lat: <input type="number" min="-90.000000" max="90.000000" step="0.000001" value="' + p_point[it_0].lat + '" onchange="func_nPosLatLng(' + it_0 + ');"/> Lng: <input type="number" min="-90.000000" max="90.000000" step="0.000001" value="' + p_point[it_0].lng + '" onchange="func_nPosLatLng(' + it_0 + ');"/></div><div class="cl_cntInf"></div><div class="cl_minimap" id="minimap_' + it_0 + '"></div></div></div></div>');
        minimapArr[it_0] = L.map('minimap_' + it_0, {
            doubleClickZoom: false,
            closePopupOnClick: false,
            dragging: false,
            zoomControl: false,
            zoomSnap: false,
            zoomDelta: false,
            trackResize: false,
            touchZoom: false,
            scrollWheelZoom: false,
            center: [48.3805228, 15.9558588],
            zoom: 19
        });

        popupArr[it_0] = L.popup({
            closeOnClick: false,
            autoClose: false
        })
            .setLatLng(p_point[it_0]);
        llBounds[it_0] = L.latLngBounds(L.latLng(marker[it_0].getLatLng().lat - 0.005, marker[it_0].getLatLng().lng - 0.005), L.latLng(marker[it_0].getLatLng().lat + 0.005, marker[it_0].getLatLng().lng + 0.005));
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
            $('#ic_info').attr('visibility', 'hidden');
            if (!$(".cl_cbEsys:checkbox:checked").length) {

                alert("Bitte wählen sie zuerst eine Ökosystemleistung aus!");
                bt_ecosysCB.click();
            } else {
                //func_reqEcosys();
            }
            //func_reqSpecies();
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
                cnt_main.animate({
                    'width': '65%'
                }, 100);
                cnt_nav.animate({
                    'width': '35%'
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
            $('#ic_info').attr('visibility', 'visible');
            console.log($(".cl_cbEsys:checkbox:checked").length);
            if (!$(".cl_cbEsys:checkbox:checked").length) {
                alert("Bitte wählen sie zuerst eine Ökosystemleistung aus!");
                bt_ecosysCB.click();
            }
            func_reqSpecies();
            func_updatePolyLine();
            id_MarkerConn.val("Verbindung löschen");
        }
        if (chk_pconn === 1) {
            chk_pcSet = 0;
            $('#ic_info').attr('visibility', 'hidden');
            func_deletePolyLine();
            cnt_main.animate({
                'width': '100%'
            }, 100);
            cnt_nav.animate({
                'width': '0%'
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
            if (it_infBt % 2 == 0) {
                cnt_main.animate({
                    'width': '65%'
                }, 100);
                cnt_nav.animate({
                    'width': '35%'
                }, 100);
                cnt_info.animate({
                    'height': 8.5 + (parseInt((filteredmarker.length - 1) / 2) * 20) + 'em'
                }, 100);
                $('.cl_footer').css('margin-top', (8.5 + parseInt((filteredmarker.length - 1) / 2) * 20) + 'em');
            }
        }
        if (it_infBt % 2 == 1) {
            cnt_main.animate({
                'width': '100%'
            }, 100);
            cnt_nav.animate({
                'width': '0%'
            }, 100);
            cnt_info.animate({
                'height': 0 + (parseInt((filteredmarker.length - 1) / 3) * 20) + 'em'
            }, 100);
            $('.cl_footer').css('margin-top', (0 + parseInt((filteredmarker.length - 1) / 3) * 20) + 'em');
        }
        if (info_icon.css('visibility') === 'visible') {
            it_infBt = ++it_infBt % 2;
        }
        chk_pconn = ++iter_conn % 2;
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

func_initChart = function (data) {
    if ($(".cl_svg").length > 0) {
        $(".cl_svg").remove();
    }
    filteredmarker = marker.filter(x => x !== undefined);
    if (filteredmarker.length > 1) {
        var div_nav = d3.select("#id_nav");
        var svg = new Array();
        var margin = {top: 40, right: 40, bottom: 40, left: 40}, width = 680, height = 320;
        var xScale = new Object();
        var yScale = new Object()
        var xAxis = new Object();
        var yAxis = new Object();
        var distance = 0.0;
        var xStep = new Array();
        distance = func_addDistances(marker); // Array of points
        for(it_d = 0; it_d < data.length; it_d++) {
            console.log(data[it_d]);
                for (it_n = 0; it_n < data[0]['vals'].length; it_n++) {
                    xStep[it_n] = it_n * (distance / (data[0]['vals'].length - 1)); //
                }
                console.log(distance);
                margin = {top: 40, right: 40, bottom: 40, left: 40}, width = 680, height = 320;
                xScale = d3.scaleLinear().domain([0, distance]).range([0, width - margin.left - margin.right]).nice();
                yScale = d3.scaleLinear().domain([0, 3000]).range([height - margin.top - margin.bottom, 0]).nice();
                xAxis = d3.axisBottom(xScale).ticks(10);
                yAxis = d3.axisRight(yScale).ticks(10);

                div_nav
                    .append("svg")
                    .attr("id", "id_svg_e_" + it_d)
                    .attr("class", "cl_svg")
                    .attr('viewBox', '0 0 ' + width + ' ' + height)
                    .append("g");

                svg[it_d] = d3.select('#id_svg_e_' + it_d);

                svg[it_d].append("g")
                    .attr("class", "x-axis")
                    .attr("transform", "translate(" + margin.left + "," + (height - margin.bottom) + ")")
                    .call(xAxis);

// Y axis
                svg[it_d].append("g")
                    .attr("class", "y-axis")
                    .attr("transform", "translate(" + (width - margin.right) + "," + margin.top + ")")
                    .call(yAxis);

                // Add Y axis

                svg[it_d].append("g")
                    // function(d), not just line function
                    .append("path")
                    .attr("class", "line")
                    .datum(data[it_d]['vals'])
                    .attr("fill", "none")
                    .attr("stroke", "steelblue")
                    .attr("stroke-width", 1.5)
                    .attr("d", d3.line()
                        .x(function (d, it) {
                            console.log(it * 10.0);
                            return xScale(xStep[it]) + margin.left;
                        })
                        .y(function (d) {
                            console.log(d['val']);
                            return yScale(d['val']) + margin.top;
                        })
                    )
                res = 0.0;
            }
    } else {
        console.log("<1");
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
            $('#ic_info').attr('visibility', 'hidden');
            func_deletePolyLine();
            cnt_main.animate({
                'width': '100%'
            }, 100);
            cnt_nav.animate({
                'width': '0%'
            }, 100);
            cnt_info.animate({
                'height': 0 + (parseInt((filteredmarker.length - 1) / 3) * 20) + 'em'
            }, 100);
            $('.cl_footer').css('margin-top', (0 + parseInt((filteredmarker.length - 1) / 3) * 20) + 'em');
            id_MarkerConn.val("Verbindung setzen");
        }
        if (id_MarkerConn.val() === 'Verbindung setzen') {
            it_infBt = ++it_infBt % 2
        }
        chk_pconn = ++iter_conn % 2;
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

    for (it_r = 0; it_r < filteredmarker.length; it_r++) {
        map.removeLayer(filteredmarker[it_r]);
    }

    marker = new Array();
    point = new Array();
    p_point = new Array();
    llBounds = new Array();
    minimapArr = new Array();

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
                popupAnchor: [0, -80]
            })
        }).on('dragstart', function (e) {
        }).on('drag', function (e) {
            chk_cl = 0;
            $('.markers').change();
        }).on('drop', function (e) {
            chk_cl = 1;
            $('.markers').change();
        }).on('dragend', function (e) {
            chk_cl = 2;
            $('.markers').change();
            if (chk_pconn === 1) {
                func_updatePolyLine();
                //$('#ic_info').attr('visibility','hidden');
                cnt_main.animate({
                    'width': '65%'
                }, 100);
                cnt_nav.animate({
                    'width': '35%'
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
        marker[it_r].addTo(map).bindPopup("<div class='cl_popup' id='id_popup_" + it_r + "'><div class=\"cl_headID\">ID " + it_r + " Coords: " + p_point[it_r] + "</div><div class='cl_esysInf' id='id_esysInf_" + it_r + "'></div></div>");
        info.append('<div class="markers" id="marker_' + it_r + '" onchange="func_updateID($(this))"><div class="minimapNr">ID<br> ' + it_r + '</div><input onclick="func_delMark($(this).parent())" type="button" class="cl_delMark" id="del_mark_' + it_r + '" value="Marker löschen"/><div class="cl_mark" id="id_mark_' + it_r + '">Lat: <input type="number" min="-90.000000" max="90.000000" step="0.000001" value="' + p_point[it_r].lat + '" onchange="func_nPosLatLng(' + it_r + ');"/> Lng: <input type="number" min="-90.000000" max="90.000000" step="0.000001" value="' + p_point[it_r].lng + '" onchange="func_nPosLatLng(' + it_r + ');"/></div><div class="cl_cntInf"></div><div class="cl_minimap" id="minimap_' + it_r + '"></div></div></div></div>');
        minimapArr[it_r] = L.map('minimap_' + it_r, {
            doubleClickZoom: false,
            closePopupOnClick: false,
            dragging: false,
            zoomControl: false,
            zoomSnap: false,
            zoomDelta: false,
            trackResize: false,
            touchZoom: false,
            scrollWheelZoom: false,
            center: [p_point[it_r].lat, p_point[it_r].lng],
            zoom: 19
        });

        popupArr[it_r] = L.popup({
            closeOnClick: false,
            autoClose: false
        })
            .setLatLng(p_point[it_r]);
        llBounds[it_r] = L.latLngBounds(L.latLng(marker[it_r].getLatLng().lat - 0.005, marker[it_r].getLatLng().lng - 0.005), L.latLng(marker[it_r].getLatLng().lat + 0.005, marker[it_r].getLatLng().lng + 0.005));
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
            $('#ic_info').attr('visibility', 'hidden');
            if (!$(".cl_cbEsys:checkbox:checked").length) {

                alert("Bitte wählen sie zuerst eine Ökosystemleistung aus!");
                bt_ecosysCB.click();
            } else {
                //func_reqEcosys();
            }
            //func_reqSpecies();
        }
    }
    if (chk_pconn === 1) {
        func_updatePolyLine();
    }
    if (chk_pconn === 0) {
        cnt_main.animate({
            'width': '100%'
        }, 100);
        cnt_nav.animate({
            'width': '0%'
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
            cnt_main.animate({
                'width': '100%'
            }, 100);
            cnt_nav.animate({
                'width': '0%'
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
    $('#id_mark_' + parseInt(tmpT.attr('id').split('_')[1])).html("Lat: <input id='id_lat_" + parseInt(tmpT.attr('id').split('_')[1]) + "' type='number' min='-90.000000' max='90.000000' step='0.000001' value='" + point[parseInt(tmpT.attr('id').split('_')[1])].lat + "' onchange='func_nPosLatLng(" + parseInt(tmpT.attr('id').split('_')[1]) + ");'/> Lng: <input type='number' id='id_lng_" + parseInt(tmpT.attr('id').split('_')[1]) + "' min='-90.000000' max='90.000000' step='0.000001' value='" + point[parseInt(tmpT.attr('id').split('_')[1])].lng + "' onchange='func_nPosLatLng(" + parseInt(tmpT.attr('id').split('_')[1]) + ");'/>");
    p_point[parseInt(tmpT.attr('id').split('_')[1])] = point[parseInt(tmpT.attr('id').split('_')[1])];

    marker[parseInt(tmpT.attr('id').split('_')[1])].bindPopup("<div class='cl_popup' id='id_popup_" + parseInt(tmpT.attr('id').split('_')[1]) + "'><div id='id_coords'><div class=\"cl_headID\">ID " + parseInt(tmpT.attr('id').split('_')[1]) + " Coords: " + p_point[parseInt(tmpT.attr('id').split('_')[1])] + "</div><div class='cl_esysInf' id='id_esysInf_" + parseInt(tmpT.attr('id').split('_')[1]) + "'></div></div>");
    minimapArr[parseInt(tmpT.attr('id').split('_')[1])].setView(point[parseInt(tmpT.attr('id').split('_')[1])], 19);
};
func_nPosLatLng = function (id_val) {
    marker[id_val].setLatLng(L.latLng($('#id_lat_' + id_val).val(), $('#id_lng_' + id_val).val()));
    if (chk_pconn === 1) {
        func_updatePolyLine();
    }
}
func_submEsys = function () {
    console.log($(".cl_cbEsys:checkbox:checked").length);
    if ($(".cl_cbEsys:checkbox:checked").length) {
        func_updatePolyLine();
        bt_ecosysCB.click();
    } else {
        alert("Bitte wählen sie zuerst eine Ökosystemleistung aus!");
    }
};
info_icon.on('click', function (e) {
    if (chk_pconn === 1) {
        if (it_infBt == 0) {
            cnt_main.animate({
                'width': '65%'
            }, 100);
            cnt_nav.animate({
                'width': '35%'
            }, 100);
            cnt_info.animate({
                'height': 8.5 + (parseInt((filteredmarker.length - 1) / 2) * 20) + 'em'
            }, 100);
            $('.cl_footer').css('margin-top', (8.5 + parseInt((filteredmarker.length - 1) / 2) * 20) + 'em');
        }
        if (it_infBt == 1) {
            cnt_main.animate({
                'width': '100%'
            }, 100);
            cnt_nav.animate({
                'width': '0%'
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
            bt_close_mark.val('Minimaps öffnen');
            info.hide();
        }
        if (it_mmBt == 1) {
            cnt_map.animate({
                'height': '65%'
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
            bt_close_mark.val('Minimaps schließen');
            info.show();
        }
        it_mmBt = ++it_mmBt % 2;
    }
});
var map = L.map('map', {
    center: [48.3805228, 15.9558588],
    zoom: 7
});
map.locate({
    setView: false
});
map.on('popupopen', function (e) {
    if (!$(".cl_cbEsys:checkbox:checked").length) {
        e.target.closePopup();
        alert("Bitte wählen sie zuerst eine Ökosystemleistung aus!");
        bt_ecosysCB.click();
    } else {
        console.log($(e.popup._content).attr('id').split('_')[2]);
        chk_pcSet = 0;
        func_reqEcosys(new Array(marker[$(e.popup._content).attr('id').split('_')[2]]), $(e.popup._content).attr('id').split('_')[2]);
    }
    func_reqSpecies();
});
map.on('zoomend', function (e) {
    var currZoom = map.getZoom();
    var diff = prevZoom - currZoom;
    if (diff > 0) {
        $('.cl_popup').css('width', 360 * 2 * diff);
        $('.cl_popup').css('height', 460 * 2 * diff);
    } else if (diff < 0) {
        $('.cl_popup').css('width', 360 / (2 * diff));
        $('.cl_popup').css('height', 460 / (2 * diff));
    } else {

    }
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
    $('#ic_info').attr('visibility', 'hidden');
    if (chk_map == 0) {
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            maxZoom: 19,
            attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        }).addTo(map);
    }
    if (chk_map == 1) {
        L.tileLayer('https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png', {
            maxZoom: 19,
            attribution: 'Map data: &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, <a href="http://viewfinderpanoramas.org">SRTM</a> | Map style: &copy; <a href="https://opentopomap.org">OpenTopoMap</a> (<a href="https://creativecommons.org/licenses/by-sa/3.0/">CC-BY-SA</a>)'
            // page 14 Map.locate <watch, enableHighAccuracy, maxZoom>
        }).addTo(map);
    }
    if (chk_map == 2) {
        mapLink =
            '<a href="http://www.esri.com/">Esri</a>';
        wholink =
            'i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community';
        L.tileLayer(
            'http://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
                attribution: '&copy; ' + mapLink + ', ' + wholink,
            }).addTo(map);
    }
}