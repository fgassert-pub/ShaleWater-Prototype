
(function (window, document) {
    'use strict';
    
    var 

    toGeoJson = esriConverter(),
    
    shalePlayUrl = "http://services.natcarbviewer.org/arcgis/rest/services/Unconventional_Resources/Unconventional_Resources/MapServer/3/query?geometry=[[-90,-180],[90,180]]&outFields=*&returnGeometry=true&geometryPrecision=5&outSR=4326&f=json",
    shaleBasinUrl = "http://services.natcarbviewer.org/arcgis/rest/services/Unconventional_Resources/Unconventional_Resources/MapServer/4/query?geometry=[[-90,-180],[90,180]]&outFields=*&returnGeometry=true&geometryPrecision=5&outSR=4326&f=json",

    aqueductUrl = 'http://gis.wri.org/arcgis/rest/services/Aqueduct/aqueduct_global_2014/MapServer',
    wriTiles = "http://data.wri.org/tiles/{styleId}/{z}/{x}/{y}.png",
    base = 'http://',
    labels = 'http://',

    style_play = function(feature) {
	return {
            weight:1,
            opacity:1,
            color:'#2E1700',
            fillOpacity:0.6,
            fillColor: '#391D00'
	};
    },
    highlightFeature_play = function(e) {
	var layer = e.target;
	layer.setStyle({
            weight: 1.5,
            color: '#ffd700',
            fillOpacity: 0.7
	});
	if (!L.Browser.ie && !L.Browser.opera) {
            layer.bringToBack();
	};
    },
    resetHighlight_play = function(e) {
	shale_play.resetStyle(e.target);
    },
    style_basin = function(feature) {
	return {
            weight:1,
            opacity:1,
            color:'#333333',
            fillOpacity:0.6,
            fillColor: '#666666'
	};
    },
    highlightFeature_basin = function(e) {
	var layer = e.target;
	layer.setStyle({
            weight: 1.5,
            color: 'black',
            fillOpacity: 0.7
	});
	if (!L.Browser.ie && !L.Browser.opera) {
            layer.bringToBack();
	};
    },
    resetHighlight_basin = function(e) {
	shale_basin.resetStyle(e.target);
    },
    onEachFeature_basin = function(feature,layer) {
	layer.on({
            mouseover: highlightFeature_basin,
            mouseout: resetHighlight_basin
	});
	layer.bindPopup("Basin Name<br>" +
			"<b>" + feature.properties.Basin_Name + "</b><br>" +
			"Country<br>" +
			"<b>" + feature.properties.Country + "</b>"
	);
    },
    onEachFeature_play = function(feature,layer) {
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
		"<b>" + feature.properties.Shale_Formation + "</b><br>" +
		"<font size='1' color='#777777'>Geologic Age</font><br>" +
		"<b>" + feature.properties.Geologic_Age + "</b><br>"                   
	);
    },
    

    shale_play = L.geoJson('',{
	style:style_play,
	onEachFeature:onEachFeature_play
    }),
    shale_basin = L.geoJson('',{
	style:style_basin,
	onEachFeature:onEachFeature_basin
    }),
    
    
    map = L.map('map',{keyboard: false}).setView([16, 10], 3);
    
    corslite(shalePlayUrl, function(err, resp) {
	err && console.log(err);
	var obj = JSON.parse(resp.response);
	var geoJson = toGeoJson.toGeoJson(obj);
	shale_play.addData(geoJson);
    });
    corslite(shaleBasinUrl, function(err, resp) {
	err && console.log(err);
	var obj = JSON.parse(resp.response);
	var geoJson = toGeoJson.toGeoJson(obj);
	shale_basin.addData(geoJson);
    });

    var retina = window.devicePixelRatio > 1.4,
    ret = retina ? "bm8/iabels-retina" : "bm8/labels";
    L.tileLayer(wriTiles, {styleId: "bm8/base", detectRetina: true, zIndex:0}).addTo(map);

    L.tileLayer(wriTiles, {styleId: ret, detectRetina: true, zIndex:10}).addTo(map);
    
    var aqLayer = function(idx) {
	return L.tileLayer.wms("http://gis.wri.org/arcgis/services/Aqueduct/aqueduct_global/MapServer/WmsServer",{layers:idx,transparent:true,format:'image/png32',detectRetina:true, zIndex:2});
    };
    
    L.control.layers({
	'Baseline water stress': aqLayer(1).addTo(map),
	'Seasonal variability': aqLayer(3),
	'Drought severity': aqLayer(5),
	'Groundwater stress': aqLayer(7),
    },{
	'Shale Basin': shale_basin.addTo(map),
	'Shale Play': shale_play.addTo(map)
    },{
	position: 'topright'
    },{
	autoZIndex: false
    }).addTo(map);


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
    
    window.addEventListener('resize',function(e){
	window.setTimeout(map.invalidateSize,100);
    });

})(document, window);
