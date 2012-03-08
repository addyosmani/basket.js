(function() {
module("Test script API", {
	teardown: function() {
		localStorage.clear();
	}
});


asyncTest("require() a script, execute callback post-load via wait()", 4, function(){
	basket
		.require("jquery-1.7.1.min.js")
		.wait(function(){
			ok(true, "first callback invoked");
			ok(
				localStorage.getItem("basket-jquery-1.7.1.min.js"),
				"file saved in local storage correctly"
			);
			start();
		})
		.require("modernizr.js")
		.wait(function(){
			ok(true, "second callback invoked");
			ok(
				localStorage.getItem("basket-modernizr.js"),
				"file saved in local storage correctly"
			);
			start();
		});
});


asyncTest("add() scripts without injection", 1, function() {
	basket
		.add("jquery-1.7.1.min.js")
		.add("modernizr.js");

	setTimeout(function() {
		var testItem = window.localStorage.getItem("basket-modernizr.js");
		ok(testItem.length >0 , "ensuring items reloaded contain content");
		start();
	}, 100);
});


asyncTest("remove() scripts from storage", 2, function() {
		// Add initial scripts to storage
		basket
			.add("jquery-1.7.1.min.js")
			.add("modernizr.js");

		// If the previous test passed, we know add() works
		// lets assume there should be two items in LS now.
		// Remove them.

		setTimeout(function() {
			basket
				.remove("jquery-1.7.1.min.js")
				.remove("modernizr.js");

			var testjQuery = window.localStorage.getItem("jquery-1.7.1.min.js");
			var testModernizr = window.localStorage.getItem("basket-modernizr.js");
			strictEqual(!!testModernizr, false, "ensure script 1 removed");
			strictEqual(!!testjQuery, false, "ensure script 2 removed");
			start();

		}, 100);
});


asyncTest("Chaining require() calls", 1, function() {
	basket
		.require("jquery-1.7.1.min.js")
		.require("underscore-min.js")
		.require("backbone-min.js").wait(function() {
			strictEqual(window.localStorage.length, 3, "Items correctly added via chaining");
			start();
	});
});


asyncTest("require() multiple scripts, test scripts loaded and can be used", 3, function() {
	basket
		.require("jquery-1.7.1.min.js").wait(function() {
			var el = $("ul");
			strictEqual(el.length, 1, "Selected element correctly using jQuery");
			start();
		});

	stop();

	basket
		.require("underscore-min.js").wait(function() {
			var sum = _.reduce([1, 2, 3], function(memo, num) { return memo + num; }, 0);
			strictEqual(sum, 6, "Sum operation via Underscore processed correctly");
			start();
		});

	stop();

	basket
		.require("backbone-min.js").wait(function() {
			var Meal = Backbone.Model.extend({
				idAttribute: "_id"
			});

			var cake = new Meal({ _id: 4, name: "Cake" });
			strictEqual(cake.id, 4, "Retrieved id of Backbone.Model instance");
			start();
		});
});


module("Test localStorage population");


asyncTest("require() cache scripts to localStorage, scripts can be accessed and contain expected contents", 2, function() {
	basket
		.require("modernizr.js")
		.require("underscore-min.js").wait(function() {
			var test = localStorage.getItem("basket-modernizr.js");
			ok(test.length > 0, "script contents are greater than 0");
			ok(
				test.indexOf("applicationcache-canvas-canvastext") > 0,
				"script contents contain expected strings"
			);
			start();
		});
});


module("Utilities");


test("Can correctly detect if input is a function or not. Used for callbacks", function() {
	expect(2);
	// isFunc() logic abstracted from the private section of basket.js
	function method(){};
	var variable = "test";
	strictEqual(Object.prototype.toString.call(method) === "[object Function]", true);
	strictEqual(Object.prototype.toString.call(variable) === "[object Function]", false);
});

}());