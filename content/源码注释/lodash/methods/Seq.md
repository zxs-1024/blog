## _

```js
; (function () {
  ...
  var runInContext = (function runInContext(context) {
    ...
  })

  /*--------------------------------------------------------------------------*/

  // Export lodash.
  var _ = runInContext();

  // Some AMD build optimizers, like r.js, check for condition patterns like:
  if (typeof define == 'function' && typeof define.amd == 'object' && define.amd) {
    // Expose Lodash on the global object to prevent errors when Lodash is
    // loaded by a script tag in the presence of an AMD loader.
    // See http://requirejs.org/docs/errors.html#mismatch for more details.
    // Use `_.noConflict` to remove Lodash from the global object.
    root._ = _;

    // Define as an anonymous module so, through path mapping, it can be
    // referenced as the "underscore" module.
    define(function () {
      return _;
    });
  }
  // Check for `exports` after `define` in case a build optimizer adds it.
  else if (freeModule) {
    // Export for Node.js.
    (freeModule.exports = _)._ = _;
    // Export for CommonJS support.
    freeExports._ = _;
  }
  else {
    // Export to the global object.
    root._ = _;
  }
}.call(this));
```

`lodash.js` 是一个自执行函数，函数内大致分为 3 个部分。

* 10 ~ 1373 初始变量、base 函数、 util 函数的申明
* 1377 ~ 17070 runInContext 函数
* 17070 ~ 17101 export 部分

`_` 变量是调用 `runInContext` 返回的 `lodash` 函数。

### AMD 的兼容

```js
// Some AMD build optimizers, like r.js, check for condition patterns like:
if (typeof define == 'function' && typeof define.amd == 'object' && define.amd) {
  // Expose Lodash on the global object to prevent errors when Lodash is
  // loaded by a script tag in the presence of an AMD loader.
  // See http://requirejs.org/docs/errors.html#mismatch for more details.
  // Use `_.noConflict` to remove Lodash from the global object.
  root._ = _;

  // Define as an anonymous module so, through path mapping, it can be
  // referenced as the "underscore" module.
  define(function () {
    return _;
  });
}
```

`AMD` 规范中，`define` 函数有一个公有属性 `define.amd`，用来说明当前的模块加载器是 `AMD` 协议。

这里判断 `define` 是 `function`、 `define.amd` 是 `object`，并且为真，排除 `null` 类型，进入判断后会将 `define.amd` 赋值给 `root._`，并且调用 `define` 函数定义匿名模块。

### Node 的兼容

```js
/** Detect free variable `exports`. */
  var freeExports = typeof exports == 'object' && exports && !exports.nodeType && exports;

/** Detect free variable `module`. */
var freeModule = freeExports && typeof module == 'object' && module && !module.nodeType && module;

// Check for `exports` after `define` in case a build optimizer adds it.
else if (freeModule) {
  // Export for Node.js.
  (freeModule.exports = _)._ = _;
  // Export for CommonJS support.
  freeExports._ = _;
}
```

`Node` 采用 `CommonJS` 模块规范。

`freeExports` 变量判断 `exports` 是 `object`、`exports` 为真、`!exports.nodeType` 证明 `exports` 不是 `html dom` 元素

### 原生模块的兼容

```js
else {
  // Export to the global object.
  root._ = _;
}
```

导出到全局对象。


## chain

> 创建一个经 lodash 包装的对象以启用显式链模式，要解除链必须使用 _#value 方法。

```js
/**
  * Creates a `lodash` wrapper instance that wraps `value` with explicit method
  * chain sequences enabled. The result of such sequences must be unwrapped
  * with `_#value`.
  *
  * @static
  * @memberOf _
  * @since 1.3.0
  * @category Seq
  * @param {*} value The value to wrap.
  * @returns {Object} Returns the new `lodash` wrapper instance.
  * @example
  *
  * var users = [
  *   { 'user': 'barney',  'age': 36 },
  *   { 'user': 'fred',    'age': 40 },
  *   { 'user': 'pebbles', 'age': 1 }
  * ];
  *
  * var youngest = _
  *   .chain(users)
  *   .sortBy('age')
  *   .map(function(o) {
  *     return o.user + ' is ' + o.age;
  *   })
  *   .head()
  *   .value();
  * // => 'pebbles is 1'
  */
function chain(value) {
  var result = lodash(value);
  result.__chain__ = true;
  return result;
}
```

### 栗子 🌰 

```js
var users = [
  { 'user': 'barney',  'age': 36 },
  { 'user': 'fred',    'age': 40 },
  { 'user': 'pebbles', 'age': 1 }
];
 
var youngest = _
  .chain(users)
  .sortBy('age')
  .map(function(o) {
    return o.user + ' is ' + o.age;
  })
  .head()
  .value();
// => 'pebbles is 1'
```

在栗子 🌰 中，我们调用 `chain` 函数并传了 `users` 对象。

```js
function chain(value) {
  var result = lodash(value);
  result.__chain__ = true;
  return result;
}
```

函数首先会调用 `lodash` 函数，并且将 `value`，也就是 `users` 对象传入，将返回的值保存在 `result` 变量中，
接着设置 `__chain__` 属性为 `true`，最后返回 `result`。

调用 `chain` 函数后可以连缀调用 `sortBy` 方法，`lodash` 内部是如何实现将 `sortBy` 方法添加到 `result` 上的呢？ 又是如何实现函数的连缀调用呢？

我们来看看 `lodash` 函数：

```js
function lodash(value) {
  if (isObjectLike(value) && !isArray(value) && !(value instanceof LazyWrapper)) {
    if (value instanceof LodashWrapper) {
      return value;
    }
    if (hasOwnProperty.call(value, '__wrapped__')) {
      return wrapperClone(value);
    }
  }
  return new LodashWrapper(value);
}
```

`lodash` 函数接收 `value`，也就是 `users` 对象, 
在函数内部首先会进行一个 `if` 判断，3 个条件，`isObjectLike(value)` 是一个类对象、`!isArray(value) ` 不是一个数组、` !(value instanceof LazyWrapper)` 不是 `LazyWrapper` 构造函数的实例，如果都符合条件进入判断。

如果 `value` 是 `LodashWrapper` 构造函数的实例，直接返回 `value`。

判断如果 `value` 上有 `__wrapped__` 这个属性直接返回 `wrapperClone` 函数的调用返回，
不满足 3 个条件或者在上面的判断中没有 `return` 的情况下说明是第一次调用 `lodash` 进行包装，
此时的 `value` 还是一个单纯的对象，返回 `LodashWrapper` 构造函数的实例。

我们接着往下看 `LodashWrapper` 构造函数：

```js
function LodashWrapper(value, chainAll) {
  this.__wrapped__ = value;
  this.__actions__ = [];
  this.__chain__ = !!chainAll;
  this.__index__ = 0;
  this.__values__ = undefined;
}
```

`LodashWrapper` 构造函数是创建 `lodash` 包装器对象的基本构造函数，这里会给实例添加几个私有属性。

`value` 赋值给 `__wrapped__` 属性，在 `lodash` 函数中，如果有 `__wrapped__` 属性，会返回 `wrapperClone(value)`，
`__actions__` 赋值空数组，`lazy evaluation` 惰性计算 `methods` 储存数组，
`__chain__` 赋值为 `chainAll` 取非非，也就是转换成 `Boolean`，
`__index__` 赋值为 0，
`__values__` 赋值为 `undefined`。

在 `runInContext` 函数的末尾我们会将申明的各种方法挂载到 `lodash` 函数上：

```js
// 16515 ~ 16669
// Add methods that return wrapped values in chain sequences.
lodash.after = after;
lodash.ary = ary;
lodash.assign = assign;
lodash.assignIn = assignIn;
...
lodash.shuffle = shuffle;
lodash.slice = slice;
lodash.sortBy = sortBy;
lodash.sortedUniq = sortedUniq;
lodash.sortedUniqBy = sortedUniqBy;
...
// Add aliases.
lodash.entries = toPairs;
lodash.entriesIn = toPairsIn;
lodash.extend = assignIn;
lodash.extendWith = assignInWith;
```

挂载这些方法之后会调用 `mixin` 函数：

```js
// Add methods to `lodash.prototype`.
mixin(lodash, lodash);
```

`mixin` 函数会将 `methods` 挂载到 `lodash.prototype` 上，来看一下它的实现：

```js
function mixin(object, source, options) {
  var props = keys(source),
    methodNames = baseFunctions(source, props);

  if (options == null &&
    !(isObject(source) && (methodNames.length || !props.length))) {
    options = source;
    source = object;
    object = this;
    methodNames = baseFunctions(source, keys(source));
  }
  var chain = !(isObject(options) && 'chain' in options) || !!options.chain,
    isFunc = isFunction(object);

  arrayEach(methodNames, function (methodName) {
    var func = source[methodName];
    object[methodName] = func;
    if (isFunc) {
      object.prototype[methodName] = function () {
        var chainAll = this.__chain__;
        if (chain || chainAll) {
          var result = object(this.__wrapped__),
            actions = result.__actions__ = copyArray(this.__actions__);

          actions.push({ 'func': func, 'args': arguments, 'thisArg': object });
          result.__chain__ = chainAll;
          return result;
        }
        return func.apply(object, arrayPush([this.value()], arguments));
      };
    }
  });

  return object;
}
```

`mixin` 函数接收 3 个参数，`object` 目标对象、`source` 添加函数的对象、`options` 配置对象。

首先为申明变量 `props` 赋值为 `keys(source)` 函数调用后返回的 `source` 的 `key` 数组，
申明变量 `methodNames` 赋值为 `baseFunctions(source, props)` 函数调用后返回的 `source` 中属性是 `functions` 方法名。

```js
function baseFunctions(object, props) {
  return arrayFilter(props, function(key) {
    return isFunction(object[key]);
  });
}
```

简单的 `filter` 过滤实现，根据 `isFunction` 返回 `Boolean` 值。

```js
if (options == null &&
  !(isObject(source) && (methodNames.length || !props.length))) {
  options = source;
  source = object;
  object = this;
  methodNames = baseFunctions(source, keys(source));
}
```
接着会对 `options` 进行非空判断，进行一些参数处理，这里是对 `lodash` 函数暴露的 `mixin` 方法的参数处理。

```js
arrayEach(methodNames, function (methodName) {
  var func = source[methodName];
  object[methodName] = func;
    ...
  }
});
```

然后着会遍历 `methodNames` 数组，也就是 `source` 中可枚举属性为 `function` 的 `key` 数组，在遍历回调中会取出 `source[methodName]` 对应的 `function`，将其以相同的 `key` 添加到给 `object` 对象，也就是实现了方法属性的拷贝。

如果 `isFunc` 为真，进入 `if` 判断，在判断中我们会给 `object.prototype` 以 `methodName` 为方法名，添加方法。

在这个方法中，我们会判断 `chain` 和 `chainAll` 变量：

```js
var chain = !(isObject(options) && 'chain' in options) || !!options.chain,
```

`chain` 是一个布尔值，`options` 不是对象并且 `options` 实例或者原型没有 `chain` 属性或者 `options.chain` 为真。

```js
var chainAll = this.__chain__;
```

`chainAll` 代表 `this` 有 `__chain__` 属性，在第一次调用 `lodash` 函数后，我们会将 `__chain__` 赋值为 `true`。

`chain || chainAll` 代表需要返回链式调用 `result`，进入 `if` 判断后会进行以下操作：

```js
var result = object(this.__wrapped__),
  actions = result.__actions__ = copyArray(this.__actions__);

actions.push({ 'func': func, 'args': arguments, 'thisArg': object });
result.__chain__ = chainAll;
return result;
```

调用 `object` 并且传入 `this.__wrapped__`，`object` 就是传入的 `lodash` 函数，`this.__wrapped__` 就是 栗子中传入的 `users`。

调用 `copyArray` 函数将 `this.__actions__` 赋值给 `actions` 以及 `result.__actions__`，然后以 `func`、`args`、`thisArg` 拼装成一个对象插入 `actions` 数组，将 `result.__chain__` 赋值为 `chainAll`，最后将 `result` 返回，这个也就是调用 `chain` 函数的返回，其实也就是调用 `lodash` 函数返回的 `LodashWrapper` 构造函数实例。

如果不满足 `chain || chainAll`，返回非链式调用的函数：

```js
return func.apply(object, arrayPush([this.value()], arguments));
```

这里会调用 `apply` 函数将 `func` 绑定到 `object` 上， 并且调用 `arrayPush` 函数，将 `this.value` 与 `arguments` 组成数组传入。

第一次调用 `mixin` 函数后，又继续为 `lodash` 添加各种方法：

```js
// 16676 ~ 16830
// Add methods that return unwrapped values in chain sequences.
lodash.add = add;
lodash.attempt = attempt;
lodash.camelCase = camelCase;
...
// Add aliases.
lodash.each = forEach;
lodash.eachRight = forEachRight;
lodash.first = head;
```

接着会第二次调用 `mixin` 函数：

```js
mixin(lodash, (function () {
  var source = {};
  baseForOwn(lodash, function (func, methodName) {
    if (!hasOwnProperty.call(lodash.prototype, methodName)) {
      source[methodName] = func;
    }
  });
  return source;
}()), { 'chain': false });
```

调用 `mixin` 函数，将 `lodash`，一个立即执行函数，`{'chain': false}` 配置对象传入。

```js
(function () {
  var source = {};
  baseForOwn(lodash, function (func, methodName) {
    if (!hasOwnProperty.call(lodash.prototype, methodName)) {
      source[methodName] = func;
    }
  });
  return source;
}())
```

在立即执行函数中遍历 `lodash` ，如果 `lodash.prototype` 中没有 `methodName` 对应的 `key`，将 `func` 添加到 `source` 对象上，因为第一次调用 `mixin` 函数后，将之前挂载到 `lodash` 上的函数重置处理，往原型上添加相同 `key` 的方法，而后面添加的函数的 `key` 则没有，主要是区分链式和非链式调用的函数。

最后将 `source` 返回，所以这个立即执行函数会返回一个 `source` 对象，对象中拷贝了 `lodash` 的除了原型上所有属性，再次调用 `mixin` 函数对象 `lodash` 函数进行属性拷贝。

```js
return func.apply(object, arrayPush([this.value()], arguments));
```

此时就会返回不支持链式调用的函数。

## wrapperClone

```js
/**
  * Creates a clone of `wrapper`.
  *
  * @private
  * @param {Object} wrapper The wrapper to clone.
  * @returns {Object} Returns the cloned wrapper.
  */
function wrapperClone(wrapper) {
  if (wrapper instanceof LazyWrapper) {
    return wrapper.clone();
  }
  var result = new LodashWrapper(wrapper.__wrapped__, wrapper.__chain__);
  result.__actions__ = copyArray(wrapper.__actions__);
  result.__index__ = wrapper.__index__;
  result.__values__ = wrapper.__values__;
  return result;
}
```

在 `lodash` 函数中，满足 3 个条件，并且不是 `LodashWrapper` 实例的情况，会返回 `wrapperClone` 函数的返回对象。

那么在 `wrapperClone` 函数做了什么呢？

`wrapperClone` 函数首先会判断 `wrapper` 如果是 `LazyWrapper` 的实例，直接返回 `wrapper.clone()`，否则就调用 `LodashWrapper` 构造函数，并且传入 `wrapper.__wrapped__`、 ` wrapper.__chain__` 参数，产生一个 `result` 实例，随后为 `result` 添加属性 `__actions__` 为 `wrapper.__actions__` 的拷贝、`__index__`、`__values__` ，最后将 `result` 返回。

## LazyWrapper

```js
/**
  * Creates a lazy wrapper object which wraps `value` to enable lazy evaluation.
  *
  * @private
  * @constructor
  * @param {*} value The value to wrap.
  */
function LazyWrapper(value) {
  this.__wrapped__ = value;
  this.__actions__ = [];
  this.__dir__ = 1;
  this.__filtered__ = false;
  this.__iteratees__ = [];
  this.__takeCount__ = MAX_ARRAY_LENGTH;
  this.__views__ = [];
}
```

在 `LazyWrapper` 构造函数中我们为实例添加了 `__wrapped__` 属性为传入的 `value`，以及其他属性。

## tap

> 这个方法调用一个 interceptor 并返回 value。interceptor 传入一个参数：(value) 目的是 进入 链的中间以便执行操作。

```js
_.tap(value, interceptor)
```

```js
 /**
  * This method invokes `interceptor` and returns `value`. The interceptor
  * is invoked with one argument; (value). The purpose of this method is to
  * "tap into" a method chain sequence in order to modify intermediate results.
  *
  * @static
  * @memberOf _
  * @since 0.1.0
  * @category Seq
  * @param {*} value The value to provide to `interceptor`.
  * @param {Function} interceptor The function to invoke.
  * @returns {*} Returns `value`.
  * @example
  *
  * _([1, 2, 3])
  *  .tap(function(array) {
  *    // Mutate input array.
  *    array.pop();
  *  })
  *  .reverse()
  *  .value();
  * // => [2, 1]
  */
function tap(value, interceptor) {
  interceptor(value);
  return value;
}
```

`tap` 在函数内部调用传入 `interceptor` 函数，并将 `value` 作为参数传入，最后将 `value` 返回。

## thru

> 这个方法类似 _.tap， 除了它返回 interceptor 的返回结果

```js
_.thru(value, interceptor)
```

```js
/**
  * This method is like `_.tap` except that it returns the result of `interceptor`.
  * The purpose of this method is to "pass thru" values replacing intermediate
  * results in a method chain sequence.
  *
  * @static
  * @memberOf _
  * @since 3.0.0
  * @category Seq
  * @param {*} value The value to provide to `interceptor`.
  * @param {Function} interceptor The function to invoke.
  * @returns {*} Returns the result of `interceptor`.
  * @example
  *
  * _('  abc  ')
  *  .chain()
  *  .trim()
  *  .thru(function(value) {
  *    return [value];
  *  })
  *  .value();
  * // => ['abc']
  */
function thru(value, interceptor) {
  return interceptor(value);
}
```

`thru` 函数直接返回了调用 `interceptor` 函数的结果。

## prototype

> 将方法挂载到 lodash 的 prototype 对象上。

```js
// Add chain sequence methods to the `lodash` wrapper.
lodash.prototype.at = wrapperAt;
lodash.prototype.chain = wrapperChain;
lodash.prototype.commit = wrapperCommit;
lodash.prototype.next = wrapperNext;
lodash.prototype.plant = wrapperPlant;
lodash.prototype.reverse = wrapperReverse;
lodash.prototype.toJSON = lodash.prototype.valueOf = lodash.prototype.value = wrapperValue;
```

将各方法挂载到 `lodash` 的原型链上。
