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

	basket.require({
		url: 'jquery-1.7.1.min.js' ,
		wait: function() {
			clearTimeout( cancel );

			ok( true, 'Callback invoked' );
			ok( basket.get('jquery-1.7.1.min.js'), 'Data exists in localStorage' );

			start();
		}
	});
});


asyncTest( 'require() 2 scripts with .wait()', 3, function() {
	var cancel = setTimeout(function() {
		ok( false, 'Callback never invoked' );
		start();
	}, 2500);

	basket.require(
			{ url: 'jquery-1.7.1.min.js' },
			{ url: 'modernizr.js' }
		)
		.wait(function() {
			clearTimeout( cancel );

			ok( true, 'Callback invoked' );
			ok( basket.get('jquery-1.7.1.min.js'), 'Data exists in localStorage' );
			ok( basket.get('modernizr.js'), 'Data exists in localStorage' );

			start();
		});
});


asyncTest( 'require() 2 scripts (one non-executed) with .wait()', 4, function() {
	var cancel = setTimeout(function() {
		ok( false, 'Callback never invoked' );
		start();
	}, 2500);

	basket.require(
			{ url: 'fail-script.js', execute: false },
			{ url: 'modernizr.js' }
		)
		.wait(function() {
			clearTimeout( cancel );

			ok( true, 'Callback invoked' );
			ok( basket.get('modernizr.js'), 'Data exists in localStorage' );
			ok( basket.get('fail-script.js'), 'Data exists in localStorage' );
			ok( basket.fail !== true, 'Script not executed' );

			start();
		});
});


asyncTest( 'require(), custom key', 1, function() {
	var key = +new Date();

	basket
		.require({ url: 'jquery-1.7.1.min.js', key: key })
		.wait(function() {
			ok( basket.get(key), 'Data exists in localStorage under custom key' );

			start();
		});
});


asyncTest( 'clear()', 1, function() {
	basket
		.require({ url: 'jquery-1.7.1.min.js' })
		.wait(function() {
			basket.clear();
			ok( !basket.get('jquery-1.7.1.min.js'), 'basket.js data in localStorage cleared' );

			start();
		});
});


asyncTest( 'store data using expiration (non-expired)', 2, function() {
	basket
		.require({ url: 'stamp-script.js', expire: 1 })
		.wait(function() {
			var stamp = basket.lastXHR;
			ok( basket.get('stamp-script.js'), 'Data exists in localStorage' );

			basket
				.require({ url: 'stamp-script.js' })
				.wait(function() {
					console.log( basket , stamp)
					ok( basket.lastXHR === stamp, 'Data retrieved from localStorage' );
					start();
				});
		});
});


asyncTest( 'store data using expiration (expired)', 2, function() {
		basket
			.require({ url: 'stamp-script.js', expire: -1 })
			.wait(function() {
				var stamp = basket.lastXHR;
				ok( basket.get('stamp-script.js'), 'Data exists in localStorage' );

				basket
					.require({ url: 'stamp-script.js' })
					.wait(function() {
						ok( basket.lastXHR !== stamp, 'Data retrieved from server' );
						start();
					});
			});
});
