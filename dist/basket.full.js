/*!
* basket.js
* v0.5.2 - 2016-05-05
* http://addyosmani.github.com/basket.js
* (c) Addy Osmani;  License
* Created by: Addy Osmani, Sindre Sorhus, Andrée Hansson, Mat Scales
* Contributors: Ironsjp, Mathias Bynens, Rick Waldron, Felipe Morais
* Uses rsvp.js, https://github.com/tildeio/rsvp.js
*/(function (root, factory) {
  if (typeof define === 'function' && define.amd) {
    // AMD. Register as an anonymous module unless amdModuleId is set
    define([], function () {
      return (root['libBasketjs'] = factory());
    });
  } else if (typeof exports === 'object') {
    // Node. Does not work with strict CommonJS, but
    // only CommonJS-like environments that support module.exports,
    // like Node.
    module.exports = factory();
  } else {
    root['basket'] = factory();
  }
}(this, function () {

var libRSVPwrapper, libBasketjs;
libRSVPwrapper = function () {
  var PROTOTYPE = 'prototype', FUNCTION = 'function', RESOLVED = 'resolved', REJECTED = 'rejected';
  function resolve() {
    var me = this;
    me.promise.result = me.promise.result || arguments[0];
    if (me.promise[RESOLVED] || me.promise[REJECTED]) {
      return;
    }
    me.promise[RESOLVED] = true;
    for (var i = 0; i < me.promise._s.length; i++) {
      me.promise._s[i].call(null, me.promise.result);
    }
    me.promise._s = [];
  }
  function reject() {
    var me = this;
    me.promise.error = me.promise.error || arguments[0];
    if (me.promise[RESOLVED] || me.promise[REJECTED]) {
      return;
    }
    me.promise[REJECTED] = true;
    for (var i = 0; i < me.promise._f.length; i++) {
      me.promise._f[i].call(null, me.promise.error);
    }
    me.promise._f = [];
  }
  function Defer(promise) {
    if (!(this instanceof Defer)) {
      return new Defer(promise);
    }
    var me = this;
    me.promise = promise && 'then' in promise ? promise : new Promise(me);
    me.resolve = function () {
      return resolve.apply(me, arguments);
    };
    me.reject = function () {
      return reject.apply(me, arguments);
    };
  }
  function Promise(arg) {
    this._s = [];
    this._f = [];
    this._defer = arg && arg instanceof Defer ? arg : new Defer(this);
    this.result = null;
    this.error = null;
    if (typeof arg === FUNCTION) {
      try {
        arg.call(this, this._defer.resolve, this._defer.reject);
      } catch (ex) {
        this._defer.reject(ex);
      }
    }
  }
  function createResultHandlerWrapper(handler, defer) {
    var me = this;
    return function () {
      var res = handler.apply(me, arguments);
      if (res && typeof res.then === FUNCTION) {
        res.then(function () {
          defer.resolve.apply(defer, arguments);
        }, function () {
          defer.reject.apply(defer, arguments);
        });
      } else {
        defer.resolve.apply(defer, res == null ? [] : [res]);
      }
    };
  }
  Promise[PROTOTYPE].then = function (onSuccess, onFailure) {
    var defer = new Defer();
    var me = this;
    var handleSuccess, handleFail;
    if (typeof onSuccess == FUNCTION) {
      handleSuccess = createResultHandlerWrapper.call(me, onSuccess, defer);
    } else {
      handleSuccess = defer.resolve;
    }
    if (me[RESOLVED]) {
      handleSuccess.call(null, me.result);
    } else {
      me._s.push(handleSuccess);
    }
    if (typeof onFailure == FUNCTION) {
      handleFail = createResultHandlerWrapper.call(me, onFailure, defer);
    } else {
      handleFail = defer.reject;
    }
    if (me[REJECTED]) {
      handleFail.call(null, me.error);
    } else {
      me._f.push(handleFail);
    }
    return defer.promise;
  };
  Defer.Promise = Promise;
  Defer.resolve = function (v) {
    var result = new Defer();
    result.resolve(v);
    return result.promise;
  };
  Defer.reject = function (v) {
    var result = new Defer();
    result.reject(v);
    return result.promise;
  };
  function getResultChecker(results, index, resolve, length, count) {
    return function check(result) {
      results[index] = result;
      count.value++;
      if (length.value === count.value) {
        resolve(results);
      }
    };
  }
  Defer.all = function (promises) {
    return new Promise(function (rs, rj) {
      var length = { value: promises.length };
      var count = { value: 0 };
      var results = [];
      for (var l = promises.length; l--;) {
        if (!('then' in promises[l])) {
          results[l] = promises[l];
          length.value--;
        } else {
          promises[l].then(getResultChecker(results, l, rs, length, count), rj);
        }
      }
      if (length.value <= 0 || length.value === count.value) {
        rs(results);
        return;
      }
    });
  };
  return Defer;
}();
libBasketjs = function (RSVP) {
  var Fn = Function, window = new Fn('return this')();
  var document = window.document;
  var head = document.head || document.getElementsByTagName('head')[0];
  var storagePrefix = 'basket-';
  var defaultExpiration = 5000;
  var inBasket = [];
  var basket;
  var addLocalStorage = function (key, storeObj) {
    try {
      localStorage.setItem(storagePrefix + key, JSON.stringify(storeObj));
      return true;
    } catch (e) {
      if (e.name.toUpperCase().indexOf('QUOTA') >= 0) {
        var item;
        var tempScripts = [];
        for (item in localStorage) {
          if (item.indexOf(storagePrefix) === 0) {
            tempScripts.push(JSON.parse(localStorage[item]));
          }
        }
        if (tempScripts.length) {
          tempScripts.sort(function (a, b) {
            return a.stamp - b.stamp;
          });
          basket.remove(tempScripts[0].key);
          return addLocalStorage(key, storeObj);
        } else {
          // no files to remove. Larger than available quota
          return;
        }
      } else {
        // some other error
        return;
      }
    }
  };
  var getUrl = function (url) {
    var promise = new RSVP.Promise(function (resolve, reject) {
      var xhr = new XMLHttpRequest();
      xhr.open('GET', url);
      xhr.onreadystatechange = function () {
        if (xhr.readyState === 4) {
          if (xhr.status === 200 || xhr.status === 0 && xhr.responseText) {
            resolve({
              content: xhr.responseText,
              type: xhr.getResponseHeader('content-type')
            });
          } else {
            reject(new Error(xhr.statusText));
          }
        }
      };
      // By default XHRs never timeout, and even Chrome doesn't implement the
      // spec for xhr.timeout. So we do it ourselves.
      setTimeout(function () {
        if (xhr.readyState < 4) {
          xhr.abort();
        }
      }, basket.timeout);
      xhr.send();
    });
    return promise;
  };
  var wrapStoreData = function (obj, data) {
    var now = +new Date();
    obj.data = data.content;
    obj.originalType = data.type;
    obj.type = obj.type || data.type;
    obj.skipCache = obj.skipCache || false;
    obj.stamp = now;
    obj.expire = now + (obj.expire || defaultExpiration) * 60 * 60 * 1000;
    return obj;
  };
  var saveUrl = function (obj) {
    return getUrl(obj.url).then(function (result) {
      var storeObj = wrapStoreData(obj, result);
      if (!obj.skipCache) {
        addLocalStorage(obj.key, storeObj);
      }
      return storeObj;
    });
  };
  var isCacheValid = function (source, obj) {
    return !source || source.expire - +new Date() < 0 || obj.unique !== source.unique || basket.isValidItem && !basket.isValidItem(source, obj);
  };
  var handleStackObject = function (obj) {
    var source, promise, shouldFetch;
    if (!obj.url) {
      return;
    }
    obj.key = obj.key || obj.url;
    source = basket.get(obj.key);
    obj.execute = obj.execute !== false;
    shouldFetch = isCacheValid(source, obj);
    if (obj.live || shouldFetch) {
      if (obj.unique) {
        // set parameter to prevent browser cache
        obj.url += (obj.url.indexOf('?') > 0 ? '&' : '?') + 'basket-unique=' + obj.unique;
      }
      promise = saveUrl(obj);
      if (obj.live && !shouldFetch) {
        promise = promise.then(function (result) {
          // If we succeed, just return the value
          // RSVP doesn't have a .fail convenience method
          return result;
        }, function () {
          return source;
        });
      }
    } else {
      source.type = obj.type || source.originalType;
      source.execute = obj.execute;
      promise = new RSVP.resolve(source);
    }
    return promise;
  };
  var injectScript = function (obj) {
    var script = document.createElement('script');
    script.defer = true;
    // Have to use .text, since we support IE8,
    // which won't allow appending to a script
    script.text = obj.data;
    head.appendChild(script);
  };
  var handlers = { 'default': injectScript };
  var execute = function (obj) {
    if (obj.type && handlers[obj.type]) {
      return handlers[obj.type](obj);
    }
    return handlers['default'](obj);  // 'default' is a reserved word
  };
  var performActions = function (resources) {
    var obj;
    for (var i = 0; i < resources.length; i++) {
      obj = resources[i];
      if (obj.execute) {
        execute(obj);
      }
    }
    return RSVP.resolve(resources);
  };
  var fetch = function () {
    var i, l, promises = [];
    for (i = 0, l = arguments.length; i < l; i++) {
      promises.push(handleStackObject(arguments[i]));
    }
    return RSVP.all(promises);
  };
  var thenRequire = function () {
    var resources = fetch.apply(null, arguments);
    var promise = this.then(function () {
      return resources;
    }).then(performActions);
    promise.thenRequire = thenRequire;
    return promise;
  };
  basket = {
    require: function () {
      for (var a = 0, l = arguments.length; a < l; a++) {
        arguments[a].execute = arguments[a].execute !== false;
        if (arguments[a].once && inBasket.indexOf(arguments[a].url) >= 0) {
          arguments[a].execute = false;
        } else if (arguments[a].execute !== false && inBasket.indexOf(arguments[a].url) < 0) {
          inBasket.push(arguments[a].url);
        }
      }
      var promise = fetch.apply(null, arguments).then(performActions);
      promise.thenRequire = thenRequire;
      return promise;
    },
    remove: function (key) {
      localStorage.removeItem(storagePrefix + key);
      return this;
    },
    get: function (key) {
      var item = localStorage.getItem(storagePrefix + key);
      try {
        return JSON.parse(item || 'false');
      } catch (e) {
        return false;
      }
    },
    clear: function (expired) {
      var item, key;
      var now = +new Date();
      for (item in localStorage) {
        key = item.split(storagePrefix)[1];
        if (key && (!expired || this.get(key).expire <= now)) {
          this.remove(key);
        }
      }
      return this;
    },
    isValidItem: null,
    timeout: 5000,
    addHandler: function (types, handler) {
      if (!Array.isArray(types)) {
        types = [types];
      }
      types.forEach(function (type) {
        handlers[type] = handler;
      });
    },
    removeHandler: function (types) {
      basket.addHandler(types, undefined);
    }
  };
  // delete expired keys
  basket.clear(true);
  return basket;
}(libRSVPwrapper);
return libBasketjs;

}));
