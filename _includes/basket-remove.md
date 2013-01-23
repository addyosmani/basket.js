### basket.remove

`basket.remove( key )`

*key:* The key to remove from the localStorage cache.

`remove()` will simply remove a previously cached script from localStorage. An example of how to use it can be seen below:

	basket
		.remove('jquery.js')
		.remove('modernizr');
