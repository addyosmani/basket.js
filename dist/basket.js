/*!
* basket.js
* v0.3.0 - 2012-12-28
* http://addyosmani.github.com/basket.js
* (c) Addy Osmani; MIT License
* Created by: Addy Osmani, Sindre Sorhus, Andrée Hansson
* Contributors: Ironsjp, Mathias Bynens, Rick Waldron, Felipe Morais
* Uses rsvp.js, https://github.com/tildeio/rsvp.js
*/

(function( window, document ) {
	'use strict';

	// Monkey-patching an "all" method onto RSVP
	// Returns a promise that will be fulfilled when the array of promises passed in are all
	// fulfilled
	RSVP.all = function( promises ) {
		var i, results = [];
		var allPromise = new RSVP.Promise();
		var remaining = promises.length;

		var resolver = function( index ) {
			return function( value ) {
				resolve( index, value );
			};
		};
		var resolve = function( index, value ) {
			results[ index ] = value;
			if ( --remaining === 0 ) {
				allPromise.resolve( results );
			}
		};
		var reject = function( error ) {
			allPromise.reject( error );
		};

		for ( i = 0; i < remaining; i++ ) {
			promises[ i ].then( resolver( i ), reject );
		}

		return allPromise;
	};

	var head = document.head || document.getElementsByTagName('head')[0];
	var storagePrefix = 'basket-';
	var defaultExpiration = 5000;

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
					// no files to remove. Larger than available quota
					return;
				}

			} else {
				// some other error
				return;
			}
		}

	};

	var getUrl = function( url ) {
		var xhr = new XMLHttpRequest();
		var promise = new RSVP.Promise();
		xhr.open( 'GET', url );

		xhr.onreadystatechange = function() {
			if ( xhr.readyState === 4 ) {
				if( xhr.status === 200 ) {
					promise.resolve( xhr.responseText );
				} else {
					promise.reject( new Error( xhr.statusText ) );
				}
			}
		};

		xhr.send();

		return promise;
	};

	var saveUrl = function( obj ) {
		return getUrl( obj.url ).then( function( text ) {
			var storeObj = wrapStoreData( obj, text );

			addLocalStorage( obj.key , storeObj );

			return text;
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

	var wrapStoreData = function( obj, data ) {
		var now = +new Date();
		obj.data = data;
		obj.stamp = now;
		obj.expire = now + ( ( obj.expire || defaultExpiration ) * 60 * 60 * 1000 );

		return obj;
	};

	var handleStackObject = function( obj ) {
		var source, promise;

		if ( !obj.url ) {
			return;
		}

		obj.key =  ( obj.key || obj.url );
		source = basket.get( obj.key );

		obj.execute = obj.execute !== false;

		if ( !source || source.expire - +new Date() < 0  || obj.unique !== source.unique ) {
			if ( obj.unique ) {
				// set parameter to prevent browser cache
				obj.url += ( ( obj.url.indexOf('?') > 0 ) ? '&' : '?' ) + 'basket-unique=' + obj.unique;
			}
			promise = saveUrl( obj );
		} else {
			promise = new RSVP.Promise();
			promise.resolve( source.data );
		}

		if( obj.execute ) {
			return promise.then( injectScript );
		} else {
			return promise;
		}
	};

	window.basket = {
		require: function() {
			var i, l, promises = [];

			for ( i = 0, l = arguments.length; i < l; i++ ) {
				promises.push( handleStackObject( arguments[ i ] ) );
			}

			return RSVP.all( promises );
		},

		remove: function( key ) {
			localStorage.removeItem( storagePrefix + key );
			return this;
		},

		get: function( key ) {
			var item = localStorage.getItem( storagePrefix + key );
			try	{
				return JSON.parse( item || 'false' );
			} catch( e ) {
				return false;
			}
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
