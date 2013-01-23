### Project History

This project was created as a response to a [tweet](https://twitter.com/#!/souders/statuses/166928191649357824) by Steve Souders asking that the jQuery project consider caching jQuery in localStorage for performance reasons. Intrigued by the idea, we began exploring a minimalistic solution to it (just for the sake of experimentation).

You may remember Souders previously did research and a [write-up](http://www.stevesouders.com/blog/2011/03/28/storager-case-study-bing-google/) on search engines making use of localStorage caching back in 2011. His conclusions were:

**Bing and Google Search make extensive use of localStorage for stashing SCRIPT blocks that are used on subsequent page views. None of the other top sites from my previous post use localStorage in this way. Are Bing and Google Search onto something? Yes, definitely.**

To help provide a more general solution for this problem, we put together a script loader that treats localStorage as a cache.
