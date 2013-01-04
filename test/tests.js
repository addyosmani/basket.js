/*global module, asyncTest, ok, start, basket*/
'use strict';
module( 'Test script API', {
	teardown: function() {
		localStorage.clear();
		basket.fail = false;
	}
});


asyncTest( 'require() 1 script', 2, function() {
	var cancel = setTimeout(function() {
		ok( false, 'Callback never invoked' );
		start();
	}, 2500);

	basket.require(
		{url: 'fixtures/jquery.min.js'}
	)
	.then(function() {
		clearTimeout( cancel );

		ok( true, 'Callback invoked' );
		ok( basket.get('fixtures/jquery.min.js'), 'Data exists in localStorage' );

		start();
	});
});


asyncTest( 'require() 2 scripts with .then()', 3, function() {
	var cancel = setTimeout(function() {
		ok( false, 'Callback never invoked' );
		start();
	}, 2500);

	basket.require(
			{ url: 'fixtures/jquery.min.js' },
			{ url: 'fixtures/modernizr.min.js' }
		)
		.then(function() {
			clearTimeout( cancel );

			ok( true, 'Callback invoked' );
			ok( basket.get('fixtures/jquery.min.js'), 'Data exists in localStorage' );
			ok( basket.get('fixtures/modernizr.min.js'), 'Data exists in localStorage' );

			start();
		});
});


asyncTest( 'require() 2 scripts (one non-executed) with .then()', 4, function() {
	var cancel = setTimeout(function() {
		ok( false, 'Callback never invoked' );
		start();
	}, 2500);

	basket.require(
			{ url: 'fixtures/fail-script.js', execute: false },
			{ url: 'fixtures/modernizr.min.js' }
		)
		.then(function() {
			clearTimeout( cancel );

			ok( true, 'Callback invoked' );
			ok( basket.get('fixtures/modernizr.min.js'), 'Data exists in localStorage' );
			ok( basket.get('fixtures/fail-script.js'), 'Data exists in localStorage' );
			ok( basket.fail !== true, 'Script not executed' );

			start();
		});
});


asyncTest( 'require(), custom key', 1, function() {
	var key = +new Date();

	basket
		.require({ url: 'fixtures/jquery.min.js', key: key })
		.then(function() {
			ok( basket.get(key), 'Data exists in localStorage under custom key' );

			start();
		});
});


asyncTest( 'clear()', 1, function() {
	basket
		.require({ url: 'fixtures/jquery.min.js' })
		.then(function() {
			basket.clear();
			ok( !basket.get('fixtures/jquery.min.js'), 'basket.js data in localStorage cleared' );

			start();
		});
});


asyncTest( 'clear( expired ) - remove only expired keys ', 2, function() {
	basket
		.require(
			{ url: 'fixtures/largeScript.js', key: 'largeScript0', expire: -1 },
			{ url: 'fixtures/largeScript.js', key: 'largeScript1' }
		).then(function() {
			basket.clear( true );
			// check if scripts added was removed from localStorage
			ok( !basket.get( 'largeScript0' ) , 'Expired script removed' );
			ok( basket.get( 'largeScript1' ) , 'Non-expired script exists in localstorage' );

			start();
		});
});


asyncTest( 'store data using expiration (non-expired)', 2, function() {
	basket
		.require({ url: 'fixtures/stamp-script.js', expire: 1 })
		.then(function() {
			var stamp = basket.get('fixtures/stamp-script.js').stamp;
			ok( basket.get('fixtures/stamp-script.js'), 'Data exists in localStorage' );

			basket
				.require({ url: 'fixtures/stamp-script.js' })
				.then(function() {
					var stampAfter = basket.get('fixtures/stamp-script.js').stamp;
					ok( stamp === stampAfter, 'Data retrieved from localStorage' );

					start();
				});
		});
});


asyncTest( 'store data using expiration (expired)', 2, function() {
		basket
			.require({ url: 'fixtures/stamp-script.js', expire: -1 })
			.then(function() {
				var stamp = basket.get('fixtures/stamp-script.js').stamp;
				ok( basket.get('fixtures/stamp-script.js'), 'Data exists in localStorage' );

				basket
					.require({ url: 'fixtures/stamp-script.js' })
					.then(function() {
						var stampAfter = basket.get('fixtures/stamp-script.js').stamp;
						ok( stamp !== stampAfter, 'Data retrieved from server' );

						start();
					});
			});
});


asyncTest( 'get()', 2, function() {
	basket
		.require({ url: 'fixtures/jquery.min.js', key: 'jquery' })
		.then(function() {
			ok( basket.get('jquery'), 'Data retrieved under custom key' );
			ok( !basket.get('anotherkey').stamp, 'No Data retrieved under custom key' );

			start();
		});
});


asyncTest( 'store data using file-versioning (not previous explicit version)', 3, function() {
		basket
			.require({ url: 'fixtures/stamp-script.js' })
			.then(function() {
				var stamp = basket.get('fixtures/stamp-script.js').stamp;
				ok( basket.get('fixtures/stamp-script.js'), 'Data exists in localStorage' );

				basket
					.require({ url: 'fixtures/stamp-script.js', unique: 123 })
					.then(function() {
						var req = basket.get('fixtures/stamp-script.js');
						ok( stamp !== req.stamp, 'Data retrieved from server' );
						ok( req.url.indexOf('basket-unique=123') > 0, 'Sending basket unique parameter' );

						start();
					});
			});
});


asyncTest( 'store data using file-versioning (same release)', 2, function() {
		basket
			.require({ url: 'fixtures/stamp-script.js', unique: 123 })
			.then(function() {
				var stamp = basket.get('fixtures/stamp-script.js').stamp;
				ok( basket.get('fixtures/stamp-script.js'), 'Data exists in localStorage' );

				basket
					.require({ url: 'fixtures/stamp-script.js', unique: 123 })
					.then(function() {
						var stampAfter = basket.get('fixtures/stamp-script.js').stamp;
						ok( stamp === stampAfter, 'Data retrieved from server' );

						start();
					});
			});
});


asyncTest( 'store data using file-versioning (different release)', 3, function() {
		basket
			.require({ url: 'fixtures/stamp-script.js', unique: 123 })
			.then(function() {
				var stamp = basket.get('fixtures/stamp-script.js').stamp;
				ok( basket.get('fixtures/stamp-script.js'), 'Data exists in localStorage' );

				basket
					.require({ url: 'fixtures/stamp-script.js', unique: 456 })
					.then(function() {
						var req = basket.get('fixtures/stamp-script.js');
						ok( stamp !== req.stamp, 'Data retrieved from server' );
						ok( req.url.indexOf('basket-unique=456') > 0, 'Sending basket unique parameter' );
						start();
					});
			});
});


asyncTest( 'remove oldest script in localStorage when Quote Exceeded', 2, function() {
	var i = 0;
	var l = 10;

	(function add() {
		// Try add script in localStorage
		basket
			.require({ url: 'fixtures/largeScript.js', key: 'largeScript' + i })
			.then(function() {
				if ( i < l ) {
					// add one more file
					add( ++i );
				} else {
					// check if first script added was removed from localStorage
					ok( !basket.get( 'largeScript0' ) , 'First Script deleted' );
					// check if the last script added still on localStorage
					ok( basket.get( 'largeScript10' ) , 'Last Script still alive' );
					start();
				}
			});
	})();
});


asyncTest( 'file is larger then quota limit ', 3, function() {
	basket
		.require({ url: 'fixtures/largeScript.js', key: 'largeScript0' }, { url: 'fixtures/largeScript.js', key: 'largeScript1' })
		.then();
	basket.require({ url: 'fixtures/veryLargeScript.js', key: 'largeScript2' })
		.then(function() {
			// check if scripts added was removed from localStorage
			ok( !basket.get( 'largeScript0' ) , 'First Script deleted' );
			ok( !basket.get( 'largeScript1' ) , 'Second Script deleted' );
			// check if the last script added still on localStorage
			ok( !basket.get( 'largeScript2' ) , 'Last Script not added' );
			start();
		});
});

asyncTest( 'non-existant file causes error handler to be called', 2, function() {
	basket
		.require({ url: 'non-existant.js' })
		.then(function() {
			ok( false, 'The success callback should not be called' );
			start();
		}, function(error) {
			ok( error, 'Error callback called' );
			ok( !basket.get( 'non-existant.js' ), 'No cache entry for missing file' );
			start();
		});
});

asyncTest( 'handle the case where localStorage contains something we did not expect', 2, function() {
	localStorage.setItem( 'basket-test', 'An invalid JSON string' );
	basket
		.require({ url: 'fixtures/jquery.min.js', key: 'test' })
		.then(function() {
			start();
			ok( basket.get( 'test' ), 'successfully retrieved the script' );
			ok( basket.get( 'test' ).key === 'test', 'got a valid cache object' );
		});
});

asyncTest( 'file is fetched from server even if it exists when isValidItem answers no', 2, function() {
		basket
			.require({ url: 'fixtures/stamp-script.js'})
			.then(function() {
				var stamp = basket.get('fixtures/stamp-script.js').stamp;
				ok( basket.get('fixtures/stamp-script.js'), 'Data exists in localStorage' );
				basket.isValidItem = function(source, obj) {
					return false;
				};
				basket
					.require({ url: 'fixtures/stamp-script.js' })
					.then(function() {
						var stampAfter = basket.get('fixtures/stamp-script.js').stamp;
						ok( stamp !== stampAfter, 'Data retrieved from server' );

						start();
					});
			});
});

