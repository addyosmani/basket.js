![basket.js logo](https://raw.github.com/addyosmani/basket.js/gh-pages/asset/logo.png)

[Basket.js](http://addyosmani.github.com/basket.js) is a script and resource loader for caching and loading scripts using localStorage

[![Build Status](https://secure.travis-ci.org/addyosmani/basket.js.png?branch=gh-pages)](http://travis-ci.org/addyosmani/basket.js)

## Contribute

### Style Guide

This project follows the [Idiomatic](https://github.com/rwldrn/idiomatic.js) guide to writing JavaScript - a concise extension to the jQuery Core Style [guidelines](http://docs.jquery.com/JQuery_Core_Style_Guidelines), with the exception of multiple var statements. Please ensure any pull requests follow these closely.


### Unit Tests

We are also attempting to get as much unit test coverage as possible. For this reason, please add unit tests for any new or changed functionality and remember to lint and test your code using [grunt](https://github.com/cowboy/grunt).

*Also, please don't edit files in the "dist" subdirectory as they are generated via grunt. You'll find source code in the "lib" subdirectory!*

### Building

To build the project, you will first need to install the necessary dependencies (such as [RSVP](https://github.com/tildeio/rsvp.js)) using [npm](http://npmjs.org) and [Bower](http://bower.io). Run:

```
npm install && bower install
```

in the project root to get everything you need. Next, to actually build the project you will need [Grunt](http://gruntjs.com).Run

```
grunt release
```

to generate a new release, otherwise just running `grunt test` will run the unit tests.

### Community articles, extensions and examples

#### Examples
* [Load RequireJS modules with Basket.js](https://github.com/andrewwakeling/requirejs-basketjs/blob/master/basket-loader.js)
* [Loading CSS with Basket.js](https://github.com/andrewwakeling/basket-css-example)

#### Articles

* [Basket.js: A JavaScript Loader With LocalStorage-based script caching](http://badassjs.com/post/40850339601/basket-js-a-javascript-loader-with-localstorage-based)
* [basket.js caches scripts with HTML5 localStorage](http://ahmadassaf.com/blog/web-development/scripts-plugins/basket-js-caches-scripts-with-html5-localstorage/)
* [Basket.js for improved script caching](http://t3n.de/news/basketjs-performance-localstorage-515119/)

## Team

[ ![Addy Osmani avatar](http://www.gravatar.com/avatar/96270e4c3e5e9806cf7245475c00b275.png?s=60) Addy Osmani ](https://github.com/addyosmani) (lead)
[ ![Sindre Sorhus avatar](http://www.gravatar.com/avatar/d36a92237c75c5337c17b60d90686bf9.png?s=60) Sindre Sorhus ](https://github.com/sindresorhus)
[ ![Andrée Hansson avatar](http://www.gravatar.com/avatar/9a22324229aebc599d46dacab494ce77.png?s=60) Andrée Hansson ](https://github.com/peol)
[ ![Mat Scales avatar](http://www.gravatar.com/avatar/c2b874c38990ed90a0ed15ac33bda00f.png?s=60) Mat Scales ](https://github.com/wibblymat)


## License
(c) Addy Osmani, the basket.js project
[MIT License](http://en.wikipedia.org/wiki/MIT_License)
