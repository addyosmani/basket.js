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

	var addLocalStorage = function( key, storeObj ) {
		try {
			localStorage.setItem( storagePrefix + key, JSON.stringify( storeObj ) );
			return true;
		} catch( e ) {
			if ( e.name.toUpperCase().indexOf('QUOTA') >= 0 ) {
				var item;
				var tempScripts = [];

				for ( item in localStorage ) {
					if ( item.indexOf( storagePrefix ) === 0 ) {
						tempScripts.push( JSON.parse( localStorage[ item ] ) );
					}
				}

				if ( tempScripts.length ) {
					tempScripts.sort(function( a, b ) {
						return a.stamp - b.stamp;
					});

					basket.remove( tempScripts[ 0 ].key );

					return addLocalStorage( key, storeObj );

				} else {
					// no files to remove. More large than available quota
					return;
				}

			} else {
				// some other error
				return;
			}
		}

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

			addLocalStorage( obj.key , storeObj );

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
		obj.expire = now + ( ( obj.expire || defaultExpiration ) * 60 * 60 * 1000 );

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

		if ( !source || source.expire - +new Date() < 0  || obj.unique !== source.unique ) {
			if ( obj.unique ) {
				// set parameter to prevent browser cache
				obj.url += ( ( obj.url.indexOf('?') > 0 ) ? '&' : '?' ) + 'basket-unique=' + obj.unique;
			}
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
			return JSON.parse( localStorage.getItem( storagePrefix + key ) || "false" );
		},

		clear: function( expired ) {
			var item, key;
			var now = +new Date();

			for ( item in localStorage ) {
				key = item.split( storagePrefix )[ 1 ];
				if ( key && ( !expired || this.get( key ).expire <= now ) ) {
					this.remove( key );
				}
			}

			return this;
		}
	};

	// delete expired keys
	basket.clear( true );

})( this, document );
