<html>
<head>
    <link rel="stylesheet" type="text/css" href="/static/admin/css/ecosysAdmin.css">
    <link rel="stylesheet" type="text/css" href="/static/admin/css/bootstrap.min.css">
    <script type="text/javascript" src="/static/admin/js/bootstrap.min.js"></script>
    <script type="text/javascript" src="/static/admin/js/ecosysAdmin.js"></script>

    <script src="https://code.jquery.com/jquery-3.6.1.min.js" integrity="sha256-o88AwQnZB+VDvE9tvIXrMQaPlFFSUTR+nldQm1LuPXQ=" crossorigin="anonymous"></script>

    <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.2/dist/leaflet.css"
          integrity="sha256-sA+zWATbFveLLNqWO2gtiw3HL/lh1giY/Inf1BJ0z14="
          crossorigin="anonymous"/>
    <script src="https://unpkg.com/leaflet@1.9.2/dist/leaflet.js"
            integrity="sha256-o9N1jGDZrf5tS+Ft4gbIK7mYMipq9lqpVJ91xHSyKhg="
            crossorigin="anonymous"></script>


</head>
<body>
<#assign naviSel = "0">
<#include "common/headline.ftl">
<div class="row">
    <div class="col-md-2 m-4">
        <#include "common/navigation.ftl">
    </div>
    <div class="col-md-8 m-4">
        <h1 class="text-primary">WMS-Check</h1>
        <div id="map"></div>

    </div>
</div>

</body>
</html>
<script>
var map = L.map('map').setView([48.210033, 16.363449], 7);
var key_id = "PG" // depending on layer

function callEcosys(key_id) {
    let layer_id = 2;
    var url = "http://127.0.0.1:8080/api/check"
    $.ajax({
        url: url,
        data: {
            "layerId": layer_id,
            "keyId": key_id,
        },
        success: function (data, status, xhr) {
            console.log(data)
        },
        error: function (xhr, status, error) {
            console.log("error" + error)
        }
    });

}

L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
}).addTo(map);




L.TileLayer.BetterWMS = L.TileLayer.WMS.extend({

    onAdd: function (map) {
        // Triggered when the layer is added to a map.
        //   Register a click listener, then do all the upstream WMS things
        L.TileLayer.WMS.prototype.onAdd.call(this, map);
        map.on('click', this.getFeatureInfo, this);
    },

    onRemove: function (map) {
        // Triggered when the layer is removed from a map.
        //   Unregister a click listener, then do all the upstream WMS things
        L.TileLayer.WMS.prototype.onRemove.call(this, map);
        map.off('click', this.getFeatureInfo, this);
    },

    getFeatureInfo: function (evt) {
        console.log("JAJAJA")
        // Make an AJAX request to the server and hope for the best
        var url = this.getFeatureInfoUrl(evt.latlng),
            showResults = L.Util.bind(this.showGetFeatureInfo, this);
        $.ajax({
            url: url,
            headers: { 'Host': 'spatial.biodiversityatlas.at' },
            success: function (data, status, xhr) {
                var err = typeof data === 'string' ? null : data;
                //console.log(data);
                //var details = JSON.parse(data)
                console.log(data.features[0].properties)
                console.log(eval("data.features[0].properties."+key_id))
                callEcosys(eval("data.features[0].properties."+key_id))
                showResults(err, evt.latlng, data);
            },
            error: function (xhr, status, error) {
                showResults(error);
            }
        });
    },

    getFeatureInfoUrl: function (latlng) {
        // Construct a GetFeatureInfo request URL given a point
        var point = this._map.latLngToContainerPoint(latlng, this._map.getZoom()),
            size = this._map.getSize(),

            params = {
                request: 'GetFeatureInfo',
                service: 'WMS',
                srs: 'EPSG:4326',
                styles: this.wmsParams.styles,
                transparent: this.wmsParams.transparent,
                version: this.wmsParams.version,
                format: this.wmsParams.format,
                bbox: this._map.getBounds().toBBoxString(),
                height: size.y,
                width: size.x,
                layers: this.wmsParams.layers,
                query_layers: this.wmsParams.layers,
                //info_format: 'text/html'
                info_format: 'application/json'
            };

        params[params.version === '1.3.0' ? 'i' : 'x'] = point.x;
        params[params.version === '1.3.0' ? 'j' : 'y'] = point.y;

        return this._url + L.Util.getParamString(params, this._url, true);
    },

    showGetFeatureInfo: function (err, latlng, content) {
        if (err) { console.log(err); return; } // do nothing if there's an error

        // Otherwise show the content in a popup, or something.
        L.popup({ maxWidth: 800})
            .setLatLng(latlng)
            .setContent(content)
            .openOn(this._map);
    }
});

L.tileLayer.betterWms = function (url, options) {
    return new L.TileLayer.BetterWMS(url, options);
};

//var states = L.tileLayer.betterWms('https://spatial.biodiversityatlas.at/geoserver/gwc/service',
var states = L.tileLayer.betterWms('http://localhost:8081/geoserver/wms',
    {
        format: 'image/png',
        transparent: true,
        //for spatial portal -  layers: "ALA:bezirk_wgs84_iso"
        layers: "gemeinde_wgs84_iso",
        //layers: "bezirk_wgs84_iso"
        //layers: "kleinregnoe_iso_wgs84"
    });
states.addTo(map);
</script>