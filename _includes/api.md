## API

### Summary of changes since version 0.2

**basket.require() now returns a Promise**. Calls to `require()` are no longer chainable but you get better flexibilty in handling dependancies and errors in return.

**The basket.wait() method has been removed**. The promise returned by `require()` fulfills the same purpose in a more standard way.

**The basket.add() method has been removed**. Manually adding items to the cache is no longer supported.

**basket.clear() has been added**.

See the updated documentation below for more details.

* [`basket.require()`](#basketrequire)
* [`basket.get()`](#basketget)
* [`basket.remove()`](#basketremove)
* [`basket.clear()`](#basketclear)

### basket.require

`basket.require( details )`

*details:* Either an object or an array of objects with the following fields:


* **url** (*required*) The URI for the script. At present this must be a URI on the same origin as the caller.
* **key** The name that will be used to refer to this script. By default this is the *uri*.
* **expire** How long (in hours) before the cached item expires.
* **execute** Whether to cause the script to be executed once it has been retrieved. Defaults to true.
* **unique** A token stored with the cached item. If you request the same item again with a different token the script will be fetched and cached again.

`require()` returns a [promise](http://wiki.commonjs.org/wiki/Promises/A) that will be fulfilled when each of the requested items has been fetched, or rejected if any item fails.

#### Examples

**Single script**

	basket.require({ url: 'jquery.js' });

This fetches a single script and executes it. If the script was already in the localStorage cache it will be loaded from there, otherwise it will be loaded from the network. The script will then be injected into the document for the browser to execute.

**Multiple scripts**

	basket.require(
		{ url: 'jquery.js' },
		{ url: 'underscore.js' },
		{ url: 'backbone.js' }
	);

Multiple scripts will be requested. The scripts are requested asynchronously and so may load and execute in any order.

**Ordering dependencies**

	basket.require({ url: 'jquery.js' })
		.then(function() {
			basket.require({ url: 'jquery-ui.js' });
		});
	})

Here we ask basket.js to load jQuery. Once it has been fetched and executed, the promise returned by `require()` will be fulfilled and the callback passed to the `then()` method of the promise will be executed. Now we can do anything the requires jquery to be loaded including load any scripts that depend on it.

**Error handling**

	basket.require({ url: 'missing.js' })
		.then(function() {
			// Success
		}, function( error ) {
			// There was an error fetching the script
			console.log( error );
		});

The second parameter to `then()` is a function that will be called if the promise is rejected. That is, if there was an error fetching the script. The only parameter to the error callback will be an Error object with details of the failure.

**Using an alias**

	basket.require({ url: 'jquery-1.8.3.min.js', key: 'jquery' });

If you wish to store a script under a specific key name (e.g. if you have a build process which creates a script with a name like `012345.js` and want to store it as, say, `main`), you can set the `key` property to the name you want to use.

This can also be useful for libraries with version numbers in their URIs when you don't need a particular version. In the above example the cache will be checked for a script stored as "jquery" regardless of its original URI. This allows us to use an older version stored in the cache if one exists.

If `key` is not set the url will be used instead.

**Cache expiry**

	basket.require({ url: 'jquery.min.js', expire: 2 })

Here script will only be cached for up to 2 hours. After that time it will be fetched from the network again even if it exists in the cache. To re-fetch after 7 days you could set 168 ( i.e. 7 * 24 = 168 ).

If `expire` is not set, the default time of 5000 hours will be used - almost 7 months.

**Cache a file without executing it**

	basket.require({ url: 'jquery.min.js', execute: false });

The script will be cached but will not be added to the document to be executed.

**Cache busting**

	/* fetch and cache the file */
	basket.require({ url: 'jquery.min.js' });

	/* fetch and cache again */
	basket.require({ url: 'jquery.min.js', unique: 123 });

Set the `unique` property to control whether the script will be loaded from the cache. If the parameter is different in the request to that stored in the cache the file is fetched again.

basket.js will add the "basket-unique" parameter on to the url to also prevent the script being fetched from the browser cache.

### basket.get

`basket.get( key )`

*key:* The key to lookup in the localStorage cache.

`get()` will return an object if script is found or false if not. The object contains the same data as that passed to `require()` when it was first loaded, with some additional details added:

* **stamp** The timestamp for when the file was fetched.
* **expire** The timestamp for when the item will expire.
* **data** The file contents of the script.

	var req, ttl;
	basket.require({ url: 'jquery.min.js', key: 'jquery' });
	req = basket.get('jquery');
	// know the lifetime
	ttl = req.expire - req.stamp;

### basket.remove

`basket.remove( key )`

*key:* The key to remove from the localStorage cache.

`remove()` will simply remove a previously cached script from localStorage. An example of how to use it can be seen below:

	basket
		.remove('jquery.js')
		.remove('modernizr');

### basket.clear

`basket.clear( expired )`

*expired:* If `expired` is true then only items that have expired will be removed. Otherwise all items are removed.

`clear()` removes items from the cache.

	basket.clear();
	basket.clear( true );
