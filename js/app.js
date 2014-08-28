
(function () {
    'use strict';
    
    var 
    
    shalePlayUrl = "http://services.natcarbviewer.org/arcgis/rest/services/Unconventional_Resources/Unconventional_Resources/MapServer/3/query?geometry=[[-90,-180],[90,180]]&outFields=*&returnGeometry=true&geometryPrecision=5&outSR=4326&f=json",
    shaleBasinUrl = "http://services.natcarbviewer.org/arcgis/rest/services/Unconventional_Resources/Unconventional_Resources/MapServer/4/query?geometry=[[-90,-180],[90,180]]&outFields=*&returnGeometry=true&geometryPrecision=5&outSR=4326&f=json",

    aqUrl = "http://gis.wri.org/arcgis/services/Aqueduct/aqueduct_global/MapServer/WmsServer",
    wriTiles = "http://data.wri.org/tiles/{styleId}/{z}/{x}/{y}.png",

    playStyle = {
        weight: 1,
        opacity: 1,
        color: '#2E1700',
        fillOpacity: .6,
        fillColor: '#391D00'
    },
    playStyleHighlight = {
        weight: 1.5,
        color: '#ffd700',
        fillOpacity: .3
    },

    basinStyle = {
        weight: 1,
        opacity: 1,
        color: '#333',
        fillOpacity: .6,
        fillColor: '#666'
    }, 
    basinStyleHighlight = {
        weight: 1.5,
        color: '#000',
        fillOpacity: .3
    }, 

    legendLabels = ['Low',
		   'Low to medium',
		   'Medium to high',
		   'High',
		   'Extremely high',
		   'Arid & Low water use',
		   'No data'],
    legendColors = ['rgb(255,255,153)',
		   'rgb(255,230,0)',
		   'rgb(255,153,0)',
		   'rgb(255,25,0)',
		   'rgb(204,0,20)',
		   'rgb(204,204,204)',
		   'rgb(128,128,115)'],

    playPopupTemplate = 
	"Play Name<br><b>{Basin_Name}</b><br>" +
	"Country<br><b>{Country}</b><br>" +
	"Formation<br><b>{Shale_Formation}</b><br>" +
	"Geologic Age<br><b>{Geologic_Age}</b><br>",

    basinPopupTemplate = 
	"Basin Name<br><b>{Basin_Name}</b><br>" +
	"Country<br><b>{Country}</b><br>",

    layerNames = {
	bws: "Baseline water stress",
	sv: "Seasonal variability",
	dro: "Drought severity",
	gw: "Groundwater stress",
	play: "Shale plays",
	basin: "Shale basins"
    },

    playDefinition = "Regions of known viable shale oil or gas reserves",
    basinDefinition = "Geological formations that may contain shale oil or gas",
    layerDefinitions = {
	"Baseline water stress":"The ratio of water demand to water supply",
	"Seasonal variability":"Variability of water supply between months of the year",
	"Drought severity":"Historical severity of droughts, measued as average lenght times intensity",
	"Groundwater stress":"Ratio of groundwater withdrawal to sustainable recharge"
    },

    baseDefinition = layerDefinitions["Baseline water stress"],

    retina = window.devicePixelRatio > 1.4,

    toGeoJson = esriConverter().toGeoJson,

    highlightFeature = function(feature, style) {
	feature.setStyle(style);
    },
    
    btnAbout = L.DomUtil.get('btnAbout'),
    btnReport = L.DomUtil.get('btnReport'),
    btnData = L.DomUtil.get('btnData'),
    btnRankings = L.DomUtil.get('btnRankings'),
    btnContact = L.DomUtil.get('btnContact'),
    btnClose = L.DomUtil.get('btnPanelClose'),

    panel = L.DomUtil.get('ra-panel-content'),
    
    setPanel = function(c) {
	panel.className = c;
	if (ra.getCurrentPanel() !== 1)
	    ra.togglePanel();
    },
    closePanel = function() {
	if (ra.getCurrentPanel() === 1)
	    ra.togglePanel();
    },

    init = function() {
    
	var 
	
	map = L.map('map',{keyboard: false, maxZoom: 8}).setView([16, 10], 3),

	labels = L.tileLayer(wriTiles, {
	    styleId: retina ? "bm8/ilabels-retina" : "bm8/ilabels", 
	    detectRetina: true, 
	    zIndex: 10,
	    attribution: 'Data from <a href="http://wri.org" target="_blank">World Resources Institute</a>, <a href="http://www.unconventionalenergyresources.com/" target="_blank">West Virginia University</a>'
	}).addTo(map),
	
	shale_play = L.geoJson('', {
	    style: function(f) { return playStyle; },
	    onEachFeature: function(feature, layer) {
		layer.on({
		    mouseover: function(e) { 
			highlightFeature(e.target, playStyleHighlight); },
		    mouseout: function(e) { shale_play.resetStyle(e.target); }
		});
		layer.bindPopup(L.Util.template(playPopupTemplate, 
						feature.properties));
	    },
	    zIndex: 1
	}).addTo(map),

	shale_basin = L.geoJson('',{
	    style: function(f) { return basinStyle; },
	    onEachFeature: function(feature, layer) {
		layer.on({
		    mouseover: function(e) { 
			highlightFeature(e.target, basinStyleHighlight); },
		    mouseout: function(e) { shale_basin.resetStyle(e.target); }
		});
		layer.bindPopup(L.Util.template(basinPopupTemplate, 
						feature.properties));
	    },
	    zIndex: 2
	}).addTo(map),

	legend = L.control({position: 'bottomright'}),
	legendInfo = L.control({position: 'bottomright'}),

	aqLayer = function(idx) {
	    return L.tileLayer.wms(aqUrl,{
		layers:idx,
		transparent:true,
		format:'image/png32',
		detectRetina:true, 
		zIndex:2 });
	},

	baseLayers = {},
	featureLayers = {};
	
	// set up layers
	baseLayers[layerNames.bws] = aqLayer(1).addTo(map);	
	baseLayers[layerNames.sv] = aqLayer(3);
	baseLayers[layerNames.dro] = aqLayer(5);
	baseLayers[layerNames.gw] = aqLayer(7);

	featureLayers[layerNames.play] = shale_play;	
	featureLayers[layerNames.basin] = shale_basin;
	
	L.control.layers(
	    baseLayers,
	    featureLayers,
	    { position: 'topright' }
	).addTo(map);

	// set up legend
	legend.onAdd = function(map){
	    var 
	    container = L.DomUtil.get('legend'),
	    title = L.DomUtil.get('legend-title'),
	    swatches = L.DomUtil.get('legend-swatches'),
	    playSwatch = L.DomUtil.get('legend-plays'),
	    basinSwatch = L.DomUtil.get('legend-basins'),
	    swatchList = [];
	    

	    for (var i=0;i<legendColors.length;i++) {
		swatchList.push('<i style="background:' + legendColors[i] +
				'"></i>' + legendLabels[i] + '<br>');
	    };
	    swatches.innerHTML = swatchList.join('');
	    title.innerHTML = layerNames.bws;
	    playSwatch.innerHTML = '<i style="background:' + 
		playStyle.fillColor +
		'"></i>' + layerNames.play + '<br>';
	    basinSwatch.innerHTML = '<i style="background:' + 
		basinStyle.fillColor +
		'"></i>' + layerNames.basin + '<br>';
	    
	    L.DomEvent.addListener(swatches,'mouseover',function(e){
		if (baseDefinition) {
		    legendInfo.addTo(map);
		    legendInfo.getContainer().innerHTML = baseDefinition;
		};
	    });
	    L.DomEvent.addListener(playSwatch,'mouseover',function(e){
		legendInfo.addTo(map);
		legendInfo.getContainer().innerHTML = playDefinition;
	    });
	    L.DomEvent.addListener(basinSwatch,'mouseover',function(e){
		legendInfo.addTo(map);
		legendInfo.getContainer().innerHTML = basinDefinition;
	    });
	    L.DomEvent.addListener(swatches,'mouseout',function(e){
		legendInfo.removeFrom(map);
	    });
	    L.DomEvent.addListener(playSwatch,'mouseout',function(e){
		legendInfo.removeFrom(map);
	    });
	    L.DomEvent.addListener(basinSwatch,'mouseout',function(e){
		legendInfo.removeFrom(map);
	    });
	    // set legend title to name of baselayer
	    map.on('baselayerchange', function(e) {
		title.innerHTML = e.name;
		baseDefinition = layerDefinitions[e.name];
	    });

	    return container;
	};
	legend.addTo(map);
	legendInfo.onAdd = function(map){
	    this.container = this.container || L.DomUtil.create('div','legend info');
	    return this.container;
	};
	    

	// load plays and basins
	corslite(shalePlayUrl, function(err, resp) {
	    err && console.log(err);
	    shale_play.addData(toGeoJson(JSON.parse(resp.response)))
	});
	corslite(shaleBasinUrl, function(err, resp) {
	    err && console.log(err);
	    shale_basin.addData(toGeoJson(JSON.parse(resp.response)))
		.bringToBack();;
	});
	

	L.control.scale().addTo(map);
    
	L.DomEvent.addListener(window,'resize',function(e){
	    window.setTimeout(function(){map.invalidateSize()},260)
	});

	L.DomEvent.addListener(btnAbout,'click',function(e) {
	    setPanel('panelAbout'); 
	    L.DomEvent.stopPropagation(e);
	});
	L.DomEvent.addListener(btnReport,'click',function(e) {
	    setPanel('panelReport');
	    L.DomEvent.stopPropagation(e);
	});
	L.DomEvent.addListener(btnRankings,'click',function(e) {
	    setPanel('panelRankings');
	    L.DomEvent.stopPropagation(e);
	});
	L.DomEvent.addListener(btnData,'click',function(e) {
	    setPanel('panelData');
	    L.DomEvent.stopPropagation(e);
	});
	L.DomEvent.addListener(btnContact,'click',function(e) {
	    setPanel('panelContact');
	    L.DomEvent.stopPropagation(e);
	});
	L.DomEvent.addListener(btnClose,'click',function(e) {
	    closePanel();
	    L.DomEvent.stopPropagation(e);
	});

    };
    init();

})();
