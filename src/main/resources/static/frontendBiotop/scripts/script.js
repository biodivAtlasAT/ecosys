var url_apiProjects = "api/bt/projects";
// number + filter + number
var url_habitat = "";
var opt_layerID = $('#id_addLayer').val(0);
var LayerMap;
var ly_bioHabitat;
var ly_biotop;
var layer_name = '';
var chk_map = 0;
var speciesGroups = new Array();
var ly_filter = undefined;
var wktString;
var map = L.map('map', {
    center: [48.3805228, 15.9558588],
    zoom: 8
});
var popup;
var geoJsonLayer;
map.locate({
    setView: false
});
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
opt_layerID.on('click change', function () {
    if(ly_filter !== undefined) {
        map.removeLayer(ly_filter);
    }
    if(ly_biotop !== undefined) {
        map.removeLayer(ly_biotop);
    }
    if(geoJsonLayer !== undefined) {
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
                    console.log(arrAlph);
                    for (it_h = 0; it_h < resp2['filter'].length; it_h++) {
                        var id = resp2['filter'][it_h]['id'];
                        $('.cl_habitatTypes').append('<ul class="cl_habitats_l0_' + it_h +'"></ul>');
                        $('.cl_habitats_l0_' + it_h).append('<ul class="cl_habitats_l1_' + it_h +'"></ul>');
                        $('.cl_habitats_l1_' + it_h).append('<ul class="cl_habitats_l2_' + it_h +'"></ul>');
                        $('.cl_habitats_l2_' + it_h).append('<ul class="cl_habitats_l3_' + it_h +'"></ul>');
                        if (resp2['filter'][it_h] !== undefined && (resp2['filter'][it_h]['cqlQuery'] !== null)) {
                            if (resp2['filter'][it_h]['cqlQuery'].replaceAll('\'', '').split('=')[1] !== undefined) {
                                if (resp2['filter'][it_h]['levelNumber'] === 0) {
                                    $('.cl_habitats_l0_' + it_h).append('<li class="cl_hov" id="id_h_' + id + '" onclick="func_CQLSubm(' + it_h + ', '+ id + ', p_color)"><b>' + resp2['filter'][it_h]['cqlQuery'].replaceAll('\'', '').split('=')[1] + ' ' + resp2['filter'][it_h]['description'] + '</b></li>');
                                }
                                if (resp2['filter'][it_h]['levelNumber'] === 1) {

                                    $('.cl_habitats_l1_' + it_h).append('<li class="cl_hov" id="id_h_' + id + '" onclick="func_CQLSubm(' + it_h + ', '+ id + ', p_color)"><b>' + resp2['filter'][it_h]['cqlQuery'].replaceAll('\'', '').split('=')[1] + ' ' + resp2['filter'][it_h]['description'] + '</b></li>');

                                }
                                if (resp2['filter'][it_h]['levelNumber'] === 2) {

                                    $('.cl_habitats_l2_' + it_h).append('<li class="cl_hov" id="id_h_' + id + '" onclick="func_CQLSubm(' + it_h + ', '+ id + ', p_color)"><b>' + resp2['filter'][it_h]['cqlQuery'].replaceAll('\'', '').split('=')[1] + ' ' + resp2['filter'][it_h]['description'] + '</b></li>');
                                }
                                if (resp2['filter'][it_h]['levelNumber'] === 3) {

                                    $('.cl_habitats_l3_' + it_h).append('<li class="cl_hov" id="id_h_' + id + '" onclick="func_CQLSubm(' + it_h + ', '+ id + ', p_color)"><b>' + resp2['filter'][it_h]['cqlQuery'].replaceAll('\'', '').split('=')[1] + ' ' + resp2['filter'][it_h]['description'] + '</b></li>');
                                }
                            }
                        }
                    }
                }
            });
        }
    });
});
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
                    map.fitBounds(geoJsonLayer.getBounds());
                    geoJsonLayer.on('mouseover', function(e) {
                        popup = new L.popup({
                            className: 'cl_popup2',
                            closeButton: false,
                            closeOnClick: true
                        })
                            .setLatLng(e.latlng)
                            .setContent(decode_utf8(e.layer.feature.properties.BT_Lang));
                        // Create a custom popup
                        $.ajax({
                            url: 'https://spatial.biodivdev.at/geoserver/ECO/wfs',
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
                                        ly_filter = L.geoJSON(response);
                                        map.fitBounds(ly_filter.getBounds());
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
                                                    console.log(wktString);
                                                    speciesGroups = new Array();
                                                    for (it_d = 0; it_d < resp['speciesGroup']['list'].length; it_d++) {
                                                        $.ajax({
                                                            //url: 'https://biocache.biodivdev.at/ws/occurrences/search?q=' + resp['speciesGroup']['list'][it_d]['description'] +'&qc=&wkt=' + wktString,
                                                            url: 'https://biocache-ws.biodiversityatlas.at/webportal/params?',
                                                            data: {
                                                                q: resp['speciesGroup']['list'][it_d]['description'],
                                                                wkt: wktString
                                                            },
                                                            // POST tested string returns a number
                                                            type: 'POST',
                                                            success: function (occurrence) {
                                                                $.ajax({
                                                                    url: 'https://biocache-ws.biodiversityatlas.at/occurrences/search?q=qid:' + occurrence,
                                                                    type: 'GET',
                                                                    success: function (result) {
                                                                        // speciesGroups.push(occurrence);
                                                                        console.log(result);
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
                    geoJsonLayer.on('mouseover', function(event) {
                        var latlng = event.latlng;
                        var center =  latlng;

                        // Open the popup at the center of the polygon
                        if(popup !== undefined) {
                            popup.openOn(map);
                            event.stopPropagation();
                        }
                    });
                    geoJsonLayer.on('mouseout', function() {
                        if(popup !== undefined) {
                            console.log("here left");
                            map.closePopup();
                            popup.remove();
                            console.log(popup);
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

func_CQLSubm = function(p_id, r_id, p_color) {
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
            if(resp['filter'][p_id]['cqlQuery'] !== undefined) {
                console.log("check1");
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
                        map.removeLayer(ly_biotop);
                        map.removeLayer(geoJsonLayer);
                        if (ly_filter !== undefined) {
                            map.removeLayer(ly_filter);
                        }
                        ly_filter = L.geoJSON(response);
                        map.fitBounds(ly_filter.getBounds());

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
                            var infoPup = L.popup({
                                className: 'cl_popup3',
                                closeButton: true,
                                closeOnClick: true
                            });
                            var str_content = '';
                            if(response['features'] !== undefined) {
                                str_content += '<div><b>' + decode_utf8(response['features'][0]['properties']['BT_Lang']) + '</b></div>';
                            }
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
                                    console.log(wktString);
                                    speciesGroups = new Array();
                                    str_content += "<div><input type='button' onclick=func_SpeciesInfo(resp2['speciesGroup']['list'])'></input></div>";
                                    /*
                                    for (it_d = 0; it_d < resp2['speciesGroup']['list'].length; it_d++) {
                                        $.ajax({
                                            //url: 'https://biocache.biodivdev.at/ws/occurrences/search?q=' + resp['speciesGroup']['list'][it_d]['description'] +'&qc=&wkt=' + wktString,
                                            url: 'https://biocache-ws.biodiversityatlas.at/webportal/params?',
                                            data: {q: resp2['speciesGroup']['list'][it_d]['description'], wkt:  wktString},
                                            // POST tested string returns a number
                                            type: 'POST',
                                            success: function (occurrence) {
                                                $.ajax({
                                                    url: 'https://biocache-ws.biodiversityatlas.at/occurrences/search?q=qid:' + occurrence,
                                                    type: 'GET',
                                                    success: function (result) {
                                                        speciesGroups.push(occurrence);
                                                        console.log(result);
                                                    }
                                                });
                                            }
                                        });
                                    }
                                     */
                                },
                                error: function (xhr, status, error) {
                                    console.error(error);
                                }
                            });
                            if (infoPup !== undefined) {
                                infoPup.setLatLng(e.latlng);
                                infoPup.setContent(str_content);
                            }
                            infoPup.openOn(map);
                        });
                        ly_filter.addTo(map);
                    }
                });
            }
        }
    });
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
            opacity: 0.3,
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
            opacity: 0.3,
            layers: "ECO:" + layer_name
        });
        ly_biotop.addTo(map);

    });

}