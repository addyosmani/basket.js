[![basket.js logo](media/logo_src.png)](http://addyosmani.github.com/basket.js)

> [Basket.js](http://addyosmani.github.com/basket.js) is a script and resource loader for caching and loading scripts using localStorage

[![Build Status](https://travis-ci.org/addyosmani/basket.js.svg?branch=gh-pages)](https://travis-ci.org/addyosmani/basket.js)


## Resources

### Examples

* [Load RequireJS modules with Basket.js](https://github.com/andrewwakeling/requirejs-basketjs/blob/master/basket-loader.js)
* [Loading CSS with Basket.js](https://github.com/andrewwakeling/basket-css-example)

### Articles

* [Basket.js: A JavaScript Loader With LocalStorage-based script caching](http://badassjs.com/post/40850339601/basket-js-a-javascript-loader-with-localstorage-based)
* [basket.js caches scripts with HTML5 localStorage](http://ahmadassaf.com/blog/web-development/scripts-plugins/basket-js-caches-scripts-with-html5-localstorage/)
* [Basket.js for improved script caching](http://t3n.de/news/basketjs-performance-localstorage-515119/)


## Contribute

### Style Guide

This project follows the [Idiomatic](https://github.com/rwldrn/idiomatic.js) guide to writing JavaScript - a concise extension to the jQuery Core Style [guidelines](http://docs.jquery.com/JQuery_Core_Style_Guidelines), with the exception of multiple var statements. Please ensure any pull requests follow these closely.


### Unit Tests

We are also attempting to get as much unit test coverage as possible. For this reason, please add unit tests for any new or changed functionality and remember to lint and test your code using [grunt](http://gruntjs.com).

*Also, please don't edit files in the "dist" subdirectory as they are generated via grunt. You'll find source code in the "lib" subdirectory!*

### Building

To build the project, you will first need to install the necessary dependencies (such as [RSVP](https://github.com/tildeio/rsvp.js)) using [npm](http://npmjs.org) and [Bower](http://bower.io).

Run:

```sh
$ npm install & bower install
```

in the project root to get everything you need. Next, to actually build the project you will need [Grunt](http://gruntjs.com).

Run:

```sh
$ grunt release
```

to generate a new release, otherwise just running `grunt test` will run the unit tests.


## Team

| ![Addy Osmani avatar](http://www.gravatar.com/avatar/96270e4c3e5e9806cf7245475c00b275.png?s=60) | ![Sindre Sorhus avatar](http://www.gravatar.com/avatar/d36a92237c75c5337c17b60d90686bf9.png?s=60) | ![Andrée Hansson avatar](http://www.gravatar.com/avatar/9a22324229aebc599d46dacab494ce77.png?s=60) | ![Mat Scales avatar](http://www.gravatar.com/avatar/c2b874c38990ed90a0ed15ac33bda00f.png?s=60) |
|---|---|---|---|
| [Addy Osmani](https://github.com/addyosmani) | [Sindre Sorhus](https://github.com/sindresorhus) | [Andrée Hansson](https://github.com/peol) | [Mat Scales](https://github.com/wibblymat) |


## License

MIT © Basket.js team
