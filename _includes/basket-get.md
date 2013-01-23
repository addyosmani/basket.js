<h3 id="get-doc">basket.get</h3>

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
