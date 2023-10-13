var url_apiProjects = "api/bt/projects";
// number + filter + number
var url_habitat = "";
var opt_layerID = $('#id_addLayer').val(0);
var LayerMap;
var ly_bioHabitat;
var cnt_nav = $('#cnt_nav');
var ly_biotop;
var layer_name = '';
var chk_map = 0;
var speciesGroups = new Array();
var ly_filter = undefined;
var map = L.map('map', {
    center: [48.3805228, 15.9558588],
    zoom: 8
});
var popup;
var geoJsonLayer;
var infoPup = L.popup({
    className: 'cl_popup3',
    closeButton: true,
    closeOnClick: true
});
var speciesList = new Array();
var infoPupAll = new Array();
var respAll = new Array();
var ly_filterAll = new Array();
var wkt = new Array();
var wktString = new Array();
var str_content = '';
var str_contentAll = new Array();
var speciesGroupsAll = new Array();
var speciesListAll = new Array();
var styleAll = new Array();
map.locate({
    setView: false
});
cnt_nav.animate({
    'width': '0em', 'display': 'none'
}, 100);
$('#id_mapLayer').change(function () {
    chk_map = $(this).val();
    func_initMap();
});
$(function() {
    $(".resizable").resizable({
        handles: "e, w", // Allow resizing from left and right edges only
        resize: function(event, ui) {
            // Adjust the width of the adjacent div when resizing
            var currentDiv = $(this);
            $('#map').css('width', $(window).width() - currentDiv.width() - 38);
        }
    });
});
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
(function() {
    orig = $.fn.css;
    $.fn.css = function() {
        var result = orig.apply(this, arguments);
        $(this).trigger('stylechanged');
        return result;
    }
})();
function decode_utf8(s) {
    return decodeURIComponent(escape(s));
}
$.ajax({
    url: url_ecosys + url_apiProjects,
    headers: {"Accept": "application/json"},
    type: 'GET',
    dataType: "json",
    crossDomain: true,
    beforeSend: function (xhr) {
        xhr.withCredentials = true;
    },
    //data: JSON.stringify({"packageID":opt_layerID.val()}),
    success: function (resp) {
        console.log(resp);
        $("#id_addLayer option").remove(); // Remove all <option> child tags.
        $.each(resp.projects, function (index, item) { // Iterates through a collection
            $("#id_addLayer").append( // Append an object to the inside of the select box
                $("<option></option>") // Yes you can do this.
                    .text(item.name)
                    .val(item.id)
            );
        });
        opt_layerID = $('#id_addLayer').val(1);
    }
});
func_toggle = function(p_it_t) {
    $('.cl_hov_' + (p_it_t)).toggle();
}
opt_layerID.on('click change', function () {
    $('#id_title').children().remove();
    if ($('#id_addLayer').find(":selected").text().split('(')[1]!== undefined && $('#id_addLayer').find(":selected").text().split('(')[1].replaceAll(')', '') !== 'Capacity Matrix') {
        $('#id_title').append('<b style="visibility: hidden" id="id_dataI" data-i18n="Lebensraumtypen auswählen">Lebensraumtypen auswählen</b>');
        $('#id_dataI').on('stylechanged', function () {
            do_translate();
        });
        $('#id_dataI').css('visibility', 'visible');
        if (ly_filter !== undefined) {
            map.removeLayer(ly_filter);
        }
        if (ly_biotop !== undefined) {
            map.removeLayer(ly_biotop);
        }
        if (geoJsonLayer !== undefined) {
            map.removeLayer(geoJsonLayer);
        }
        map.eachLayer(function (layer) {
            console.log(layer);
            map.removeLayer(layer);
        });
        $.ajax({
            url: url_ecosys + url_apiProjects + '/' + opt_layerID.val(),
            headers: {"Accept": "application/json"},
            type: 'GET',
            dataType: "json",
            crossDomain: true,
            beforeSend: function (xhr) {
                xhr.withCredentials = true;
            },
            //data: JSON.stringify({"packageID":opt_layerID.val()}),
            success: function (resp1) {
                layer_name = resp1['project']['geoserverLayer'];
                func_initMap();
                func_CQLFull();
                $('.cl_habitats').children().remove();
                $.ajax({
                    url: url_ecosys + url_apiProjects + '/' + opt_layerID.val() + '/filter',
                    headers: {"Accept": "application/json"},
                    type: 'GET',
                    dataType: "json",
                    crossDomain: true,
                    beforeSend: function (xhr) {
                        xhr.withCredentials = true;
                    },
                    //data: JSON.stringify({"packageID":opt_layerID.val()}),
                    success: function (resp2) {
                        var flag = 0;
                        var it_a = 0;
                        var arrAlph = new Array();
                        var tmpArr = new Array();
                        p_color = '#66ffff';
                        $('.cl_habitatTypes').children().remove();
                        for (it_h = 0; it_h < resp2['filter'].length; it_h++) {
                            if (resp2['filter'][it_h] !== undefined && (resp2['filter'][it_h]['cqlQuery'] !== null)) {
                                if (resp2['filter'][it_h]['cqlQuery'].replaceAll('\'', '').split('=')[1] !== undefined) {
                                    arrAlph.push(resp2['filter'][it_h]['cqlQuery'].replaceAll('\'', '').split('=')[1].split('\.')[0]);
                                }
                            }
                        }
                        var it_a = 0;
                        var it_b = 0;
                        var it_t = 0;
                        var it_cnt = 0;
                        var tmpCh = new Array();
                        var tmpFiltAlph = new Array();
                        arrAlph = arrAlph.filter(function (itm, i, a) {
                            return i == a.indexOf(itm);
                        });
                        for (it_h = 0; it_h < resp2['filter'].length; it_h++) {
                            var id = resp2['filter'][it_h]['id'];
                            if (resp2['filter'][it_h] !== undefined && (resp2['filter'][it_h]['cqlQuery'] !== null)) {
                                if (resp2['filter'][it_h]['cqlQuery'].split('in').length > 1) {
                                    if (resp2['filter'][it_h]['levelNumber'] >= 1) {
                                        $('.cl_habitatTypes').append("<ul class='cl_toggle cl_tDescr_" + it_t + "'><b onclick='func_toggle(" + it_t + ")'>" + resp2['filter'][it_h]['description'] + "</b></ul>");
                                        it_t++;
                                    }
                                }
                                if (resp2['filter'][it_h]['cqlQuery'].replaceAll('\'', '').split('=')[1] !== undefined) {
                                    $('.cl_tDescr_' + (it_t - 1)).append('<li class="cl_hov_' + (it_t - 1) + ' cl_hov" id="id_h_' + id + '" onclick="func_CQLSubm(' + it_h + ', ' + id + ', p_color)"><i>' + resp2['filter'][it_h]['cqlQuery'].replaceAll('\'', '').split('=')[1] + ' ' + resp2['filter'][it_h]['description'] + '</i></li>');
                                    $('.cl_hov_' + (it_t - 1)).hide();
                                }
                            }
                        }
                    }
                });
            }
        });
    }
    if ($('#id_addLayer').find(":selected").text().split('(')[1] !== undefined && $('#id_addLayer').find(":selected").text().split('(')[1].replaceAll(')', '') === 'Capacity Matrix') {
        $('#id_title').append('<b style="visibility: hidden" id="id_dataI" data-i18n="Capacity Matrix auswählen">Capacity Matrix auswählen</b>');
        $('#id_dataI').on('stylechanged', function () {
            do_translate();
        });
        $('#id_dataI').css('visibility', 'visible');
        if (ly_filter !== undefined) {
            map.removeLayer(ly_filter);
        }
        if (ly_biotop !== undefined) {
            map.removeLayer(ly_biotop);
        }
        if (geoJsonLayer !== undefined) {
            map.removeLayer(geoJsonLayer);
        }
        map.eachLayer(function (layer) {
            console.log(layer);
            map.removeLayer(layer);
        });
        $.ajax({
            url: url_ecosys + url_apiProjects + '/' + opt_layerID.val(),
            headers: {"Accept": "application/json"},
            type: 'GET',
            dataType: "json",
            crossDomain: true,
            beforeSend: function (xhr) {
                xhr.withCredentials = true;
            },
            //data: JSON.stringify({"packageID":opt_layerID.val()}),
            success: function (resp1) {
                layer_name = resp1['project']['geoserverLayer'];
                func_initMap();
                func_CQLFull();
                p_color = '#66ffff';
                $('.cl_habitatTypes').children().remove();
                var it_CMx_1 = 0;
                var it_CMx_2 = 1;
                var it_CMx_3 = 2;

                $('.cl_habitatTypes').append("<ul class='cl_toggle cl_tDescr_" + it_CMx_1 + "'><b onclick='func_toggle(" + it_CMx_1 + ")'>Regulation services</b></ul>");
                $('.cl_habitatTypes').append("<ul class='cl_toggle cl_tDescr_" + it_CMx_2 + "'><b onclick='func_toggle(" + it_CMx_2 + ")'>Habitat services</b></ul>");
                $('.cl_habitatTypes').append("<ul class='cl_toggle cl_tDescr_" + it_CMx_3 + "'><b onclick='func_toggle(" + it_CMx_3 + ")'>Provision services</b></ul>");

                $('.cl_tDescr_' + it_CMx_1).append('<li class="cl_hov_' + (it_CMx_1) + ' cl_hov" id="id_h_' + 0 + '" onclick="func_CQLCapMatr(' + 0 + ', p_color)"><i>Disturbance prevention</i></li>');
                $('.cl_hov_' + (it_CMx_1)).hide();
                $('.cl_tDescr_' + it_CMx_1).append('<li class="cl_hov_' + (it_CMx_1) + ' cl_hov" id="id_h_' + 1 + '" onclick="func_CQLCapMatr(' + 1 + ', p_color)"><i>Local climate regulation</i></li>');
                $('.cl_hov_' + (it_CMx_1)).hide();
                $('.cl_tDescr_' + it_CMx_1).append('<li class="cl_hov_' + (it_CMx_1) + ' cl_hov" id="id_h_' + 2 + '" onclick="func_CQLCapMatr(' + 2 + ', p_color)"><i>Waterregulation</i></li>');
                $('.cl_hov_' + (it_CMx_1)).hide();
                $('.cl_tDescr_' + it_CMx_1).append('<li class="cl_hov_' + (it_CMx_1) + ' cl_hov" id="id_h_' + 3 + '" onclick="func_CQLCapMatr(' + 3 + ', p_color)"><i>Watersupply</i></li>');
                $('.cl_hov_' + (it_CMx_1)).hide();
                $('.cl_tDescr_' + it_CMx_1).append('<li class="cl_hov_' + (it_CMx_1) + ' cl_hov" id="id_h_' + 4 + '" onclick="func_CQLCapMatr(' + 4 + ', p_color)"><i>Pollination</i></li>');
                $('.cl_hov_' + (it_CMx_1)).hide();

                $('.cl_tDescr_' + it_CMx_2).append('<li class="cl_hov_' + (it_CMx_2) + ' cl_hov" id="id_h_' + 5 + '" onclick="func_CQLCapMatr(' + 5 + ', p_color)"><i>Refugium</i></li>');
                $('.cl_hov_' + (it_CMx_2)).hide();

                $('.cl_tDescr_' + it_CMx_3).append('<li class="cl_hov_' + (it_CMx_3) + ' cl_hov" id="id_h_' + 6 + '" onclick="func_CQLCapMatr(' + 6 + ', p_color)"><i>Food</i></li>');
                $('.cl_hov_' + (it_CMx_3)).hide();
                $('.cl_tDescr_' + it_CMx_3).append('<li class="cl_hov_' + (it_CMx_3) + ' cl_hov" id="id_h_' + 7 + '" onclick="func_CQLCapMatr(' + 7 + ', p_color)"><i>Raw materials</i></li>');
                $('.cl_hov_' + (it_CMx_3)).hide();
                $('.cl_tDescr_' + it_CMx_3).append('<li class="cl_hov_' + (it_CMx_3) + ' cl_hov" id="id_h_' + 8 + '" onclick="func_CQLCapMatr(' + 8 + ', p_color)"><i>Genetic resources</i></li>');
                $('.cl_hov_' + (it_CMx_3)).hide();
            }
        });
    }
});
func_closedPopup = function() {
    cnt_nav.animate({
        'width': '0em', 'display': 'none'
    }, 100);
}
func_CQLCapMatr = function(p_id, p_color) {
    $('.cl_hov').css('list-style-type', 'none');
    $('.cl_hov').css('background-color', '#ffffff');
    $('.cl_hov').css('color', '#637073');
    $('#id_h_' + p_id).css('background-color', '#49754a');
    $('#id_h_' + p_id).css('color', '#ffffff');
    $.ajax({
        url: url_ecosys + url_apiProjects + '/' + opt_layerID.val() + '/filter',
        headers: {"Accept": "application/json"},
        type: 'GET',
        dataType: "json",
        crossDomain: true,
        beforeSend: function (xhr) {
            xhr.withCredentials = true;
        },
        //data: JSON.stringify({"packageID":opt_layerID.val()}),
        success: function (resp) {
            for(it_a = 0; it_a < resp['filter'].length; it_a++) {
                if (resp['filter'][it_a]['cqlQuery'] !== undefined && ('' + resp['filter'][it_a]['cqlQuery']).split('(').length < 2) {
                    $.ajax({
                        url: 'https://spatial.biodivdev.at/geoserver/ECO/wfs',
                        type: 'GET',
                        data: {
                            service: 'WFS',
                            version: '1.0.0',
                            request: 'GetFeature',
                            typeName: 'ECO:' + layer_name,
                            outputFormat: 'application/json',
                            cql_filter: resp['filter'][it_a]['cqlQuery']
                        },
                        success: function (response) {
                            //map.removeLayer(ly_biotop);
                            var tmp_CMx_name = undefined;
                            if(p_id === 0) {
                                tmp_CMx_name = 'Disturbanc';
                            }
                            if(p_id === 1) {
                                tmp_CMx_name = 'Localclima';
                            }
                            if(p_id === 2) {
                                tmp_CMx_name = 'Waterregul';
                            }
                            if(p_id === 3) {
                                tmp_CMx_name = 'Watersuppl';
                            }
                            if(p_id === 4) {
                                tmp_CMx_name = 'Pollinatio';
                            }
                            if(p_id === 5) {
                                tmp_CMx_name = 'Refugium';
                            }
                            if(p_id === 6) {
                                tmp_CMx_name = 'Food';
                            }
                            if(p_id === 7) {
                                tmp_CMx_name = 'Rawmateria';
                            }
                            if(p_id === 8) {
                                tmp_CMx_name = 'Geneticres';
                            }
                            if (response !== undefined && response['features'] !== undefined) {
                                if (geoJsonLayer !== undefined) {
                                    map.removeLayer(geoJsonLayer);
                                }
                                if (parseInt(response['features'][0]['properties'][tmp_CMx_name]) === 1) {
                                    styleAll[it_a] = {
                                        fillColor: 'rgb(188, 0, 0)',
                                        weight: 2,
                                        opacity: 1,
                                        color: 'rgb(188, 0, 0)',
                                        fillOpacity: 0.8
                                    };
                                }
                                if (parseInt(response['features'][0]['properties'][tmp_CMx_name]) === 2) {
                                    styleAll[it_a] = {
                                        fillColor: 'rgb(255, 0, 0)',
                                        weight: 2,
                                        opacity: 1,
                                        color: 'rgb(255, 0, 0)',
                                        fillOpacity: 0.8
                                    };
                                }
                                if (parseInt(response['features'][0]['properties'][tmp_CMx_name]) === 3) {
                                    styleAll[it_a] = {
                                        fillColor: 'rgb(188, 188, 0)',
                                        weight: 2,
                                        opacity: 1,
                                        color: 'rgb(188, 188, 0)',
                                        fillOpacity: 0.8
                                    };
                                }
                                if (parseInt(response['features'][0]['properties'][tmp_CMx_name]) === 4) {
                                    styleAll[it_a] = {
                                        fillColor: 'rgb(255, 255, 0)',
                                        weight: 2,
                                        opacity: 1,
                                        color: 'rgb(255, 255, 0)',
                                        fillOpacity: 0.8
                                    };
                                }
                                if (parseInt(response['features'][0]['properties'][tmp_CMx_name]) === 5) {
                                    styleAll[it_a] = {
                                        fillColor: 'rgb(0, 255, 0)',
                                        weight: 2,
                                        opacity: 1,
                                        color: 'rgb(0, 255, 0)',
                                        fillOpacity: 0.8
                                    };
                                }
                                /*
                                if(parseInt(response['features'][0]['properties']['Cultivatio']) === 1) {
                                    return {
                                        fillColor: 'yellow',
                                        weight: 2,
                                        opacity: 1,
                                        color: 'yellow',  //Outline color
                                        fillOpacity: 0.8
                                    };
                                }
                                if(parseInt(response['features'][0]['properties']['Cultivatio']) === 1) {
                                    return {
                                        fillColor: 'yellow',
                                        weight: 2,
                                        opacity: 1,
                                        color: 'yellow',  //Outline color
                                        fillOpacity: 0.8
                                    };
                                }

                                 */
                                if (response['features'][0]['properties'] !== undefined) {
                                    ly_filterAll[it_a] = L.geoJSON(response, {style: styleAll[it_a]});
                                    //map.fitBounds(ly_filterAll[it_a].getBounds());
                                    ly_filterAll[it_a].on('click', function(event) {
                                        if(popup !== undefined) {
                                            popup.remove();
                                        }
                                    });
                                    ly_filterAll[it_a].on('click', function (e) {
                                        var clickedFeature = e.layer.feature;
                                        wkt[it_a] = new Array();
                                        // Convert the clicked feature's geometry to a WKT string
                                        turf.coordEach(clickedFeature, function (coord) {
                                            wkt[it_a].push(coord);
                                        }, 'wkt');
                                        wktString[it_a] = "MULTIPOLYGON(((";
                                        for (it_w = 0; it_w < wkt[it_a].length; it_w++) {
                                            wktString[it_a] += wkt[it_a][it_w][0] + " " + wkt[it_a][it_w][1] + ",";
                                        }
                                        wktString[it_a] += wkt[it_a][0][0] + " " + wkt[it_a][0][1] + ")))";
                                        str_contentAll[it_a] = '';
                                        var tmp_AK_FNR = url_ecosys + url_apiProjects + '/' + opt_layerID.val() + '/species/' + response['features'][0]['properties']['AK_FNR'];
                                        if (tmp_AK_FNR !== undefined || tmp_AK_FNR !== '') {
                                            console.log(tmp_AK_FNR);
                                            $.ajax({
                                                url: tmp_AK_FNR,
                                                headers: {"Accept": "application/json"},
                                                type: 'GET',
                                                dataType: "json",
                                                crossDomain: true,
                                                beforeSend: function (xhr) {
                                                    xhr.withCredentials = true;
                                                },
                                                //data: JSON.stringify({"packageID":opt_layerID.val()}),
                                                success: function (resp2) {
                                                    speciesGroupsAll[it_a] = new Array();
                                                    speciesListAll[it_a] = new Array();
                                                    for (it_d = 1; it_d < parseInt(resp2['speciesGroup']['list'].length); it_d++) {
                                                        if(resp2['speciesGroup']['list'][it_d - 1]['taxonId'] !== resp2['speciesGroup']['list'][it_d]['taxonId']) {
                                                            speciesListAll[it_a].push(resp2['speciesGroup']['list'][it_d - 1]);
                                                        }
                                                    }
                                                    for (it_d = 0; it_d < speciesListAll[it_a].length; it_d++) {
                                                        $.ajax({
                                                            //url: 'https://biocache.biodivdev.at/ws/occurrences/search?q=' + resp['speciesGroup']['list'][it_d]['description'] +'&qc=&wkt=' + wktString,
                                                            url: 'https://biocache.biodivdev.at/ws/webportal/params?',
                                                            data: {
                                                                q: encodeURIComponent(speciesListAll[it_a][it_d]['description']),
                                                                wkt: wktString[it_a]
                                                            },
                                                            // POST tested string returns a number
                                                            type: 'POST',
                                                            success: function (occurrence) {
                                                                $.ajax({
                                                                    url: 'https://biocache.biodivdev.at/ws/occurrences/search?q=qid:' + occurrence,
                                                                    type: 'GET',
                                                                    success: function (result) {
                                                                        if (result['totalRecords'] !== 0) {
                                                                            speciesGroupsAll[it_a].push(result['occurrences']);
                                                                        }
                                                                    }
                                                                });
                                                            }
                                                        });
                                                    }
                                                },
                                                error: function (xhr, status, error) {
                                                    console.error(error);
                                                }
                                            });
                                            str_contentAll[it_a] += '<div><b>' + decode_utf8(response['features'][0]['properties']['BT_Lang']) + '</b></div>';

                                            console.log(response['features'][0]['properties']);
                                            infoPupAll[it_a] = L.popup({
                                                className: 'cl_popup3',
                                                closeButton: true,
                                                closeOnClick: true
                                            });

                                            str_contentAll[it_a] += "<div class='cl_spGroups'><div onclick='func_spList(speciesListAll[it_a], speciesGroupsAll[it_a]);'><i data-i18n='Artenliste für Biotoptyp anzeigen'>Artenliste für Biotoptyp anzeigen</i></div></div>";
                                            str_contentAll[it_a] += "<div onclick='func_wktData(wktString[it_a]);'><i data-i18n='Funddaten für Polygon'>Funddaten für Polygon</i></div></div>";
                                            if (response['features'][0]['properties']['Disturbanc'] === undefined && response['features'][0]['properties']['Localclima'] === undefined && response['features'][0]['properties']['Waterregul'] === undefined && response['features'][0]['properties']['Waterregul'] === undefined && response['features'][0]['properties']['Watersuppl'] === undefined && response['features'][0]['properties']['Pollinatio'] === undefined && response['features'][0]['properties']['Refugium'] === undefined && response['features'][0]['properties']['Food'] === undefined && response['features'][0]['properties']['Rawmateria'] === undefined && response['features'][0]['properties']['Geneticres'] === undefined) {
                                                infoPupAll[it_a].setLatLng(e.latlng);
                                                infoPupAll[it_a].setContent(str_contentAll[it_a]);
                                                infoPupAll[it_a].openOn(map);
                                            } else {
                                                if ($('.cl_capMatr').length !== 0) {
                                                    $('.cl_capMatr').remove();
                                                }
                                                if ($('.cl_services').length !== 0) {
                                                    $('.cl_services').remove();
                                                }
                                                str_contentAll[it_a] += "<div class='cl_capMatr'><div class='cl_cntCap'><b>Capacity Matrix values</b></div></div>";
                                                if ((response['features'][0]['properties']['Disturbanc'] !== undefined || response['features'][0]['properties']['Localclima'] !== undefined || response['features'][0]['properties']['Waterregul'] !== undefined || response['features'][0]['properties']['Watersuppl'] !== undefined || response['features'][0]['properties']['Pollinatio'] !== undefined)) {
                                                    str_contentAll[it_a] += "<div class='cl_services cl_serv1'><b>Regulation services</b></div>";
                                                    if (response['features'][0]['properties']['Disturbanc'] !== undefined) {
                                                        str_contentAll[it_a] += "<div><i>Disturbance prevention: " + response['features'][0]['properties']['Disturbanc'] + "</i></div>";
                                                    }
                                                    if (response['features'][0]['properties']['Localclima'] !== undefined) {
                                                        str_contentAll[it_a] += "<div><i>Local climate regulation: " + response['features'][0]['properties']['Localclima'] + "</i></div>";
                                                    }
                                                    if (response['features'][0]['properties']['Waterregul'] !== undefined) {
                                                        str_contentAll[it_a] += "<div><i>Waterregulation: " + response['features'][0]['properties']['Waterregul'] + "</i></div>";
                                                    }
                                                    if (response['features'][0]['properties']['Watersuppl'] !== undefined) {
                                                        str_contentAll[it_a] += "<div><i>Watersupply: " + response['features'][0]['properties']['Watersuppl'] + "</i></div>";
                                                    }
                                                    if (response['features'][0]['properties']['Pollinatio'] !== undefined) {
                                                        str_contentAll[it_a] += "<div><i>Pollination: " + response['features'][0]['properties']['Pollinatio'] + "</i></div>";
                                                    }
                                                }
                                                if (response['features'][0]['properties']['Refugium'] !== undefined) {
                                                    str_contentAll[it_a] += "<div class='cl_services cl_serv2'><b>Habitat services</b></div>";
                                                    if (response['features'][0]['properties']['Refugium'] !== undefined) {
                                                        str_contentAll[it_a] += "<div><i>Refugium: " + response['features'][0]['properties']['Refugium'] + "</i></div>";
                                                    }
                                                }
                                                if ((response['features'][0]['properties']['Food'] !== undefined || response['features'][0]['properties']['Rawmateria'] !== undefined || response['features'][0]['properties']['Geneticres'] !== undefined)) {
                                                    str_contentAll[it_a] += "<div class='cl_services cl_serv3'><b>Provision services</b></div>";
                                                    if (response['features'][0]['properties']['Food'] !== undefined) {
                                                        str_contentAll[it_a] += "<div><i>Food: " + response['features'][0]['properties']['Food'] + "</i></div>";
                                                    }
                                                    if (response['features'][0]['properties']['Rawmateria'] !== undefined) {
                                                        str_contentAll[it_a] += "<div><i>Raw materials: " + response['features'][0]['properties']['Rawmateria'] + "</i></div>";
                                                    }
                                                    if (response['features'][0]['properties']['Geneticres'] !== undefined) {
                                                        str_contentAll[it_a] += "<div><i>Genetic resources: " + response['features'][0]['properties']['Geneticres'] + "</i></div>";
                                                    }
                                                }
                                                if (response['features'][0]['properties']['TotalValue'] !== undefined) {
                                                    str_contentAll[it_a] += "<div><b>Total Value: " + response['features'][0]['properties']['TotalValue'] + "</b></div>";
                                                }

                                                infoPupAll[it_a].setLatLng(e.latlng);
                                                infoPupAll[it_a].setContent(str_contentAll[it_a]);
                                                infoPupAll[it_a].openOn(map);

                                            }
                                            if (speciesGroupsAll[it_a] !== undefined && !speciesGroupsAll[it_a].length) {
                                                if (infoPupAll[it_a] !== undefined) {
                                                    infoPupAll[it_a].setLatLng(e.latlng);
                                                    infoPupAll[it_a].setContent(str_contentAll[it_a]);
                                                } else {
                                                    infoPupAll[it_a] = L.popup({
                                                        className: 'cl_popup3',
                                                        closeButton: true,
                                                        closeOnClick: true
                                                    });
                                                    infoPupAll[it_a].setLatLng(e.latlng);
                                                    infoPupAll[it_a].setContent(str_contentAll[it_a]);
                                                }
                                                //map.addLayer(infoPup);
                                                //infoPupAll[it_a].openOn(map);
                                            }
                                        } else {
                                            console.log("keine AK_FNR");
                                        }
                                    });
                                    ly_filterAll[it_a].addTo(map);
                                }
                            }
                        }
                    });
                }
            }
        }
    });
}
func_CQLFull = function() {
    $.ajax({
        url: url_ecosys + url_apiProjects + '/' + opt_layerID.val() + '/filter',
        headers: {"Accept": "application/json"},
        type: 'GET',
        dataType: "json",
        crossDomain: true,
        beforeSend: function (xhr) {
            xhr.withCredentials = true;
        },
        //data: JSON.stringify({"packageID":opt_layerID.val()}),
        success: function (resp) {
            $.ajax({
                url: 'https://spatial.biodivdev.at/geoserver/ECO/wfs',
                type: 'GET',
                data: {
                    service: 'WFS',
                    version: '1.0.0',
                    request: 'GetFeature',
                    typeName: 'ECO:' + layer_name,
                    outputFormat: 'application/json',
                },
                success: function (response) {
                    if(ly_filter !== undefined) {
                        map.removeLayer(ly_filter);
                    }
                    geoJsonLayer = L.geoJSON(response);
                    geoJsonLayer.eachLayer(function (layer) {
                        // Set the opacity of each feature using setStyle
                        layer.setStyle({ opacity: 0.01 });
                    });
                    //map.fitBounds(geoJsonLayer.getBounds());
                    geoJsonLayer.on('click', function(e) {
                        popup = new L.popup({
                            className: 'cl_popup2',
                            closeButton: false,
                            closeOnClick: true
                        })
                            .setLatLng(e.latlng)
                            .setContent(decode_utf8(e.layer.feature.properties.BT_Lang));
                        console.log(e.layer.feature.properties.BT_Code);
                        map.on('popupclose', func_closedPopup);
                        // Create a custom popup
                    });
                    time = 0;
                    time = setInterval(function(){
                        //hide bar if he counts to 5 sec
                        map.closePopup(popup);
                        if(popup !== undefined) {
                            popup.remove();
                        }
                    },6200);
                    geoJsonLayer.on('click', function() {
                        if(!infoPup.isOpen()) {
                            popup.openOn(map);
                            if (popup.isOpen()) {
                                popup.update();
                            }
                            clearInterval(time);
                        }
                    });
                    geoJsonLayer.addTo(map);
                },
                error: function (xhr, status, error) {
                    console.error(error);
                }
            });
        }
    });
}
func_SpeciesInfo = function (spData) {
    console.log("clicked");
}
func_wktData = function(p_wkt) {
    url_linkBioc = "https://biocache.biodiversityatlas.at/occurrences/search?q=*%3A*&qc=&wkt=" + p_wkt;
    window.open(url_linkBioc, '_blank');
}
func_spList = function(lItem, speciesGroups) {
    $('#id_spList').children().remove();
    cnt_nav.animate({
        'width': '52em', 'display': 'block'
    }, 100);
    var listContainer = document.getElementById("id_spList");
    var list = document.createElement("ul");
    var listItem = new Array();
    tmpItem = new Array();
    for(it_i = 0; it_i < lItem.length; it_i++) {
        for (it_j = 0; it_j < speciesGroups.length; it_j++) {
            for (it_k = 0; it_k < speciesGroups[it_j].length; it_k++) {
                if (lItem[it_i]['description'] === speciesGroups[it_j][it_k].raw_scientificName) {
                    tmpItem[it_i] =  '<b>' + lItem[it_i]['description'] + '</b><i> Name: </i><b>' +  speciesGroups[it_j][it_k].raw_vernacularName + '</b>';
                } else{
                    tmpItem[it_i] = undefined;
                }
            }
        }
        listItem[it_i] = document.createElement("li");
        if (tmpItem[it_i] !== undefined) {
            listItem[it_i].innerHTML += tmpItem[it_i];
        } else {
            listItem[it_i].innerHTML +=  '<b>' + lItem[it_i]['description'] + '</b>';
        }
        list.appendChild(listItem[it_i]);
    }
    listContainer.appendChild(list);
}
func_spData = function(item) {
    $('#id_spList').children().remove();
    cnt_nav.animate({
        'width': '52em', 'display': 'block'
    }, 100);
    var listContainer = document.getElementById("id_spList");
    var list = document.createElement("ul");
    var listItem = new Array();
    var tmpItem = new Array();
    tmpItem = new Array();
    for(it_i = 0; it_i < item.length; it_i++) {
        listItem[it_i] = new Array();
        item[it_i].filter(function(itm){
            var i = tmpItem.findIndex(x => x.scientificName == itm.scientificName);
            if(i <= -1){
                tmpItem.push({scientificName: itm.scientificName, raw_vernacularName: itm.raw_vernacularName});
            }
            return null;
        });
        console.log(tmpItem);

    }
    for(it_i = 0; it_i < tmpItem.length; it_i++) {
        listItem[it_i] = document.createElement("li");
        if(tmpItem[it_i].raw_vernacularName !== undefined) {
            listItem[it_i].innerHTML += '<b>' + tmpItem[it_i].scientificName + '</b><i> Name: </i><b>' + tmpItem[it_i].raw_vernacularName + '</b>';
        } else {
            listItem[it_i].innerHTML += '<b>' + tmpItem[it_i].scientificName + '</b>';
        }
        list.appendChild(listItem[it_i]);
    }
    listContainer.appendChild(list);
}
var chk_id = 0;
func_CQLSubm = function(p_id, r_id, p_color) {
    if(chk_id === r_id) {
        opt_layerID.click();
    } else {
        chk_id = r_id;
        map.closePopup(infoPup);
        if(infoPup !== undefined) {
            infoPup.remove();
        }
        $('#id_spList').children().remove();
        cnt_nav.animate({
            'width': '0em', 'display': 'none'
        }, 100);
        $('.cl_hov').css('list-style-type', 'none');
        $('.cl_hov').css('background-color', '#ffffff');
        $('.cl_hov').css('color', '#637073');
        $('#id_h_' + r_id).css('background-color', '#49754a');
        $('#id_h_' + r_id).css('color', '#ffffff');
        $.ajax({
            url: url_ecosys + url_apiProjects + '/' + opt_layerID.val() + '/filter',
            headers: {"Accept": "application/json"},
            type: 'GET',
            dataType: "json",
            crossDomain: true,
            beforeSend: function (xhr) {
                xhr.withCredentials = true;
            },
            //data: JSON.stringify({"packageID":opt_layerID.val()}),
            success: function (resp) {
                console.log(resp['filter'][p_id]['cqlQuery']);
                if (resp['filter'][p_id]['cqlQuery'] !== undefined) {
                    $.ajax({
                        url: 'https://spatial.biodivdev.at/geoserver/ECO/wfs',
                        type: 'GET',
                        data: {
                            service: 'WFS',
                            version: '1.0.0',
                            request: 'GetFeature',
                            typeName: 'ECO:' + layer_name,
                            outputFormat: 'application/json',
                            cql_filter: resp['filter'][p_id]['cqlQuery']
                        },
                        success: function (response) {
                            //map.removeLayer(ly_biotop);
                            console.log(response['features'][0]['properties']['AK_FNR']);
                            map.removeLayer(geoJsonLayer);
                            if (ly_filter !== undefined) {
                                map.removeLayer(ly_filter);
                            }
                            function polystyle() {
                                return {
                                    fillColor: 'yellow',
                                    weight: 2,
                                    opacity: 1,
                                    color: 'yellow',  //Outline color
                                    fillOpacity: 0.8
                                };
                            }
                            ly_filter = L.geoJSON(response, {style: polystyle});
                            //map.fitBounds(ly_filter.getBounds());
                            ly_filter.on('click', function(event) {
                                if(popup !== undefined) {
                                    popup.remove();
                                }
                            });
                            ly_filter.on('click', function (e) {
                                //console.log(e.layer.feature.geometry);
                                var clickedFeature = e.layer.feature;
                                var wkt = new Array();
                                // Convert the clicked feature's geometry to a WKT string
                                turf.coordEach(clickedFeature, function (coord) {
                                    wkt.push(coord);
                                }, 'wkt');
                                wktString = "MULTIPOLYGON(((";
                                for (it_w = 0; it_w < wkt.length; it_w++) {
                                    wktString += wkt[it_w][0] + " " + wkt[it_w][1] + ",";
                                }
                                wktString += wkt[0][0] + " " + wkt[0][1] + ")))";
                                //console.log(response['features'][0]['properties']['AK_FNR']);

                                var str_content = '';
                                if (response['features'] !== undefined) {
                                    $.ajax({
                                        url: url_ecosys + url_apiProjects + '/' + opt_layerID.val() + '/species/' + response['features'][0]['properties']['AK_FNR'],
                                        headers: {"Accept": "application/json"},
                                        type: 'GET',
                                        dataType: "json",
                                        crossDomain: true,
                                        beforeSend: function (xhr) {
                                            xhr.withCredentials = true;
                                        },
                                        //data: JSON.stringify({"packageID":opt_layerID.val()}),
                                        success: function (resp2) {
                                            console.log(resp2['speciesGroup']['list']);
                                            console.log(wktString);
                                            speciesGroups = new Array();
                                            speciesList = new Array();
                                            //str_content += "<div><input type='button' onclick=func_SpeciesInfo(resp2['speciesGroup']['list'])'></input></div>";
                                            for (it_d = 1; it_d < resp2['speciesGroup']['list'].length; it_d++) {
                                                if(resp2['speciesGroup']['list'][it_d - 1]['taxonId'] !== resp2['speciesGroup']['list'][it_d]['taxonId']) {
                                                    speciesList.push(resp2['speciesGroup']['list'][it_d - 1]);
                                                }
                                            }
                                            for (it_d = 0; it_d < speciesList.length; it_d++) {
                                                $.ajax({
                                                    //url: 'https://biocache.biodivdev.at/ws/occurrences/search?q=' + resp['speciesGroup']['list'][it_d]['description'] +'&qc=&wkt=' + wktString,
                                                    url: 'https://biocache.biodivdev.at/ws/webportal/params?',
                                                    data: {
                                                        q: encodeURIComponent(speciesList[it_d]['description']),
                                                        wkt: wktString
                                                    },
                                                    // POST tested string returns a number
                                                    type: 'POST',
                                                    success: function (occurrence) {
                                                        $.ajax({
                                                            url: 'https://biocache.biodivdev.at/ws/occurrences/search?q=qid:' + occurrence,
                                                            type: 'GET',
                                                            success: function (result) {
                                                                if (result['totalRecords'] !== 0) {
                                                                    speciesGroups.push(result['occurrences']);
                                                                }
                                                            }
                                                        });
                                                    }
                                                });
                                            }
                                        },
                                        error: function (xhr, status, error) {
                                            console.error(error);
                                        }
                                    });
                                    str_content += '<div><b>' + decode_utf8(response['features'][0]['properties']['BT_Lang']) + '</b></div>';

                                    console.log(response['features'][0]['properties']);
                                    infoPup = L.popup({
                                        className: 'cl_popup3',
                                        closeButton: true,
                                        closeOnClick: true
                                    });
                                    str_content += "<div class='cl_spGroups'><div onclick='func_spList(speciesList, speciesGroups);'><i data-i18n='Artenliste für Biotoptyp anzeigen'>Artenliste für Biotoptyp anzeigen</i></div></div>";
                                    str_content += "<div onclick='func_wktData(wktString);'><i data-i18n='Funddaten für Polygon'>Funddaten für Polygon</i></div></div>";
                                    if(response['features'][0]['properties']['Disturbanc'] === undefined && response['features'][0]['properties']['Localclima'] === undefined && response['features'][0]['properties']['Waterregul'] === undefined && response['features'][0]['properties']['Waterregul'] === undefined && response['features'][0]['properties']['Watersuppl'] === undefined && response['features'][0]['properties']['Pollinatio'] === undefined && response['features'][0]['properties']['Refugium'] === undefined && response['features'][0]['properties']['Food'] === undefined && response['features'][0]['properties']['Rawmateria'] === undefined && response['features'][0]['properties']['Geneticres'] === undefined) {
                                        infoPup.setLatLng(e.latlng);
                                        infoPup.setContent(str_content);
                                        infoPup.openOn(map);
                                    } else {
                                        if($('.cl_capMatr').length !== 0) {
                                            $('.cl_capMatr').remove();
                                        }
                                        if($('.cl_services').length !== 0) {
                                            $('.cl_services').remove();
                                        }
                                        str_content += "<div class='cl_capMatr'><div class='cl_cntCap'><b>Capacity Matrix values</b></div></div>";
                                        if((response['features'][0]['properties']['Disturbanc'] !== undefined || response['features'][0]['properties']['Localclima'] !== undefined || response['features'][0]['properties']['Waterregul'] !== undefined || response['features'][0]['properties']['Watersuppl'] !== undefined || response['features'][0]['properties']['Pollinatio'] !== undefined)) {
                                            str_content += "<div class='cl_services cl_serv1'><b>Regulation services</b></div>";
                                            if (response['features'][0]['properties']['Disturbanc'] !== undefined) {
                                                str_content += "<div><i>Disturbance prevention: " + response['features'][0]['properties']['Disturbanc'] + "</i></div>";
                                            }
                                            if (response['features'][0]['properties']['Localclima'] !== undefined) {
                                                str_content += "<div><i>Local climate regulation: " + response['features'][0]['properties']['Localclima'] + "</i></div>";
                                            }
                                            if(response['features'][0]['properties']['Waterregul'] !== undefined) {
                                                str_content += "<div><i>Waterregulation: " + response['features'][0]['properties']['Waterregul'] + "</i></div>";
                                            }
                                            if(response['features'][0]['properties']['Watersuppl'] !== undefined) {
                                                str_content += "<div><i>Watersupply: " + response['features'][0]['properties']['Watersuppl'] + "</i></div>";
                                            }
                                            if(response['features'][0]['properties']['Pollinatio'] !== undefined) {
                                                str_content += "<div><i>Pollination: " + response['features'][0]['properties']['Pollinatio'] + "</i></div>";
                                            }
                                        }
                                        if(response['features'][0]['properties']['Refugium'] !== undefined) {
                                            str_content += "<div class='cl_services cl_serv2'><b>Habitat services</b></div>";
                                            if(response['features'][0]['properties']['Refugium'] !== undefined) {
                                                str_content += "<div><i>Refugium: " + response['features'][0]['properties']['Refugium'] + "</i></div>";
                                            }
                                        }
                                        if((response['features'][0]['properties']['Food'] !== undefined || response['features'][0]['properties']['Rawmateria'] !== undefined || response['features'][0]['properties']['Geneticres'] !== undefined)) {
                                            str_content += "<div class='cl_services cl_serv3'><b>Provision services</b></div>";
                                            if(response['features'][0]['properties']['Food'] !== undefined) {
                                                str_content += "<div><i>Food: " + response['features'][0]['properties']['Food'] + "</i></div>";
                                            }
                                            if(response['features'][0]['properties']['Rawmateria'] !== undefined) {
                                                str_content += "<div><i>Raw materials: " + response['features'][0]['properties']['Rawmateria'] + "</i></div>";
                                            }
                                            if(response['features'][0]['properties']['Geneticres'] !== undefined) {
                                                str_content += "<div><i>Genetic resources: " + response['features'][0]['properties']['Geneticres'] + "</i></div>";
                                            }
                                        }
                                        if(response['features'][0]['properties']['TotalValue'] !== undefined) {
                                            str_content += "<div class='cl_services cl_servT'><b>Total Value: " + response['features'][0]['properties']['TotalValue'] + "</b></div>";
                                        }

                                        infoPup.setLatLng(e.latlng);
                                        infoPup.setContent(str_content);
                                        infoPup.openOn(map);

                                    }
                                    if (!speciesGroups.length) {
                                        if (infoPup !== undefined) {
                                            infoPup.setLatLng(e.latlng);
                                            infoPup.setContent(str_content);
                                        } else {
                                            infoPup = L.popup({
                                                className: 'cl_popup3',
                                                closeButton: true,
                                                closeOnClick: true
                                            });
                                            infoPup.setLatLng(e.latlng);
                                            infoPup.setContent(str_content);
                                        }
                                        map.addLayer(infoPup);
                                        //infoPup.openOn(map);
                                    }
                                } else {
                                    $.ajax({
                                        url: url_ecosys + url_apiProjects + '/' + opt_layerID.val() + '/species/*',
                                        headers: {"Accept": "application/json"},
                                        type: 'GET',
                                        dataType: "json",
                                        crossDomain: true,
                                        beforeSend: function (xhr) {
                                            xhr.withCredentials = true;
                                        },
                                        //data: JSON.stringify({"packageID":opt_layerID.val()}),
                                        success: function (resp2) {
                                            console.log(wktString);
                                            speciesGroups = new Array();
                                            //str_content += "<div><input type='button' onclick=func_SpeciesInfo(resp2['speciesGroup']['list'])'></input></div>";
                                            for (it_d = 0; it_d < resp2['speciesGroup']['list'].length; it_d++) {
                                                $.ajax({
                                                    //url: 'https://biocache.biodivdev.at/ws/occurrences/search?q=' + resp['speciesGroup']['list'][it_d]['description'] +'&qc=&wkt=' + wktString,
                                                    url: 'https://biocache.biodivdev.at/ws/webportal/params?',
                                                    data: {
                                                        q: resp2['speciesGroup']['list'][it_d]['description'],
                                                        wkt: wktString
                                                    },
                                                    // POST tested string returns a number
                                                    type: 'POST',
                                                    success: function (occurrence) {
                                                        $.ajax({
                                                            url: 'https://biocache.biodivdev.at/ws/occurrences/search?q=qid:' + occurrence,
                                                            type: 'GET',
                                                            success: function (result) {
                                                                if (result['totalRecords'] !== 0) {
                                                                    speciesGroups.push(result['occurrences']);
                                                                }
                                                            }
                                                        });
                                                    }
                                                });
                                            }
                                        },
                                        error: function (xhr, status, error) {
                                            console.error(error);
                                        }
                                    });
                                    str_content += '<div><b>' + decode_utf8(response['features'][0]['properties']['BT_Lang']) + '</b></div>';

                                    if (infoPup === undefined) {
                                        infoPup = L.popup({
                                            className: 'cl_popup3',
                                            closeButton: true,
                                            closeOnClick: true
                                        });
                                    }

                                    //str_content += "<div class='cl_spGroups'><div onclick='func_spData(speciesGroups);'><i data-i18n='Artenliste für Biotoptyp anzeigen'>Artenliste für Biotoptyp anzeigen</i></div></div>";
                                    str_content += "<div onclick='func_wktData(wktString);'><i data-i18n='Funddaten für Polygon'>Funddaten für Polygon</i></div></div>";
                                    if($('.cl_capMatr').length !== 0) {
                                        $('.cl_capMatr').remove();
                                    }
                                    if($('.cl_services').length !== 0) {
                                        $('.cl_services').remove();
                                    }
                                    str_content += "<div class='cl_capMatr'><div class='cl_cntCap'><b>Capacity Matrix values</b></div></div>";
                                    if((response['features'][0]['properties']['Disturbanc'] !== undefined || response['features'][0]['properties']['Localclima'] !== undefined || response['features'][0]['properties']['Waterregul'] !== undefined || response['features'][0]['properties']['Watersuppl'] !== undefined || response['features'][0]['properties']['Pollinatio'] !== undefined)) {
                                        str_content += "<div class='cl_services cl_serv1'><b>Regulation services</b></div>";
                                        if (response['features'][0]['properties']['Disturbanc'] !== undefined) {
                                            str_content += "<div><i>Disturbance prevention: " + response['features'][0]['properties']['Disturbanc'] + "</i></div>";
                                        }
                                        if (response['features'][0]['properties']['Localclima'] !== undefined) {
                                            str_content += "<div><i>Local climate regulation: " + response['features'][0]['properties']['Localclima'] + "</i></div>";
                                        }
                                        if(response['features'][0]['properties']['Waterregul'] !== undefined) {
                                            str_content += "<div><i>Waterregulation: " + response['features'][0]['properties']['Waterregul'] + "</i></div>";
                                        }
                                        if(response['features'][0]['properties']['Watersuppl'] !== undefined) {
                                            str_content += "<div><i>Watersupply: " + response['features'][0]['properties']['Watersuppl'] + "</i></div>";
                                        }
                                        if(response['features'][0]['properties']['Pollinatio'] !== undefined) {
                                            str_content += "<div><i>Pollination: " + response['features'][0]['properties']['Pollinatio'] + "</i></div>";
                                        }
                                    }
                                    if(response['features'][0]['properties']['Refugium'] !== undefined) {
                                        str_content += "<div class='cl_services cl_serv2'><b>Habitat services</b></div>";
                                        if(response['features'][0]['properties']['Refugium'] !== undefined) {
                                            str_content += "<div><i>Refugium: " + response['features'][0]['properties']['Refugium'] + "</i></div>";
                                        }
                                    }
                                    if((response['features'][0]['properties']['Food'] !== undefined || response['features'][0]['properties']['Rawmateria'] !== undefined || response['features'][0]['properties']['Geneticres'] !== undefined)) {
                                        str_content += "<div class='cl_services cl_serv3'><b>Provision services</b></div>";
                                        if(response['features'][0]['properties']['Food'] !== undefined) {
                                            str_content += "<div><i>Food: " + response['features'][0]['properties']['Food'] + "</i></div>";
                                        }
                                        if(response['features'][0]['properties']['Rawmateria'] !== undefined) {
                                            str_content += "<div><i>Raw materials: " + response['features'][0]['properties']['Rawmateria'] + "</i></div>";
                                        }
                                        if(response['features'][0]['properties']['Geneticres'] !== undefined) {
                                            str_content += "<div><i>Genetic resources: " + response['features'][0]['properties']['Geneticres'] + "</i></div>";
                                        }
                                    }
                                    if (infoPup !== undefined) {
                                        infoPup.setLatLng(e.latlng);
                                        infoPup.setContent(str_content);
                                    }
                                    infoPup.openOn(map);
                                }
                            });
                            ly_filter.addTo(map);
                        }
                    });
                }
            }
        });
    }
    /*
    if($('.cl_search').val().length > 0) {
        $.ajax({
            url: 'http://spatial.biodivdev.at/geoserver/ECO/wfs',
            type: 'GET',
            data: {
                service: 'WFS',
                version: '2.0.0',
                request: 'GetFeature',
                typeName: 'ECO:' + layer_name,
                outputFormat: 'application/json',
                cql_filter: p_resp
            },
            success: function (response) {
                // Process the response data
                console.log(response);
            },
            error: function (xhr, status, error) {
                // Handle error
                console.error(error);
            }
        });
     */
}
var cntr = 0;
func_initMap = function () {
    if (LayerMap !== undefined) {
        map.removeLayer(LayerMap);
    }
    $('#ic_info').attr('visibility', 'hidden');
    if (chk_map == 0) {
        LayerMap = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        }).addTo(map);
    }
    if (chk_map == 1) {
        LayerMap = L.tileLayer('https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png', {
            attribution: 'Map data: &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, <a href="http://viewfinderpanoramas.org">SRTM</a> | Map style: &copy; <a href="https://opentopomap.org">OpenTopoMap</a> (<a href="https://creativecommons.org/licenses/by-sa/3.0/">CC-BY-SA</a>)',
            // page 14 Map.locate <watch, enableHighAccuracy, maxZoom>
        }).addTo(map);
    }
    if (chk_map == 2) {
        mapLink =
            '<a href="http://www.esri.com/">Esri</a>';
        wholink =
            'i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community';
        LayerMap = L.tileLayer(
            'http://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
                attribution: '&copy; ' + mapLink + ', ' + wholink,
            }).addTo(map);
    }
    if (ly_biotop !== undefined) {
        //var layer_name = 'OEKOLEITA_Biotopkartierung_03_2023';
        if ($('#id_addLayer option:selected').val() === 'noL') {
            map.removeLayer(ly_biotop);
            map.removeLayer(geoJsonLayer);
            for (it_l = 0; it_l < popupMap.length; it_l++) {
                popupMap[it_l].removeLayer(popupArr[it_l]);
            }
        }
        ly_biotop = L.tileLayer.wms('https://spatial.biodivdev.at/geoserver/ECO/wms', {
            format: 'image/svg',
            opacity: 0.6,
            layers: "ECO:" + layer_name
        });
        ly_biotop.addTo(map);
    }

    $('#id_addLayer').change(function () {
        if (ly_biotop !== undefined) {
            map.removeLayer(ly_biotop);
            map.removeLayer(geoJsonLayer);
        }
        //var layer_name = 'OEKOLEITA_Biotopkartierung_03_2023';
        ly_biotop = L.tileLayer.wms('https://spatial.biodivdev.at/geoserver/ECO/wms', {
            format: 'image/svg',
            opacity: 0.6,
            layers: "ECO:" + layer_name
        });
        ly_biotop.addTo(map);
    });
    if(cntr === 0) {
        L.Control.AttrScale = L.Control.Scale.extend({
            onAdd: function (map) {
                var className = 'leaflet-control-scale',
                    wrapper = L.DomUtil.create('div', 'leaflet-control-attr-scale'),
                    attribution = L.DomUtil.create('div', 'leaflet-control-attribution', wrapper),
                    container = L.DomUtil.create('div', className, wrapper),
                    options = this.options;

                wrapper.style.display = "flex";
                wrapper.style.alignItems = "center";

                attribution.innerHTML = LayerMap.getAttribution();

                this._addScales(options, className + '-line', container);

                map.on(options.updateWhenIdle ? 'moveend' : 'move', this._update, this);
                map.whenReady(this._update, this);

                return wrapper;
            },
        });
        map.addControl(new L.Control.AttrScale({position: 'bottomright', metric: true}));
        cntr = 1;
    }
}
$(document).ready(function() {
    // Hide all second and third level items initially
    $("#depthList ul ul").hide();

    // Add click event handler to expand/collapse items
    $("#depthList li").click(function(e) {
        e.stopPropagation();
        var $sublist = $(this).children("ul");
        if ($sublist.length > 0) {
            $sublist.slideToggle();
        }
    });
});