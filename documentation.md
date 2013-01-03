### About localStorage

[localStorage](http://diveintohtml5.info/storage.html) is a simple API within [modern browsers](http://caniuse.com/#search=localstorage) to allow web developers to store small amounts of data within the user's browser.

The HTML5 spec suggests storage quota with a limit of 5MB for localStorage but browsers can implement their own quota if they wish. If the quota is exceeded the browser may fail to store items in the cache. If this happens, basket.js will remove entries from the cache beginning with the oldest and try again. Some browsers like Opera will ask the user about increasing the quota when it exceeds a set threshold.

To free space basket.js will only remove cached scripts that it placed in localStorage itself. The data stored by other code in same origin will not be touched.

### API

* `basket.require()`
* `basket.get()`
* `basket.remove()`
* `basket.clear()`

### basket.require

`basket.require( details )`

**details** Either an object or an array of objects with the following fields:

* **uri** (*required*) The URI for the script. At present this must be a URI on the same origin as the caller.
* **key** The name that will be used to refer to this script. By default this is the *uri*.
* **expire** How long (in hours) before the cached item expires.
* **execute** Whether to cause the script to be executed once it has been retrieved. Defaults to true.
* **unique** A token stored with the cached item. If you request the same item again with a different token the script will be fetched and cached again.

`require()` returns a [promise](http://wiki.commonjs.org/wiki/Promises/A) that will be fulfilled when each of the requested items has been fetched, or rejected if any item fails.

#### Examples

**Single script**

```javascript
basket.require({ url: 'jquery.js' });
```

This fetches a single script and executes it. If the script was already in the localStorage cache it will be loaded from there, otherwise it will be loaded from the network. The script will then be injected into the document for the browser to execute.

**Multiple scripts**

```javascript
basket.require({
	{ url: 'jquery.js' },
	{ url: 'underscore.js' },
	{ url: 'backbone.js' }
});
```

Multiple scripts will be requested. The scripts are requested asynchronously and so my load and execute in any order.

**Ordering dependencies**

```javascript
basket.require({ url: 'jquery.js' })
	.then(function() {
		basket.require({ url: 'jquery-ui.js' });
	});
})
```

Here we ask basket.js to load jQuery. Once it has been fetched and executed, the promise returned by `require()` will be fulfilled and the callback passed to the `then()` method of the promise will be executed. Now we can do anything the requires jquery to be loaded including load any scripts that depend on it.

**Error handling**

```javascript
basket.require({ url: 'missing.js' })
	.then(function() {
		// Success
	}, function( error ) {
		// There was an error fetching the script
		console.log( error );
	});
```

The second parameter to `then()` is a function that will be called if the promise is rejected. That is, if there was an error fetching the script. The only parameter to the error callback will be an Error object with details of the failure.

**Using an alias**

```javascript
basket.require({ url: 'jquery-1.7.1.min.js', key: 'jquery' });
```

If you wish to store a script under a specific key name (e.g. if you have a build process which creates a script with a name like `012345.js` and want to store it as, say, `main`), you can set the `key` property to the name you want to use.

This can also be useful for libraries with version numbers in their URIs when you don't need a particular version. In the above example the cache will be checked for a script stored as "jquery" regardless of its original URI. This allows us to use an older version stored in the cache if one exists.

If `key` is not set the url will be used instead.

**Cache expiry**

```javascript
basket.require({ url: 'jquery.min.js', expire: 2 })
```

Here script will only be cached for up to 2 hours. After that time it will be fetched from the network again even if it exists in the cache. To re-fetch after 7 days you could set 168 ( i.e. 7 * 24 = 168 ).

If `expire` is not set, the default time of 5000 hours will be used - almost 7 months.

**Cache a file without executing it**

```javascript
basket.require({ url: 'jquery.min.js', execute: false });
```

The script will be cached but will not be added to the document to be executed.

**Cache busting**

```javascript
/* fetch and cache the file */
basket.require({ url: 'jquery.min.js' });

/* fetch and cache again */
basket.require({ url: 'jquery.min.js', unique: 123 });
```

Set the `unique` property to control whether the script will be loaded from the cache. If the parameter is different in the request to that stored in the cache the file is fetched again.

basket.js will add the "basket-unique" parameter on to the url to also prevent the script being fetched from the browser cache.


### basket.get

`basket.get( key )`

**key** The key to lookup in the localStorage cache.

`get()` will return an object if script is found or false if not. The object contains the same data as that passed to `require()` when it was first loaded, with some additional details added:

* **stamp** The timestamp for when the file was fetched.
* **expire** The timestamp for when the item will expire.
* **data** The file contents of the script.

```javascript
var req, ttl;
basket.require({ url: 'jquery.min.js', key: 'jquery' });
req = basket.get('jquery');
// know the lifetime
ttl = req.expire - req.stamp;
```


### basket.remove

`basket.remove( key )`

**key** The key to remove from the localStorage cache.

`remove()` will simply remove a previously cached script from localStorage. An example of how to use it can be seen below:</p>

```javascript
basket
	.remove('jquery.js')
	.remove('modernizr');
```

### basket.clear

`basket.clear( expired )`

**expired** If `expired` is true then only items that have expired will be removed. Otherwise all items are removed.

`clear()` removes items from the cache.

```javascript
basket.clear();
basket.clear( true );
```

### basket.isValidItem

`basket.isValidItem( source, obj )`

* **source** The source of the item returned from localStorage
* **obj** The item passed into `require`

**Optional** method that is called when validating a previously cached item.  `isValidItem` is called for each item in a `require` call.

`isValidItem()` is expected to return true is the item is valid.  If `isValidItem()` returns false, the item will be loaded from the network.  `isValidItem()` if present is an additonal check and does not override the existing checks for expiration and uniqueness.

This is targetted at advanced usage and is strictly optional.  The use of `unique` and `expire` parameters are the most appropriate way to handle common scenarios.


```javascript
basket.isValidItem = function( source, obj ) {
	return myVerificationFunction( source, obj );
};
```
