### About localStorage

[localStorage](http://diveintohtml5.info/storage.html) is a simple API within modern browsers to allow web developers to store small amounts of data within the user's browser.

The HTML5 spec suggests storage quota with a limit of 5MB for localStorage but browsers can implement their own quota if they wish. If the quota is exceeded the browser may fail to store items in the cache. If this happens, basket.js will remove entries from the cache beginning with the oldest and try again. Some browsers like Opera will ask the user about increasing the quota when it exceeds a set threshold.

To free space basket.js will only remove cached scripts that it placed in localStorage itself. The data stored by other code in same origin will not be touched.
