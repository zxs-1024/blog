# Lodash 源码解析 架构

`lodash.js` 内部是一个自执行函数。

```js
; (function () {
  ...
  var runInContext = (function runInContext(context) {
    ...
  })

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

函数内大致分为 3 个部分。

* 10 ~ 1373 初始变量、base 函数、util 函数的申明
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

导出到全局对象 `root`。

## runInContext

```js
var runInContext = (function runInContext(context) {
  // 申明各种功能函数
  ...
  function lodash(value) {
   ...
  }
  // 将功能函数挂载到 lodash 上
  ...
  return lodash;
})
```

`runInContext` 函数用来创建一个新的 `lodash` 函数，我们可以看在，在 `runInContext` 内部会申明 `lodash` 函数，并且在函数最后返回这个 `lodash` 函数。

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

```js
// Export lodash.
var _ = runInContext();
```

在申明 `runInContext` 函数后，我们会立即调用 `runInContext`，并将返回的 `lodash` 函数保存在 `_` 变量上，然后根据不同平台以不同的规范，将 `_` 暴露出去。

当我们这样调用：

```js
_.chunk(['a', 'b', 'c', 'd'], 2);
// => [['a', 'b'], ['c', 'd']]
```

此时的 `_` 就是 `lodash` 函数，`chunk` 是挂载 `lodash.prototype` 上的。

那 `chunk` 是如何挂载在 `lodash.prototype` 上的的？来看一下 `runInContext` 函数内的实现。

```js
// 16515 ~ 16669
// Add methods that return wrapped values in chain sequences.
lodash.after = after;
lodash.ary = ary;
lodash.assign = assign;
lodash.assignIn = assignIn;
...
lodash.chunk = chunk;
lodash.shuffle = shuffle;
lodash.slice = slice;
...
// Add aliases.
lodash.entries = toPairs;
lodash.entriesIn = toPairsIn;
lodash.extend = assignIn;
lodash.extendWith = assignInWith;

// Add methods to `lodash.prototype`.
mixin(lodash, lodash);

```

在 `runInContext` 函数的末尾部分，会将 `runInContext` 前部分申请的各种功能函数以函数名为 `key` 赋值到 `lodash` 函数上， 然后调用 `mixin` 方法，并且传入 `lodash`、`lodash`。

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

调用 `object` 并且传入 `this.__wrapped__`，`object` 就是传入的 `lodash` 函数，`this.__wrapped__` 就是传入的参数。

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

如果 `chain || chainAll` 为真时没有 `return`，此时就会返回不支持链式调用的函数。

## Lodash 调用方式

`lodash` 有两种调用方式，一种是直接调用 `_` 上的方法：

```js
_.chunk(['a', 'b', 'c', 'd'], 2);
// => [['a', 'b'], ['c', 'd']]
```

通过 `_` 调用 `lodash` 上的方法，这是比较常规的调用方法。

我们也可以通过将将

```js
_([])
```



## Lodash Lazy 模式