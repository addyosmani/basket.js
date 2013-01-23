---
layout: default
---

### Introduction

basket.js is a small JavaScript library supporting localStorage caching of scripts. If script(s) have previously been saved locally, they will simply be loaded and injected into the current document. If not, they will be XHR'd in for use right away, but cached so that no additional loads are required in the future.

### Why localStorage?

[Tests](http://www.stevesouders.com/blog/2011/03/28/storager-case-study-bing-google/) by Google and Bing have shown that there are performance benefits to caching assets in localStorage (especially on mobile) when compared to simply reading and writing from the standard browser cache. This project is currently working on replicating these tests in the public so that we have definitive statistics on whether this is true.

Developers have also been wondering why we opted for localStorage as opposed to alternatives such as IndexedDB. Jens Arps has shown that IDB is at present [significantly slower](http://jsperf.com/indexeddb-vs-localstorage/2) than localStorage for reading and writing assets. Other developers exploring this space have also shown that localStorage works just fine for caching data (it's actually significantly [faster](http://www.webdirections.org/blog/localstorage-perhaps-not-so-harmful/) in Safari at the moment than any other browser).

We believe that in time, once implementers have optimized localStorage, it will become more feasible to use cross-browser. In the mean time, we are also exploring solutions such as the [FileSystem API](http://www.html5rocks.com/en/tutorials/file/filesystem/) as a storage mechanism for caching scripts locally.

### Project History

This project was created as a response to a [tweet](https://twitter.com/#!/souders/statuses/166928191649357824) by Steve Souders asking that the jQuery project consider caching jQuery in localStorage for performance reasons. Intrigued by the idea, we began exploring a minimalistic solution to it (just for the sake of experimentation).

You may remember Souders previously did research and a [write-up](http://www.stevesouders.com/blog/2011/03/28/storager-case-study-bing-google/) on search engines making use of localStorage caching back in 2011. His conclusions were:

**Bing and Google Search make extensive use of localStorage for stashing SCRIPT blocks that are used on subsequent page views. None of the other top sites from my previous post use localStorage in this way. Are Bing and Google Search onto something? Yes, definitely.**

To help provide a more general solution for this problem, we put together a script loader that treats localStorage as a cache.

### Compatibility

basket.js supports locally caching scripts in any browser with [localStorage capabilities](http://caniuse.com/#search=localstorage).

### About localStorage

[localStorage](http://diveintohtml5.info/storage.html) is a simple API within modern browsers to allow web developers to store small amounts of data within the user's browser.

The HTML5 spec suggests storage quota with a limit of 5MB for localStorage but browsers can implement their own quota if they wish. If the quota is exceeded the browser may fail to store items in the cache. If this happens, basket.js will remove entries from the cache beginning with the oldest and try again. Some browsers like Opera will ask the user about increasing the quota when it exceeds a set threshold.

To free space basket.js will only remove cached scripts that it placed in localStorage itself. The data stored by other code in same origin will not be touched.

{% include api.md %}

### The Future

We are currently investigating a number of different features we would like to bring to the project, as well as looking to produce some high-quality [performance benchmarks](https://github.com/addyosmani/basket.js/issues/24) (compared to IndexedDB, Browser cache and more). To find out more, check out [what we're working on](https://github.com/addyosmani/basket.js/issues).

### Team, License &amp; Contribution Guide

basket.js is released under an [MIT License](http://en.wikipedia.org/wiki/MIT_License) and is currently maintained by [Addy Osmani](https://github.com/addyosmani), [Sindre Sorhus](https://github.com/sindresorhus), [Mat Scales](https://github.com/wibblymat) and [Andrée Hansson](https://github.com/peol). We would also like to extend our thanks to [Rick Waldron](https://github.com/rwldrn) for the optimizations he suggested for improving the project.

For more information on our style-guide and how to get involved with basket.js, please see the README in our project [repo](http://github.com/addyosmani/basket.js).
