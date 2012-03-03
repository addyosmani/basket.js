/* Basket.js 0.1
 * A script-loader that handles caching scripts in localStorage
 * where supported.
 * http://addyosmani.com/
 * Credits: Addy Osmani, Ironsjp, Mathias Bynens, Rick Waldron.
 * Copyright (c) 2012 Addy Osmani;
 * Licensed MIT, GPL
 */
 ;(function (window, document) {

	function basketLoader() {

		var
		_storagePrefix = "basket-",
			scripts = [],
			scriptsExecuted = 0,
			waitCount = 0,
			waitCallbacks = [],

			getUrl = function (url, callback) {
				var xhr = new XMLHttpRequest();
				xhr.open("GET", url, true);
				xhr.onreadystatechange = function (e) {
					if (xhr.readyState === 4) {
						callback(xhr.responseText);
					}
				};
				xhr.send();
			},

			saveUrl = function(url, key, callback){
				getUrl(url, function (text) {
				   localStorage.setItem(key, text);
				   
				   if(isFunc(callback)){
						callback();
					}
				});
			},

			isFunc =  function(func){
				 return Object.prototype.toString.call(func) == "[object Function]";
			},

			injectScript = function (text) {
				var script = document.createElement("script"),
					head = document.head || document.getElementsByTagName("head")[0];

				script.defer = true;
				script.appendChild(document.createTextNode(text));
				head.appendChild(script);
			},

			queueExec = function (waitCount) {
				var script, i, j, callback;

				if (scriptsExecuted >= waitCount) {
					for (i = 0; i < scripts.length; i++) {
						script = scripts[i];

						if (!script) {
							// loading/executed
							continue;
						}
						scripts[i] = null;
						injectScript(script);
						scriptsExecuted++;

						for (j = i; j < scriptsExecuted; j++) {
							if (callback = waitCallbacks[j]) {
								waitCallbacks[j] = null;
								callback();
							}
						}
					}
				}
			};

		return {

			require: function (uri) {
				var key = _storagePrefix + uri,
					scriptIndex = scripts.length,
					_waitCount = waitCount,
					source = localStorage.getItem(key);

				scripts[scriptIndex] = null;

				if (source) {
					scripts[scriptIndex] = source;
					queueExec(_waitCount);
				} else {
					getUrl(uri, function (text) {
						localStorage.setItem(key, text);
						scripts[scriptIndex] = text;
						queueExec(_waitCount);
					});
				}
				return this;
			},

			add: function(uri, overwrite, callback){
				var key = _storagePrefix + uri;

				// default is to overwrite
				if(overwrite === undefined){
					overwrite = true;
				}

			   // if they key exists and overwrite true, overwrite
			   if(!!localStorage.getItem(key)){
					if(!!overwrite){
						saveUrl(uri, key, callback);
					}
			   }else{
					//key doesnt exist, add key as new entry
					saveUrl(uri, key, callback);
			   }
			   return this;
			},

			remove: function(uri){
				var key = _storagePrefix + uri;
				localStorage.removeItem(key);
				return this;
			},

			wait: function (callback) {
				waitCount = scripts.length;
				if (callback) {
					(scriptsExecuted >= waitCount - 1) ? callback() : waitCallbacks[waitCount - 1] = callback;
				}

				return this;
			}
		};

	}


	window["basket"] = basketLoader();

})(this, document);