/*! basket.js - v0.2.0 - 3/9/2012
* http://addyosmani.github.com/basket.js
* Copyright (c) 2012 Addy Osmani; Licensed MIT, GPL
* Credits: Addy Osmani, Ironsjp, Mathias Bynens, Rick Waldron, Sindre Sorhus, Andrée Hansson */

;(function ( window, document ) {
	"use strict";

	var
	storagePrefix = "basket-",
	scripts = [],
	scriptsExecuted = 0,
	waitCount = 0,
	waitCallbacks = [],

	getUrl = function( url, callback ) {
		var xhr = new XMLHttpRequest();
		xhr.open( "GET", url, true );

		xhr.onreadystatechange = function() {
			if ( xhr.readyState === 4 ) {
				callback( xhr.responseText );
			}
		};

		xhr.send();
	},

	saveUrl = function( url, key, callback ) {
		getUrl( url, function( text ) {
			localStorage.setItem( key, text );

			if ( isFunc(callback) ) {
				callback();
			}
		});
	},

	isFunc = function( func ) {
		return Object.prototype.toString.call( func ) === "[object Function]";
	},

	injectScript = function( text ) {
		var
		script = document.createElement("script"),
		head = document.head || document.getElementsByTagName("head")[ 0 ];

		script.defer = true;
		// Have to use .text, since we support IE8,
		// which won't allow appending to a script
		script.text = text;

		head.appendChild( script );
	},

	queueExec = function( waitCount ) {
		var
		i,
		j,
		script,
		callback;

		if ( scriptsExecuted >= waitCount ) {
			for ( i = 0; i < scripts.length; i++ ) {
				script = scripts[ i ];

				if ( !script ) {
					// loading/executed
					continue;
				}

				scripts[ i ] = null;
				injectScript( script );
				scriptsExecuted++;

				for ( j = i; j < scriptsExecuted; j++ ) {
					callback = waitCallbacks[ j ];

					if ( isFunc(callback) ) {
						waitCallbacks[ j ] = null;
						callback();
					}
				}
			}
		}
	};

	window.basket = {
		require: function ( uri, options ) {
			options = options || {};

			var
			localWaitCount = waitCount,
			scriptIndex = scripts.length,
			key = storagePrefix + ( options.key || uri ),
			source = localStorage.getItem( key );

			scripts[ scriptIndex ] = null;

			if ( source ) {
				scripts[ scriptIndex ] = source;
				queueExec( localWaitCount );
			} else {
				getUrl( uri, function( text ) {
					localStorage.setItem( key, text );
					scripts[ scriptIndex ] = text;
					queueExec( localWaitCount );
				});
			}

			return this;
		},

		add: function( uri, options, callback ) {
			options = options || {};

			var key = storagePrefix + ( options.key || uri );

			// default is to overwrite
			if ( typeof options.overwrite === "undefined" ) {
				options.overwrite = true;
			}

			// if they key exists and overwrite true, overwrite
			if ( localStorage.getItem(key) ) {
				if( options.overwrite ) {
					saveUrl( uri, key, callback );
				}
			} else {
				//key doesnt exist, add key as new entry
				saveUrl( uri, key, callback );
			}

			return this;
		},

		remove: function( key ) {
			localStorage.removeItem( storagePrefix + key );

			return this;
		},

		wait: function( callback ) {
			waitCount = scripts.length - 1;
			if ( callback ) {
				if ( scriptsExecuted > waitCount ) {
					callback();
				} else {
					waitCallbacks[ waitCount ] = callback;
				}
			}

			return this;
		},

		get: function( key ) {
			return localStorage.getItem( storagePrefix + key ) || null;
		}
	};

}( this, document ));
