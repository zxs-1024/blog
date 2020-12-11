## attempt

> 尝试调用函数，返回结果或者错误对象。任何附加的参数都会在调用时传给函数。

```js
_.attempt(func, [args])
```

```js
/**
 * Attempts to invoke `func`, returning either the result or the caught error
 * object. Any additional arguments are provided to `func` when it's invoked.
 *
 * @since 3.0.0
 * @category Util
 * @param {Function} func The function to attempt.
 * @param {...*} [args] The arguments to invoke `func` with.
 * @returns {*} Returns the `func` result or error object.
 * @example
 *
 * // Avoid throwing errors for invalid selectors.
 * const elements = attempt(selector =>
 *   document.querySelectorAll(selector), '>_>')
 *
 * if (isError(elements)) {
 *   elements = []
 * }
 */
function attempt(func, ...args) {
  try {
    return func.apply(undefined, args)
  } catch (e) {
    return isError(e) ? e : new Error(e)
  }
}
```

`attempt` 函数会接收 `func` 函数和 `args` 剩余参数，
这里会用 `try...catch` 包裹代码块，调用 `apply` 将 `this` 指向 `undefined` 并执行 `func`，如果抛出异常，就调用 `isError` 函数处理错误信息。

## bindAll

> 绑定对象的方法到对象本身，覆盖已存在的方法。 

```js
_.bindAll(object, methodNames)
```

```js
/**
  * Binds methods of an object to the object itself, overwriting the existing
  * method.
  *
  * **Note:** This method doesn't set the "length" property of bound functions.
  *
  * @static
  * @since 0.1.0
  * @memberOf _
  * @category Util
  * @param {Object} object The object to bind and assign the bound methods to.
  * @param {...(string|string[])} methodNames The object method names to bind.
  * @returns {Object} Returns `object`.
  * @example
  *
  * var view = {
  *   'label': 'docs',
  *   'click': function() {
  *     console.log('clicked ' + this.label);
  *   }
  * };
  *
  * _.bindAll(view, ['click']);
  * jQuery(element).on('click', view.click);
  * // => Logs 'clicked docs' when clicked.
  */
var bindAll = flatRest(function (object, methodNames) {
  arrayEach(methodNames, function (key) {
    key = toKey(key);
    baseAssignValue(object, key, bind(object[key], object));
  });
  return object;
});
```

`bindAll` 函数是调用 `flatRest` 后返回的函数，并且传入了回调函数，
在回调函数中会循环 `methodNames`，并且调用 `baseAssignValue` 函数实现属性的拷贝，这里会将原来的 `key` 的覆盖替换成 `bind(object[key], object)`，`bind` 会将 `object[key]` 的 `this` 绑定到 `object` 上。

## flatRest

```js
/**
  * Creates a function that invokes `func` with arguments arranged according
  * to the specified `indexes` where the argument value at the first index is
  * provided as the first argument, the argument value at the second index is
  * provided as the second argument, and so on.
  *
  * @static
  * @memberOf _
  * @since 3.0.0
  * @category Function
  * @param {Function} func The function to rearrange arguments for.
  * @param {...(number|number[])} indexes The arranged argument indexes.
  * @returns {Function} Returns the new function.
  * @example
  *
  * var rearged = _.rearg(function(a, b, c) {
  *   return [a, b, c];
  * }, [2, 0, 1]);
  *
  * rearged('b', 'c', 'a')
  * // => ['a', 'b', 'c']
  */
var rearg = flatRest(function (func, indexes) {
  return createWrap(func, WRAP_REARG_FLAG, undefined, undefined, undefined, indexes);
});
```

`flatRest` 函数是调用 `createWrap` 的返回，并且传入回调函数，在回调函数中，会返回调用 `createWrap` 函数的结果。

## flatRest

```js
/**
  * A specialized version of `baseRest` which flattens the rest array.
  *
  * @private
  * @param {Function} func The function to apply a rest parameter to.
  * @returns {Function} Returns the new function.
  */
function flatRest(func) {
  return setToString(overRest(func, undefined, flatten), func + '');
}
```

`flatRest` 会调用 `setToString` 函数，并且传入了 `overRest` 处理后 `func`。

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

`setToString` 是 `shortOut` 函数调用返回，并且传入了 `baseSetToString` 。

```js
/**
  * The base implementation of `setToString` without support for hot loop shorting.
  *
  * @private
  * @param {Function} func The function to modify.
  * @param {Function} string The `toString` result.
  * @returns {Function} Returns `func`.
  */
var baseSetToString = !defineProperty ? identity : function (func, string) {
  return defineProperty(func, 'toString', {
    'configurable': true,
    'enumerable': false,
    'value': constant(string),
    'writable': true
  });
};
```
如果支持 `defineProperty` 调用 `defineProperty` 为 `func` 添加 `toString` 属性，`value` 为 `constant(string)` 返回 `string` 的函数，否则赋值为 `identity` 函数，`identity` 会直接返回 `value`。

## cond

> 创建一个函数。 这个函数会遍历 pairs，并执行最先返回真值对应的函数，并绑定 this 及传入创建函数的参数。

```js
_.cond(pairs)
```

```js
/**
 * Creates a function that iterates over `pairs` and invokes the corresponding
 * function of the first predicate to return truthy. The predicate-function
 * pairs are invoked with the `this` binding and arguments of the created
 * function.
 *
 * @since 4.0.0
 * @category Util
 * @param {Array} pairs The predicate-function pairs.
 * @returns {Function} Returns the new composite function.
 * @example
 *
 * const func = cond([
 *   [matches({ 'a': 1 }),         () => 'matches A'],
 *   [conforms({ 'b': isNumber }), () => 'matches B'],
 *   [() => true,                  () => 'no match']
 * ])
 *
 * func({ 'a': 1, 'b': 2 })
 * // => 'matches A'
 *
 * func({ 'a': 0, 'b': 1 })
 * // => 'matches B'
 *
 * func({ 'a': '1', 'b': '2' })
 * // => 'no match'
 */
function cond(pairs) {
  const length = pairs == null ? 0 : pairs.length

  pairs = !length ? [] : map(pairs, (pair) => {
    if (typeof pair[1] != 'function') {
      throw new TypeError('Expected a function')
    }
    return [pair[0], pair[1]]
  })

  return (...args) => {
    for (const pair of pairs) {
      if (pair[0].apply(this, args)) {
        return pair[1].apply(this, args)
      }
    }
  }
}
```

`cond` 函数首先申明 `length` 变量获取 `pairs` 长度。默认为 0，接着调用 `map` 函数对 `pairs` 进行遍历， 判断 `pair[1]` 类型，如果不是 `function`，就抛出异常，这个主要是做预类型判断。

接着会返回一个 `fucntion`，在这个 `fucntion` 中会调用 `for...of` 循环 `pairs` 数组，如果 `pair[0]` 调用为真，就返回 `pair[1]` 的调用结果。

## conforms

> 创建一个函数。 这个函数会调用 source 的属性名对应的 predicate 与传入对象相对应属性名的值进行 predicate 处理。 如果都符合返回 true，否则返回 false。

```js
_.conforms(source)
```

```js
/** Used to compose bitmasks for cloning. */
const CLONE_DEEP_FLAG = 1

/**
 * Creates a function that invokes the predicate properties of `source` with
 * the corresponding property values of a given object, returning `true` if
 * all predicates return truthy, else `false`.
 *
 * **Note:** The created function is equivalent to `conformsTo` with
 * `source` partially applied.
 *
 * @since 4.0.0
 * @category Util
 * @param {Object} source The object of property predicates to conform to.
 * @returns {Function} Returns the new spec function.
 * @example
 *
 * const objects = [
 *   { 'a': 2, 'b': 1 },
 *   { 'a': 1, 'b': 2 }
 * ]
 *
 * filter(objects, conforms({ 'b': function(n) { return n > 1 } }))
 * // => [{ 'a': 1, 'b': 2 }]
 */
function conforms(source) {
  return baseConforms(baseClone(source, CLONE_DEEP_FLAG))
}
```

`conforms` 函数是 `baseConforms` 函数的返回函数，并且传入了 `baseClone` 函数处理的 `source`，调用 `baseClone` 函数时传入了 `CLONE_DEEP_FLAG` 深度为 1，只会进行浅拷拷贝。

## baseConforms

```js

/**
 * The base implementation of `conforms` which doesn't clone `source`.
 *
 * @private
 * @param {Object} source The object of property predicates to conform to.
 * @returns {Function} Returns the new spec function.
 */
function baseConforms(source) {
  const props = keys(source)
  return (object) => baseConformsTo(object, source, props)
}
```

`baseConforms` 函数首先会调用 `keys` 取出 `source` 的 `key` 数组 `props`，然后返回一个 `function`，调用这个函数会返回调用 `baseConformsTo` 的结果。

## baseConformsTo

```js
/**
 * The base implementation of `conformsTo` which accepts `props` to check.
 *
 * @private
 * @param {Object} object The object to inspect.
 * @param {Object} source The object of property predicates to conform to.
 * @returns {boolean} Returns `true` if `object` conforms, else `false`.
 */
function baseConformsTo(object, source, props) {
  let length = props.length
  if (object == null) {
    return !length
  }
  object = Object(object)
  while (length--) {
    const key = props[length]
    const predicate = source[key]
    const value = object[key]

    if ((value === undefined && !(key in object)) || !predicate(value)) {
      return false
    }
  }
  return true
}
```

`baseConformsTo` 函数中循环 `props`，并且在迭代中取出 `predicate` 函数，如果 `value` 为 `undefined` 并且 `object` 中没有对应的 `key` 或者调用 `predicate` 返回为 `false`，就 `return false`，循环结束后如果没有中断，返回 `true`。

## constant

> 创建一个返回 value 的函数

```js
_.constant(value)
```

```js
/**
  * Creates a function that returns `value`.
  *
  * @static
  * @memberOf _
  * @since 2.4.0
  * @category Util
  * @param {*} value The value to return from the new function.
  * @returns {Function} Returns the new constant function.
  * @example
  *
  * var objects = _.times(2, _.constant({ 'a': 1 }));
  *
  * console.log(objects);
  * // => [{ 'a': 1 }, { 'a': 1 }]
  *
  * console.log(objects[0] === objects[1]);
  * // => true
  */
function constant(value) {
  return function () {
    return value;
  };
}
```

调用 `constant` 函数会返回 `function`

```js
function () {
  return value;
}
```

调用这个 `function` 就会返回传入的 `value`。

## defaultTo

> 如果 value 为 NaN，null 或 undefined，则返回 defaultValue。

```js
_.defaultTo(value, defaultValue)
```

```js

/**
 * Checks `value` to determine whether a default value should be returned in
 * its place. The `defaultValue` is returned if `value` is `NaN`, `null`,
 * or `undefined`.
 *
 * @since 4.14.0
 * @category Util
 * @param {*} value The value to check.
 * @param {*} defaultValue The default value.
 * @returns {*} Returns the resolved value.
 * @example
 *
 * defaultTo(1, 10)
 * // => 1
 *
 * defaultTo(undefined, 10)
 * // => 10
 */
function defaultTo(value, defaultValue) {
  return (value == null || value !== value) ? defaultValue : value
}
```

`defaultTo` 函数会对 `value` 进行判断，等于 `null`、不是 `NaN`(不等于自身)，返回 `defaultValue` 默认值，否则返回 `value`。

## flow

> 创建一个函数。 返回的结果是调用提供函数的结果，this 会绑定到创建函数。 每一个连续调用，传入的参数都是前一个函数返回的结果。

```js
_.flow([funcs])
```

```js
/**
 * Composes a function that returns the result of invoking the given functions
 * with the `this` binding of the created function, where each successive
 * invocation is supplied the return value of the previous.
 *
 * @since 3.0.0
 * @category Util
 * @param {Function[]} [funcs] The functions to invoke.
 * @returns {Function} Returns the new composite function.
 * @see flowRight
 * @example
 *
 * function square(n) {
 *   return n * n
 * }
 *
 * const addSquare = flow([add, square])
 * addSquare(1, 2)
 * // => 9
 */
function flow(funcs) {
  const length = funcs ? funcs.length : 0
  let index = length
  while (index--) {
    if (typeof funcs[index] != 'function') {
      throw new TypeError('Expected a function')
    }
  }
  return function(...args) {
    let index = 0
    let result = length ? funcs[index].apply(this, args) : args[0]
    while (++index < length) {
      result = funcs[index].call(this, result)
    }
    return result
  }
}
```

`flow` 函数接收一个 `funcs` 数组，首席会申明 `length` 变量获取 `funcs` 长度，`index` 为 `length`。

进行 `while` 循环，`index` 累减，对 `func` 进行类型检测，如果不是 `function` 抛出异常。

最后返回一个 `function`，在 `function` 中，如果有 `length` 为真，调用 `funcs` 的第一个函数，将保存 到 `result` 上，接着进行 `while` 循环，`index` 累加，这里再次使用 `call` 调用 `funcs[index]` ，将 `result` 传入，将调用后的值赋值给 `result`，`result` 的值是前一个 `function` 的结果。

循环结束后将 `result` 返回。

## flowRight

> 这个方法类似 _.flow，除了它调用函数的顺序是从右往左的。

```js
_.flowRight([funcs])
```

```js
/**
 * This method is like `flow` except that it composes a function that
 * invokes the given functions from right to left.
 *
 * @since 3.0.0
 * @category Util
 * @param {Function[]} [funcs] The functions to invoke.
 * @returns {Function} Returns the new composite function.
 * @see flow
 * @example
 *
 * function square(n) {
 *   return n * n
 * }
 *
 * const addSquare = flowRight([square, add])
 * addSquare(1, 2)
 * // => 9
 */
function flowRight(funcs) {
  return flow(funcs.reverse())
}
```

`flowRight` 函数就是 `flow` 函数的包装，只是调用 `reverse` 将 `funcs` 数组进行反转。

## identity

> 这个方法返回首个提供的参数

```js
_.identity(value)
```

```js
/**
  * This method returns the first argument it receives.
  *
  * @static
  * @since 0.1.0
  * @memberOf _
  * @category Util
  * @param {*} value Any value.
  * @returns {*} Returns `value`.
  * @example
  *
  * var object = { 'a': 1 };
  *
  * console.log(_.identity(object) === object);
  * // => true
  */
function identity(value) {
  return value;
}
```

只是将传入的第一个参数返回。

## iteratee

> 创建一个调用 func 的函数。 如果 func 是一个属性名，传入包含这个属性名的对象，回调返回对应属性名的值。 如果 func 是一个对象，传入的元素有相同的对象属性，回调返回 true。 其他情况返回 false。

```js
/**
  * Creates a function that invokes `func` with the arguments of the created
  * function. If `func` is a property name, the created function returns the
  * property value for a given element. If `func` is an array or object, the
  * created function returns `true` for elements that contain the equivalent
  * source properties, otherwise it returns `false`.
  *
  * @static
  * @since 4.0.0
  * @memberOf _
  * @category Util
  * @param {*} [func=_.identity] The value to convert to a callback.
  * @returns {Function} Returns the callback.
  * @example
  */
function iteratee(func) {
  return baseIteratee(typeof func == 'function' ? func : baseClone(func, CLONE_DEEP_FLAG));
}
```

`iteratee` 函数是 `baseIteratee` 函数的返回，调用 `baseIteratee` 函数时会判断 `func` 类型，如果是 `func` 直接传入，否则调用 `baseClone` 将浅拷贝后的 `func` 传入。

## baseIteratee

```js
 /**
  * The base implementation of `_.iteratee`.
  *
  * @private
  * @param {*} [value=_.identity] The value to convert to an iteratee.
  * @returns {Function} Returns the iteratee.
  */
function baseIteratee(value) {
  // Don't store the `typeof` result in a variable to avoid a JIT bug in Safari 9.
  // See https://bugs.webkit.org/show_bug.cgi?id=156034 for more details.
  if (typeof value == 'function') {
    return value;
  }
  if (value == null) {
    return identity;
  }
  if (typeof value == 'object') {
    return isArray(value)
      ? baseMatchesProperty(value[0], value[1])
      : baseMatches(value);
  }
  return property(value);
}
```

`baseIteratee` 函数实现了一个基本的迭代器，这里会判断 `value` 类型如果是 `function`，直接返回 `value`。

如果 `value` 等于 `null`，返回一个 `identity` 函数，`identity` 用来返回传入第一个参数。

如果 `value` 是一个 `object`，这里会有一个 3 元表达式，`isArray` 判断是数组，返回调用 `baseMatchesProperty` 函数的结果。

```js
function baseMatchesProperty(path, srcValue) {
  if (isKey(path) && isStrictComparable(srcValue)) {
    return matchesStrictComparable(toKey(path), srcValue);
  }
  return function (object) {
    var objValue = get(object, path);
    return (objValue === undefined && objValue === srcValue)
      ? hasIn(object, path)
      : baseIsEqual(srcValue, objValue, COMPARE_PARTIAL_FLAG | COMPARE_UNORDERED_FLAG);
  };
}
```

`baseMatchesProperty` 函数会调用 `isKey` 判断是否是属性名，`isStrictComparable` 是否适用于全等判断，全部为真返回 `matchesStrictComparable` 函数调用。

```js
function matchesStrictComparable(key, srcValue) {
  return function (object) {
    if (object == null) {
      return false;
    }
    return object[key] === srcValue &&
      (srcValue !== undefined || (key in Object(object)));
  };
}
```

`matchesStrictComparable` 函数会返回一个 `function`，`function` 主要用来进行严等判断。

如果 `value` 不是数组，说明是对象，返回调用 `baseMatches` 函数的结果

```js
function baseMatches(source) {
    var matchData = getMatchData(source);
    if (matchData.length == 1 && matchData[0][2]) {
      return matchesStrictComparable(matchData[0][0], matchData[0][1]);
    }
    return function (object) {
      return object === source || baseIsMatch(object, source, matchData);
    };
  }
```

这里会调用 `getMatchData` 函数获取对象的属性名称、值和比较标志，返回一个数组

```js
function getMatchData(object) {
  var result = keys(object),
    length = result.length;

  while (length--) {
    var key = result[length],
      value = object[key];

    result[length] = [key, value, isStrictComparable(value)];
  }
  return result;
}
```

判断 `matchData.length == 1 && matchData[0][2]` 为真，就返回调用 `matchesStrictComparable` 函数的返回，否则就返回一个 `function` ，在 `function` 中会返回 `object === source` ，如果为 `false`，返回
`baseIsMatch` 函数的调用返回。

最后如果不满足已上类型，直接返回 `property` 函数的调用。

```js
function property(path) {
  return isKey(path) ? baseProperty(toKey(path)) : basePropertyDeep(path);
}
```

这里会调用 `isKey` 判断 `path` 如果是 `key` 属性，调用 `baseProperty` 函数并且传入 `toKey` 调用后的 `path`，`baseProperty` 函数会返回一个获取函数值的函数。

```js
function baseProperty(key) {
  return function (object) {
    return object == null ? undefined : object[key];
  };
}
```

`basePropertyDeep` 函数会返回 `function`，调用 `function` 后会返回 `baseGet` 函数的调用返回。

```js
function basePropertyDeep(path) {
    return function (object) {
      return baseGet(object, path);
    };
  }
```

返回一个 `function`，调用后返回 `baseGet` 调用结果。

```js
function baseGet(object, path) {
    path = castPath(path, object);

    var index = 0,
      length = path.length;

    while (object != null && index < length) {
      object = object[toKey(path[index++])];
    }
    return (index && index == length) ? object : undefined;
  }
```

`baseGet` 函数中会调用 `castPath` 取出 `path` 路径数组，申明起始 `index`，`length` 路径长度。

进行 `while` 循环，从 `object` 取出 `path` 对应 `value`，赋值给 `object`，知道循环结束，将 `object` 返回。

## matches

> 创建一个深比较的方法来比较给定的对象和 source 对象。 如果给定的对象拥有相同的属性值返回 true，否则返回 false 


```js
_.matches(source)
```

```js
/** Used to compose bitmasks for cloning. */
const CLONE_DEEP_FLAG = 1

/**
 * Creates a function that performs a partial deep comparison between a given
 * object and `source`, returning `true` if the given object has equivalent
 * property values, else `false`.
 *
 * **Note:** The created function is equivalent to `isMatch` with `source`
 * partially applied.
 *
 * Partial comparisons will match empty array and empty object `source`
 * values against any array or object value, respectively. See `isEqual`
 * for a list of supported value comparisons.
 *
 * @since 3.0.0
 * @category Util
 * @param {Object} source The object of property values to match.
 * @returns {Function} Returns the new spec function.
 * @example
 *
 * const objects = [
 *   { 'a': 1, 'b': 2, 'c': 3 },
 *   { 'a': 4, 'b': 5, 'c': 6 }
 * ]
 *
 * filter(objects, matches({ 'a': 4, 'c': 6 }))
 * // => [{ 'a': 4, 'b': 5, 'c': 6 }]
 */
function matches(source) {
  return baseMatches(baseClone(source, CLONE_DEEP_FLAG))
}
```

`matches` 函数是 `baseMatches` 函数的调用返回，传入 `baseMatches` 函数参数会调用 `baseClone` 函数进行浅拷贝。

## baseMatches

见 `iteratee` 的 `baseMatches` 部分。

## matchesProperty

> 创建一个深比较的方法来比较给定对象的 path 的值是否是 srcValue。 如果是返回 true，否则返回 false 

```js
_.matchesProperty(path, srcValue)
```

```js
/** Used to compose bitmasks for cloning. */
const CLONE_DEEP_FLAG = 1

/**
 * Creates a function that performs a partial deep comparison between the
 * value at `path` of a given object to `srcValue`, returning `true` if the
 * object value is equivalent, else `false`.
 *
 * **Note:** Partial comparisons will match empty array and empty object
 * `srcValue` values against any array or object value, respectively. See
 * `isEqual` for a list of supported value comparisons.
 *
 * @since 3.2.0
 * @category Util
 * @param {Array|string} path The path of the property to get.
 * @param {*} srcValue The value to match.
 * @returns {Function} Returns the new spec function.
 * @example
 *
 * const objects = [
 *   { 'a': 1, 'b': 2, 'c': 3 },
 *   { 'a': 4, 'b': 5, 'c': 6 }
 * ]
 *
 * find(objects, matchesProperty('a', 4))
 * // => { 'a': 4, 'b': 5, 'c': 6 }
 */
function matchesProperty(path, srcValue) {
  return baseMatchesProperty(path, baseClone(srcValue, CLONE_DEEP_FLAG))
}
```

`matchesProperty` 函数是调用 `baseMatchesProperty` 函数的返回函数，在此之前，会调用 `baseClone` 对象 `srcValue` 做一个属性浅拷贝，而 `baseMatchesProperty` 函数，在 `iteratee` 中提到，是 `matchesProperty` 函数的基本实现。

## method

> 创建一个调用给定对象 path 上的函数。 任何附加的参数都会传入这个调用函数中。

```js
_.method(path, [args])
```

```js
import invoke from './invoke.js'

/**
 * Creates a function that invokes the method at `path` of a given object.
 * Any additional arguments are provided to the invoked method.
 *
 * @since 3.7.0
 * @category Util
 * @param {Array|string} path The path of the method to invoke.
 * @param {Array} [args] The arguments to invoke the method with.
 * @returns {Function} Returns the new invoker function.
 * @example
 *
 * const objects = [
 *   { 'a': { 'b': () => 2 } },
 *   { 'a': { 'b': () => 1 } }
 * ]
 *
 * map(objects, method('a.b'))
 * // => [2, 1]
 *
 * map(objects, method(['a', 'b']))
 * // => [2, 1]
 */
function method(path, args) {
  return (object) => invoke(object, path, args)
}
```

`method` 函数会 `return` 一个 `function`，在这个 `function` 中，接收一个 `object` 入参，并且调用 `invoke` 函数，将 `object`、`path`、`args` 参数传入。

## invoke

```js
 /**
  * Invokes the method at `path` of `object`.
  *
  * @static
  * @memberOf _
  * @since 4.0.0
  * @category Object
  * @param {Object} object The object to query.
  * @param {Array|string} path The path of the method to invoke.
  * @param {...*} [args] The arguments to invoke the method with.
  * @returns {*} Returns the result of the invoked method.
  * @example
  *
  * var object = { 'a': [{ 'b': { 'c': [1, 2, 3, 4] } }] };
  *
  * _.invoke(object, 'a[0].b.c.slice', 1, 3);
  * // => [2, 3]
  */
var invoke = baseRest(baseInvoke);
```

`invoke` 函数是调用 `baseRest` 函数的返回函数，并传入 `baseInvoke` 函数。

## baseInvoke

```js
/**
  * The base implementation of `_.invoke` without support for individual
  * method arguments.
  *
  * @private
  * @param {Object} object The object to query.
  * @param {Array|string} path The path of the method to invoke.
  * @param {Array} args The arguments to invoke the method with.
  * @returns {*} Returns the result of the invoked method.
  */
function baseInvoke(object, path, args) {
  path = castPath(path, object);
  object = parent(object, path);
  var func = object == null ? object : object[toKey(last(path))];
  return func == null ? undefined : apply(func, object, args);
}
```

`baseInvoke` 函数调用 `castPath` 处理 `path` 得到 `path` 数组，调用 `parent` 获取 `object` 父级，这里会尝试获取 `path` 对应的 `object` 中的 `value`，然后返回一个 `apply` 将 `this` 指向 `object` 的 `func`。

## baseRest

`baseRest` 详见 `assign.md`

## methodOf

> 反向版 _.method。 这个创建一个函数调用给定 object 的 path 上的方法， 任何附加的参数都会传入这个调用函数中。

```js
_.methodOf(object, [args])
```

```js
import invoke from './invoke.js'

/**
 * The opposite of `method` this method creates a function that invokes
 * the method at a given path of `object`. Any additional arguments are
 * provided to the invoked method.
 *
 * @since 3.7.0
 * @category Util
 * @param {Object} object The object to query.
 * @param {Array} [args] The arguments to invoke the method with.
 * @returns {Function} Returns the new invoker function.
 * @example
 *
 * const array = times(3, i => () => i)
 * const object = { 'a': array, 'b': array, 'c': array }
 *
 * map(['a[2]', 'c[0]'], methodOf(object))
 * // => [2, 0]
 *
 * map([['a', '2'], ['c', '0']], methodOf(object))
 * // => [2, 0]f
 */
function methodOf(object, args) {
  return (path) => invoke(object, path, args)
}
```

`methodOf` 与 `method` 函数相似，只是传入的参数有所不同。

## mixin

> 添加来源对象自身的所有可枚举函数属性到目标对象。 如果 object 是个函数，那么函数方法将被添加到原型链上。 

```js
_.mixin([object=lodash], source, [options={}])
```

```js
/**
  * Adds all own enumerable string keyed function properties of a source
  * object to the destination object. If `object` is a function, then methods
  * are added to its prototype as well.
  *
  * **Note:** Use `_.runInContext` to create a pristine `lodash` function to
  * avoid conflicts caused by modifying the original.
  *
  * @static
  * @since 0.1.0
  * @memberOf _
  * @category Util
  * @param {Function|Object} [object=lodash] The destination object.
  * @param {Object} source The object of functions to add.
  * @param {Object} [options={}] The options object.
  * @param {boolean} [options.chain=true] Specify whether mixins are chainable.
  * @returns {Function|Object} Returns `object`.
  * @example
  *
  * function vowels(string) {
  *   return _.filter(string, function(v) {
  *     return /[aeiou]/i.test(v);
  *   });
  * }
  *
  * _.mixin({ 'vowels': vowels });
  * _.vowels('fred');
  * // => ['e']
  *
  * _('fred').vowels().value();
  * // => ['e']
  *
  * _.mixin({ 'vowels': vowels }, { 'chain': false });
  * _('fred').vowels();
  * // => ['e']
  */
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

详见 `Seq.md`

## noConflict

> 释放 _ 为原来的值，并返回一个 lodash 的引用

```js
_.noConflict()
```

```js
/**
  * Reverts the `_` variable to its previous value and returns a reference to
  * the `lodash` function.
  *
  * @static
  * @since 0.1.0
  * @memberOf _
  * @category Util
  * @returns {Function} Returns the `lodash` function.
  * @example
  *
  * var lodash = _.noConflict();
  */
function noConflict() {
  if (root._ === this) {
    root._ = oldDash;
  }
  return this;
}
```

调用 `noConflict` 函数后首先会判断 `root._` 是否与 `this` 全等，如果全等将 `root._` 设置为 `oldDash`，然后再返回 `this`。

```js
var oldDash = root._;
```

## noop

> 无论传递什么参数，都返回 undefined。

```js
/**
  * This method returns `undefined`.
  *
  * @static
  * @memberOf _
  * @since 2.3.0
  * @category Util
  * @example
  *
  * _.times(2, _.noop);
  * // => [undefined, undefined]
  */
function noop() {
  // No operation performed.
}
```

一个空的函数而已。

## nthArg

> 创建一个返回第 N 个参数的函数。

```js
_.nthArg([n=0])
```

```js
/**
 * Creates a function that gets the argument at index `n`. If `n` is negative,
 * the nth argument from the end is returned.
 *
 * @since 4.0.0
 * @category Util
 * @param {number} [n=0] The index of the argument to return.
 * @returns {Function} Returns the new pass-thru function.
 * @example
 *
 * const func = nthArg(1)
 * func('a', 'b', 'c', 'd')
 * // => 'b'
 *
 * const func = nthArg(-2)
 * func('a', 'b', 'c', 'd')
 * // => 'c'
 */
function nthArg(n) {
  return (...args) => nth(args, n)
}
```

`nthArg` 函数返回一个 `function`，这个 `function` 接收 `args` 数组参数，返回调用 `nth` 函数后的结果。

## nth

```js
/**
  * Gets the element at index `n` of `array`. If `n` is negative, the nth
  * element from the end is returned.
  *
  * @static
  * @memberOf _
  * @since 4.11.0
  * @category Array
  * @param {Array} array The array to query.
  * @param {number} [n=0] The index of the element to return.
  * @returns {*} Returns the nth element of `array`.
  * @example
  *
  * var array = ['a', 'b', 'c', 'd'];
  *
  * _.nth(array, 1);
  * // => 'b'
  *
  * _.nth(array, -2);
  * // => 'c';
  */
function nth(array, n) {
  return (array && array.length) ? baseNth(array, toInteger(n)) : undefined;
}
```

`nth` 函数会判读 `array` 是是否为有效数组，如果是调用 `baseNth` 函数，将调用结果返回，否则返回 `undefined`。

## baseNth

```js
/**
  * The base implementation of `_.nth` which doesn't coerce arguments.
  *
  * @private
  * @param {Array} array The array to query.
  * @param {number} n The index of the element to return.
  * @returns {*} Returns the nth element of `array`.
  */
function baseNth(array, n) {
  var length = array.length;
  if (!length) {
    return;
  }
  n += n < 0 ? length : 0;
  return isIndex(n, length) ? array[n] : undefined;
}
```

`baseNth` 函数会返回数组对应的 `n` 个，如果没有就返回 `undefined`。

## over 

> 创建一个传入提供的参数的函数并调用 iteratees 返回结果的函数。

```js
_.over([iteratees=[_.identity]])
```

```js
/**
 * Creates a function that invokes `iteratees` with the arguments it receives
 * and returns their results.
 *
 * @since 4.0.0
 * @category Util
 * @param {Function[]} [iteratees=[identity]]
 *  The iteratees to invoke.
 * @returns {Function} Returns the new function.
 * @example
 *
 * const func = over([Math.max, Math.min])
 *
 * func(1, 2, 3, 4)
 * // => [4, 1]
 */
function over(iteratees) {
  return function(...args) {
    return map(iteratees, (iteratee) => iteratee.apply(this, args))
  }
}
```

`over` 函数会返回一个 `function`，这个 `function` 内部保存第一次调用 `over` 传入的 `iteratees`  函数。

以例子中 `func` 函数来说：

```js
var func = _.over([Math.max, Math.min]);
```

此时 `func` 函数就是这个 `return` 的 `function`：

```js
function(...args) {
  return map(iteratees, (iteratee) => iteratee.apply(this, args))
}
```

此时这个 `func` 函数中的 `args` 就是 `[Math.max, Math.min]`，`func` 函数会返回调用 `map` 函数后的数组，这个数组是调用 `Math.max(args)`、`Math.min(args)` 通过 `map` 组合成的数组。

## overEvery

> 创建一个传入提供的参数的函数并调用 iteratees 判断是否 全部 都为真值的函数。

```js
_.overEvery([predicates=[_.identity]])
```
```js
/**
 * Creates a function that checks if **all** of the `predicates` return
 * truthy when invoked with the arguments it receives.
 *
 * @since 4.0.0
 * @category Util
 * @param {Function[]} [predicates=[identity]]
 *  The predicates to check.
 * @returns {Function} Returns the new function.
 * @example
 *
 * const func = overEvery([Boolean, isFinite])
 *
 * func('1')
 * // => true
 *
 * func(null)
 * // => false
 *
 * func(NaN)
 * // => false
 */
function overEvery(iteratees) {
  return function(...args) {
    return every(iteratees, (iteratee) => iteratee.apply(this, args))
  }
}
```

`overEvery` 函数与 `over` 函数相似，只不过是将调用 `map` 改为了 `every` 函数而已。

## overSome

> 创建一个传入提供的参数的函数并调用 iteratees 判断是否 存在 有真值的函数。

```js
_.overSome([predicates=[_.identity]])
```

```js
/**
 * Creates a function that checks if **any** of the `predicates` return
 * truthy when invoked with the arguments it receives.
 *
 * @since 4.0.0
 * @category Util
 * @param {Function[]} [predicates=[identity]]
 *  The predicates to check.
 * @returns {Function} Returns the new function.
 * @example
 *
 * const func = overSome([Boolean, isFinite])
 *
 * func('1')
 * // => true
 *
 * func(null)
 * // => true
 *
 * func(NaN)
 * // => false
 */
function overSome(iteratees) {
  return function(...args) {
    return some(iteratees, (iteratee) => iteratee.apply(this, args))
  }
}
```

`overSome` 函数与 `over` 函数相似，只不过是将调用 `map` 改为了 `some` 函数而已。

## property

> 创建一个返回给定对象的 path 的值的函数。

```js
_.property(path)
```

```js
/**
 * Creates a function that returns the value at `path` of a given object.
 *
 * @since 2.4.0
 * @category Util
 * @param {Array|string} path The path of the property to get.
 * @returns {Function} Returns the new accessor function.
 * @example
 *
 * const objects = [
 *   { 'a': { 'b': 2 } },
 *   { 'a': { 'b': 1 } }
 * ]
 *
 * map(objects, property('a.b'))
 * // => [2, 1]
 *
 * map(sortBy(objects, property(['a', 'b'])), 'a.b')
 * // => [1, 2]
 */
function property(path) {
  return isKey(path) ? baseProperty(toKey(path)) : basePropertyDeep(path)
}
```

这里会调用 `isKey` 判断 `path` 如果是 `key` 属性，调用 `baseProperty` 函数并且传入 `toKey` 调用后的 `path`，`baseProperty` 函数会返回一个获取函数值的函数。

```js
function baseProperty(key) {
  return function (object) {
    return object == null ? undefined : object[key];
  };
}
```

`basePropertyDeep` 函数会返回 `function`，调用 `function` 后会返回 `baseGet` 函数的调用返回

```js
function basePropertyDeep(path) {
    return function (object) {
      return baseGet(object, path);
    };
  }
```

```js
function baseGet(object, path) {
    path = castPath(path, object);

    var index = 0,
      length = path.length;

    while (object != null && index < length) {
      object = object[toKey(path[index++])];
    }
    return (index && index == length) ? object : undefined;
  }
```

`baseGet` 函数取出 `path`，`while` 循环从 `object` 取出 `path` 对应值。

## propertyOf

> 反向版 _.property。 这个方法创建的函数返回给定 path 在对象上的值。

```js
_.propertyOf(object)
```

```js
/**
 * The opposite of `property`s method creates a function that returns
 * the value at a given path of `object`.
 *
 * @since 3.0.0
 * @category Util
 * @param {Object} object The object to query.
 * @returns {Function} Returns the new accessor function.
 * @example
 *
 * const array = [0, 1, 2]
 * const object = { 'a': array, 'b': array, 'c': array }
 *
 * map(['a[2]', 'c[0]'], propertyOf(object))
 * // => [2, 0]
 *
 * map([['a', '2'], ['c', '0']], propertyOf(object))
 * // => [2, 0]
 */
function propertyOf(object) {
  return (path) => object == null ? undefined : baseGet(object, path)
}
```

`propertyOf` 函数返回一个 `function`，该 `function` 接收一个 `path` 路径，返回一个 3 元表达式，如果 `object` 等于 `null`，返回 `undefined`，否则返回 `baseGet` 函数函数调用。

## range

> 创建一个包含从 start 到 end，但不包含 end 本身范围数字的数组。 如果 start 是负数，而 end 或 step 没有指定，那么 step 从 -1 为开始。 如果 end 没有指定，start 设置为 0。 如果 end 小于 start，会创建一个空数组，除非指定了 step。 

```js
_.range([start=0], end, [step=1])
```

```js
/**
 * Creates an array of numbers (positive and/or negative) progressing from
 * `start` up to, but not including, `end`. A step of `-1` is used if a negative
 * `start` is specified without an `end` or `step`. If `end` is not specified,
 * it's set to `start`, and `start` is then set to `0`.
 *
 * **Note:** JavaScript follows the IEEE-754 standard for resolving
 * floating-point values which can produce unexpected results.
 *
 * @since 0.1.0
 * @category Util
 * @param {number} [start=0] The start of the range.
 * @param {number} end The end of the range.
 * @param {number} [step=1] The value to increment or decrement by.
 * @returns {Array} Returns the range of numbers.
 * @see inRange, rangeRight
 * @example
 *
 * range(4)
 * // => [0, 1, 2, 3]
 *
 * range(-4)
 * // => [0, -1, -2, -3]
 *
 * range(1, 5)
 * // => [1, 2, 3, 4]
 *
 * range(0, 20, 5)
 * // => [0, 5, 10, 15]
 *
 * range(0, -4, -1)
 * // => [0, -1, -2, -3]
 *
 * range(1, 4, 0)
 * // => [1, 1, 1]
 *
 * range(0)
 * // => []
 */
const range = createRange()
```

`range` 函数是调用 `createRange` 函数返回的函数。

## createRange

```js
/**
 * Creates a `range` or `rangeRight` function.
 *
 * @private
 * @param {boolean} [fromRight] Specify iterating from right to left.
 * @returns {Function} Returns the new range function.
 */
function createRange(fromRight) {
  return (start, end, step) => {
    // Ensure the sign of `-0` is preserved.
    start = toFinite(start)
    if (end === undefined) {
      end = start
      start = 0
    } else {
      end = toFinite(end)
    }
    step = step === undefined ? (start < end ? 1 : -1) : toFinite(step)
    return baseRange(start, end, step, fromRight)
  }
}
```

`createRange` 函数会 `return` 一个 `function`。

此函数接收 3 个函数，首先会调用 `toFinite` 处理 `start` 为有限数，如果 `end` 等于 `undefined`，将 `start` 赋值给 `end`，`start` 赋值为 0，否则将 `end` 转化为有限数，这里主要是做参数的处理。

接着是处理增量 `step`，最后返回 `baseRange` 函数的调用返回。

## baseRange

```js
/**
  * The base implementation of `_.range` and `_.rangeRight` which doesn't
  * coerce arguments.
  *
  * @private
  * @param {number} start The start of the range.
  * @param {number} end The end of the range.
  * @param {number} step The value to increment or decrement by.
  * @param {boolean} [fromRight] Specify iterating from right to left.
  * @returns {Array} Returns the range of numbers.
  */
function baseRange(start, end, step, fromRight) {
  var index = -1,
    length = nativeMax(nativeCeil((end - start) / (step || 1)), 0),
    result = Array(length);

  while (length--) {
    result[fromRight ? length : ++index] = start;
    start += step;
  }
  return result;
}
```

`baseRange` 函数首先是申明一些初始变量，接着会进入 `while` 循环，这里会根据传入的 `fromRight` 返回升序或者降序，`length` 累减，`start += step` 累加，最后将 `result` 返回。

## rangeRight

> 这个方法类似 _.range， 除了它是降序生成值的。

```js
_.rangeRight([start=0], end, [step=1])
```

```js

/**
 * This method is like `range` except that it populates values in
 * descending order.
 *
 * @since 4.0.0
 * @category Util
 * @param {number} [start=0] The start of the range.
 * @param {number} end The end of the range.
 * @param {number} [step=1] The value to increment or decrement by.
 * @returns {Array} Returns the range of numbers.
 * @see inRange, range
 * @example
 *
 * rangeRight(4)
 * // => [3, 2, 1, 0]
 *
 * rangeRight(-4)
 * // => [-3, -2, -1, 0]
 *
 * rangeRight(1, 5)
 * // => [4, 3, 2, 1]
 *
 * rangeRight(0, 20, 5)
 * // => [15, 10, 5, 0]
 *
 * rangeRight(0, -4, -1)
 * // => [-3, -2, -1, 0]
 *
 * rangeRight(1, 4, 0)
 * // => [1, 1, 1]
 *
 * rangeRight(0)
 * // => []
 */
const rangeRight = createRange(true)
```

`rangeRight` 函数是调用 `createRange` 函数返回的函数，与 `range` 不同的是传入了 `true` 作为参数，而在`createRange` 函数中会根据 `fromRight` 变量以升序降序排列返回数组。

## runInContext

> 创建一个给定上下文对象的原始的 lodash 函数。

```js
_.runInContext([context=root])
```

```js
/**
  * Create a new pristine `lodash` function using the `context` object.
  *
  * @static
  * @memberOf _
  * @since 1.1.0
  * @category Util
  * @param {Object} [context=root] The context object.
  * @returns {Function} Returns a new `lodash` function.
  * @example
  *
  * _.mixin({ 'foo': _.constant('foo') });
  *
  * var lodash = _.runInContext();
  * lodash.mixin({ 'bar': lodash.constant('bar') });
  *
  * _.isFunction(_.foo);
  * // => true
  * _.isFunction(_.bar);
  * // => false
  *
  * lodash.isFunction(lodash.foo);
  * // => false
  * lodash.isFunction(lodash.bar);
  * // => true
  *
  * // Create a suped-up `defer` in Node.js.
  * var defer = _.runInContext({ 'setTimeout': setImmediate }).defer;
  */
var runInContext = (function runInContext(context) {
  context = context == null ? root : _.defaults(root.Object(), context, _.pick(root, contextProps));
  ...
  return lodash;
}
```

`runInContext` 返回了整个 `Lodash` 函数。

## stubArray

> 此方法返回一个新的空数组。

```js
_.stubArray()
```

```js
/**
  * This method returns a new empty array.
  *
  * @static
  * @memberOf _
  * @since 4.13.0
  * @category Util
  * @returns {Array} Returns the new empty array.
  * @example
  *
  * var arrays = _.times(2, _.stubArray);
  *
  * console.log(arrays);
  * // => [[], []]
  *
  * console.log(arrays[0] === arrays[1]);
  * // => false
  */
function stubArray() {
  return [];
}
```

真的是返回一个空数组。

## stubFalse

> 此方法返回 false。

```js
_.stubFalse()
```

```js
/**
  * This method returns `false`.
  *
  * @static
  * @memberOf _
  * @since 4.13.0
  * @category Util
  * @returns {boolean} Returns `false`.
  * @example
  *
  * _.times(2, _.stubFalse);
  * // => [false, false]
  */
function stubFalse() {
  return false;
}
```

真的是返回一个 `false`。

## stubObject

> 此方法返回一个新的空对象。

```js
_.stubObject()
```

```js
/**
  * This method returns a new empty object.
  *
  * @static
  * @memberOf _
  * @since 4.13.0
  * @category Util
  * @returns {Object} Returns the new empty object.
  * @example
  *
  * var objects = _.times(2, _.stubObject);
  *
  * console.log(objects);
  * // => [{}, {}]
  *
  * console.log(objects[0] === objects[1]);
  * // => false
  */
function stubObject() {
  return {};
}
```

真的是返回一个 `{}`。

## stubString

> 此方法返回一个空字符串。

```js
_.stubString()
```

```js
/**
  * This method returns an empty string.
  *
  * @static
  * @memberOf _
  * @since 4.13.0
  * @category Util
  * @returns {string} Returns the empty string.
  * @example
  *
  * _.times(2, _.stubString);
  * // => ['', '']
  */
function stubString() {
  return '';
}
```

真的是返回一个 `''`。

## stubTrue

> 此方法返回 true 。

```js
_.stubTrue()
```

```js
/**
  * This method returns `true`.
  *
  * @static
  * @memberOf _
  * @since 4.13.0
  * @category Util
  * @returns {boolean} Returns `true`.
  * @example
  *
  * _.times(2, _.stubTrue);
  * // => [true, true]
  */
function stubTrue() {
  return true;
}
```

真的是返回一个 `true`。

## times

> 调用 iteratee N 次，每次调用返回的结果存入到数组中。 iteratee 会传入1个参数：(index)。

```js
_.times(n, [iteratee=_.identity])
```

```js
/**
 * Invokes the iteratee `n` times, returning an array of the results of
 * each invocation. The iteratee is invoked with one argumentindex).
 *
 * @since 0.1.0
 * @category Util
 * @param {number} n The number of times to invoke `iteratee`.
 * @param {Function} iteratee The function invoked per iteration.
 * @returns {Array} Returns the array of results.
 * @example
 *
 * times(3, String)
 * // => ['0', '1', '2']
 *
 *  times(4, () => 0)
 * // => [0, 0, 0, 0]
 */
function times(n, iteratee) {
  if (n < 1 || n > MAX_SAFE_INTEGER) {
    return []
  }
  let index = -1
  const length = Math.min(n, MAX_ARRAY_LENGTH)
  const result = new Array(length)
  while (++index < length) {
    result[index] = iteratee(index)
  }
  index = MAX_ARRAY_LENGTH
  n -= MAX_ARRAY_LENGTH
  while (++index < n) {
    iteratee(index)
  }
  return result
}
```

`times` 函数接收 2 个参数，`n` 调用函数次数、`iteratee` 迭代函数。

首选会对 `n` 做限制，小于 0 或者大于 `MAX_SAFE_INTEGER` 返回 `[]`，

```js
/** Used as references for various `Number` constants. */
const MAX_SAFE_INTEGER = 9007199254740991

/** Used as references for the maximum length and index of an array. */
const MAX_ARRAY_LENGTH = 4294967295
```

接着从 `n` 与 `MAX_ARRAY_LENGTH` 数组最大长度取最小值，申明一个 `length` 长度的数组 `result`，用来保存结果。

随后进入 `while` 循环， `index` 累加，不断调用 `iteratee` 迭代函数，将结果赋值给 `result` 的第 `index` 个。

```js
index = MAX_ARRAY_LENGTH
n -= MAX_ARRAY_LENGTH
while (++index < n) {
  iteratee(index)
}
```

循环结束后会将 `index` 赋值为 `MAX_ARRAY_LENGTH`，`n` 赋值为减等于 `MAX_ARRAY_LENGTH`，

最后将循环后的数组返回。

## toPath

> 创建 value 为属性路径的数组。

```js
_.toPath(value)
```

```js
/**
 * Converts `value` to a property path array.
 *
 * @since 4.0.0
 * @category Util
 * @param {*} value The value to convert.
 * @returns {Array} Returns the new property path array.
 * @example
 *
 * toPath('a.b.c')
 * // => ['a', 'b', 'c']
 *
 * toPath('a[0].b.c')
 * // => ['a', '0', 'b', 'c']
 */
function toPath(value) {
  if (Array.isArray(value)) {
    return map(value, toKey)
  }
  return isSymbol(value) ? [value] : copyArray(stringToPath(value))
}
```

`toPath` 函数首先会判断 `value` 是否为数组，如果是数组返回调用 `map` 函数返回的数组。

否则返回一个 3 元表达式，如果是 `Symbol` 类型，将 `value` 包装成数组返回，否则就返回调用 `copyArray` 函数进行数组复制，并且传入 `stringToPath` 函数处理后的 `value`，将 `value` 转换为属性路径数组。

## uniqueId

> 创建唯一ID。 如果提供了 prefix，会被添加到ID前缀上。

```js
_.uniqueId([prefix=''])
```

```js
/** Used to generate unique IDs. */
const idCounter = {}

/**
 * Generates a unique ID. If `prefix` is given, the ID is appended to it.
 *
 * @since 0.1.0
 * @category Util
 * @param {string} [prefix=''] The value to prefix the ID with.
 * @returns {string} Returns the unique ID.
 * @see random
 * @example
 *
 * uniqueId('contact_')
 * // => 'contact_104'
 *
 * uniqueId()
 * // => '105'
 */
function uniqueId(prefix='$lodash$') {
  if (!idCounter[prefix]) {
    idCounter[prefix] = 0
  }

  const id =++idCounter[prefix]
  if (prefix === '$lodash$') {
    return `${id}`
  }

  return `${prefix + id}`
}
```

`uniqueId` 接收一个 `prefix`，默认为 `$lodash$`。

如果 `idCounter` 对象中没有有 `prefix` 对应的键值，就赋值为 0，
否则将 `++idCounter[prefix]`，得到累加后的 `id`，判断 `prefix` 等于 `$lodash$` ，直接返回 `id`，否则返回 `prefix + id` 拼接 `prefix` 后的 `id`。


