/*global document, XMLHttpRequest, localStorage, basket, RSVP*/
(function( window, document ) {
	'use strict';

	var head = document.head || document.getElementsByTagName('head')[0];
	var storagePrefix = 'basket-';
	var defaultExpiration = 5000;
	var hasLScache = null;

	var hasLocalStorage = function(){
		if ( hasLScache === null ){
			hasLScache = false;
			try{
				var tmpMtime = new Date().getTime();
				localStorage.setItem('t_'+tmpMtime,'d_'+tmpMtime);
				if ( localStorage.getItem('t_'+tmpMtime)==='d_'+tmpMtime ){
					localStorage.removeItem('t_'+tmpMtime);
					hasLScache = true;
				}
			}catch(e){}
		}
		return hasLScache;
	};

	var getFalse = function(){return false;};

	var LS = function(){
		return hasLocalStorage() ? localStorage : {
				setItem : getFalse,
				getItem : getFalse,
				removeItem : getFalse
			};
	};

	var tryGetChecksum = function( obj ){
		return	obj.unique ? obj.unique :
				basket.checksums[obj.url] ? basket.checksums[obj.url] :
				null;
	};

	var getAbsolute = function( relative ) {
		var stack = [],
			parts = relative.split('/');
		for (var i in parts) {
			if(parts[i] === '.') {continue;}
			parts[i] === '..' ? stack.pop() : stack.push(parts[i]);
		}
		return stack.join('/');
	};

	var addLocalStorage = function( key, storeObj ) {
		try {
			LS().setItem( storagePrefix + key, JSON.stringify( storeObj ) );
			return true;
		} catch( e ) {
			if ( e.name.toUpperCase().indexOf('QUOTA') >= 0 ) {
				var item;
				var tempScripts = [];

				for ( item in LS() ) {
					if ( item.indexOf( storagePrefix ) === 0 ) {
						tempScripts.push( JSON.parse( LS()[ item ] ) );
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
		var promise = new RSVP.Promise( function( resolve, reject ){
		  
			var xhr = new XMLHttpRequest();
			xhr.open( 'GET', url );

			xhr.onreadystatechange = function() {
				if ( xhr.readyState === 4 ) {
					if( xhr.status === 200 ) {
						resolve( {
							content: xhr.responseText,
							type: xhr.getResponseHeader('content-type')
						} );
					} else {
						reject( new Error( xhr.statusText ) );
					}
				}
			};

			// By default XHRs never timeout, and even Chrome doesn't implement the
			// spec for xhr.timeout. So we do it ourselves.
			/*
			setTimeout( function () {
				if( xhr.readyState < 4 ) {
					xhr.abort();
				}
			}, basket.timeout );*/

			xhr.send();
		});

		return promise;
	};

	var saveUrl = function( obj ) {
		return getUrl( obj.url ).then( function( result ) {
			var storeObj = wrapStoreData( obj, result );

			addLocalStorage( obj.key , storeObj );

			return storeObj;
		});
	};

	var wrapStoreData = function( obj, data ) {
		var now = +new Date();
		obj.data = data.content;
		obj.originalType = data.type;
		obj.type = obj.type || data.type;
		obj.stamp = now;
		obj.expire = now + ( ( obj.expire || defaultExpiration ) * 60 * 60 * 1000 );

		return obj;
	};

	var isCacheValid = function(source, obj) {
		return !source ||
			source.expire - +new Date() < 0  ||
			obj.unique !== source.unique ||
			(basket.isValidItem && !basket.isValidItem(source, obj));
	};

	var handleStackObject = function( obj ) {
		var source, promise, shouldFetch;

		if ( !obj.url ) {
			return;
		}
		
		obj.url = getAbsolute(obj.url);
		obj.key =  ( obj.key || obj.url );
		obj.unique = tryGetChecksum(obj);
		source = basket.get( obj.key );

		obj.execute = obj.execute !== false;

		shouldFetch = isCacheValid(source, obj);

		if( obj.live || shouldFetch ) {
			if ( obj.unique ) {
				// set parameter to prevent browser cache
				obj.url += ( ( obj.url.indexOf('?') > 0 ) ? '&' : '?' ) + 'basket-unique=' + obj.unique;
			}
			promise = saveUrl( obj );

			if( obj.live && !shouldFetch ) {
				promise = promise
					.then( function( result ) {
						// If we succeed, just return the value
						// RSVP doesn't have a .fail convenience method
						return result;
					}, function() {
						return source;
					});
			}
		} else {
			source.type = obj.type || source.originalType;
			promise = new RSVP.Promise( function( resolve ){
				resolve( source );
			});
		}

		return promise;
	};

	var injectScript = function( obj ) {
		var script = document.createElement('script');
		script.defer = true;
		// Have to use .text, since we support IE8,
		// which won't allow appending to a script
		script.text = obj.data;
		head.appendChild( script );
	};

	var handlers = {
		'default': injectScript
	};

	var execute = function( obj ) {
		if( obj.type && handlers[ obj.type ] ) {
			return handlers[ obj.type ]( obj );
		}

		return handlers['default']( obj ); // 'default' is a reserved word
	};

	var performActions = function( resources ) {
		resources.map( function( obj ) {
			if( obj.execute ) {
				execute( obj );
			}

			return obj;
		} );
	};

	var fetch = function() {
		var i, l, promises = [];

		for ( i = 0, l = arguments.length; i < l; i++ ) {
			promises.push( handleStackObject( arguments[ i ] ) );
		}

		return RSVP.all( promises );
	};

	var thenRequire = function() {
		var resources = fetch.apply( null, arguments );
		var promise = this.then( function() {
			return resources;
		}).then( performActions );
		promise.thenRequire = thenRequire;
		return promise;
	};

	window.basket = {
		require: function() {
			var promise = fetch.apply( null, arguments ).then( performActions );

			promise.thenRequire = thenRequire;
			return promise;
		},

		synchRequire : function(){
			var mainArguments = Array.prototype.slice.call(
				Array.isArray(arguments[0]) ? arguments[0] : arguments
			);
			var obj = mainArguments.shift();
			if(obj){
				return this.require(obj)
					.then(this.synchRequire.bind(this,mainArguments));
			}
		},

		remove: function( key ) {
			LS().removeItem( storagePrefix + key );
			return this;
		},

		get: function( key ) {
			var item = LS().getItem( storagePrefix + key );
			try	{
				return JSON.parse( item || 'false' );
			} catch( e ) {
				return false;
			}
		},

		clear: function( expired ) {
			var item, key;
			var now = +new Date();

			for ( item in LS() ) {
				// now can add basket-loader.js without keyname
				key = item.substr(item.indexOf(storagePrefix)+storagePrefix.length);
				if ( key && ( !expired || this.get( key ).expire <= now ) ) {
					this.remove( key );
				}
			}

			return this;
		},

		isValidItem: null,

		timeout: 5000,

		checksums: [],

		addHandler: function( types, handler ) {
			if( !Array.isArray( types ) ) {
				types = [ types ];
			}
			types.forEach( function( type ) {
				handlers[ type ] = handler;
			});
		},

		removeHandler: function( types ) {
			basket.addHandler( types, undefined );
		}
	};

	// delete expired keys
	basket.clear( true );

})( this, document );