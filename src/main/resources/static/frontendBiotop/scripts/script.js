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
var wkt = new Array();
var wktString = new Array();
var map = L.map('map', {
    center: [48.3805228, 15.3758588],
    zoom: 10
});
var popup;
var geoJsonLayer;
var infoPup = L.popup({
    className: 'cl_popup3',
    closeButton: true,
    closeOnClick: true
});
var infoPupAll = new Array();
var str_content = new Array();
var speciesGroupsAll = new Array();
var speciesList = new Array();
var styleAll = new Array();
var ly_filterAll = new Array();
var chk = 0;
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
$(function () {
    $(".resizable").resizable({
        handles: "e, w", // Allow resizing from left and right edges only
        resize: function (event, ui) {
            // Adjust the width of the adjacent div when resizing
            var currentDiv = $(this);
            $('#map').css('width', $('#cnt_map').width() - $('#eSys').width());
        }
    });
});
func_info = function(p_id) {
    switch(p_id) {
        case "Lesesteinriegel und Trockenmauern": window.open( "https://biodiversityatlas.at/wp-content/uploads/2023/11/F5_Steckbriefe_Biotoptypen_Trockenmauern.pdf");
            break;
        case "Steilwände aus Lockersubstrat": window.open( "https://biodiversityatlas.at/wp-content/uploads/2023/11/F3_Steckbriefe_Biotoptypen_Waende.pdf");
            break;
        case "Fels": window.open( "https://biodiversityatlas.at/wp-content/uploads/2023/11/F1_Steckbriefe_Biotoptypen_Fels.pdf");
            break;
        case "Stillgewässer": window.open( "https://biodiversityatlas.at/wp-content/uploads/2023/11/B2_Steckbriefe_Biotoptypen_Stillgewaesser.pdf");
            break;
        case "Fließgewässer": window.open( "https://biodiversityatlas.at/wp-content/uploads/2023/11/B1_Steckbriefe_Biotoptypen_Fliessgewaesser.pdf");
            break;
        case "Waldsäume": window.open( "https://biodiversityatlas.at/wp-content/uploads/2023/11/A7_Steckbriefe_Biotoptypen_Waldsaeume.pdf");
            break;
        case "Hochstaudenfluren": window.open( "https://biodiversityatlas.at/wp-content/uploads/2023/11/A6_Steckbriefe_Biotoptypen_Hochstaudenfluren.pdf");
            break;
        case "Ruderalfluren": window.open( "https://biodiversityatlas.at/wp-content/uploads/2023/11/A5_Steckbriefe_Biotoptypen_Ruderalfluren.pdf");
            break;
        case "Raine und Böschungen": window.open( "https://biodiversityatlas.at/wp-content/uploads/2023/11/A4_Steckbriefe_Biotoptypen_Raine.pdf");
            break;
        case "Ackerbrachen": window.open( "https://biodiversityatlas.at/wp-content/uploads/2023/11/A3_Steckbriefe_Biotoptypen_Ackerbrachen.pdf");
            break;
        case "Weingärten": window.open( "https://biodiversityatlas.at/wp-content/uploads/2023/11/A2_Steckbriefe_Biotoptypen_Wein.pdf");
            break;
        case "Äcker": window.open( "https://biodiversityatlas.at/wp-content/uploads/2023/11/A1_Steckbriefe_Biotoptypen_Aecker.pdf");
            break;
        case "Forste": window.open( "https://biodiversityatlas.at/wp-content/uploads/2023/11/W7_Steckbriefe_Biotoptypen_Forste.pdf");
            break;
        case "Vorwälder": window.open( "https://biodiversityatlas.at/wp-content/uploads/2023/11/W6_Steckbriefe_Biotoptypen_Vorwaelder.pdf");
            break;
        case "Eichenmischwälder und Eichen-Hainbuchenwälder": window.open( "https://biodiversityatlas.at/wp-content/uploads/2023/11/W3_Steckbriefe_Biotoptypen_Eichenwaelder.pdf");
            break;
        case "Block-, Schutt-, Schlucht- und Hangwälder": window.open( "https://biodiversityatlas.at/wp-content/uploads/2023/11/W2_Steckbriefe_Biotoptypen_Hangwaelder.pdf");
            break;
        case "Auwälder": window.open( "https://biodiversityatlas.at/wp-content/uploads/2023/11/W1_Steckbriefe_Biotoptypen_Auwaelder.pdf");
            break;
        case "Verkehrsanlagen und Plätze": window.open( "https://biodiversityatlas.at/wp-content/uploads/2023/11/S_Steckbriefe_Biotoptypen_Siedlungsbiotoptypen.pdf");
            break;
        case "Siedlungsraum, Bauwerke": window.open( "https://biodiversityatlas.at/wp-content/uploads/2023/11/S_Steckbriefe_Biotoptypen_Siedlungsbiotoptypen.pdf");
            break;
        case "Lagerplätze": window.open( "https://biodiversityatlas.at/wp-content/uploads/2023/11/S_Steckbriefe_Biotoptypen_Siedlungsbiotoptypen.pdf");
            break;
        case "Abbau- und Aufschüttungsbereiche, sonstige technische Biotoptypen": window.open( "https://biodiversityatlas.at/wp-content/uploads/2023/11/S_Steckbriefe_Biotoptypen_Siedlungsbiotoptypen.pdf");
            break;
        case "Moore, Sümpfe und Quellfluren": window.open( "https://biodiversityatlas.at/wp-content/uploads/2023/11/M1_Steckbriefe_Biotoptypen_Suempfe.pdf");
            break;
        case "Kultivierte Gehölzbestände": window.open( "https://biodiversityatlas.at/wp-content/uploads/2023/11/H9_Steckbriefe_Biotoptypen_KultivierteGehoelze.pdf");
            break;
        case "Gebüsche": window.open( "https://biodiversityatlas.at/wp-content/uploads/2023/11/H7_Steckbriefe_Biotoptypen_Gebuesche.pdf");
            break;
        case "Baumgruppen": window.open( "https://biodiversityatlas.at/wp-content/uploads/2023/11/H6_Steckbriefe_Biotoptypen_BaumgruppenAlleen.pdf");
            break;
        case "Baumzeilen und Alleen": window.open( "https://biodiversityatlas.at/wp-content/uploads/2023/11/H6_Steckbriefe_Biotoptypen_BaumgruppenAlleen.pdf");
            break;
        case "Gehölzgruppen": window.open( "https://biodiversityatlas.at/wp-content/uploads/2023/11/H5_Steckbriefe_Biotoptypen_Gehoelzgruppen.pdf");
            break;
        case "Einzelgehölze, Gehölzgruppen": window.open( "https://biodiversityatlas.at/wp-content/uploads/2023/11/H4_Steckbriefe_Biotoptypen_Einzelgehoelze.pdf");
            break;
        case "Feldgehölze": window.open( "https://biodiversityatlas.at/wp-content/uploads/2023/11/H3_Steckbriefe_Biotoptypen_Feldgehoelze.pdf");
            break;
        case "Ufergehölzstreifen": window.open( "https://biodiversityatlas.at/wp-content/uploads/2023/11/H2_Steckbriefe_Biotoptypen_Ufergehoelze.pdf");
            break;
        case "Hecken, Waldmäntel und Gebüsche": window.open( "https://biodiversityatlas.at/wp-content/uploads/2023/11/H1_Steckbriefe_Biotoptypen_Hecken.pdf");
            break;
        case "Waldmäntel": window.open( "https://biodiversityatlas.at/wp-content/uploads/2023/11/H1_Steckbriefe_Biotoptypen_Hecken.pdf");
            break;
        case "Zwergstrauchheiden": window.open( "https://biodiversityatlas.at/wp-content/uploads/2023/11/G5_Steckbriefe_Biotoptypen_Zwergstrauchheiden.pdf");
            break;
        case "Trockenrasen": window.open( "https://biodiversityatlas.at/wp-content/uploads/2023/11/G4_Steckbriefe_Biotoptypen_Trockenrasen.pdf");
            break;
        case "Halbtrockenrasen": window.open( "https://biodiversityatlas.at/wp-content/uploads/2023/11/G3_Steckbriefe_Biotoptypen_Halbtrockenrasen.pdf");
            break;
        case "Grünland frischer Standorte": window.open( "https://biodiversityatlas.at/wp-content/uploads/2023/11/G2_Steckbriefe_Biotoptypen_Gruenland.pdf");
            break;
    }
}
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
            location.href = "https://ecosys.biodiversityatlas.at/biotop?lang=de_AT";
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
func_toggle_t = function (p_it_t) {
    $('.cl_l1_' + (p_it_t)).toggle();
}
func_toggle = function (p_it_t) {
    $('.cl_hov_' + (p_it_t)).toggle();
}
func_toggle_2 = function (p_it_t) {
    $('.cl_l2_' + (p_it_t)).toggle();
}
func_hide = function (p_it_t) {
    $('.cl_hov_' + (p_it_t)).hide();
}
opt_layerID.on('click change', function () {
    $('#id_title').children().remove();
    if ($('#id_addLayer').find(":selected").text().split('(')[1] !== undefined && $('#id_addLayer').find(":selected").text().split('(')[1].replaceAll(')', '') !== 'Capacity Matrix') {
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
                        var it_f = 0;
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
                                    if (resp2['filter'][it_h]['levelNumber'] >= 0) {
                                        if (resp2['filter'][it_h]['levelNumber'] == 1) {
                                            $('.cl_habitatTypes').append("<ul style='padding-left:1em' id='idSb_"+ resp2['filter'][it_h]['description'] +"' class='cl_toggle cl_idSb cl_l1_" + (it_f - 1) + " cl_tDescr_" + it_t + "'><b id='id_stb_" + it_h +"' onclick='func_toggle(" + it_t + ")'>" + resp2['filter'][it_h]['description'] + "</b><span class='cl_infoIcon' onclick='func_info(" + JSON.stringify(resp2['filter'][it_h]['description']) + ");'><svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 48 48' width='1.3em' style='margin-right:0.8em' class='cl_ptinfo'><circle cy='24' cx='24' r='24' fill='#36c'></circle><g fill='#fff'><circle cx='24' cy='11.6' r='4.7'></circle><path d='m17.4 18.8v2.15h1.13c2.26 0 2.26 1.38 2.26 1.38v15.1s0 1.38-2.26 1.38h-1.13v2.08h14.2v-2.08h-1.13c-2.26 0-2.26-1.38-2.26-1.38v-18.6'></path></g></svg></span></ul>");
                                            $('.cl_l1_' + (it_f - 1)).hide();
                                            it_t++;
                                        }
                                        if (resp2['filter'][it_h]['levelNumber'] == 2) {
                                            $('.cl_tDescr_' + (it_t - 1)).append("<li style='padding-left:2em' class='cl_hov cl_toggle cl_l2_" + (it_t - 1) + " cl_tDescr_" + (it_t - 1) + "'><b onclick='func_toggle_2(" + (it_t) + ")'>" + resp2['filter'][it_h]['description'] + "</b></li>");
                                            $('.cl_l2_' + (it_t - 1)).hide();
                                        }
                                        if (resp2['filter'][it_h]['levelNumber'] == 0) {
                                            $('.cl_habitatTypes').append("<ul style='padding-left:0em' class='cl_toggle cl_tDescr_0_" + it_f + "'><h4 onclick='func_toggle_t(" + it_f + ");'>" + resp2['filter'][it_h]['description'] + "</h4></ul>");
                                            it_f++;
                                            it_t++;
                                        }
                                    }

                                }
                                if (resp2['filter'][it_h]['levelNumber'] == 0) {
                                    $('.cl_tDescr_' + (it_t - 1)).append('<li style="padding-left:1em" class="cl_hov_' + (it_t - 1) + ' cl_hov" id="id_h_' + id + '" onclick="func_CQLSubm(' + it_h + ', ' + id + ', p_color)"><i>' + resp2['filter'][it_h]['description'] + '</i></li>');
                                    $('.cl_hov_' + (it_t - 1)).hide();
                                }
                                if (resp2['filter'][it_h]['cqlQuery'].replaceAll('\'', '').split('=')[1] !== undefined) {
                                    if (resp2['filter'][it_h]['levelNumber'] == 1) {
                                        $('.cl_tDescr_' + (it_t - 1)).append('<li style="padding-left:2em" class="cl_hov_' + (it_f - 1) + ' cl_hov" id="id_h_' + id + '" onclick="func_CQLSubm(' + it_h + ', ' + id + ', p_color)"><i>' + resp2['filter'][it_h]['description'] + '</i></li>');
                                        $('.cl_hov_' + (it_t - 1)).hide();
                                    }
                                }
                                if (resp2['filter'][it_h]['cqlQuery'].replaceAll('\'', '').split('=')[1] !== undefined) {
                                    if (resp2['filter'][it_h]['levelNumber'] == 2) {
                                        $('.cl_tDescr_' + (it_t - 1)).append('<li style="padding-left:3em" class="cl_hov_' + (it_t - 1) + ' cl_hov" id="id_h_' + id + '" onclick="func_CQLSubm(' + it_h + ', ' + id + ', p_color)"><i>' + '   ' + resp2['filter'][it_h]['cqlQuery'].replaceAll('\'', '').split('=')[1] + ' ' + resp2['filter'][it_h]['description'] + '</i></li>');
                                        $('.cl_hov_' + (it_t - 1)).hide();
                                    }
                                    if (resp2['filter'][it_h]['levelNumber'] == 3) {
                                        $('.cl_tDescr_' + (it_t - 1)).append('<li style="padding-left:3em" class="cl_hov_' + (it_t - 1) + ' cl_hov" id="id_h_' + id + '" onclick="func_CQLSubm(' + it_h + ', ' + id + ', p_color)"><i>' + '   ' + resp2['filter'][it_h]['cqlQuery'].replaceAll('\'', '').split('=')[1] + ' ' + resp2['filter'][it_h]['description'] + '</i></li>');
                                        $('.cl_hov_' + (it_t - 1)).hide();
                                    }
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
                var it_CMx_4 = 3;

                $('.cl_habitatTypes').append("<ul class='cl_toggle cl_tDescr_" + it_CMx_1 + "'><b onclick='func_toggle(" + it_CMx_1 + ")'>Regulation services</b></ul>");
                $('.cl_habitatTypes').append("<ul class='cl_toggle cl_tDescr_" + it_CMx_2 + "'><b onclick='func_toggle(" + it_CMx_2 + ")'>Habitat services</b></ul>");
                $('.cl_habitatTypes').append("<ul class='cl_toggle cl_tDescr_" + it_CMx_3 + "'><b onclick='func_toggle(" + it_CMx_3 + ")'>Provision services</b></ul>");
                $('.cl_habitatTypes').append("<ul class='cl_toggle cl_tDescr_" + it_CMx_4 + "'><b onclick='func_toggle(" + it_CMx_4 + ")'>Total Value</b></ul>");

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
                $('.cl_tDescr_' + it_CMx_4).append('<li class="cl_hov_' + (it_CMx_4) + ' cl_hov" id="id_h_' + 9 + '" onclick="func_CQLCapMatr(' + 9 + ', p_color)"><i>Total Value</i></li>');
                $('.cl_hov_' + (it_CMx_4)).hide();
            }
        });
        if ($('#id_addLayer').find(":selected").text().split('(')[1] !== undefined && $('#id_addLayer').find(":selected").text().split('(')[1].replaceAll(')', '') === 'Capacity Matrix') {
            $('.cl_habitatTypes').css('height', '26em');
            $('.cl_legend').children().remove();

            d3.selectAll('.cl_legend').append('div')
                .style('padding-left', '0.5em')
                .style('width', '200px')
                .style('height', '25em')
                .attr('class', 'cl_leg_1')
                .style('float', 'left')

            d3.selectAll('.cl_legend').append('div')
                .style('padding-left', '0.5em')
                .style('width', '200px')
                .style('height', '25em')
                .attr('class', 'cl_leg_2')
                .style('float', 'left')

            d3.selectAll('.cl_leg_1').append('div')
                .attr('class', 'cl_tLeg_1')

            d3.selectAll('.cl_tLeg_1').append('h4')
                .style('margin-left', '2em')
                .style('width', '12em')
                .attr('data-i18n', 'Legende der Services')
                .html('Legende der Services')

            d3.selectAll('.cl_leg_2').append('div')
                .attr('class', 'cl_tLeg_2')

            d3.selectAll('.cl_leg_2').append('div')
                .attr('class', 'cl_leg_2_a')
                .style('float', 'left')
            d3.selectAll('.cl_leg_2').append('div')
                .attr('class', 'cl_leg_2_b')
                .style('margin-left', '1em')
                .style('float', 'left')

            d3.selectAll('.cl_tLeg_2').append('h4')
                .style('margin-left', '2em')
                .style('width', '12em')
                .attr('data-i18n', 'Legende Total Value')
                .html('Legende Total Value')

            d3.selectAll('.cl_leg_2').append('div')
                .attr('class', 'cl_tLeg_2')
                .style('float', 'left')


            var it_0 = 0;
            var arrCol1 = new Array();
            arrCol1[0] = "rgb(255, 0, 0)";
            arrCol1[1] = "rgb(255,165,0)";
            arrCol1[2] = "rgb(255, 255, 0)";
            arrCol1[3] = "rgb(0, 188, 0)";
            arrCol1[4] = "rgb(0, 255, 0)";

            for (it_0 = 0; it_0 < 5; it_0++) {

                d3.selectAll('.cl_leg_1').append('div')
                    .attr('class', 'cl_' + it_0)
                    .style('margin-left', '4.5em')
                    .style('margin-bottom', '1em')
                    .style('width', '2em')
                    .style('height', '1em')
                    .html('<b style="background-color: white;  margin-left: -2em">' + (it_0 + 1) + '</b>')
                    .style('background-color', arrCol1[it_0])
            }
            it_0 = 0;
            var arrCol2 = new Array();
            arrCol2[0] = "rgb(250, 25, 0)";
            arrCol2[1] = "rgb(250,50,0)";
            arrCol2[2] = "rgb(225, 75, 0)";
            arrCol2[3] = "rgb(225, 100, 0)";
            arrCol2[4] = "rgb(200, 125, 0)";
            arrCol2[5] = "rgb(200, 150, 0)";
            arrCol2[6] = "rgb(175, 175,0)";
            arrCol2[7] = "rgb(175, 200, 0)";
            arrCol2[8] = "rgb(150, 225, 0)";
            arrCol2[9] = "rgb(150, 250, 0)";

            for (it_0 = 0; it_0 < 5; it_0++) {

                d3.selectAll('.cl_leg_2_a').append('div')
                    .attr('class', 'cl_2' + it_0)
                    .style('margin-left', '4.5em')
                    .style('margin-bottom', '1em')
                    .style('width', '2em')
                    .style('height', '1em')
                    .html('<b style="background-color: white; margin-left: -2em">' + (it_0 + 1) + '</b>')
                    .style('background-color', arrCol2[it_0])
            }
            for (it_0 = 5; it_0 < 10; it_0++) {

                d3.selectAll('.cl_leg_2_b').append('div')
                    .attr('class', 'cl_2' + it_0)
                    .style('margin-left', '2.5em')
                    .style('margin-bottom', '1em')
                    .style('width', '2em')
                    .style('height', '1em')
                    .html('<b style="background-color: white; margin-left: -2em">' + (it_0 + 1) + '</b>')
                    .style('background-color', arrCol2[it_0])
            }
        }
    } else {
        $('.cl_legend').children().remove();
    }
});
func_closedPopup = function () {
    cnt_nav.animate({
        'width': '0em', 'display': 'none'
    }, 100);
}
func_CQLFull = function () {
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
                url: 'https://spatial.biodiversityatlas.at/geoserver/ECO/wfs',
                type: 'GET',
                data: {
                    service: 'WFS',
                    version: '1.0.0',
                    request: 'GetFeature',
                    typeName: 'ECO:' + layer_name,
                    outputFormat: 'application/json',
                },
                success: function (response) {
                    if (ly_filter !== undefined) {
                        map.removeLayer(ly_filter);
                    }
                    if (geoJsonLayer !== undefined) {
                        map.removeLayer(geoJsonLayer);
                    }
                    geoJsonLayer = L.geoJSON(response);
                    geoJsonLayer.eachLayer(function (layer) {
                        // Set the opacity of each feature using setStyle
                        layer.setStyle({opacity: 0.01});
                    });
                    //map.fitBounds(geoJsonLayer.getBounds());
                    geoJsonLayer.on('click', function (e) {
                        console.log(resp['filter']);
                        for (it_h = 0; it_h < resp['filter'].length; it_h++) {
                            if ($('#id_h_' + resp['filter'][it_h]['id']).attr('class') !== undefined) {
                                func_hide(parseInt($('#id_h_' + resp['filter'][it_h]['id']).attr('class').split('_')[2].split(' ')[0]));
                            }
                        }
                        for (it_h = 0; it_h < resp['filter'].length; it_h++) {
                            //console.log(resp['filter'][it_h]['cqlQuery']);
                            //console.log('BT_Code=' + '\'' + e.layer.feature.properties.BT_Code + '\'');
                            if (resp['filter'][it_h]['cqlQuery'] === 'BT_Code=' + '\'' + e.layer.feature.properties.BT_Code + '\'') {
                                console.log($('#id_h_' + resp['filter'][it_h]['id']).attr('class').split('_'));
                                $('#id_h_' + resp['filter'][it_h]['id']).click();
                                //func_CQLSubm(it_h, resp['filter'][it_h]['id']);
                                //func_toggle(parseInt($('#id_h_' + resp['filter'][it_h]['id']).attr('class').split('_')[2].split(' ')[0]));
                                
                            }
                        }
                        /*
                        popup = new L.popup({
                            className: 'cl_popup2',
                            closeButton: false,
                            closeOnClick: true
                        })
                            .setLatLng(e.latlng)
                            .setContent(decode_utf8(e.layer.feature.properties.BT_Lang));

                         */
                        map.on('popupclose', func_closedPopup);
                        // Create a custom popup
                        $.ajax({
                            url: 'https://spatial.biodiversityatlas.at/geoserver/ECO/wfs',
                            type: 'GET',
                            data: {
                                service: 'WFS',
                                version: '1.0.0',
                                request: 'GetFeature',
                                typeName: 'ECO:' + layer_name,
                                outputFormat: 'application/json',
                                cql_filter: 'BT_Code=' + e.layer.feature.properties.BT_Code
                            },
                            success: function (response) {
                                if (response['features'] !== undefined) {
                                    if (response['features'][0]['properties']['AK_FNR'] !== undefined) {
                                        map.removeLayer(ly_biotop);
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
                                        ly_filter.on('mouseover', function (event) {
                                            popup.remove();
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
                                                wktString += wkt[it_w][0].toFixed(5) + " " + wkt[it_w][1].toFixed(5) + ",";
                                            }
                                            wktString += wkt[0][0].toFixed(5) + " " + wkt[0][1].toFixed(5) + ")))";
                                            console.log(response['features'][0]['properties']['AK_FNR']);
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
                                                success: function (resp) {
                                                    $('#id_spList').children().remove();
                                                    console.log(wktString);
                                                    for (it_d = 0; it_d < resp['speciesGroup']['list'].length; it_d++) {
                                                        $.ajax({
                                                            //url: 'https://biocache.biodiversityatlas.at/ws/occurrences/search?q=' + resp['speciesGroup']['list'][it_d]['description'] +'&qc=&wkt=' + wktString,
                                                            url: 'https://biocache.biodiversityatlas.at/ws/webportal/params?',
                                                            data: {
                                                                q: resp['speciesGroup']['list'][it_d]['description'],
                                                                wkt: wktString
                                                            },
                                                            // POST tested string returns a number
                                                            type: 'POST',
                                                            success: function (occurrence) {
                                                                $.ajax({
                                                                    url: 'https://biocache.biodiversityatlas.at/ws/occurrences/search?q=qid:' + occurrence,
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
                                        });
                                        ly_filter.addTo(map);
                                    }
                                } else {
                                    console.log("enthält keine Features");
                                }
                            }
                        });
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
func_CQLCapMatr = function(p_id, p_color) {
    $('.cl_hov').css('list-style-type', 'none');
    $('.cl_hov').css('background-color', '#ffffff');
    $('.cl_hov').css('color', '#637073');
    $('#id_h_' + p_id).css('background-color', '#49754a');
    $('#id_h_' + p_id).css('color', '#ffffff');
    map.on('popupclose', func_closedPopup);
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
                        url: 'https://spatial.biodiversityatlas.at/geoserver/ECO/wfs',
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
                            if (p_id === 0) {
                                tmp_CMx_name = 'Disturbanc';
                            }
                            if (p_id === 1) {
                                tmp_CMx_name = 'Localclima';
                            }
                            if (p_id === 2) {
                                tmp_CMx_name = 'Waterregul';
                            }
                            if (p_id === 3) {
                                tmp_CMx_name = 'Watersuppl';
                            }
                            if (p_id === 4) {
                                tmp_CMx_name = 'Pollinatio';
                            }
                            if (p_id === 5) {
                                tmp_CMx_name = 'Refugium';
                            }
                            if (p_id === 6) {
                                tmp_CMx_name = 'Food';
                            }
                            if (p_id === 7) {
                                tmp_CMx_name = 'Rawmateria';
                            }
                            if (p_id === 8) {
                                tmp_CMx_name = 'Geneticres';
                            }
                            if (p_id === 9) {
                                tmp_CMx_name = 'TotalValue';
                            }
                            if (p_id !== 9) {
                                if (response !== undefined && response['features'] !== undefined) {
                                    if (geoJsonLayer !== undefined) {
                                        map.removeLayer(geoJsonLayer);
                                    }
                                    if (parseInt(response['features'][0]['properties'][tmp_CMx_name]) === 1) {
                                        styleAll[it_a] = {
                                            fillColor: 'rgb(255, 0, 0)',
                                            weight: 2,
                                            opacity: 1,
                                            color: 'rgb(255, 0, 0)',
                                            fillOpacity: 1
                                        };
                                    }
                                    if (parseInt(response['features'][0]['properties'][tmp_CMx_name]) === 2) {
                                        styleAll[it_a] = {
                                            fillColor: 'rgb(255,165,0)',
                                            weight: 2,
                                            opacity: 1,
                                            color: 'rgb(255,165,0)',
                                            fillOpacity: 1
                                        };
                                    }
                                    if (parseInt(response['features'][0]['properties'][tmp_CMx_name]) === 3) {
                                        styleAll[it_a] = {
                                            fillColor: 'rgb(255, 255, 0)',
                                            weight: 2,
                                            opacity: 1,
                                            color: 'rgb(255, 255, 0)',
                                            fillOpacity: 1
                                        };
                                    }
                                    if (parseInt(response['features'][0]['properties'][tmp_CMx_name]) === 4) {
                                        styleAll[it_a] = {
                                            fillColor: 'rgb(0, 188, 0)',
                                            weight: 2,
                                            opacity: 1,
                                            color: 'rgb(0, 188, 0)',
                                            fillOpacity: 1
                                        };
                                    }
                                    if (parseInt(response['features'][0]['properties'][tmp_CMx_name]) === 5) {
                                        styleAll[it_a] = {
                                            fillColor: 'rgb(0, 255, 0)',
                                            weight: 2,
                                            opacity: 1,
                                            color: 'rgb(0, 255, 0)',
                                            fillOpacity: 1
                                        };
                                    }
                                }
                            }
                            if (p_id === 9) {
                                if (response !== undefined && response['features'] !== undefined) {
                                    if (geoJsonLayer !== undefined) {
                                        map.removeLayer(geoJsonLayer);
                                    }
                                    if (parseInt(response['features'][0]['properties'][tmp_CMx_name]) >= 26 + (((92 - 26) / 10) * 0) && parseInt(response['features'][0]['properties'][tmp_CMx_name]) < 26 + (((92 - 26) / 10) * 1)) {
                                        styleAll[it_a] = {
                                            fillColor: 'rgb(250, 25, 0)',
                                            weight: 2,
                                            opacity: 1,
                                            color: 'rgb(250, 25, 0)',
                                            fillOpacity: 1
                                        };
                                    }
                                    if (parseInt(response['features'][0]['properties'][tmp_CMx_name]) >= 26 + (((92 - 26) / 10) * 1) && parseInt(response['features'][0]['properties'][tmp_CMx_name]) < 26 + (((92 - 26) / 10) * 2)) {
                                        styleAll[it_a] = {
                                            fillColor: 'rgb(225,50,0)',
                                            weight: 2,
                                            opacity: 1,
                                            color: 'rgb(225,50,0)',
                                            fillOpacity: 1
                                        };
                                    }
                                    if (parseInt(response['features'][0]['properties'][tmp_CMx_name]) >= 26 + (((92 - 26) / 10) * 2) && parseInt(response['features'][0]['properties'][tmp_CMx_name]) < 26 + (((92 - 26) / 10) * 3)) {
                                        styleAll[it_a] = {
                                            fillColor: 'rgb(200, 75, 0)',
                                            weight: 2,
                                            opacity: 1,
                                            color: 'rgb(200, 75, 0)',
                                            fillOpacity: 1
                                        };
                                    }
                                    if (parseInt(response['features'][0]['properties'][tmp_CMx_name]) >= 26 + (((92 - 26) / 10) * 3) && parseInt(response['features'][0]['properties'][tmp_CMx_name]) < 26 + (((92 - 26) / 10) * 4)) {
                                        styleAll[it_a] = {
                                            fillColor: 'rgb(175, 100, 0)',
                                            weight: 2,
                                            opacity: 1,
                                            color: 'rgb(175, 100, 0)',
                                            fillOpacity: 1
                                        };
                                    }
                                    if (parseInt(response['features'][0]['properties'][tmp_CMx_name]) >= 26 + (((92 - 26) / 10) * 4)) {
                                        styleAll[it_a] = {
                                            fillColor: 'rgb(150, 125, 0)',
                                            weight: 2,
                                            opacity: 1,
                                            color: 'rgb(150, 125, 0)',
                                            fillOpacity: 1
                                        };
                                    }
                                    if (parseInt(response['features'][0]['properties'][tmp_CMx_name]) >= 26 + (((92 - 26) / 10) * 4) && parseInt(response['features'][0]['properties'][tmp_CMx_name]) < 26 + (((92 - 26) / 10) * 5)) {
                                        styleAll[it_a] = {
                                            fillColor: 'rgb(150, 150, 0)',
                                            weight: 2,
                                            opacity: 1,
                                            color: 'rgb(150, 150, 0)',
                                            fillOpacity: 1
                                        };
                                    }
                                    if (parseInt(response['features'][0]['properties'][tmp_CMx_name]) >= 26 + (((92 - 26) / 10) * 5) && parseInt(response['features'][0]['properties'][tmp_CMx_name]) < 26 + (((92 - 26) / 10) * 6)) {
                                        styleAll[it_a] = {
                                            fillColor: 'rgb(125,175,0)',
                                            weight: 2,
                                            opacity: 1,
                                            color: 'rgb(125,175,0)',
                                            fillOpacity: 1
                                        };
                                    }
                                    if (parseInt(response['features'][0]['properties'][tmp_CMx_name]) >= 26 + (((92 - 26) / 10) * 6) && parseInt(response['features'][0]['properties'][tmp_CMx_name]) < 26 + (((92 - 26) / 10) * 7)) {
                                        styleAll[it_a] = {
                                            fillColor: 'rgb(100, 200, 0)',
                                            weight: 2,
                                            opacity: 1,
                                            color: 'rgb(100, 200, 0)',
                                            fillOpacity: 1
                                        };
                                    }
                                    if (parseInt(response['features'][0]['properties'][tmp_CMx_name]) >= 26 + (((92 - 26) / 10) * 7) && parseInt(response['features'][0]['properties'][tmp_CMx_name]) < 26 + (((92 - 26) / 10) * 8)) {
                                        styleAll[it_a] = {
                                            fillColor: 'rgb(100, 225, 0)',
                                            weight: 2,
                                            opacity: 1,
                                            color: 'rgb(100, 225, 0)',
                                            fillOpacity: 1
                                        };
                                    }
                                    if (parseInt(response['features'][0]['properties'][tmp_CMx_name]) >= 26 + (((92 - 26) / 10) * 8)) {
                                        styleAll[it_a] = {
                                            fillColor: 'rgb(75, 250, 0)',
                                            weight: 2,
                                            opacity: 1,
                                            color: 'rgb(75, 250, 0)',
                                            fillOpacity: 1
                                        };
                                    }
                                }
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
                            if (response['features'] !== undefined) {
                                ly_filterAll[it_a] = L.geoJSON(response, {style: styleAll[it_a]});
                                //map.fitBounds(ly_filterAll[it_a].getBounds());
                                ly_filterAll[it_a].on('click', function(event) {
                                    if(popup !== undefined) {
                                        popup.remove();
                                    }
                                });
                                ly_filterAll[it_a].on('click', function (e) {
                                    var clickedFeature = e.layer.feature;
                                    wkt = new Array();
                                    // Convert the clicked feature's geometry to a WKT string
                                    turf.coordEach(clickedFeature, function (coord) {
                                        wkt.push(coord);
                                    }, 'wkt');
                                    wktString = "MULTIPOLYGON(((";
                                    for (it_w = 0; it_w < wkt.length; it_w++) {
                                        wktString += wkt[it_w][0].toFixed(5) + " " + wkt[it_w][1].toFixed(5) + ",";
                                    }
                                    wktString += wkt[0][0].toFixed(5) + " " + wkt[0][1].toFixed(5) + ")))";
                                    console.log(wktString);
                                    str_content = '';
                                    var tmp_AK_FNR = url_ecosys + url_apiProjects + '/' + opt_layerID.val() + '/species/' + response['features'][0]['properties']['AK_FNR'];
                                    if (tmp_AK_FNR !== undefined || tmp_AK_FNR !== '') {
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
                                                speciesGroups = new Array();
                                                speciesList = new Array();
                                                for (it_d = 1; it_d < parseInt(resp2['speciesGroup']['list'].length); it_d++) {
                                                    if(resp2['speciesGroup']['list'][it_d - 1]['taxonId'] !== resp2['speciesGroup']['list'][it_d]['taxonId']) {
                                                        speciesList.push(resp2['speciesGroup']['list'][it_d - 1]);
                                                    }
                                                    if(it_d == parseInt(resp2['speciesGroup']['list'].length) - 1 &&  resp2['speciesGroup']['list'][it_d - 1]['taxonId'] !== resp2['speciesGroup']['list'][it_d]['taxonId']) {
                                                        speciesList.push(resp2['speciesGroup']['list'][it_d]);
                                                    }
                                                }
                                                for (it_d = 0; it_d < speciesList.length; it_d++) {
                                                    $.ajax({
                                                        //url: 'https://biocache.biodiversityatlas.at/ws/occurrences/search?q=' + resp['speciesGroup']['list'][it_d]['description'] +'&qc=&wkt=' + wktString,
                                                        url: 'https://biocache.biodiversityatlas.at/ws/webportal/params?',
                                                        data: {
                                                            q: encodeURIComponent(speciesList[it_d]['description']),
                                                            wkt: wktString
                                                        },
                                                        // POST tested string returns a number
                                                        type: 'POST',
                                                        success: function (occurrence) {
                                                            $.ajax({
                                                                url: 'https://biocache.biodiversityatlas.at/ws/occurrences/search?q=qid:' + occurrence,
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

                                        infoPupAll = L.popup({
                                            className: 'cl_popup3',
                                            closeButton: true,
                                            closeOnClick: true
                                        });
                                        if(response['features'][0]['properties']['AK_FNR'] !== '') {
                                            str_content += "<div class='cl_spGroups'><div onclick='func_spData(speciesGroups);'><i title='Alle Arten, die in diesem Biotop (ausgewähltes Polygon) vorkommen.' data-i18n='Biotop-Artenliste anzeigen'>Biotop-Artenliste anzeigen</i></div></div>";
                                        }

                                        str_content += "<div onclick='func_wktData(wktString);'><i title='Alle Funddaten, die im BDA für dieses Polygon verortet sind werden angezeigt)' data-i18n='Alle Funddaten anzeigen'>Alle Funddaten anzeigen</i></div></div>";
                                        if (response['features'][0]['properties']['Disturbanc'] === undefined && response['features'][0]['properties']['Localclima'] === undefined && response['features'][0]['properties']['Waterregul'] === undefined && response['features'][0]['properties']['Waterregul'] === undefined && response['features'][0]['properties']['Watersuppl'] === undefined && response['features'][0]['properties']['Pollinatio'] === undefined && response['features'][0]['properties']['Refugium'] === undefined && response['features'][0]['properties']['Food'] === undefined && response['features'][0]['properties']['Rawmateria'] === undefined && response['features'][0]['properties']['Geneticres'] === undefined) {
                                            infoPupAll.setLatLng(e.latlng);
                                            infoPupAll.setContent(str_content);
                                            infoPupAll.openOn(map);
                                        } else {
                                            if ($('.cl_capMatr').length !== 0) {
                                                $('.cl_capMatr').remove();
                                            }
                                            if ($('.cl_services').length !== 0) {
                                                $('.cl_services').remove();
                                            }
                                            str_content += "<div class='cl_capMatr'><div class='cl_cntCap'><b>Capacity Matrix values</b></div></div>";
                                            if ((response['features'][0]['properties']['Disturbanc'] !== undefined || response['features'][0]['properties']['Localclima'] !== undefined || response['features'][0]['properties']['Waterregul'] !== undefined || response['features'][0]['properties']['Watersuppl'] !== undefined || response['features'][0]['properties']['Pollinatio'] !== undefined)) {
                                                str_content += "<div class='cl_services cl_serv1'><b>Regulation services</b></div>";
                                                if (response['features'][0]['properties']['Disturbanc'] !== undefined) {
                                                    str_content += "<div><i>Disturbance prevention: " + response['features'][0]['properties']['Disturbanc'] + "</i></div>";
                                                }
                                                if (response['features'][0]['properties']['Localclima'] !== undefined) {
                                                    str_content += "<div><i>Local climate regulation: " + response['features'][0]['properties']['Localclima'] + "</i></div>";
                                                }
                                                if (response['features'][0]['properties']['Waterregul'] !== undefined) {
                                                    str_content += "<div><i>Waterregulation: " + response['features'][0]['properties']['Waterregul'] + "</i></div>";
                                                }
                                                if (response['features'][0]['properties']['Watersuppl'] !== undefined) {
                                                    str_content += "<div><i>Watersupply: " + response['features'][0]['properties']['Watersuppl'] + "</i></div>";
                                                }
                                                if (response['features'][0]['properties']['Pollinatio'] !== undefined) {
                                                    str_content += "<div><i>Pollination: " + response['features'][0]['properties']['Pollinatio'] + "</i></div>";
                                                }
                                            }
                                            if (response['features'][0]['properties']['Refugium'] !== undefined) {
                                                str_content += "<div class='cl_services cl_serv2'><b>Habitat services</b></div>";
                                                if (response['features'][0]['properties']['Refugium'] !== undefined) {
                                                    str_content += "<div><i>Refugium: " + response['features'][0]['properties']['Refugium'] + "</i></div>";
                                                }
                                            }
                                            if ((response['features'][0]['properties']['Food'] !== undefined || response['features'][0]['properties']['Rawmateria'] !== undefined || response['features'][0]['properties']['Geneticres'] !== undefined)) {
                                                str_content += "<div class='cl_services cl_serv3'><b>Provision services</b></div>";
                                                if (response['features'][0]['properties']['Food'] !== undefined) {
                                                    str_content += "<div><i>Food: " + response['features'][0]['properties']['Food'] + "</i></div>";
                                                }
                                                if (response['features'][0]['properties']['Rawmateria'] !== undefined) {
                                                    str_content += "<div><i>Raw materials: " + response['features'][0]['properties']['Rawmateria'] + "</i></div>";
                                                }
                                                if (response['features'][0]['properties']['Geneticres'] !== undefined) {
                                                    str_content += "<div><i>Genetic resources: " + response['features'][0]['properties']['Geneticres'] + "</i></div>";
                                                }
                                            }
                                            if (response['features'][0]['properties']['TotalValue'] !== undefined) {
                                                str_content += "<div><b>Total Value: " + response['features'][0]['properties']['TotalValue'] + "</b></div>";
                                            }

                                            infoPupAll.setLatLng(e.latlng);
                                            infoPupAll.setContent(str_content);
                                            infoPupAll.openOn(map);

                                        }
                                        if (speciesGroups !== undefined && !speciesGroups.length) {
                                            if (infoPupAll !== undefined) {
                                                infoPupAll.setLatLng(e.latlng);
                                                infoPupAll.setContent(str_content);
                                            } else {
                                                infoPupAll = L.popup({
                                                    className: 'cl_popup3',
                                                    closeButton: true,
                                                    closeOnClick: true
                                                });
                                                infoPupAll.setLatLng(e.latlng);
                                                infoPupAll.setContent(str_content);
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
                    });
                }
            }
        }
    });
}
func_SpeciesInfo = function (spData) {
    console.log("clicked");
}
func_wktData = function (p_wkt) {
    url_linkBioc = "https://biocache.biodiversityatlas.at/occurrences/search?q=*%3A*&qc=&wkt=" + p_wkt;
    window.open(url_linkBioc, '_blank');
}
func_spData = function (item) {
    if(item.length > 0) {
        cnt_nav.animate({
            'width': '52em', 'display': 'block'
        }, 100);

    }
    var listContainer = document.getElementById("id_spList");
    listContainer.innerHTML = "";
    var list = document.createElement("ul");
    var listItem = new Array();
    var tmpItem = new Array();
    tmpItem = new Array();
    for (it_i = 0; it_i < item.length; it_i++) {
        listItem[it_i] = new Array();
        item[it_i].filter(function (itm) {
            var i = tmpItem.findIndex(x => x.scientificName == itm.scientificName);
            if (i <= -1) {
                tmpItem.push({scientificName: itm.scientificName, raw_vernacularName: itm.raw_vernacularName});
            }
            return null;
        });
        console.log(tmpItem);
    }
    for (it_i = 0; it_i < tmpItem.length; it_i++) {
        listItem[it_i] = document.createElement("li");
        if (tmpItem[it_i].raw_vernacularName !== undefined) {
            listItem[it_i].innerHTML += '<b>' + tmpItem[it_i].scientificName + '</b><i> Name: </i><b>' + tmpItem[it_i].raw_vernacularName + '</b>';
        } else {
            listItem[it_i].innerHTML += '<b>' + tmpItem[it_i].scientificName + '</b>';
        }
        list.appendChild(listItem[it_i]);
    }
    listContainer.appendChild(list);
}
var chk_id = 0;
func_CQLSubm = function (p_id, r_id, p_color) {
    if(infoPup !== undefined) {
        map.closePopup(infoPup);
    }
    if (chk_id === r_id) {
        opt_layerID.click();
    } else {
        chk_id = r_id;
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
                    console.log("check1");
                    $.ajax({
                        url: 'https://spatial.biodiversityatlas.at/geoserver/ECO/wfs',
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
                            /*
                            ly_filter.on('mouseover', function(event) {
                                popup.remove();
                            });
                             */
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
                                    wktString += wkt[it_w][0].toFixed(5) + " " + wkt[it_w][1].toFixed(5) + ",";
                                }
                                wktString += wkt[0][0].toFixed(5) + " " + wkt[0][1].toFixed(5) + ")))";
                                //console.log(response['features'][0]['properties']['AK_FNR']);

                                var str_content = '';
                                if (response['features'][0] !== undefined) {
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
                                            $('#id_spList').children().remove();
                                            console.log(wktString);
                                            speciesGroups = new Array();
                                            //str_content += "<div><input type='button' onclick=func_SpeciesInfo(resp2['speciesGroup']['list'])'></input></div>";
                                            for (it_d = 0; it_d < resp2['speciesGroup']['list'].length; it_d++) {
                                                $.ajax({
                                                    //url: 'https://biocache.biodiversityatlas.at/ws/occurrences/search?q=' + resp['speciesGroup']['list'][it_d]['description'] +'&qc=&wkt=' + wktString,
                                                    url: 'https://biocache.biodiversityatlas.at/ws/webportal/params?',
                                                    data: {
                                                        q: resp2['speciesGroup']['list'][it_d]['description'],
                                                        wkt: wktString
                                                    },
                                                    // POST tested string returns a number
                                                    type: 'POST',
                                                    success: function (occurrence) {
                                                        $.ajax({
                                                            url: 'https://biocache.biodiversityatlas.at/ws/occurrences/search?q=qid:' + occurrence,
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
                                    if(response['features'][0]['properties']['AK_FNR'] !== '') {
                                        str_content += "<div class='cl_spGroups'><div onclick='func_spData(speciesGroups);'><i title='Alle Arten, die in diesem Biotop (ausgewähltes Polygon) vorkommen.' data-i18n='Biotop-Artenliste anzeigen'>Biotop-Artenliste anzeigen</i></div></div>";
                                    }
                                    str_content += "<div  onclick='func_wktData(wktString);'><i title='Alle Funddaten, die im BDA für dieses Polygon verortet sind werden angezeigt' data-i18n='Alle Funddaten anzeigen'>Alle Funddaten anzeigen</i></div></div>";
                                    if (response['features'][0]['properties']['Disturbanc'] === undefined && response['features'][0]['properties']['Localclima'] === undefined && response['features'][0]['properties']['Waterregul'] === undefined && response['features'][0]['properties']['Waterregul'] === undefined && response['features'][0]['properties']['Watersuppl'] === undefined && response['features'][0]['properties']['Pollinatio'] === undefined && response['features'][0]['properties']['Refugium'] === undefined && response['features'][0]['properties']['Food'] === undefined && response['features'][0]['properties']['Rawmateria'] === undefined && response['features'][0]['properties']['Geneticres'] === undefined) {
                                        infoPup.setLatLng(e.latlng);
                                        infoPup.setContent(str_content);
                                        infoPup.openOn(map);
                                    } else {
                                        if ($('.cl_capMatr').length !== 0) {
                                            $('.cl_capMatr').remove();
                                        }
                                        if ($('.cl_services').length !== 0) {
                                            $('.cl_services').remove();
                                        }
                                        str_content += "<div class='cl_capMatr'><div class='cl_cntCap'><b>Capacity Matrix values</b></div></div>";
                                        if ((response['features'][0]['properties']['Disturbanc'] !== undefined || response['features'][0]['properties']['Localclima'] !== undefined || response['features'][0]['properties']['Waterregul'] !== undefined || response['features'][0]['properties']['Watersuppl'] !== undefined || response['features'][0]['properties']['Pollinatio'] !== undefined)) {
                                            str_content += "<div class='cl_services cl_serv1'><b>Regulation services</b></div>";
                                            if (response['features'][0]['properties']['Disturbanc'] !== undefined) {
                                                str_content += "<div><i>Disturbance prevention: " + response['features'][0]['properties']['Disturbanc'] + "</i></div>";
                                            }
                                            if (response['features'][0]['properties']['Localclima'] !== undefined) {
                                                str_content += "<div><i>Local climate regulation: " + response['features'][0]['properties']['Localclima'] + "</i></div>";
                                            }
                                            if (response['features'][0]['properties']['Waterregul'] !== undefined) {
                                                str_content += "<div><i>Waterregulation: " + response['features'][0]['properties']['Waterregul'] + "</i></div>";
                                            }
                                            if (response['features'][0]['properties']['Watersuppl'] !== undefined) {
                                                str_content += "<div><i>Watersupply: " + response['features'][0]['properties']['Watersuppl'] + "</i></div>";
                                            }
                                            if (response['features'][0]['properties']['Pollinatio'] !== undefined) {
                                                str_content += "<div><i>Pollination: " + response['features'][0]['properties']['Pollinatio'] + "</i></div>";
                                            }
                                        }
                                        if (response['features'][0]['properties']['Refugium'] !== undefined) {
                                            str_content += "<div class='cl_services cl_serv2'><b>Habitat services</b></div>";
                                            if (response['features'][0]['properties']['Refugium'] !== undefined) {
                                                str_content += "<div><i>Refugium: " + response['features'][0]['properties']['Refugium'] + "</i></div>";
                                            }
                                        }
                                        if ((response['features'][0]['properties']['Food'] !== undefined || response['features'][0]['properties']['Rawmateria'] !== undefined || response['features'][0]['properties']['Geneticres'] !== undefined)) {
                                            str_content += "<div class='cl_services cl_serv3'><b>Provision services</b></div>";
                                            if (response['features'][0]['properties']['Food'] !== undefined) {
                                                str_content += "<div><i>Food: " + response['features'][0]['properties']['Food'] + "</i></div>";
                                            }
                                            if (response['features'][0]['properties']['Rawmateria'] !== undefined) {
                                                str_content += "<div><i>Raw materials: " + response['features'][0]['properties']['Rawmateria'] + "</i></div>";
                                            }
                                            if (response['features'][0]['properties']['Geneticres'] !== undefined) {
                                                str_content += "<div><i>Genetic resources: " + response['features'][0]['properties']['Geneticres'] + "</i></div>";
                                            }
                                        }
                                        if (response['features'][0]['properties']['TotalValue'] !== undefined) {
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
                                            $('#id_spList').children().remove();
                                            console.log(wktString);
                                            speciesGroups = new Array();
                                            //str_content += "<div><input type='button' onclick=func_SpeciesInfo(resp2['speciesGroup']['list'])'></input></div>";
                                            for (it_d = 0; it_d < resp2['speciesGroup']['list'].length; it_d++) {
                                                $.ajax({
                                                    //url: 'https://biocache.biodiversityatlas.at/ws/occurrences/search?q=' + resp['speciesGroup']['list'][it_d]['description'] +'&qc=&wkt=' + wktString,
                                                    url: 'https://biocache.biodiversityatlas.at/ws/webportal/params?',
                                                    data: {
                                                        q: resp2['speciesGroup']['list'][it_d]['description'],
                                                        wkt: wktString
                                                    },
                                                    // POST tested string returns a number
                                                    type: 'POST',
                                                    success: function (occurrence) {
                                                        $.ajax({
                                                            url: 'https://biocache.biodiversityatlas.at/ws/occurrences/search?q=qid:' + occurrence,
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
                                    str_content += "<div onclick='func_wktData(wktString);'><i title='Alle Funddaten, die im BDA für dieses Polygon verortet sind werden angezeigt' data-i18n='Alle Funddaten anzeigen'>Alle Funddaten anzeigen</i></div></div>";
                                    if ($('.cl_capMatr').length !== 0) {
                                        $('.cl_capMatr').remove();
                                    }
                                    if ($('.cl_services').length !== 0) {
                                        $('.cl_services').remove();
                                    }
                                    str_content += "<div class='cl_capMatr'><div class='cl_cntCap'><b>Capacity Matrix values</b></div></div>";
                                    if ((response['features'][0]['properties']['Disturbanc'] !== undefined || response['features'][0]['properties']['Localclima'] !== undefined || response['features'][0]['properties']['Waterregul'] !== undefined || response['features'][0]['properties']['Watersuppl'] !== undefined || response['features'][0]['properties']['Pollinatio'] !== undefined)) {
                                        str_content += "<div class='cl_services cl_serv1'><b>Regulation services</b></div>";
                                        if (response['features'][0]['properties']['Disturbanc'] !== undefined) {
                                            str_content += "<div><i>Disturbance prevention: " + response['features'][0]['properties']['Disturbanc'] + "</i></div>";
                                        }
                                        if (response['features'][0]['properties']['Localclima'] !== undefined) {
                                            str_content += "<div><i>Local climate regulation: " + response['features'][0]['properties']['Localclima'] + "</i></div>";
                                        }
                                        if (response['features'][0]['properties']['Waterregul'] !== undefined) {
                                            str_content += "<div><i>Waterregulation: " + response['features'][0]['properties']['Waterregul'] + "</i></div>";
                                        }
                                        if (response['features'][0]['properties']['Watersuppl'] !== undefined) {
                                            str_content += "<div><i>Watersupply: " + response['features'][0]['properties']['Watersuppl'] + "</i></div>";
                                        }
                                        if (response['features'][0]['properties']['Pollinatio'] !== undefined) {
                                            str_content += "<div><i>Pollination: " + response['features'][0]['properties']['Pollinatio'] + "</i></div>";
                                        }
                                    }
                                    if (response['features'][0]['properties']['Refugium'] !== undefined) {
                                        str_content += "<div class='cl_services cl_serv2'><b>Habitat services</b></div>";
                                        if (response['features'][0]['properties']['Refugium'] !== undefined) {
                                            str_content += "<div><i>Refugium: " + response['features'][0]['properties']['Refugium'] + "</i></div>";
                                        }
                                    }
                                    if ((response['features'][0]['properties']['Food'] !== undefined || response['features'][0]['properties']['Rawmateria'] !== undefined || response['features'][0]['properties']['Geneticres'] !== undefined)) {
                                        str_content += "<div class='cl_services cl_serv3'><b>Provision services</b></div>";
                                        if (response['features'][0]['properties']['Food'] !== undefined) {
                                            str_content += "<div><i>Food: " + response['features'][0]['properties']['Food'] + "</i></div>";
                                        }
                                        if (response['features'][0]['properties']['Rawmateria'] !== undefined) {
                                            str_content += "<div><i>Raw materials: " + response['features'][0]['properties']['Rawmateria'] + "</i></div>";
                                        }
                                        if (response['features'][0]['properties']['Geneticres'] !== undefined) {
                                            str_content += "<div><i>Genetic resources: " + response['features'][0]['properties']['Geneticres'] + "</i></div>";
                                        }
                                    }
                                    if (response['features'][0]['properties']['TotalValue'] !== undefined) {
                                        str_content += "<div class='cl_services cl_servT'><b>Total Value: " + response['features'][0]['properties']['TotalValue'] + "</b></div>";
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
            url: 'http://spatial.biodiversityatlas.at/geoserver/ECO/wfs',
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
        ly_biotop = L.tileLayer.wms('https://spatial.biodiversityatlas.at/geoserver/ECO/wms', {
            format: 'image/svg',
            opacity: 1,
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
        ly_biotop = L.tileLayer.wms('https://spatial.biodiversityatlas.at/geoserver/ECO/wms', {
            format: 'image/svg',
            opacity: 1,
            layers: "ECO:" + layer_name
        });
        ly_biotop.addTo(map);

    });

}
$(document).ready(function () {
    // Hide all second and third level items initially
    $("#depthList ul ul").hide();

    // Add click event handler to expand/collapse items
    $("#depthList li").click(function (e) {
        e.stopPropagation();
        var $sublist = $(this).children("ul");
        if ($sublist.length > 0) {
            $sublist.slideToggle();
        }
    });
});