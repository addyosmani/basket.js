### Why localStorage?

[Tests](http://www.stevesouders.com/blog/2011/03/28/storager-case-study-bing-google/) by Google and Bing have shown that there are performance benefits to caching assets in localStorage (especially on mobile) when compared to simply reading and writing from the standard browser cache. This project is currently working on replicating these tests in the public so that we have definitive statistics on whether this is true.

Developers have also been wondering why we opted for localStorage as opposed to alternatives such as IndexedDB. Jens Arps has shown that IDB is at present [significantly slower](http://jsperf.com/indexeddb-vs-localstorage/2) than localStorage for reading and writing assets. Other developers exploring this space have also shown that localStorage works just fine for caching data (it's actually significantly [faster](http://www.webdirections.org/blog/localstorage-perhaps-not-so-harmful/) in Safari at the moment than any other browser).

We believe that in time, once implementers have optimized localStorage, it will become more feasible to use cross-browser. In the mean time, we are also exploring solutions such as the [FileSystem API](http://www.html5rocks.com/en/tutorials/file/filesystem/) as a storage mechanism for caching scripts locally.
