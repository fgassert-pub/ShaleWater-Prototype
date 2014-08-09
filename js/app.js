
(function (window, document) {
    'use strict'
    
    var shaleUrl = 'http://services.natcarbviewer.org/arcgis/rest/services/Unconventional_Resources/Unconventional_Resources/MapServer/'
    var aqueductUrl = 'http://gis.wri.org/arcgis/rest/services/Aqueduct/aqueduct_global_2014/MapServer'

    var bws_basemap = 'https://{s}.tiles.mapbox.com/v3/tluo.r3ipy14i/{z}/{x}/{y}.png';
    var mapbox_basemap = 'https://api.tiles.mapbox.com/v3/examples.map-i875kd35/{z}/{x}/{y}.png';
    var shale_basin;
    var shale_play;

    function style_play(feature) {
	return {
            weight:1,
            opacity:1,
            color:'#2E1700',
            fillOpacity:0.6,
            fillColor: '#391D00'
	};
    }
    function highlightFeature_play(e) {
	var layer = e.target;
	layer.setStyle({
            weight: 1.5,
            color: '#ffd700',
            dashArray: '',
            fillOpacity: 0.7
	});
    }
    function resetHighlight_play(e) {
	shale_play.resetStyle(e.target);
    }

    function style_basin(feature) {
	return {
            weight:1,
            opacity:1,
            color:'#333333',
            fillOpacity:0.6,
            fillColor: '#666666'
	};
    }
    function highlightFeature_basin(e) {
	var layer = e.target;
	layer.setStyle({
            weight: 1.5,
            color: 'black',
            dashArray: '',
            fillOpacity: 0.7
	});
	if (!L.Browser.ie && !L.Browser.opera) {
            layer.bringToBack();
	}
    }
    function resetHighlight_basin(e) {
	shale_basin.resetStyle(e.target);
    }

    function onEachFeature_basin(feature,layer) {
	layer.on({
            mouseover: highlightFeature_basin,
            mouseout: resetHighlight_basin
	});
	layer.bindPopup(
            "<font size='1' color='#777777'>Basin Name</font><br>" +
		"<b>" + feature.properties.Basin_Name + "</b><br>" +
		"<font size='1' color='#777777'>Country</font><br>" +
		"<b>" + feature.properties.Country + "</b>"
	);
    }

    function onEachFeature_play(feature,layer) {
	layer.on({
            mouseover: highlightFeature_play,
            mouseout: resetHighlight_play
	});
	layer.bindPopup(
            
            "<font size='1' color='#777777'>Play Name</font><br>" +
		"<b>" + feature.properties.Basin_Name + "</b><br>" +
		"<font size='1' color='#777777'>Country</font><br>" +
		"<b>" + feature.properties.Country + "</b><br>" +
		"<font size='1' color='#777777'>Formation</font><br>" +
		"<b>" + feature.properties.Shale_Form + "</b><br>" +
		"<font size='1' color='#777777'>Geologic Age</font><br>" +
		"<b>" + feature.properties.Geologic_A + "</b><br>"                   
	);
    }

    shale_play = L.geoJson(shale_play,{
	onEachFeature: onEachFeature_play,
	style: style_play
    });
    shale_basin = L.geoJson(shale_basin,{
	onEachFeature: onEachFeature_basin,
	style: style_basin
    });


    var map = L.map('map',{keyboard: false}).setView([16, 10], 3);

    L.control.layers({
	'Water Stress': L.tileLayer(bws_basemap,{maxZoom:6, minZoom:1}).addTo(map),
	'Admin Area': L.tileLayer(mapbox_basemap)
    },{
	'Shale Basin': shale_basin.addTo(map),
	'Shale Play': shale_play.addTo(map)
    },{
	position: 'topright'
    },{
	autoZIndex: true
    })
	.addTo(map);


    var info = L.control({position: 'bottomleft'});
    info.onAdd = function(map) {
	this._div = L.DomUtil.create('div','info');
	this._div.innerHTML = '<h3>Global Shale Gas and Water Risk</h3>';
	return this._div
    };

    var legend = L.control({position: 'bottomright'});
    legend.onAdd = function(map){
	var div = L.DomUtil.create('div','info legend'),
	labels = ['Low',
		  'Low to medium',
		  'Medium to high',
		  'High',
		  'Extremely high',
		  'Arid & Low water use',
		  'No data'],
	colors = ['rgb(255,255,153)',
		  'rgb(255,230,0)',
		  'rgb(255,153,0)',
		  'rgb(255,25,0)',
		  'rgb(204,0,20)',
		  'rgb(204,204,204)',
		  'rgb(128,128,115)'],
	labels_f = [];
	for (var i = 0; i < labels.length; i++) {
            labels_f.push(
		'<i style = "background:' + colors[i] + '"></i>' + labels[i]
            );
	}
	div.innerHTML = '<h4>Water Stress Level</h4>'
            + labels_f.join('<br>')
            +'<br>'
            +'<br>'
            +'<h4>Shale Gas Resources</h4>'
            + '<i style = "background: #522900"></i>Shale Play'
            + '<br>'
            + '<i style = "background: #666666"></i>Shale Basin'
            + '<br>'
            + '<br>'
            + '<a href="http://www.wri.org/our-work/project/aqueduct"><font size="1">Click to learn more</font></a>';
	return div;
    };
    legend.addTo(map);

    L.control.scale().addTo(map);

    map.attributionControl
	.addAttribution('<a href="http://www.mapbox.com"> Mapbox</a> | Data Sources <a href="http://www.wri.org"> &copy World Resources Institute</a> | Developer <a href="http://www.wri.org/profile/tianyi-luo"> Tianyi Luo</a>');

})(document, window);
