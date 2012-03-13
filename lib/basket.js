/*globals document:true, XMLHttpRequest:true, localStorage:true*/
;(function ( window, document ) {
	"use strict";

	var
	head = document.head || document.getElementsByTagName("head")[ 0 ],
	storagePrefix = "basket-",
	scripts = [],
	scriptsExecuted = 0,
	globalWaitCount = 0,
	waitCallbacks = [],

	getUrl = function( url, callback ) {
		var xhr = new XMLHttpRequest();
		xhr.open( "GET", url, true );

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

	isFunc = function( func ) {
		return Object.prototype.toString.call( func ) === "[object Function]";
	},

	injectScript = function( text ) {
		var
		script = document.createElement( "script" );
		script.defer = true;
		// Have to use .text, since we support IE8,
		// which won't allow appending to a script
		script.text = text;
		head.appendChild( script );
	},

	handleStackObject = function( obj ) {
		var
		key = storagePrefix + ( obj.key || obj.url ),
		waitCount = globalWaitCount,
		scriptIndex = scripts.length,
		source = localStorage.getItem( key );

		if ( !obj.url ) {
			return;
		}

		if ( obj.execute !== false ) {
			obj.execute = true;
		}

		scripts[ scriptIndex ] = null;

		if ( source ) {
			scripts[ scriptIndex ] = source;
			queueExec( waitCount, obj.execute );
		} else {
			saveUrl( obj.url, key, function( text ) {
				scripts[ scriptIndex ] = text;
				queueExec( waitCount, obj.execute );
			});
		}

		if ( obj.wait ) {
			basket.wait( obj.wait );
		}
	},

	queueExec = function( waitCount, doExecute ) {
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

	window.basket = {
		require: function() {
			var
			stack = Array.apply( 0, arguments ),
			i = 0,
			l = stack.length;

			for ( ; i < l; i+= 1 ) {
				handleStackObject( stack[i] );
			}

			return this;
		},

		remove: function( key ) {
			localStorage.removeItem( storagePrefix + key );

			return this;
		},

		wait: function( callback ) {
			globalWaitCount = scripts.length - 1;

			if ( callback ) {
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
		}
	};

}( this, document ));
