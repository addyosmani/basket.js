import { Promise } from 'rsvp';

const storagePrefix = 'basket-';
const defaultExpiration = 5000;
const inBasket = [];
const handlers = {
  'default': injectScript
};

const head = document.head || document.getElementsByTagName('head')[0];

const addLocalStorage = (key, storeObj) => {
  try {
    localStorage.setItem(storagePrefix + key, JSON.stringify(storeObj));
    return true;
  } catch (e) {
    if (e.name.toUpperCase().indexOf('QUOTA') >= 0) {
      const tempScripts = Object.entries(localStorage)
        .filter(([item]) => item.startsWith(storagePrefix))
        .map(([, value]) => JSON.parse(value))
        .sort((a, b) => a.stamp - b.stamp);

      if (tempScripts.length) {
        basket.remove(tempScripts[0].key);
        return addLocalStorage(key, storeObj);
      }
      
      // no files to remove. Larger than available quota
      return;
    }
    // some other error
    return;
  }
};

const getUrl = (url) => {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open('GET', url);

    xhr.onreadystatechange = () => {
      if (xhr.readyState === 4) {
        if ((xhr.status === 200) || ((xhr.status === 0) && xhr.responseText)) {
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
    setTimeout(() => {
      if (xhr.readyState < 4) {
        xhr.abort();
      }
    }, basket.timeout);

    xhr.send();
  });
};

const wrapStoreData = (obj, data) => {
  const now = Date.now();
  return {
    ...obj,
    data: data.content,
    originalType: data.type,
    type: obj.type || data.type,
    skipCache: obj.skipCache || false,
    stamp: now,
    expire: now + ((obj.expire || defaultExpiration) * 60 * 60 * 1000)
  };
};

const saveUrl = (obj) => {
  return getUrl(obj.url).then((result) => {
    const storeObj = wrapStoreData(obj, result);

    if (!obj.skipCache) {
      addLocalStorage(obj.key, storeObj);
    }

    return storeObj;
  });
};

const isCacheValid = (source, obj) => {
  return !source ||
    source.expire - Date.now() < 0 ||
    obj.unique !== source.unique ||
    (basket.isValidItem && !basket.isValidItem(source, obj));
};

const handleStackObject = (obj) => {
  if (!obj.url) return;

  obj.key = (obj.key || obj.url);
  const source = basket.get(obj.key);
  obj.execute = obj.execute !== false;

  const shouldFetch = isCacheValid(source, obj);

  if (obj.live || shouldFetch) {
    if (obj.unique) {
      // set parameter to prevent browser cache
      obj.url += ((obj.url.includes('?') ? '&' : '?') + 'basket-unique=' + obj.unique);
    }
    let promise = saveUrl(obj);

    if (obj.live && !shouldFetch) {
      promise = promise.then(
        (result) => result,
        () => source
      );
    }
    return promise;
  }

  source.type = obj.type || source.originalType;
  source.execute = obj.execute;
  return Promise.resolve(source);
};

function injectScript(obj) {
  const script = document.createElement('script');
  script.defer = true;
  // Have to use .text, since we support IE8,
  // which won't allow appending to a script
  script.text = obj.data;
  head.appendChild(script);
}

const performActions = (resources) => {
  return resources.map((obj) => {
    if (obj.execute) {
      execute(obj);
    }
    return obj;
  });
};

const execute = (obj) => {
  if (obj.type && handlers[obj.type]) {
    return handlers[obj.type](obj);
  }
  return handlers['default'](obj);
};

const fetch = (...args) => {
  const promises = args.map(handleStackObject);
  return Promise.all(promises);
};

function thenRequire(...args) {
  const resources = fetch.apply(null, args);
  const promise = this.then(() => resources).then(performActions);
  promise.thenRequire = thenRequire;
  return promise;
}

const basket = {
  require(...args) {
    for (const arg of args) {
      arg.execute = arg.execute !== false;

      if (arg.once && inBasket.includes(arg.url)) {
        arg.execute = false;
      } else if (arg.execute !== false && !inBasket.includes(arg.url)) {
        inBasket.push(arg.url);
      }
    }

    const promise = fetch.apply(null, args).then(performActions);
    promise.thenRequire = thenRequire;
    return promise;
  },

  remove(key) {
    localStorage.removeItem(storagePrefix + key);
    return this;
  },

  get(key) {
    const item = localStorage.getItem(storagePrefix + key);
    try {
      return JSON.parse(item || 'false');
    } catch (e) {
      return false;
    }
  },

  clear(expired) {
    const now = Date.now();
    
    // Convert to Array to avoid modification during iteration
    const items = Object.keys(localStorage).filter(item => item.startsWith(storagePrefix));
    
    for (const item of items) {
      const key = item.slice(storagePrefix.length);
      const stored = this.get(key);
      
      if (stored && (!expired || stored.expire <= now)) {
        this.remove(key);
      }
    }

    return this;
  },

  isValidItem: null,

  timeout: 5000,

  addHandler(types, handler) {
    if (!Array.isArray(types)) {
      types = [types];
    }
    types.forEach(type => {
      handlers[type] = handler;
    });
  },

  removeHandler(types) {
    this.addHandler(types, undefined);
  }
};

// delete expired keys
basket.clear(true);

export default basket;
