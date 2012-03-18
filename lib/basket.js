/*globals document:true, XMLHttpRequest:true, localStorage:true, basket:true */
!function( window, document ) {
	'use strict';

	var
	head = document.head || document.getElementsByTagName('head')[ 0 ],
	storagePrefix = 'basket-',
	scripts = [],
	scriptsExecuted = 0,
	globalWaitCount = 0,
	waitCallbacks = [],

	isFunc = function( fn ) {
		return {}.toString.call( fn ) === '[object Function]';
	},

	getUrl = function( url, callback ) {
		var xhr = new XMLHttpRequest();
		xhr.open( 'GET', url );

		xhr.onreadystatechange = function() {
			if ( xhr.readyState === 4 && xhr.status === 200 ) {
				callback( xhr.responseText );
			}
		};

		xhr.send();
	},

	saveUrl = function( url, key, callback ) {
		getUrl( url, function( text ) {
			localStorage.setItem( key, text );

			if ( isFunc(callback) ) {
				callback( text );
			}
		});
	},

	injectScript = function( text ) {
		var
		script = document.createElement('script');
		script.defer = true;
		// Have to use .text, since we support IE8,
		// which won't allow appending to a script
		script.text = text;
		head.appendChild( script );
	},

	queueExec = function( waitCount, doExecute ) {
		var
		i = 0,
		j,
		script,
		callback;

		if ( scriptsExecuted >= waitCount ) {
			for ( ; i < scripts.length; i++ ) {
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
	},

	handleStackObject = function( obj ) {
		var
		key = storagePrefix + ( obj.key || obj.url ),
		waitCount = globalWaitCount,
		scriptIndex = scripts.length,
		source = localStorage.getItem( key ),
		callback = function( text ) {
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
			var
			i = 0,
			l = arguments.length;

			for ( ; i < l; i++ ) {
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
			var
			LS = localStorage,
			re = /^basket-/,
			key;

			for ( key in LS ) {
				if ( re.test( key ) ) {
					delete LS[ key ];
				}
			}

			return this;
		}
	};

}( this, document );