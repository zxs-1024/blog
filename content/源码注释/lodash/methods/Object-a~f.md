## assign

> 分配来源对象的可枚举属性到目标对象上。 来源对象的应用规则是从左到右，随后的下一个对象的属性会覆盖上一个对象的属性。

```js
_.assign(object, [sources])
```

```js
/**
  * Assigns own enumerable string keyed properties of source objects to the
  * destination object. Source objects are applied from left to right.
  * Subsequent sources overwrite property assignments of previous sources.
  *
  * **Note:** This method mutates `object` and is loosely based on
  * [`Object.assign`](https://mdn.io/Object/assign).
  *
  * @static
  * @memberOf _
  * @since 0.10.0
  * @category Object
  * @param {Object} object The destination object.
  * @param {...Object} [sources] The source objects.
  * @returns {Object} Returns `object`.
  * @see _.assignIn
  * @example
  *
  * function Foo() {
  *   this.a = 1;
  * }
  *
  * function Bar() {
  *   this.c = 3;
  * }
  *
  * Foo.prototype.b = 2;
  * Bar.prototype.d = 4;
  *
  * _.assign({ 'a': 0 }, new Foo, new Bar);
  * // => { 'a': 1, 'c': 3 }
  */
var assign = createAssigner(function(object, source) {
  if (isPrototype(source) || isArrayLike(source)) {
    copyObject(source, keys(source), object);
    return;
  }
  for (var key in source) {
    if (hasOwnProperty.call(source, key)) {
      assignValue(object, key, source[key]);
    }
  }
});
```

`assign` 函数是调用 `createAssigner` 后返回的函数，调用 `createAssigner` 时传入了回调函数：

```js
function(object, source) {
  if (isPrototype(source) || isArrayLike(source)) {
    copyObject(source, keys(source), object);
    return;
  }
  for (var key in source) {
    if (hasOwnProperty.call(source, key)) {
      assignValue(object, key, source[key]);
    }
  }
}
```

这里会判断传入的参数 `source` 是否是原型对象或者是类数组，如果是的话会调用 `copyObject` 进行熟悉拷贝，然后 `return`。

都不满足上述情况，说明 `object` 是一个对象，使用 `for...in` 循环，调用 `hasOwnProperty` 判断 `source` 是否有除原型外的对应的 `key` ，如果有调用 `assignValue` 进行熟悉拷贝。

## createAssigner

```js
/**
  * Creates a function like `_.assign`.
  *
  * @private
  * @param {Function} assigner The function to assign values.
  * @returns {Function} Returns the new assigner function.
  */
function createAssigner(assigner) {
  return baseRest(function(object, sources) {
    var index = -1,
        length = sources.length,
        customizer = length > 1 ? sources[length - 1] : undefined,
        guard = length > 2 ? sources[2] : undefined;

    customizer = (assigner.length > 3 && typeof customizer == 'function')
      ? (length--, customizer)
      : undefined;

    if (guard && isIterateeCall(sources[0], sources[1], guard)) {
      customizer = length < 3 ? undefined : customizer;
      length = 1;
    }
    object = Object(object);
    while (++index < length) {
      var source = sources[index];
      if (source) {
        assigner(object, source, index, customizer);
      }
    }
    return object;
  });
}
```

`createAssigner` 接收 `assigner` 函数，也就是 `assign` 函数传入的回调函数，`createAssigner` 内部会 `return` 调用 `baseRest` 函数返回的函数，这个才是最终的 `assign` 函数，在调用 `baseRest` 函数的时候也传入一个回调函数：

```js
function(object, sources) {
  var index = -1,
      length = sources.length,
      customizer = length > 1 ? sources[length - 1] : undefined,
      guard = length > 2 ? sources[2] : undefined;

  customizer = (assigner.length > 3 && typeof customizer == 'function')
    ? (length--, customizer)
    : undefined;

  if (guard && isIterateeCall(sources[0], sources[1], guard)) {
    customizer = length < 3 ? undefined : customizer;
    length = 1;
  }
  object = Object(object);
  while (++index < length) {
    var source = sources[index];
    if (source) {
      assigner(object, source, index, customizer);
    }
  }
  return object;
}
```

回调函数接收 `object` 、`sources` 2 个参数，首先是申明一些初始变量，从 `sources` 参数数组中尝试取出 `customizer`、`guard`，判断 `customizer` 类型是否为 `function`，否则赋值为 `undefined`，
接着会调用 `isIterateeCall` 判断 `guard` 是否来自迭代器调用，如果是当 `length < 3` 是将 `customizer` 赋值为 `undefined`, `length` 赋值为 1。

然后使用 `while` 循环，`index` 累加，并且调用传入的 `assigner` 函数进行对传入的 `object` 属性拷贝，循环结束后将 `object` 返回。

## baseRest

```js
/**
  * The base implementation of `_.rest` which doesn't validate or coerce arguments.
  *
  * @private
  * @param {Function} func The function to apply a rest parameter to.
  * @param {number} [start=func.length-1] The start position of the rest parameter.
  * @returns {Function} Returns the new function.
  */
function baseRest(func, start) {
  return setToString(overRest(func, start, identity), func + '');
}
```

`baseRest` 返回 `setToString` 函数的函数调用，并且传入 `overRest` 函数调用和 `func` 的字符串。


## overRest

```js
/**
  * A specialized version of `baseRest` which transforms the rest array.
  *
  * @private
  * @param {Function} func The function to apply a rest parameter to.
  * @param {number} [start=func.length-1] The start position of the rest parameter.
  * @param {Function} transform The rest array transform.
  * @returns {Function} Returns the new function.
  */
function overRest(func, start, transform) {
  start = nativeMax(start === undefined ? (func.length - 1) : start, 0);
  return function() {
    var args = arguments,
        index = -1,
        length = nativeMax(args.length - start, 0),
        array = Array(length);

    while (++index < length) {
      array[index] = args[start + index];
    }
    index = -1;
    var otherArgs = Array(start + 1);
    while (++index < start) {
      otherArgs[index] = args[index];
    }
    otherArgs[start] = transform(array);
    return apply(func, this, otherArgs);
  };
}
```

`overRest` 函数接收 3 个参数，`func` 回调函数、`start` 起始下标，默认为 0 、`transform` 调用时传入的 `identity` 函数，用来返回接收到的第一个参数。

`overRest` 函数返回一个 `function` ，在这个 `function` 中首先会申明一些初始参数，然后进行 `while` 循环，从 `start` 开始复制 `args`，然后申明 `otherArgs` 数组，又进行一次 `while` 循环，复制 `otherArgs` 数组，随后调用 `transform` 函数，返回 `array` 的第一个，赋值给 `otherArgs` 数组的第 `start` 个，最后返回使用 `apply` 返回改变`this` 指向的函数。

## setToString

```js
/**
  * Sets the `toString` method of `func` to return `string`.
  *
  * @private
  * @param {Function} func The function to modify.
  * @param {Function} string The `toString` result.
  * @returns {Function} Returns `func`.
  */
var setToString = shortOut(baseSetToString);
```

`setToString` 函数是 `shortOut` 函数传入 `baseSetToString` 变量的调用返回，主要是设置 `toString` 方法返回 `func` 的字符串。

## baseSetToString

```js
/**
  * The base implementation of `setToString` without support for hot loop shorting.
  *
  * @private
  * @param {Function} func The function to modify.
  * @param {Function} string The `toString` result.
  * @returns {Function} Returns `func`.
  */
var baseSetToString = !defineProperty ? identity : function(func, string) {
  return defineProperty(func, 'toString', {
    'configurable': true,
    'enumerable': false,
    'value': constant(string),
    'writable': true
  });
};
```

`baseSetToString` 是一个三元表达式，如果不支持 `defineProperty` 就调用 `identity` 函数，用来返回接收到的第一个参数，否则就调用 `defineProperty` 给 `func` 添加 `toString` 方法，并将 `value` 设置成传入的  `func` 字符串。

## shortOut

```js
/**
  * Creates a function that'll short out and invoke `identity` instead
  * of `func` when it's called `HOT_COUNT` or more times in `HOT_SPAN`
  * milliseconds.
  *
  * @private
  * @param {Function} func The function to restrict.
  * @returns {Function} Returns the new shortable function.
  */
function shortOut(func) {
  var count = 0,
    lastCalled = 0;

  return function () {
    var stamp = nativeNow(),
      remaining = HOT_SPAN - (stamp - lastCalled);

    lastCalled = stamp;
    if (remaining > 0) {
      if (++count >= HOT_COUNT) {
        return arguments[0];
      }
    } else {
      count = 0;
    }
    return func.apply(undefined, arguments);
  };
}
```

`shortOut` 接收传入的 `func` 函数，返回一个 `function`，在 `function` 中申明了 `stamp` 变量保存 `nativeNow()`，也就是现在的毫秒数，然后将 `remaining` 赋值为 `HOT_SPAN` 减去 `stamp` 、`lastCalled` 之差：

```js
/** Used to detect hot functions by number of calls within a span of milliseconds. */
var HOT_COUNT = 800,
  HOT_SPAN = 16;
```

调用 `shortOut` 函数时会在函数内部维持一个闭包，保持对 `count` 、`lastCalled` 变量的引用，`lastCalled` 变量记录了上次调用的毫秒数，在第二次调用时会判断 `remaining` 调用时间差，如果大于 `HOT_COUNT 800`，返回 `arguments[0]`，否则将 `count` 重置，最后返回调用 `apply` 后的 `func` 函数。

## assignIn

> 这个方法类似 _.assign。 除了它会遍历并继承来源对象的属性。

```js
_.assignIn(object, [sources])
```

```js
/**
  * This method is like `_.assign` except that it iterates over own and
  * inherited source properties.
  *
  * **Note:** This method mutates `object`.
  *
  * @static
  * @memberOf _
  * @since 4.0.0
  * @alias extend
  * @category Object
  * @param {Object} object The destination object.
  * @param {...Object} [sources] The source objects.
  * @returns {Object} Returns `object`.
  * @see _.assign
  * @example
  *
  * function Foo() {
  *   this.a = 1;
  * }
  *
  * function Bar() {
  *   this.c = 3;
  * }
  *
  * Foo.prototype.b = 2;
  * Bar.prototype.d = 4;
  *
  * _.assignIn({ 'a': 0 }, new Foo, new Bar);
  * // => { 'a': 1, 'b': 2, 'c': 3, 'd': 4 }
  */
var assignIn = createAssigner(function (object, source) {
  copyObject(source, keysIn(source), object);
});
```

`assignIn` 函数与 `assign` 大致相似，只是调用 `createAssigner` 函数时传入的回调函数有所不同，回调函数接收 2 个参数，`object` 、`source`，调用 `copyObject` 方法，将 `source` 、`keysIn(source)`、 `object` 作为参数传入，`keysIn` 函数返回对象 `key` 数组：

```js
function keysIn(object) {
  return isArrayLike(object) ? arrayLikeKeys(object, true) : baseKeysIn(object);
}
```

`keysIn` 会判断是否是数组并返回 `key` 数组集合。

## copyObject

```js
/**
  * Copies properties of `source` to `object`.
  *
  * @private
  * @param {Object} source The object to copy properties from.
  * @param {Array} props The property identifiers to copy.
  * @param {Object} [object={}] The object to copy properties to.
  * @param {Function} [customizer] The function to customize copied values.
  * @returns {Object} Returns `object`.
  */
function copyObject(source, props, object, customizer) {
  var isNew = !object;
  object || (object = {});

  var index = -1,
    length = props.length;

  while (++index < length) {
    var key = props[index];

    var newValue = customizer
      ? customizer(object[key], source[key], key, object, source)
      : undefined;

    if (newValue === undefined) {
      newValue = source[key];
    }
    if (isNew) {
      baseAssignValue(object, key, newValue);
    } else {
      assignValue(object, key, newValue);
    }
  }
  return object;
}
```

`copyObject` 接收 4 个参数，`source` 原生对象、`props` `key` 数组、`object` 需要拷贝对象、`customizer` 自定义函数。

`copyObject` 函数实现了一个简单的属性拷贝，申明 `isNew` 变量代取反 `object`，如果 `object` 为假，`isNew` 为真，`object` 默认为一个空对象，并且申明起始 `index`、 `length`。

通过 `while` 循环，如果 `isNew` 为真，调用 `baseAssignValue` 进行熟悉拷贝，否则调用 `assignValue`。

## assignInWith

> 这个方法类似 _.assignIn。 除了它接受一个 customizer决定如何分配值。 如果customizer返回undefined将会由分配处理方法代替。customizer` 会传入5个参数：(objValue, srcValue, key, object, source)。 

```js
_.assignInWith(object, sources, [customizer])
```

```js
/**
  * This method is like `_.assignIn` except that it accepts `customizer`
  * which is invoked to produce the assigned values. If `customizer` returns
  * `undefined`, assignment is handled by the method instead. The `customizer`
  * is invoked with five arguments: (objValue, srcValue, key, object, source).
  *
  * **Note:** This method mutates `object`.
  *
  * @static
  * @memberOf _
  * @since 4.0.0
  * @alias extendWith
  * @category Object
  * @param {Object} object The destination object.
  * @param {...Object} sources The source objects.
  * @param {Function} [customizer] The function to customize assigned values.
  * @returns {Object} Returns `object`.
  * @see _.assignWith
  * @example
  *
  * function customizer(objValue, srcValue) {
  *   return _.isUndefined(objValue) ? srcValue : objValue;
  * }
  *
  * var defaults = _.partialRight(_.assignInWith, customizer);
  *
  * defaults({ 'a': 1 }, { 'b': 2 }, { 'a': 3 });
  * // => { 'a': 1, 'b': 2 }
  */
var assignInWith = createAssigner(function(object, source, srcIndex, customizer) {
  copyObject(source, keysIn(source), object, customizer);
});
```

`assignInWith` 与 `assignIn` 函数基本相似，多了一个参数 `customizer` 自定义函数，
在调用 `createAssigner` 函数中内部处理传入的 `customizer` 函数。

## assignWith

> 这个方法类似 _.assign。 除了它接受一个 customizer决定如何分配值。 如果customizer返回undefined将会由分配处理方法代替。customizer` 会传入5个参数：(objValue, srcValue, key, object, source)。

```js
_.assignWith(object, sources, [customizer])
```

```js
/**
  * This method is like `_.assign` except that it accepts `customizer`
  * which is invoked to produce the assigned values. If `customizer` returns
  * `undefined`, assignment is handled by the method instead. The `customizer`
  * is invoked with five arguments: (objValue, srcValue, key, object, source).
  *
  * **Note:** This method mutates `object`.
  *
  * @static
  * @memberOf _
  * @since 4.0.0
  * @category Object
  * @param {Object} object The destination object.
  * @param {...Object} sources The source objects.
  * @param {Function} [customizer] The function to customize assigned values.
  * @returns {Object} Returns `object`.
  * @see _.assignInWith
  * @example
  *
  * function customizer(objValue, srcValue) {
  *   return _.isUndefined(objValue) ? srcValue : objValue;
  * }
  *
  * var defaults = _.partialRight(_.assignWith, customizer);
  *
  * defaults({ 'a': 1 }, { 'b': 2 }, { 'a': 3 });
  * // => { 'a': 1, 'b': 2 }
  */
var assignWith = createAssigner(function(object, source, srcIndex, customizer) {
  copyObject(source, keys(source), object, customizer);
});
```

`assignWith` 比 `assign` 函数少了一层判断，回调中只有 `copyObject` 函数，只不过在其中多加了 `customizer` 自定义函数，在 `copyObject` 中：

```js
while (++index < length) {
  var key = props[index];

  var newValue = customizer
    ? customizer(object[key], source[key], key, object, source)
    : undefined;

  if (newValue === undefined) {
    newValue = source[key];
  }
  if (isNew) {
    baseAssignValue(object, key, newValue);
  } else {
    assignValue(object, key, newValue);
  }
}
```

如果有 `customizer` 会调用 `customizer` 生成 `newValue` 并且赋值，然后进行属性拷贝。

## at

> 根据 object 的路径获取值为数组。

```js
_.at(object, [paths])
```

```js
/**
 * Creates an array of values corresponding to `paths` of `object`.
 *
 * @since 1.0.0
 * @category Object
 * @param {Object} object The object to iterate over.
 * @param {...(string|string[])} [paths] The property paths to pick.
 * @returns {Array} Returns the picked values.
 * @example
 *
 * const object = { 'a': [{ 'b': { 'c': 3 } }, 4] }
 *
 * at(object, ['a[0].b.c', 'a[1]'])
 * // => [3, 4]
 */
function at(...paths) {
  return baseAt(paths)
}
```

`at` 是调用 `baseAt` 后返回的函数。

## baseAt

```js
/**
 * The base implementation of `at` without support for individual paths.
 *
 * @private
 * @param {Object} object The object to iterate over.
 * @param {string[]} paths The property paths to pick.
 * @returns {Array} Returns the picked elements.
 */
function baseAt(object, paths) {
  let index = -1
  const length = paths.length
  const result = new Array(length)
  const skip = object == null

  while (++index < length) {
    result[index] = skip ? undefined : get(object, paths[index])
  }
  return result
}
```

`baseAt` 函数接收 2 个参数，`object` 迭代对象、`paths` 路径数组。

申明初始变量，进入 `while` 循环， `index` 累加，
接着对 `result` 的第 `index` 个进行赋值，是一个三元表达式，如果 `skip` 为真，也就是 `object` 为 `null`，就赋值为 `undefined`，否则就调用 `get` 方法获取对应 `paths` 的 `value`，循环结束后将 `result` 数组返回。

## get

```js
/**
 * Gets the value at `path` of `object`. If the resolved value is
 * `undefined`, the `defaultValue` is returned in its place.
 *
 * @since 3.7.0
 * @category Object
 * @param {Object} object The object to query.
 * @param {Array|string} path The path of the property to get.
 * @param {*} [defaultValue] The value returned for `undefined` resolved values.
 * @returns {*} Returns the resolved value.
 * @see has, hasIn, set, unset
 * @example
 *
 * const object = { 'a': [{ 'b': { 'c': 3 } }] }
 *
 * get(object, 'a[0].b.c')
 * // => 3
 *
 * get(object, ['a', '0', 'b', 'c'])
 * // => 3
 *
 * get(object, 'a.b.c', 'default')
 * // => 'default'
 */
function get(object, path, defaultValue) {
  const result = object == null ? undefined : baseGet(object, path)
  return result === undefined ? defaultValue : result
}
```

`get` 函数接收 3 个参数，`object` 对象、`path` 路径、`defaultValue` 默认值。

申明 `result` 变量，如果 `object` 不为 `null`，赋值为 `undefined`，否则调用 `baseGet` 函数赋值给 `result`，
最后返回一个三元表达式，如果 `result` 等于 `undefined` 返回默认值，否则返回 `result`。

## baseGet

```js
/**
 * The base implementation of `get` without support for default values.
 *
 * @private
 * @param {Object} object The object to query.
 * @param {Array|string} path The path of the property to get.
 * @returns {*} Returns the resolved value.
 */
function baseGet(object, path) {
  path = castPath(path, object)

  let index = 0
  const length = path.length

  while (object != null && index < length) {
    object = object[toKey(path[index++])]
  }
  return (index && index == length) ? object : undefined
}
```

`baseGet` 函数接收 2 个参数，`object` 对象、`path` 路径。

调用 `castPath` 函数将路径解析成数组形式，然后进入 `while` 循环，

在 `baseGet` 函数中，首先会调用 `castPath` 函数解析 `path`，此时 `path` 为一个数组，申明初始值 `index`、`length` 路径长度。

然后进行 `while` 循环，不断从 `object` 取出路径对应的 `value` 替换 `object`，最后将 `object` 最终取出的值返回。

## castPath

```js
/**
 * Casts `value` to a path array if it's not one.
 *
 * @private
 * @param {*} value The value to inspect.
 * @param {Object} [object] The object to query keys on.
 * @returns {Array} Returns the cast property path array.
 */
function castPath(value, object) {
  if (Array.isArray(value)) {
    return value
  }
  return isKey(value, object) ? [value] : stringToPath(value)
}
```

`castPath` 函数首先会判断 `value` 是否是数组，是数组直接返回 `value`，否则返回一个三元表达式：

```js
isKey(value, object) ? [value] : stringToPath(value)
```

如果调用 `isKey` 检查 `value` 是属性，就将 `value` 包装成数组返回，否则就调用 `stringToPath` 将 `value` 转换成路径。

## create

> 创建一个继承 prototype 的对象。 如果提供了 properties，它的可枚举属性会被分配到创建的对象上。

```js
_.create(prototype, [properties])
```

```js
/**
 * Creates an object that inherits from the `prototype` object. If a
 * `properties` object is given, its own enumerable string keyed properties
 * are assigned to the created object.
 *
 * @since 2.3.0
 * @category Object
 * @param {Object} prototype The object to inherit from.
 * @param {Object} [properties] The properties to assign to the object.
 * @returns {Object} Returns the new object.
 * @example
 *
 * function Shape() {
 *   this.x = 0
 *   this.y = 0
 * }
 *
 * function Circle() {
 *   Shape.call(this)
 * }
 *
 * Circle.prototype = create(Shape.prototype, {
 *   'constructor': Circle
 * })
 *
 * const circle = new Circle
 * circle instanceof Circle
 * // => true
 *
 * circle instanceof Shape
 * // => true
 */
function create(prototype, properties) {
  prototype = prototype === null ? null : Object(prototype)
  const result = Object.create(prototype)
  return properties == null ? result : Object.assign(result, properties)
}
```

`create` 函数接收 2 个参数， `prototype` 要继承的对象、`properties` 继承的属性。

首先会判断 `prototype` 是否是 `null`，否则就调用 `Object` 转化为对象，这里调用了原生的 `Object.create` 方法，创建一个具有指定原型且可选择性地包含指定属性的 `result`。

最后会 `return` 一个三元表达式，如果 `properties` 等于 `null`， 直接返回 `result`，否则调用 ` Object.assign` 实现属性的拷贝后返回。

## defaults

> 分配来源对象的可枚举属性到目标对象所有解析为 undefined 的属性上。 来源对象从左到右应用。 一旦设置了相同属性的值，后续的将被忽略掉。 

```js
_.defaults(object, [sources])
```

```js
/** Used for built-in method references. */
const objectProto = Object.prototype

/** Used to check objects for own properties. */
const hasOwnProperty = objectProto.hasOwnProperty

/**
 * Assigns own and inherited enumerable string keyed properties of source
 * objects to the destination object for all destination properties that
 * resolve to `undefined`. Source objects are applied from left to right.
 * Once a property is set, additional values of the same property are ignored.
 *
 * **Note:** This method mutates `object`.
 *
 * @since 0.1.0
 * @category Object
 * @param {Object} object The destination object.
 * @param {...Object} [sources] The source objects.
 * @returns {Object} Returns `object`.
 * @see defaultsDeep
 * @example
 *
 * defaults({ 'a': 1 }, { 'b': 2 }, { 'a': 3 })
 * // => { 'a': 1, 'b': 2 }
 */
function defaults(object, ...sources) {
  object = Object(object)
  sources.forEach((source) => {
    if (source != null) {
      source = Object(source)
      for (const key in source) {
        const value = object[key]
        if (value === undefined ||
            (eq(value, objectProto[key]) && !hasOwnProperty.call(object, key))) {
          object[key] = source[key]
        }
      }
    }
  })
  return object
}
```

`defaults` 函数接收 2 个参数，`object` 目标对象、`sources` 其他对象。

首先调用 `Object` 转化 `object` 对象，
然后遍历 `sources` 数组，进行 `source` 的非空判断，并且尝试转化为 `object`，
接着使用 `for...in` 循环遍历 `source`，申明 `value` 变量遍历保存对象 `key` 的 `value`，如果不为 `undefined` 或者 `value` 与原型上的对象 `key` 相等并且 `object` 上的没有这个属性就将 `source` 对应的 `key`，就将 `value` 赋值给 `object` 对应的 `key` ，循环结束后将 `object` 返回。

总的来说就是循环调用 `sources` 参数数组，并且遍历参数的 `key` ，没有重复 `key` 就往原对象加 `key: value`，最后返回 `object`。

## defaultsDeep

> 这个方法类似 _.defaults，除了它会递归分配默认属性。 

```js
_.defaultsDeep(object, [sources])
```

```js
/**
 * This method is like `defaults` except that it recursively assigns
 * default properties.
 *
 * **Note:** This method mutates `object`.
 *
 * @since 3.10.0
 * @category Object
 * @param {Object} object The destination object.
 * @param {...Object} [sources] The source objects.
 * @returns {Object} Returns `object`.
 * @see defaults
 * @example
 *
 * defaultsDeep({ 'a': { 'b': 2 } }, { 'a': { 'b': 1, 'c': 3 } })
 * // => { 'a': { 'b': 2, 'c': 3 } }
 */
function defaultsDeep(...args) {
  args.push(undefined, customDefaultsMerge)
  return mergeWith.apply(undefined, args)
}
```

`defaultsDeep` 首先会将 `undefined, customDefaultsMerge` 插入到 `args`，调用 `mergeWith` 函数返回。

## customDefaultsMerge

```js
/**
 * Used by `defaultsDeep` to customize its `merge` use to merge source
 * objects into destination objects that are passed thru.
 *
 * @private
 * @param {*} objValue The destination value.
 * @param {*} srcValue The source value.
 * @param {string} key The key of the property to merge.
 * @param {Object} object The parent object of `objValue`.
 * @param {Object} source The parent object of `srcValue`.
 * @param {Object} [stack] Tracks traversed source values and their merged
 *  counterparts.
 * @returns {*} Returns the value to assign.
 */
function customDefaultsMerge(objValue, srcValue, key, object, source, stack) {
  if (isObject(objValue) && isObject(srcValue)) {
    // Recursively merge objects and arrays (susceptible to call stack limits).
    stack.set(srcValue, objValue)
    baseMerge(objValue, srcValue, undefined, customDefaultsMerge, stack)
    stack['delete'](srcValue)
  }
  return objValue
}
```

`customDefaultsMerge` 会判断 `objValue`、`srcValue` 如果均为对象，
调用 `set` 为 `srcValue` 增加 `objValue`，
接着调用 `baseMerge` 函数，并且传入 `customDefaultsMerge` 自身，`baseMerge` 函数内部，递归调用 `customDefaultsMerge`，实现属性的深拷贝，
然后删除 `stack` 上的 `srcValue`，
最后返回 `objValue`。

## findKey

> 这个方法类似 _.find。 除了它返回最先被 predicate 判断为真值的元素 key，而不是元素本身。

```js
_.findKey(object, [predicate=_.identity])
```

```js
/**
 * This method is like `find` except that it returns the key of the first
 * element `predicate` returns truthy for instead of the element itself.
 *
 * @since 1.1.0
 * @category Object
 * @param {Object} object The object to inspect.
 * @param {Function} predicate The function invoked per iteration.
 * @returns {string|undefined} Returns the key of the matched element,
 *  else `undefined`.
 * @see find, findIndex, findLast, findLastIndex, findLastKey
 * @example
 *
 * const users = {
 *   'barney':  { 'age': 36, 'active': true },
 *   'fred':    { 'age': 40, 'active': false },
 *   'pebbles': { 'age': 1,  'active': true }
 * }
 *
 * findKey(users, ({ age }) => age < 40)
 * // => 'barney' (iteration order is not guaranteed)
 */
function findKey(object, predicate) {
  let result
  if (object == null) {
    return result
  }
  Object.keys(object).some((key) => {
    const value = object[key]
    if (predicate(value, key, object)) {
      result = key
      return true
    }
  })
  return result
}
```

`findKey` 接收 2 个参数，`object` 遍历对象、`predicate` 比较函数。

首先是非空判断，如果 `object` 等于 `null`，`return result`。

接着调用 `Object.keys` 获取 `key` 数组并采用 `some` 方法进行遍历， 
然后调用 `predicate` 函数，如果返回为真，则将 `key` 赋值给 `result` ，
返回 `true` 中断循环，将 `result` 返回。

## findLastKey

> 这个方法类似 _.findKey。 不过它是反方向开始遍历的。

```js
_.findLastKey(object, [predicate=_.identity])
```

```js
/**
 * This method is like `findKey` except that it iterates over elements of
 * a collection in the opposite order.
 *
 * @since 2.0.0
 * @category Object
 * @param {Object} object The object to inspect.
 * @param {Function} predicate The function invoked per iteration.
 * @returns {string|undefined} Returns the key of the matched element,
 *  else `undefined`.
 * @see find, findIndex, findKey, findLast, findLastIndex
 * @example
 *
 * const users = {
 *   'barney':  { 'age': 36, 'active': true },
 *   'fred':    { 'age': 40, 'active': false },
 *   'pebbles': { 'age': 1,  'active': true }
 * }
 *
 * findLastKey(users, ({ age }) => age < 40)
 * // => returns 'pebbles' assuming `findKey` returns 'barney'
 */
function findLastKey(object, predicate) {
  return baseFindKey(object, predicate, baseForOwnRight)
}
```

`findLastKey` 接收 2 个参数，`object` 遍历对象、`predicate` 比较函数， 是 `baseFindKey` 函数调用后的返回函数。

## baseFindKey

```js
/**
 * The base implementation of methods like `findKey` and `findLastKey`
 * which iterates over `collection` using `eachFunc`.
 *
 * @private
 * @param {Array|Object} collection The collection to inspect.
 * @param {Function} predicate The function invoked per iteration.
 * @param {Function} eachFunc The function to iterate over `collection`.
 * @returns {*} Returns the found element or its key, else `undefined`.
 */
function baseFindKey(collection, predicate, eachFunc) {
  let result
  eachFunc(collection, (value, key, collection) => {
    if (predicate(value, key, collection)) {
      result = key
      return false
    }
  })
  return result
}
```

`baseFindKey` 函数调用传入的 `eachFunc` 函数，也就是 `baseForOwnRight`，并且传入 `collection` 和回调函数，在回调函数中会调用 `predicate` 比较函数，如果返回为真，就将 `key` 赋值给 `result`，返回 `false` 中断循环，最后将 `result` 返回。

## baseForOwnRight

```js
/**
 * The base implementation of `forOwnRight`.
 *
 * @private
 * @param {Object} object The object to iterate over.
 * @param {Function} iteratee The function invoked per iteration.
 * @returns {Object} Returns `object`.
 */
function baseForOwnRight(object, iteratee) {
  return object && baseForRight(object, iteratee, keys)
}
```

`baseForOwnRight` 函数是 `baseForRight` 函数的调用返回的函数，只是传入了 `keys`:

```js
function keys(object) {
  return isArrayLike(object)
    ? arrayLikeKeys(object)
    : Object.keys(Object(object))
}
```

`keys` 函数主要返回对象的 `key` 数组。

## baseForRight

```js
/**
 * This function is like `baseFor` except that it iterates over properties
 * in the opposite order.
 *
 * @private
 * @param {Object} object The object to iterate over.
 * @param {Function} iteratee The function invoked per iteration.
 * @param {Function} keysFunc The function to get the keys of `object`.
 * @returns {Object} Returns `object`.
 */
function baseForRight(object, iteratee, keysFunc) {
  const iterable = Object(object)
  const props = keysFunc(object)
  let { length } = props

  while (length--) {
    const key = props[length]
    if (iteratee(iterable[key], key, iterable) === false) {
      break
    }
  }
  return object
}
```

`baseForRight` 函数接收 3 个函数，`object` 遍历对象、`iteratee` 迭代函数、`keysFunc` 也就是 `keys` 函数。

取出 `props` 的 `key` 数组，采用 `while` 循环，`length` 累减，如果调用 `iteratee` 迭代函数返回为 `false`，`break` 中断循环，循环结束后返回 `object`。

## forIn

> 使用 iteratee 遍历对象的自身和继承的可枚举属性。 iteratee 会传入3个参数：(value, key, object)。 如果返回 false，iteratee 会提前退出遍历。

```js
_.forIn(object, [iteratee=_.identity])
```

```js
/**
  * Iterates over own and inherited enumerable string keyed properties of an
  * object and invokes `iteratee` for each property. The iteratee is invoked
  * with three arguments: (value, key, object). Iteratee functions may exit
  * iteration early by explicitly returning `false`.
  *
  * @static
  * @memberOf _
  * @since 0.3.0
  * @category Object
  * @param {Object} object The object to iterate over.
  * @param {Function} [iteratee=_.identity] The function invoked per iteration.
  * @returns {Object} Returns `object`.
  * @see _.forInRight
  * @example
  *
  * function Foo() {
  *   this.a = 1;
  *   this.b = 2;
  * }
  *
  * Foo.prototype.c = 3;
  *
  * _.forIn(new Foo, function(value, key) {
  *   console.log(key);
  * });
  * // => Logs 'a', 'b', then 'c' (iteration order is not guaranteed).
  */
function forIn(object, iteratee) {
  return object == null
    ? object
    : baseFor(object, getIteratee(iteratee, 3), keysIn);
}
```

`forIn` 函数接收 2 个参数，`object` 遍历对象、`iteratee` 迭代函数。

如果 `object` 为 `null` 返回 `object`，否则返回调用 `baseFor` 函数的返回。

## baseFor

```js
/**
  * The base implementation of `baseForOwn` which iterates over `object`
  * properties returned by `keysFunc` and invokes `iteratee` for each property.
  * Iteratee functions may exit iteration early by explicitly returning `false`.
  *
  * @private
  * @param {Object} object The object to iterate over.
  * @param {Function} iteratee The function invoked per iteration.
  * @param {Function} keysFunc The function to get the keys of `object`.
  * @returns {Object} Returns `object`.
  */
var baseFor = createBaseFor();
```

`baseFor` 函数时调用 `createBaseFor` 函数的返回函数。

## createBaseFor

```js
/**
  * Creates a base function for methods like `_.forIn` and `_.forOwn`.
  *
  * @private
  * @param {boolean} [fromRight] Specify iterating from right to left.
  * @returns {Function} Returns the new base function.
  */
function createBaseFor(fromRight) {
  return function(object, iteratee, keysFunc) {
    var index = -1,
        iterable = Object(object),
        props = keysFunc(object),
        length = props.length;

    while (length--) {
      var key = props[fromRight ? length : ++index];
      if (iteratee(iterable[key], key, iterable) === false) {
        break;
      }
    }
    return object;
  };
}
```

`createBaseFor` 接收一个 `fromRight` 参数，但是 `baseFor` 调用并没有传参，
`createBaseFor` 会返回一个 `function` ，这个函数才是 `baseFor` 函数：

```js
function(object, iteratee, keysFunc) {
  var index = -1,
      iterable = Object(object),
      props = keysFunc(object),
      length = props.length;

  while (length--) {
    var key = props[fromRight ? length : ++index];
    if (iteratee(iterable[key], key, iterable) === false) {
      break;
    }
  }
  return object;
};
```

函数内部会调用 `keysFunc` 函数，也就是 `keysIn` 获取对象的 `key` 数组，
进行 `while` 循环，`length` 累减，这里会判断 `fromRight` 是否为真，如果为真就从右开始取值，然后调用 `iteratee` 函数，如果返回为 `false`，就中断循环，循环结束将 `object` 返回。

## forInRight

> 这个方法类似 _.forIn。 除了它是反方向开始遍历的。

```js
/**
  * This method is like `_.forIn` except that it iterates over properties of
  * `object` in the opposite order.
  *
  * @static
  * @memberOf _
  * @since 2.0.0
  * @category Object
  * @param {Object} object The object to iterate over.
  * @param {Function} [iteratee=_.identity] The function invoked per iteration.
  * @returns {Object} Returns `object`.
  * @see _.forIn
  * @example
  *
  * function Foo() {
  *   this.a = 1;
  *   this.b = 2;
  * }
  *
  * Foo.prototype.c = 3;
  *
  * _.forInRight(new Foo, function(value, key) {
  *   console.log(key);
  * });
  * // => Logs 'c', 'b', then 'a' assuming `_.forIn` logs 'a', 'b', then 'c'.
  */
function forInRight(object, iteratee) {
  return object == null
    ? object
    : baseForRight(object, getIteratee(iteratee, 3), keysIn);
}
```

`forInRight` 函数内部与 `forIn` 函数内部相似，只是调用了 `baseForRight` 函数。

## baseForRight

```js
/**
  * This function is like `baseFor` except that it iterates over properties
  * in the opposite order.
  *
  * @private
  * @param {Object} object The object to iterate over.
  * @param {Function} iteratee The function invoked per iteration.
  * @param {Function} keysFunc The function to get the keys of `object`.
  * @returns {Object} Returns `object`.
  */
var baseForRight = createBaseFor(true);
```

我们可以看到 `baseForRight` 函数在调用 `createBaseFor` 函数时传入了 `true`，在 `createBaseFor` 内部会判断 `fromRight` 为真就反向遍历。

```js
while (length--) {
  var key = props[fromRight ? length : ++index];
  if (iteratee(iterable[key], key, iterable) === false) {
    break;
  }
}
```

## forOwn

> 使用 iteratee 遍历自身的可枚举属性。 iteratee 会传入3个参数：(value, key, object)。 如果返回 false，iteratee 会提前退出遍历。

```js
_.forOwn(object, [iteratee=_.identity])
```

```js
/**
 * Iterates over own enumerable string keyed properties of an object and
 * invokes `iteratee` for each property. The iteratee is invoked with three
 * arguments: (value, key, object). Iteratee functions may exit iteration
 * early by explicitly returning `false`.
 *
 * @since 0.3.0
 * @category Object
 * @param {Object} object The object to iterate over.
 * @param {Function} iteratee The function invoked per iteration.
 * @see forEach, forEachRight, forIn, forInRight, forOwnRight
 * @example
 *
 * function Foo() {
 *   this.a = 1
 *   this.b = 2
 * }
 *
 * Foo.prototype.c = 3
 *
 * forOwn(new Foo, function(value, key) {
 *   console.log(key)
 * })
 * // => Logs 'a' then 'b' (iteration order is not guaranteed).
 */
function forOwn(object, iteratee) {
  object = Object(object)
  Object.keys(object).forEach((key) => iteratee(object[key], key, object))
}
```

`forOwn` 函数接收 2 个参数，`object` 迭代对象、`iteratee` 迭代函数。

首先会调用 `Object` 转化 `object`，然后调用 `Object.keys` 函数获取对象的 `key` 数组，调用 `forEach` 进行迭代，`forEach` 的回调函数中会调用 `iteratee` 函数。

## forOwnRight

> 这个方法类似 _.forOwn。 除了它是反方向开始遍历的。

```js
_.forOwnRight(object, [iteratee=_.identity])
```

```js
/**
 * This method is like `forOwn` except that it iterates over properties of
 * `object` in the opposite order.
 *
 * @since 2.0.0
 * @category Object
 * @param {Object} object The object to iterate over.
 * @param {Function} iteratee The function invoked per iteration.
 * @returns {Object} Returns `object`.
 * @see forEach, forEachRight, forIn, forInRight, forOwn
 * @example
 *
 * function Foo() {
 *   this.a = 1
 *   this.b = 2
 * }
 *
 * Foo.prototype.c = 3
 *
 * forOwnRight(new Foo, function(value, key) {
 *   console.log(key)
 * })
 * // => Logs 'b' then 'a' assuming `forOwn` logs 'a' then 'b'.
 */
function forOwnRight(object, iteratee) {
  if (object == null) {
    return
  }
  const props = Object.keys(object)
  let length = props.length
  while (length--) {
    iteratee(object[props[length]], iteratee, object)
  }
}
```

`forOwnRight` 函数接收 2 个参数，`object` 迭代对象、`iteratee` 迭代函数。

调用 `Object.keys` 函数返回 `object` 的 `key` 数组，然后采用 `while` 循环，`length` 累减，在迭代中循环调用 `iteratee` 函数。

## functions

> 返回一个 function 对象自身可枚举属性名的数组。

```js
_.functions(object)
```

```js
/**
 * Creates an array of function property names from own enumerable properties
 * of `object`.
 *
 * @since 0.1.0
 * @category Object
 * @param {Object} object The object to inspect.
 * @returns {Array} Returns the function names.
 * @see functionsIn
 * @example
 *
 * function Foo() {
 *   this.a = () => 'a'
 *   this.b = () => 'b'
 * }
 *
 * Foo.prototype.c = () => 'c'
 *
 * functions(new Foo)
 * // => ['a', 'b']
 */
function functions(object) {
  if (object == null) {
    return []
  }
  return Object.keys(object).filter((key) => typeof object[key] == 'function')
}
```

`functions` 函数接收一个 `object`，在函数中首先会进行一个非空判断，如果 `object` 为 `null`，返回空数组。

调用 `Object.keys(object)` 函数获取 `object` 的 `key` 数组，连缀调用 `filter` 函数进行过滤，在 `filter` 的回调函数中中会判断 `object[key]` 类型是否为 `function`，然后将过滤后的数组返回。

## functionsIn

> 返回一个 function 对象自身和继承的可枚举属性名的数组。

```js
_.functionsIn(object)
```

```js
/**
  * Creates an array of function property names from own and inherited
  * enumerable properties of `object`.
  *
  * @static
  * @memberOf _
  * @since 4.0.0
  * @category Object
  * @param {Object} object The object to inspect.
  * @returns {Array} Returns the function names.
  * @see _.functions
  * @example
  *
  * function Foo() {
  *   this.a = _.constant('a');
  *   this.b = _.constant('b');
  * }
  *
  * Foo.prototype.c = _.constant('c');
  *
  * _.functionsIn(new Foo);
  * // => ['a', 'b', 'c']
  */
function functionsIn(object) {
  return object == null ? [] : baseFunctions(object, keysIn(object));
}
```

`functionsIn` 函数返回一个三元表达式，如果 `object == null` 返回空数组，否则返回调用 `baseFunctions` 函数的结果，并传入 `object` 检索对象、`keysIn(object)` 检索对象的 `key` 数组。

## baseFunctions

```js
/**
  * The base implementation of `_.functions` which creates an array of
  * `object` function property names filtered from `props`.
  *
  * @private
  * @param {Object} object The object to inspect.
  * @param {Array} props The property names to filter.
  * @returns {Array} Returns the function names.
  */
  function baseFunctions(object, props) {
    return arrayFilter(props, function (key) {
      return isFunction(object[key]);
    });
  }
```

`baseFunctions` 返回一个 `arrayFilter` 函数，传入 `props` 和一个回调函数，在回调函数中会调用 `isFunction` 函数判断 `object[key]` 是否是一个 `function`。

## arrayFilter

```js
/**
  * A specialized version of `_.filter` for arrays without support for
  * iteratee shorthands.
  *
  * @private
  * @param {Array} [array] The array to iterate over.
  * @param {Function} predicate The function invoked per iteration.
  * @returns {Array} Returns the new filtered array.
  */
function arrayFilter(array, predicate) {
  var index = -1,
    length = array == null ? 0 : array.length,
    resIndex = 0,
    result = [];

  while (++index < length) {
    var value = array[index];
    if (predicate(value, index, array)) {
      result[resIndex++] = value;
    }
  }
  return result;
}
```

`arrayFilter` 函数内部是一个 `while` 循环，`index` 累加，会调用传入 `predicate` 函数，如果为真就将  `value` 赋值为 `result` 数组的第 `resIndex`，`resIndex` 累加，循环结束后将 `result` 返回。