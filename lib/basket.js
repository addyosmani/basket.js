/*globals document, XMLHttpRequest, localStorage, basket */
(function( window, document ) {
	'use strict';

	var head = document.head || document.getElementsByTagName('head')[0];
	var storagePrefix = 'basket-';
	var scripts = [];
	var scriptsExecuted = 0;
	var globalWaitCount = 0;
	var waitCallbacks = [];
	var defaultExpiration = 5000;

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

	var saveUrl = function( obj, callback ) {
		getUrl( obj.url, function( text ) {
			var storeObj = wrapStoreData( obj, text );
			localStorage.setItem( storagePrefix + obj.key, JSON.stringify( storeObj ) );

			if ( isFunc( callback ) ) {
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

	var wrapStoreData = function( obj, data ) {
		var now = +new Date();
		obj.data = data;
		obj.stamp = now;
		obj.expire = now + ( (obj.expire || defaultExpiration) * 60 * 60 * 1000 );

		return obj;
	};

	var handleStackObject = function( obj ) {
		var waitCount = globalWaitCount;
		var scriptIndex = scripts.length;
		var source;

		var callback = function( text ) {
			scripts[ scriptIndex ] = text;
			queueExec( waitCount, obj.execute );
		};
		
		if ( !obj.url ) {
			return;
		}
		obj.key =  ( obj.key || obj.url );
		source = basket.get( obj.key );

		obj.execute = obj.execute !== false;
		scripts[ scriptIndex ] = null;
		
		if( !source || source.expire - +new Date() < 0 ) {
			saveUrl( obj, callback );
		} else {
			callback( source.data );
		}

		if ( isFunc( obj.wait ) ) {
			basket.wait( obj.wait );
		}
	};

	window.basket = {
		require: function() {
			var i, l;
			for ( i = 0, l = arguments.length; i < l; i++ ) {
				handleStackObject( arguments[ i ] );
			}

			return this;
		},

		remove: function( key ) {
			localStorage.removeItem( storagePrefix + key );
			return this;
		},

		wait: function( callback ) {
			globalWaitCount = scripts.length - 1;

			if ( isFunc( callback ) ) {
				if ( scriptsExecuted > globalWaitCount ) {
					callback();
				} else {
					waitCallbacks[ globalWaitCount ] = callback;
				}
			}

			return this;
		},

		get: function( key ) {
			return JSON.parse(localStorage.getItem( storagePrefix + key )) || false;
		},

		clear: function() {
			var key;
			var ls = localStorage;
			var now =  +new Date();

			for ( key in ls ) {
				if ( key.indexOf( storagePrefix ) === 0 ) {
					delete ls[ key ];
				}
			}

			return this;
		}
	};

})( this, document );
