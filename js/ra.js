/*
 * ra.js
 * Responsive framework for full screen applications
 *
 * Copyright 2013 Francis Gassert
 * Released under the MIT License
 */

var ra = function(window, document) {
    'use strict';
    
    var

    //////////////////////////////////////////////////////////
    /* HELPER FUNCTIONS
     * Extracted from impress.js
     *
     * Copyright 2011-2012 Bartek Szopka (@bartaz)
     *
     * Released under the MIT and GPL Licenses.
     *
     * ------------------------------------------------
     *  author:  Bartek Szopka
     *  version: 0.5.3
     *  url:     http://bartaz.github.com/impress.js/
     *  source:  http://github.com/bartaz/impress.js/
     */

    // `pfx` is a function that takes a standard CSS property name as a parameter
    // and returns it's prefixed version valid for current browser it runs in.
    // The code is heavily inspired by Modernizr http://www.modernizr.com/
    pfx = (function () {
        var style = document.createElement('dummy').style,
            prefixes = 'Webkit Moz O ms Khtml'.split(' '),
            memory = {};
        return function ( prop ) {
            if ( typeof memory[ prop ] === "undefined" ) {
                var ucProp  = prop.charAt(0).toUpperCase() + prop.substr(1),
                    props   = (prop + ' ' + prefixes.join(ucProp + ' ') + ucProp).split(' ');
                memory[ prop ] = null;
                for ( var i in props ) {
                    if ( style[ props[i] ] !== undefined ) {
                        memory[ prop ] = props[i];
                        break;
                    }
                }
            }
            return memory[ prop ];
        };
    })(),
    // `arraify` takes an array-like object and turns it into real Array
    // to make all the Array.prototype goodness available.
    arrayify = function ( a ) {
        return [].slice.call( a );
    },
    // `css` function applies the styles given in `props` object to the element
    // given as `el`. It runs all property names through `pfx` function to make
    // sure proper prefixed version of the property is used.
    css = function ( el, props ) {
        var key, pkey;
        for ( key in props ) {
            if ( props.hasOwnProperty(key) ) {
                pkey = pfx(key);
                if ( pkey !== null ) {
                    el.style[pkey] = props[key];
                }
            }
        }
        return el;
    },
    // `byId` returns element with given `id` - you probably have guessed that ;)
    byId = function ( id ) {
        return document.getElementById(id);
    },

    //////////////////////////////////////////////////////////

    // binds an event listener
    bind = function (obj, event, callback) {
	obj.addEventListener ? obj.addEventListener(event, callback, false)
	: obj.attachEvent('on'+event, callback);
    },
    addC = function (obj, c) {
	obj.classList && obj.classList.add(c);
    },
    removeC = function (obj, c) {
	obj.classList && obj.classList.remove(c);
    },
    getWindowWidth = function () {
	return window.innerWidth || document.documentElement.clientWidth;
    },
    getWindowHeight = function () {
	return window.innerHeight || document.documentElement.clientHeight;
    },
    px = function ( numeric ) {
	return numeric+'px';
    },
    dispatchEvent = function( el, eventName ) {
	if (document.createEvent && el.dispatchEvent) {
            var evt = document.createEvent('HTMLEvents');
            evt.initEvent(eventName,true,true);
	    el.dispatchEvent(evt);
	}
    },

    ra = function (options) {
	// DOM objects
	var 
	
	container = byId('ra-container'),
	menuBtn = byId('ra-responsivemenu-btn'),
	headMatter = byId('ra-headmatter'),
	panel = byId('ra-panel'),
	panelContent = byId('ra-panel-content'),
	cover = byId('ra-cover'),
	main = byId('ra-main'),	
	nav = byId('ra-nav'),	

	// class names
	hide = 'ra-hidden',
	small = 'ra-small',
	large = 'ra-large',
	full = 'ra-fullscreen',
	navHidden = 'ra-nav-hidden',
	panelHidden = 'ra-panel-hidden',

	// closure variables
	currentPanel = 0,

	// default config
	config = { 
	    minWidth:640, // minimum width for screen size to count as large
	    panelWidth:284, // panel width
	    panel1:false, // panel 1 on
	},

	// custom events
	screenEvt = 'ra-screenchange',
	panelEvt = 'ra-panelchange',

	screenSize = function() {
	    return container.className;
	},
	// translate container to view offscreen panels
	_gotoX = function (x) {
	    pfx('transform') === null ? css(container, {left: x+'px'})
	    : css(container, {transform: "translate(" + x +"px, 0px)"});
	},
	// check to see if the screen changed from small to large or vice versa
	_checkScreenChange = function (force) {
	    if (screenSize() === full) {
		_onScreenChange();
	    } else if (getWindowWidth() < config.minWidth) {
		if (screenSize() !== small) {
		    container.className = small;
		    _onScreenChange();
		    dispatchEvent(container,screenEvt);
		};
	    } else if (screenSize() !== large) {
		container.className = large;
		_onScreenChange();
		dispatchEvent(container,screenEvt);
	    } else if (force) 
		_onScreenChange();
	},
	// resize respective panels
	_onScreenChange = function ( ) {
	    if (screenSize() === small) {
		// set panel sizes
		css(main, {width:'100%',left:0});
		css(panel, {height:'100%'});
		_hideNav();
		_hidePanel();
		currentPanel = 0;
	    } else if (screenSize() === large) {
		// set panel sizes
		css(panel, {width: px(config.panelWidth)});
		// reset screen view
		_gotoX(0);
	    } else if (screenSize() === full) {
		// if the screen is now full
		// set panel sizes
		css(main, {height:'100%', width:'100%', left:0});
		// reset screen view
		_gotoX(0);
	    };  
	},
	_onResize = function (x, force) {
	    _checkScreenChange(force);
	    if (screenSize() === large) {
		var h, w;
		h = getWindowHeight()-headMatter.offsetHeight;
		w = getWindowWidth()-panel.offsetWidth;
		css(panel, {height: px(h)});
		css(main, {left: px(panel.offsetWidth), maxWidth: px(w), height: px(h)});
	    } else if (screenSize() === small) {
		css(main,{height:px(getWindowHeight()-headMatter.offsetHeight)});
	    };
	},
	// turn off panel
	_hidePanel = function( ) {
	    addC(panel,panelHidden);
	},
	// turn on panel
	_showPanel = function( ) {
	    removeC(panel,panelHidden);
	},
	_hideNav = function( ) {
	    addC(nav,navHidden);
	},
	_showNav = function( ) {
	    removeC(nav,navHidden);
	},
	// toggle full screen main content
	toggleFullScreen = function( ) {
	    if (screenSize() === full) {
		container.className = undefined;
	    } else {
		container.className = full;
	    };
	    resize();
	},
	// gotoPanel scrolls container to show panel 
	// if panel is currently shown return to showing panel0
	gotoPanel = function (panelId) {
	    if (currentPanel === panelId || panelId === 0) {
		currentPanel = 0;
		addC(cover, hide);
		_gotoX(0);
		_hidePanel();
		_hideNav();
		resize();
		dispatchEvent(container,panelEvt);
	    } else {
		currentPanel = panelId;
		if (panelId === 1) {  
		    _showPanel();
		    _hideNav();
		    if (screenSize() === small) {
			_gotoX(config.panelWidth);
			removeC(cover, hide);
		    } else resize();
		};
		if (panelId === 2) {
		    _showNav();		    
		    _hidePanel();
		    if (screenSize() === small) {
			_gotoX(0);
		    	removeC(cover, hide);
		    };
		};
		dispatchEvent(container,panelEvt);
	    };
	},
	// sets config and resets display
	setConfig = function(options) {
	    for (var i in options) { 
		config[i]=options[i];
	    };
	    //reset display
	    config.panel1 ? gotoPanel(1) : gotoPanel(0);
	},
	// getConfig returns config object or named attribute
	getConfig = function(key) {
	    return config[key] ? config[key] : config
	},
	// Recalculates panel sizes
	resize = function() {
	    _onResize(false,true); 
	};
	
	// add event listeners to buttons
	bind(menuBtn,'click',function(x){gotoPanel(2)});
	bind(cover,'click',function(x){gotoPanel(0)});
	// detect screen resize and orientation change (mobile)
	bind(window,'resize',_onResize);
	bind(document,'orientationchange',_onResize);
	
	// bind public properties
	this.toggleNav = function(){gotoPanel(2);};
	this.togglePanel = function(){gotoPanel(1);};
	this.resize = resize;
	this.screenSize = screenSize;
	this.toggleFullScreen = toggleFullScreen;
	this.setOptions = setConfig;
	this.getOptions = getConfig;
	this.getCurrentPanel = function(){return currentPanel;};

	// call setConfig and onResize to initialize display
	setConfig(options);
    };
    
    return ra;

}(window, document);

