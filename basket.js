/* Basket.js 0.1
 * A script-loader that handles caching scripts in localStorage
 * where supported.
 * http://addyosmani.com/
 * Credits: Addy Osmani, Mathias Bynens, Ironsjp.
 * Copyright (c) 2012 Addy Osmani;
 * Licensed MIT, GPL
 */
 ;(function (w, d) {

    function basketLoader() {

        var
        _storagePrefix = "basket-",
            scripts = [],
            scriptsExecuted = 0,
            waitCount = 0,
            waitCallbacks = [],

            // Minimalist Cross-browser XHR
            // from https://gist.github.com/991713
            getXMLObj = function (s, a) {
                a = [a = "Msxml2.XMLHTTP", a + ".3.0", a + ".6.0"];
                do
                try {
                    s = a.pop();
                    return new(s ? ActiveXObject : XMLHttpRequest)(s)
                } catch (e) {;

                }
                while (s)
            },

            getUrl = function (url, callback) {
                var xhr = getXMLObj();
                xhr.open("GET", url, true);
                xhr.onreadystatechange = function (e) {
                    if (xhr.readyState === 4) {
                        callback(xhr.responseText);
                    }
                };
                xhr.send();
            },

            saveUrl= function(url, key){
                getUrl(url, function (text) {
                   localStorage.setItem(key, text);
                });
            },

            injectScript = function (text) {
                var script = d.createElement("script"),
                    fragment = d.createDocumentFragment(),
                    head = d.head || d.getElementsByTagName("head")[0];
                script.defer = true;
                script.appendChild(d.createTextNode(text));
                fragment.appendChild(script);
                head.appendChild(fragment);
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
               if(!!localStorage.getItem(key)){
                   if(!!overwrite){
                    saveUrl(uri, key);
                   }
               }else{
                    saveUrl(uri, key);
               }
               if(callback){
                   callback();
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


    w['basket'] = basketLoader();

})(this, document);