## now

> 获得 Unix 纪元(1970 1月1日 00:00:00 UTC) 直到现在的毫秒数。

```js
_.now()
```

```js
/**
  * Gets the timestamp of the number of milliseconds that have elapsed since
  * the Unix epoch (1 January 1970 00:00:00 UTC).
  *
  * @static
  * @memberOf _
  * @since 2.4.0
  * @category Date
  * @returns {number} Returns the timestamp.
  * @example
  *
  * _.defer(function(stamp) {
  *   console.log(_.now() - stamp);
  * }, _.now());
  * // => Logs the number of milliseconds it took for the deferred invocation.
  */
   
  /** Detect free variable `global` from Node.js. */
  var freeGlobal = typeof global == 'object' && global && global.Object === Object && global;

  /** Detect free variable `self`. */
  var freeSelf = typeof self == 'object' && self && self.Object === Object && self;

  /** Used as a reference to the global object. */
  var root = freeGlobal || freeSelf || Function('return this')();

  var ctxNow = Date && Date.now !== root.Date.now && Date.now;
  var now = ctxNow || function () {
    return root.Date.now();
  };
```

`now` 函数了多平台的兼容，申明 `freeGlobal` 变量，对 `global` 进行类型判断，返回 `Boolean`，
申明 `freeSelf` 变量，判断 `self` 的类型：

```js
// ts
declare var self: Window;
```

`self` 类型就是 `Window` 对象，`freeSelf` 变量也返回 `Boolean`。

申明 `root` 变量，进行了穿透赋值，`global` 为真说明是 `Node` 环境，`Window` 为真说明是 `JavsScript` 环境，两者都为 `false`，会赋值成一个返回 `this` 的 `Function`，作为全局对象的引用。

申明 `now` 变量，如果有 `ctxNow`，说明当前环境已经有 `Date.now` 函数了，直接复制给 `now`，
否则就是穿透赋值，赋值为一个返回 `root.Date.now()` 的函数。


