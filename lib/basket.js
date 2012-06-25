/*globals document, XMLHttpRequest, localStorage, basket */
!function( window, document ) {
	'use strict';

	var head = document.head || document.getElementsByTagName('head')[ 0 ];
	var storagePrefix = 'basket-';
	var scripts = [];
	var scriptsExecuted = 0;
	var globalWaitCount = 0;
	var waitCallbacks = [];

	var isFunc = function( fn ) {
		return {}.toString.call( fn ) === '[object Function]';
	};

	var getUrl = function( url, callback ) {
		var xhr = new XMLHttpRequest();
		xhr.open( 'GET', url );

		xhr.onreadystatechange = function() {
			if ( xhr.readyState === 4 && xhr.status === 200 ) {
				callback( xhr.responseText );
			}
		};

		xhr.send();
	};

	var saveUrl = function( url, key, callback ) {
		getUrl( url, function( text ) {
			localStorage.setItem( key, text );

			if ( isFunc(callback) ) {
				callback( text );
			}
		});
	};

	var injectScript = function( text ) {
		var script = document.createElement('script');
		script.defer = true;
		// Have to use .text, since we support IE8,
		// which won't allow appending to a script
		script.text = text;
		head.appendChild( script );
	};

	var queueExec = function( waitCount, doExecute ) {
		var i, j, script, callback;

		if ( scriptsExecuted >= waitCount ) {
			for ( i = 0; i < scripts.length; i++ ) {
				script = scripts[ i ];

				if ( !script ) {
					// loading/executed
					continue;
				}

				scripts[ i ] = null;

				if ( doExecute ) {
					injectScript( script );
				}

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

	var handleStackObject = function( obj ) {
		var key = storagePrefix + ( obj.key || obj.url );
		var waitCount = globalWaitCount;
		var scriptIndex = scripts.length;
		var source = localStorage.getItem( key );

		var callback = function( text ) {
			scripts[ scriptIndex ] = text;
			queueExec( waitCount, obj.execute );
		};

		if ( !obj.url ) {
			return;
		}

		obj.execute = obj.execute !== false;
		scripts[ scriptIndex ] = null;

		if ( source ) {
			callback( source );
		} else {
			saveUrl( obj.url, key, callback );
		}

		if ( isFunc(obj.wait) ) {
			basket.wait( obj.wait );
		}
	};

	window.basket = {
		require: function() {
			var i, l;

			for ( i = 0, l = arguments.length; i < l; i++ ) {
				handleStackObject( arguments[i] );
			}

			return this;
		},

		remove: function( key ) {
			localStorage.removeItem( storagePrefix + key );
			return this;
		},

		wait: function( callback ) {
			globalWaitCount = scripts.length - 1;

			if ( isFunc(callback) ) {
				if ( scriptsExecuted > globalWaitCount ) {
					callback();
				} else {
					waitCallbacks[ globalWaitCount ] = callback;
				}
			}

			return this;
		},

		get: function( key ) {
			return localStorage.getItem( storagePrefix + key ) || null;
		},

		clear: function() {
			var key;
			var ls = localStorage;
			var re = /^basket-/;

			for ( key in ls ) {
				if ( re.test( key ) ) {
					delete ls[ key ];
				}
			}

			return this;
		}
	};

}( this, document );