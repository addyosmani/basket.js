/*global module, asyncTest, ok, start, basket*/
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
		url: 'fixtures/jquery.min.js' ,
		wait: function() {
			clearTimeout( cancel );

			ok( true, 'Callback invoked' );
			ok( basket.get('fixtures/jquery.min.js'), 'Data exists in localStorage' );

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
			{ url: 'fixtures/jquery.min.js' },
			{ url: 'fixtures/modernizr.min.js' }
		)
		.wait(function() {
			clearTimeout( cancel );

			ok( true, 'Callback invoked' );
			ok( basket.get('fixtures/jquery.min.js'), 'Data exists in localStorage' );
			ok( basket.get('fixtures/modernizr.min.js'), 'Data exists in localStorage' );

			start();
		});
});


asyncTest( 'require() 2 scripts (one non-executed) with .wait()', 4, function() {
	var cancel = setTimeout(function() {
		ok( false, 'Callback never invoked' );
		start();
	}, 2500);

	basket.require(
			{ url: 'fixtures/fail-script.js', execute: false },
			{ url: 'fixtures/modernizr.min.js' }
		)
		.wait(function() {
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
		.wait(function() {
			ok( basket.get(key), 'Data exists in localStorage under custom key' );

			start();
		});
});


asyncTest( 'clear()', 1, function() {
	basket
		.require({ url: 'fixtures/jquery.min.js' })
		.wait(function() {
			basket.clear();
			ok( !basket.get('fixtures/jquery.min.js'), 'basket.js data in localStorage cleared' );

			start();
		});
});

asyncTest( 'store data using expiration (non-expired)', 2, function() {
	basket
		.require({ url: 'fixtures/stamp-script.js', expire: 1 })
		.wait(function() {
			var stamp = basket.get('fixtures/stamp-script.js').stamp;
			ok( basket.get('fixtures/stamp-script.js'), 'Data exists in localStorage' );

			basket
				.require({ url: 'fixtures/stamp-script.js' })
				.wait(function() {
					var stampAfter = basket.get('fixtures/stamp-script.js').stamp;
					ok( stamp === stampAfter, 'Data retrieved from localStorage' );

					start();
				});
		});
});


asyncTest( 'store data using expiration (expired)', 2, function() {
		basket
			.require({ url: 'fixtures/stamp-script.js', expire: -1 })
			.wait(function() {
				var stamp = basket.get('fixtures/stamp-script.js').stamp;
				ok( basket.get('fixtures/stamp-script.js'), 'Data exists in localStorage' );

				basket
					.require({ url: 'fixtures/stamp-script.js' })
					.wait(function() {
						var stampAfter = basket.get('fixtures/stamp-script.js').stamp;
						ok( stamp !== stampAfter, 'Data retrieved from server' );

						start();
					});
			});
});


asyncTest( 'get()', 2, function() {
	basket
		.require({ url: 'fixtures/jquery.min.js', key: 'jquery' })
		.wait(function() {
			ok( basket.get('jquery'), 'Data retrieved under custom key' );
			ok( !basket.get("anotherkey").stamp, 'No Data retrieved under custom key' );

			start();
		});
});

asyncTest( 'store data using file-versioning (not previous explicit version)', 3, function() {
		basket
			.require({ url: 'fixtures/stamp-script.js' })
			.wait(function() {
				var stamp = basket.get('fixtures/stamp-script.js').stamp;
				ok( basket.get('fixtures/stamp-script.js'), 'Data exists in localStorage' );

				basket
					.require({ url: 'fixtures/stamp-script.js', unique: 123 })
					.wait(function() {
						var req = basket.get('fixtures/stamp-script.js');
						ok( stamp !== req.stamp, 'Data retrieved from server' );
						ok( req.url.indexOf("basket-unique=123") > 0, 'Sending basket unique parameter' );

						start();
					});
			});
});

asyncTest( 'store data using file-versioning (same release)', 2, function() {
		basket
			.require({ url: 'fixtures/stamp-script.js', unique: 123 })
			.wait(function() {
				var stamp = basket.get('fixtures/stamp-script.js').stamp;
				ok( basket.get('fixtures/stamp-script.js'), 'Data exists in localStorage' );

				basket
					.require({ url: 'fixtures/stamp-script.js', unique: 123 })
					.wait(function() {
						var stampAfter = basket.get('fixtures/stamp-script.js').stamp;
						ok( stamp === stampAfter, 'Data retrieved from server' );

						start();
					});
			});
});

asyncTest( 'store data using file-versioning (different release)', 3, function() {
		basket
			.require({ url: 'fixtures/stamp-script.js', unique: 123 })
			.wait(function() {
				var stamp = basket.get('fixtures/stamp-script.js').stamp;
				ok( basket.get('fixtures/stamp-script.js'), 'Data exists in localStorage' );

				basket
					.require({ url: 'fixtures/stamp-script.js', unique: 456 })
					.wait(function() {
						var req = basket.get('fixtures/stamp-script.js');
						ok( stamp !== req.stamp, 'Data retrieved from server' );
						ok( req.url.indexOf("basket-unique=456") > 0, 'Sending basket unique parameter' );
						start();
					});
			});
});
