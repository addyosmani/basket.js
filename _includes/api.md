## API

### Summary of changes since version 0.2

**basket.require() now returns a Promise**. Calls to `require()` are no longer chainable but you get better flexibilty in handling dependancies and errors in return.

**The basket.wait() method has been removed**. The promise returned by `require()` fulfills the same purpose in a more standard way.

**The basket.add() method has been removed**. Manually adding items to the cache is no longer supported.

**basket.clear() has been added**.

See the updated documentation below for more details.

* [`basket.require()`](#basketrequire)
* [`basket.get()`](#basketget)
* [`basket.remove()`](#basketremove)
* [`basket.clear()`](#basketclear)
