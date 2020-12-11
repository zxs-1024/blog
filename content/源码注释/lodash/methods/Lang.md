## castArray

> 如果 value 不是数组, 那么强制转为数组。

```js
_.castArray(value)
```

```js
/**
 * Casts `value` as an array if it's not one.
 *
 * @since 4.4.0
 * @category Lang
 * @param {*} value The value to inspect.
 * @returns {Array} Returns the cast array.
 * @example
 *
 * castArray(1)
 * // => [1]
 *
 * castArray({ 'a': 1 })
 * // => [{ 'a': 1 }]
 *
 * castArray('abc')
 * // => ['abc']
 *
 * castArray(null)
 * // => [null]
 *
 * castArray(undefined)
 * // => [undefined]
 *
 * castArray()
 * // => []
 *
 * const array = [1, 2, 3]
 * console.log(castArray(array) === array)
 * // => true
 */
function castArray(...args) {
  if (!args.length) {
    return []
  }
  const value = args[0]
  return Array.isArray(value) ? value : [value]
}
```

`castArray` 接收 `args` 参数数组，如果没有 `length`，返回空数组。

然后申明 `value` 获取 `args[0]` ，调用 `Array.isArray` 函数判断 `value` 是否为数组，不是就使用 `[]` 包装成数组，然后返回。

## eq

> 执行 SameValueZero 比较两者的值确定它们是否相等。

```js
_.eq(value, other)
```

```js
/**
 * Performs a
 * [`SameValueZero`](http://ecma-international.org/ecma-262/7.0/#sec-samevaluezero)
 * comparison between two values to determine if they are equivalent.
 *
 * @since 4.0.0
 * @category Lang
 * @param {*} value The value to compare.
 * @param {*} other The other value to compare.
 * @returns {boolean} Returns `true` if the values are equivalent, else `false`.
 * @example
 *
 * const object = { 'a': 1 }
 * const other = { 'a': 1 }
 *
 * eq(object, object)
 * // => true
 *
 * eq(object, other)
 * // => false
 *
 * eq('a', 'a')
 * // => true
 *
 * eq('a', Object('a'))
 * // => false
 *
 * eq(NaN, NaN)
 * // => true
 */
function eq(value, other) {
  return value === other || (value !== value && other !== other)
}
```

`eq` 接收 2 个比较的参数，使用 `===` 判断是否全等，并且根据 `NaN` 不等于自身，排除 2 个参数是 `NaN` 的情况。

## gt

> 检查 value 是否大于 other

```js
_.gt(value, other)
```

```js

/**
 * Checks if `value` is greater than `other`.
 *
 * @since 3.9.0
 * @category Lang
 * @param {*} value The value to compare.
 * @param {*} other The other value to compare.
 * @returns {boolean} Returns `true` if `value` is greater than `other`,
 *  else `false`.
 * @see gte, lt, lte
 * @example
 *
 * gt(3, 1)
 * // => true
 *
 * gt(3, 3)
 * // => false
 *
 * gt(1, 3)
 * // => false
 */
function gt(value, other) {
  if (!(typeof value == 'string' && typeof other == 'string')) {
    value = +value
    other = +other
  }
  return value > other
}
```

`gt` 首先会进行类型的判断，如果当 `value` 、`other` 都为字符串时，为防止字符串拼接，使用 `+` 转化为数字，当只有一个字符串时使用 `>` 有会隐式转换的效果，将另一个不是数字的 `value` 转化为数字，返回比较后的 `Boolean`。

## gte

> 检查 value 是否大于等于 other。

```js
/**
 * Checks if `value` is greater than or equal to `other`.
 *
 * @since 3.9.0
 * @category Lang
 * @param {*} value The value to compare.
 * @param {*} other The other value to compare.
 * @returns {boolean} Returns `true` if `value` is greater than or equal to
 *  `other`, else `false`.
 * @see gt, lt, lte
 * @example
 *
 * gte(3, 1)
 * // => true
 *
 * gte(3, 3)
 * // => true
 *
 * gte(1, 3)
 * // => false
 */
function gte(value, other) {
  if (!(typeof value == 'string' && typeof other == 'string')) {
    value = +value
    other = +other
  }
  return value >= other
}
```

`gte` 与 `gt` 实现一致，返回 `value >= other` 。

## lt

> 检查 value 是否是 小于 other。

```js
_.lt(value, other)
```

```js
/**
 * Checks if `value` is less than `other`.
 *
 * @since 3.9.0
 * @category Lang
 * @param {*} value The value to compare.
 * @param {*} other The other value to compare.
 * @returns {boolean} Returns `true` if `value` is less than `other`,
 *  else `false`.
 * @see gt, gte, lte
 * @example
 *
 * lt(1, 3)
 * // => true
 *
 * lt(3, 3)
 * // => false
 *
 * lt(3, 1)
 * // => false
 */
function lt(value, other) {
  if (!(typeof value == 'string' && typeof other == 'string')) {
    value = +value
    other = +other
  }
  return value < other
}
```

与 `gt` 实现基本一致，返回 `value > other`。

## lte

> 检查 value 是否是 小于等于 other.

```js
_.lte(value, other)
```

```js
/**
 * Checks if `value` is less than or equal to `other`.
 *
 * @since 3.9.0
 * @category Lang
 * @param {*} value The value to compare.
 * @param {*} other The other value to compare.
 * @returns {boolean} Returns `true` if `value` is less than or equal to
 *  `other`, else `false`.
 * @see gt, gte, lt
 * @example
 *
 * lte(1, 3)
 * // => true
 *
 * lte(3, 3)
 * // => true
 *
 * lte(3, 1)
 * // => false
 */
function lte(value, other) {
  if (!(typeof value == 'string' && typeof other == 'string')) {
    value = +value
    other = +other
  }
  return value <= other
}
```

与 `gt` 实现基本一致，返回 `value <= other`。

## isArguments

> 检查 value 是否是 类 arguments 对象。

```js
_.isArguments(value)
```

```js
/**
 * Checks if `value` is likely an `arguments` object.
 *
 * @since 0.1.0
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is an `arguments` object, else `false`.
 * @example
 *
 * isArguments(function() { return arguments }())
 * // => true
 *
 * isArguments([1, 2, 3])
 * // => false
 */
function isArguments(value) {
  return isObjectLike(value) && getTag(value) == '[object Arguments]'
}
```

`isArguments` 函数内部会调用 `isObjectLike` 判断 `value` 是对象，并且调用 `getTag` 方法判断类型字符串等于 `[object Arguments]`。

## isArray

> 检查 value 是否是 Array 类对象。

```js
_.isArray(value)
```

```js
var isArray = Array.isArray;
```

就是对原生数组方法 `Array.isArray` 的引用。

## isArrayBuffer

> 检查 value 是否是 ArrayBuffer 对象。

```js
_.isArrayBuffer(value)
```

```js
/* Node.js helper references. */
const nodeIsArrayBuffer = nodeTypes && nodeTypes.isArrayBuffer

/**
 * Checks if `value` is classified as an `ArrayBuffer` object.
 *
 * @since 4.3.0
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is an array buffer, else `false`.
 * @example
 *
 * isArrayBuffer(new ArrayBuffer(2))
 * // => true
 *
 * isArrayBuffer(new Array(2))
 * // => false
 */
const isArrayBuffer = nodeIsArrayBuffer
  ? (value) => nodeIsArrayBuffer(value)
  : (value) => isObjectLike(value) && baseGetTag(value) == '[object ArrayBuffer]'
```

`isArrayBuffer` 是一个三元表达式，根据 `nodeIsArrayBuffer` 判断是否是 `node` 环境，就调用 `nodeIsArrayBuffer` 方法，如果不是 `node` 说明是浏览器环境，判断 `value` 是对象并且调用 `baseGetTag` 返回的对象字符串是等于 `[object ArrayBuffer]`。


## isArrayLike

> 检查 `value` 是否是类数组。

```js
/**
 * Checks if `value` is array-like. A value is considered array-like if it's
 * not a function and has a `value.length` that's an integer greater than or
 * equal to `0` and less than or equal to `Number.MAX_SAFE_INTEGER`.
 *
 * @since 4.0.0
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is array-like, else `false`.
 * @example
 *
 * isArrayLike([1, 2, 3])
 * // => true
 *
 * isArrayLike(document.body.children)
 * // => true
 *
 * isArrayLike('abc')
 * // => true
 *
 * isArrayLike(Function)
 * // => false
 */
function isArrayLike(value) {
  return value != null && typeof value != 'function' && isLength(value.length)
}
```

`isArrayLike` 接收 `value` 作为参数，判断 `value` 不等于 `null` 并且类型不为 `function`，并且通过 `isLength` 判断 `value` 是一个有效的数组长度。

## isArrayLikeObject

> 这个方法类似 _.isArrayLike，除了它还检查值是否是个对象。

```js
/**
 * This method is like `isArrayLike` except that it also checks if `value`
 * is an object.
 *
 * @since 4.0.0
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is an array-like object,
 *  else `false`.
 * @example
 *
 * isArrayLikeObject([1, 2, 3])
 * // => true
 *
 * isArrayLikeObject(document.body.children)
 * // => true
 *
 * isArrayLikeObject('abc')
 * // => false
 *
 * isArrayLikeObject(Function)
 * // => false
 */
function isArrayLikeObject(value) {
  return isObjectLike(value) && isArrayLike(value)
}
```

`isArrayLikeObject` 接收 `value` 作为参数，通过 `isObjectLike` 和 `isArrayLike` 判断 `value` 是对象并且是一个数组。

## isBoolean

> 检查 value 是否是原始 boolean 类型或者对象。

```js
_.isBoolean(value)
```

```js
/**
 * Checks if `value` is classified as a boolean primitive or object.
 *
 * @since 0.1.0
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is a boolean, else `false`.
 * @example
 *
 * isBoolean(false)
 * // => true
 *
 * isBoolean(null)
 * // => false
 */
function isBoolean(value) {
  return value === true || value === false ||
    (isObjectLike(value) && baseGetTag(value) == '[object Boolean]')
}
```

`isBoolean` 函数内部会调用 `isObjectLike` 判断 `value` 是对象，并且调用 `getTag` 方法判断类型字符串等于 `'[object Boolean]'`。

## isBuffer

> 检查 value 是否是个 buffer

```js
_.isBuffer(value)
```

```js
/** Detect free variable `exports`. */
const freeExports = typeof exports == 'object' && exports !== null && !exports.nodeType && exports

/** Detect free variable `module`. */
const freeModule = freeExports && typeof module == 'object' && module !== null && !module.nodeType && module

/** Detect the popular CommonJS extension `module.exports`. */
const moduleExports = freeModule && freeModule.exports === freeExports

/** Built-in value references. */
const Buffer = moduleExports ? root.Buffer : undefined

/* Built-in method references for those with the same name as other `lodash` methods. */
const nativeIsBuffer = Buffer ? Buffer.isBuffer : undefined

/**
 * Checks if `value` is a buffer.
 *
 * @since 4.3.0
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is a buffer, else `false`.
 * @example
 *
 * isBuffer(new Buffer(2))
 * // => true
 *
 * isBuffer(new Uint8Array(2))
 * // => false
 */
const isBuffer = nativeIsBuffer || (() => false)
```

开始会根据 `exports` 、`module` 判断当前环境是否为 `node`，如果是的就有 `Buffer` 对象，将`Buffer.isBuffer` 赋值给 `isBuffer` 变量，如果非 `node` 环境则是一个 `return false` 的函数。

## isDate

> 检查 value 是否是 Date 类型

```js
_.isDate(value)
```

```js
/* Node.js helper references. */
const nodeIsDate = nodeTypes && nodeTypes.isDate

/**
 * Checks if `value` is classified as a `Date` object.
 *
 * @since 0.1.0
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is a date object, else `false`.
 * @example
 *
 * isDate(new Date)
 * // => true
 *
 * isDate('Mon April 23 2012')
 * // => false
 */
const isDate = nodeIsDate
  ? (value) => nodeIsDate(value)
  : (value) => isObjectLike(value) && baseGetTag(value) == '[object Date]'
```

`isDate` 是一个三元表达式，根据 `nodeIsDate` 判断是否是 `node` 环境，就调用 `nodeIsDate` 方法，如果不是 `node` 说明是浏览器环境，判断 `value` 是对象并且调用 `baseGetTag` 返回的对象字符串是等于 `[object Date]`。

## isElement

> 检查 value 是否是可能是 DOM 元素

```js
_.isElement(value)
```

```js
/**
 * Checks if `value` is likely a DOM element.
 *
 * @since 0.1.0
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is a DOM element, else `false`.
 * @example
 *
 * isElement(document.body)
 * // => true
 *
 * isElement('<body>')
 * // => false
 */
function isElement(value) {
  return isObjectLike(value) && value.nodeType === 1 && !isPlainObject(value)
}
```

`isElement` 通过 3 个条件来判断是否的 `DOM` 元素，`isObjectLike` 判断是一个对象、`value.nodeType === 1` 判断 `value` 是否有 `nodeType` 并且等于 1 、`isPlainObject` 判断 `value` 不是普通对象。

## isEmpty

> 检查 value 是否为空。 判断的依据是除非是有枚举属性的对象，length 大于 0 的 arguments object, array, string 或类jquery选择器。

```js
_.isEmpty(value)
```

```js
/** Used to check objects for own properties. */
const hasOwnProperty = Object.prototype.hasOwnProperty

/**
 * Checks if `value` is an empty object, collection, map, or set.
 *
 * Objects are considered empty if they have no own enumerable string keyed
 * properties.
 *
 * Array-like values such as `arguments` objects, arrays, buffers, strings, or
 * jQuery-like collections are considered empty if they have a `length` of `0`.
 * Similarly, maps and sets are considered empty if they have a `size` of `0`.
 *
 * @since 0.1.0
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is empty, else `false`.
 * @example
 *
 * isEmpty(null)
 * // => true
 *
 * isEmpty(true)
 * // => true
 *
 * isEmpty(1)
 * // => true
 *
 * isEmpty([1, 2, 3])
 * // => false
 *
 * isEmpty('abc')
 * // => false
 *
 * isEmpty({ 'a': 1 })
 * // => false
 */
function isEmpty(value) {
  if (value == null) {
    return true
  }
  if (isArrayLike(value) &&
      (Array.isArray(value) || typeof value == 'string' || typeof value.splice == 'function' ||
        isBuffer(value) || isTypedArray(value) || isArguments(value))) {
    return !value.length
  }
  const tag = getTag(value)
  if (tag == '[object Map]' || tag == '[object Set]') {
    return !value.size
  }
  if (isPrototype(value)) {
    return !Object.keys(value).length
  }
  for (const key in value) {
    if (hasOwnProperty.call(value, key)) {
      return false
    }
  }
  return true
}
```

`isEmpty` 内部有很多判断，首先是判断 `value` 等于 `null` 返回 `fasle`，如果是类数组之类的则返回 `value.length` 取非，说明不为空，如果是 `Map` 、`Set` 类型，返回它们的 `size`，如果是原型对象，通过 `Object.keys(value)` 判断对象是否有 `key` 返回 `key` 数组的长度，`for...in` 循环如果有 `key` 返回 `false`，非空，最后已上都不满足，返回 `true` 判断为空。

## isEqual

> 执行深比较来决定两者的值是否相等。 

```js
_.isEqual(value, other)
```

```js
/**
 * Performs a deep comparison between two values to determine if they are
 * equivalent.
 *
 * **Note:** This method supports comparing arrays, array buffers, booleans,
 * date objects, error objects, maps, numbers, `Object` objects, regexes,
 * sets, strings, symbols, and typed arrays. `Object` objects are compared
 * by their own, not inherited, enumerable properties. Functions and DOM
 * nodes are compared by strict equality, i.e. `===`.
 *
 * @static
 * @memberOf _
 * @since 0.1.0
 * @category Lang
 * @param {*} value The value to compare.
 * @param {*} other The other value to compare.
 * @returns {boolean} Returns `true` if the values are equivalent, else `false`.
 * @example
 *
 * var object = { 'a': 1 };
 * var other = { 'a': 1 };
 *
 * _.isEqual(object, other);
 * // => true
 *
 * object === other;
 * // => false
 */
function isEqual(value, other) {
  return baseIsEqual(value, other);
}
```

`isEqual` 是对 `baseIsEqual` 的封装。

## baseIsEqual

```js
/**
 * The base implementation of `isEqual` which supports partial comparisons
 * and tracks traversed objects.
 *
 * @private
 * @param {*} value The value to compare.
 * @param {*} other The other value to compare.
 * @param {boolean} bitmask The bitmask flags.
 *  1 - Unordered comparison
 *  2 - Partial comparison
 * @param {Function} [customizer] The function to customize comparisons.
 * @param {Object} [stack] Tracks traversed `value` and `other` objects.
 * @returns {boolean} Returns `true` if the values are equivalent, else `false`.
 */
function baseIsEqual(value, other, bitmask, customizer, stack) {
  if (value === other) {
    return true
  }
  if (value == null || other == null || (!isObjectLike(value) && !isObjectLike(other))) {
    return value !== value && other !== other
  }
  return baseIsEqualDeep(value, other, bitmask, customizer, baseIsEqual, stack)
}
```

`isEqual` 函数调用 `baseIsEqual` 时传了 2 个参数，`value` 、`other`，`baseIsEqual` 函数内首先判断 `value === other` ，说明是同一个指针，返回 `true`，接着是一个连或判断，满足任何一个条件返回 ` value !== value && other !== other`，最后调用 `baseIsEqualDeep` 方法。

## baseIsEqualDeep

```js
/** Used to compose bitmasks for value comparisons. */
const COMPARE_PARTIAL_FLAG = 1

/** `Object#toString` result references. */
const argsTag = '[object Arguments]'
const arrayTag = '[object Array]'
const objectTag = '[object Object]'

/** Used to check objects for own properties. */
const hasOwnProperty = Object.prototype.hasOwnProperty

/**
 * A specialized version of `baseIsEqual` for arrays and objects which performs
 * deep comparisons and tracks traversed objects enabling objects with circular
 * references to be compared.
 *
 * @private
 * @param {Object} object The object to compare.
 * @param {Object} other The other object to compare.
 * @param {number} bitmask The bitmask flags. See `baseIsEqual` for more details.
 * @param {Function} customizer The function to customize comparisons.
 * @param {Function} equalFunc The function to determine equivalents of values.
 * @param {Object} [stack] Tracks traversed `object` and `other` objects.
 * @returns {boolean} Returns `true` if the objects are equivalent, else `false`.
 */
function baseIsEqualDeep(object, other, bitmask, customizer, equalFunc, stack) {
  let objIsArr = Array.isArray(object)
  const othIsArr = Array.isArray(other)
  let objTag = objIsArr ? arrayTag : getTag(object)
  let othTag = othIsArr ? arrayTag : getTag(other)

  objTag = objTag == argsTag ? objectTag : objTag
  othTag = othTag == argsTag ? objectTag : othTag

  let objIsObj = objTag == objectTag
  const othIsObj = othTag == objectTag
  const isSameTag = objTag == othTag

  if (isSameTag && isBuffer(object)) {
    if (!isBuffer(other)) {
      return false
    }
    objIsArr = true
    objIsObj = false
  }
  if (isSameTag && !objIsObj) {
    stack || (stack = new Stack)
    return (objIsArr || isTypedArray(object))
      ? equalArrays(object, other, bitmask, customizer, equalFunc, stack)
      : equalByTag(object, other, objTag, bitmask, customizer, equalFunc, stack)
  }
  if (!(bitmask & COMPARE_PARTIAL_FLAG)) {
    const objIsWrapped = objIsObj && hasOwnProperty.call(object, '__wrapped__')
    const othIsWrapped = othIsObj && hasOwnProperty.call(other, '__wrapped__')

    if (objIsWrapped || othIsWrapped) {
      const objUnwrapped = objIsWrapped ? object.value() : object
      const othUnwrapped = othIsWrapped ? other.value() : other

      stack || (stack = new Stack)
      return equalFunc(objUnwrapped, othUnwrapped, bitmask, customizer, stack)
    }
  }
  if (!isSameTag) {
    return false
  }
  stack || (stack = new Stack)
  return equalObjects(object, other, bitmask, customizer, equalFunc, stack)
}
```

`baseIsEqualDeep` 也是传入5个参数，不过只有 `object` 、`other` 有值，首先是申明一些初始变量，是否是数组、参数的类型，接着是 `isBuffer` 判断 `Buffer` 类型，是数组返回 `equalArrays` 函数、

TODO: 占坑

## isEqualWith

> 这个方法类似 _.isEqual。 除了它接受一个 customizer 定制比较值。 如果 customizer 返回 undefined 将会比较处理方法代替。 customizer 会传入7个参数：(objValue, othValue [, index|key, object, other, stack])

```js
_.isEqualWith(value, other, [customizer])
```

```js
/**
 * This method is like `isEqual` except that it accepts `customizer` which
 * is invoked to compare values. If `customizer` returns `undefined`, comparisons
 * are handled by the method instead. The `customizer` is invoked with up to
 * six arguments: (objValue, othValue [, index|key, object, other, stack]).
 *
 * @since 4.0.0
 * @category Lang
 * @param {*} value The value to compare.
 * @param {*} other The other value to compare.
 * @param {Function} [customizer] The function to customize comparisons.
 * @returns {boolean} Returns `true` if the values are equivalent, else `false`.
 * @example
 *
 * function isGreeting(value) {
 *   return /^h(?:i|ello)$/.test(value)
 * }
 *
 * function customizer(objValue, othValue) {
 *   if (isGreeting(objValue) && isGreeting(othValue)) {
 *     return true
 *   }
 * }
 *
 * const array = ['hello', 'goodbye']
 * const other = ['hi', 'goodbye']
 *
 * isEqualWith(array, other, customizer)
 * // => true
 */
function isEqualWith(value, other, customizer) {
  customizer = typeof customizer == 'function' ? customizer : undefined
  const result = customizer ? customizer(value, other) : undefined
  return result === undefined ? baseIsEqual(value, other, undefined, customizer) : !!result
}
```

## isError

> 检查 value 是否是 Error, EvalError, RangeError, ReferenceError, SyntaxError, TypeError, 或 URIError object.

```js
_.isError(value)
```

```js
/**
 * Checks if `value` is an `Error`, `EvalError`, `RangeError`, `ReferenceError`,
 * `SyntaxError`, `TypeError`, or `URIError` object.
 *
 * @since 3.0.0
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is an error object, else `false`.
 * @example
 *
 * isError(new Error)
 * // => true
 *
 * isError(Error)
 * // => false
 */
function isError(value) {
  if (!isObjectLike(value)) {
    return false
  }
  const tag = baseGetTag(value)
  return tag == '[object Error]' || tag == '[object DOMException]' ||
    (typeof value.message == 'string' && typeof value.name == 'string' && !isPlainObject(value))
}
```

首先判断 `value` 不是一个对象返回 `false`，然后调用 `baseGetTag` 获得对象类型字符串 `tag`，接着是一个连或的判断，满足任何一项说明是 `Error`。

## isFinite

> 检查 value 是否是原始 finite number。 

```js
_.isFinite(value)
```

```js
/**
 * Checks if `value` is a finite primitive number.
 *
 * **Note:** This method is based on
 * [`Number.isFinite`](https://mdn.io/Number/isFinite).
 *
 * @static
 * @memberOf _
 * @since 0.1.0
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is a finite number, else `false`.
 * @example
 *
 * _.isFinite(3);
 * // => true
 *
 * _.isFinite(Number.MIN_VALUE);
 * // => true
 *
 * _.isFinite(Infinity);
 * // => false
 *
 * _.isFinite('3');
 * // => false
 */
function isFinite(value) {
  return typeof value == 'number' && nativeIsFinite(value);
}
```

`isFinite` 函数式对原生 `Number.isFinite` 的包装，加入了 `number` 类型的判断。


## isFunction

> 检查 value 是否是 Function 对象。

```js
_.isFunction(value)
```

```js
/**
 * Checks if `value` is classified as a `Function` object.
 *
 * @since 0.1.0
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is a function, else `false`.
 * @example
 *
 * isFunction(_)
 * // => true
 *
 * isFunction(/abc/)
 * // => false
 */
function isFunction(value) {
  if (!isObject(value)) {
    return false
  }
  // The use of `Object#toString` avoids issues with the `typeof` operator
  // in Safari 9 which returns 'object' for typed arrays and other constructors.
  const tag = baseGetTag(value)
  return tag == '[object Function]' || tag == '[object AsyncFunction]' ||
    tag == '[object GeneratorFunction]' || tag == '[object Proxy]'
}
```

`isFunction` 首先调用 `isObject` 判断是否为对象，不是返回 `false`，接着调用 `baseGetTag` 获取 `value` 的对象类型字符串，这里判断了 4 中类型是属于 `Function`。

## isError

> 检查 value 是否是整数。 

```js
_.isInteger(value)
```

```js
/**
 * Checks if `value` is an integer.
 *
 * **Note:** This method is based on
 * [`Number.isInteger`](https://mdn.io/Number/isInteger).
 *
 * @static
 * @memberOf _
 * @since 4.0.0
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is an integer, else `false`.
 * @example
 *
 * _.isInteger(3);
 * // => true
 *
 * _.isInteger(Number.MIN_VALUE);
 * // => false
 *
 * _.isInteger(Infinity);
 * // => false
 *
 * _.isInteger('3');
 * // => false
 */
function isInteger(value) {
  return typeof value == 'number' && value == toInteger(value);
}
```

`isInteger` 使用 `typeof` 判断 `value` 的类型等于 `number` ，并且调用 `toInteger` 取整函数与原来 `value` 相等即为整数。

## isLength

> 检查 `value` 是否是一个有效的数组长度。

```js
/** Used as references for various `Number` constants. */
const MAX_SAFE_INTEGER = 9007199254740991

/**
 * Checks if `value` is a valid array-like length.
 *
 * **Note:** This method is loosely based on
 * [`ToLength`](http://ecma-international.org/ecma-262/7.0/#sec-tolength).
 *
 * @since 4.0.0
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is a valid length, else `false`.
 * @example
 *
 * isLength(3)
 * // => true
 *
 * isLength(Number.MIN_VALUE)
 * // => false
 *
 * isLength(Infinity)
 * // => false
 *
 * isLength('3')
 * // => false
 */
function isLength(value) {
  return typeof value == 'number' &&
    value > -1 && value % 1 == 0 && value <= MAX_SAFE_INTEGER
}
```

`isLength` 接收 `value` 作为参数，通过 `typeof` 判断 `value` 是 `number` 类型，`value` 大于 `-1` 并且 `value % 1 == 0` 是判断为整数，`value <= MAX_SAFE_INTEGER` 小于等于最大有效数字。

## isMap

> 检查 value 是否是个 Map 对象

```js
_.isMap(value)
```

```js
/* Node.js helper references. */
const nodeIsMap = nodeTypes && nodeTypes.isMap

/**
 * Checks if `value` is classified as a `Map` object.
 *
 * @since 4.3.0
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is a map, else `false`.
 * @example
 *
 * isMap(new Map)
 * // => true
 *
 * isMap(new WeakMap)
 * // => false
 */
const isMap = nodeIsMap
  ? (value) => nodeIsMap(value)
  : (value) => isObjectLike(value) && getTag(value) == '[object Map]'
```

根据 `nodeIsMap` 判断是否在 `node` 环境，在 `node` 环境调用 `node` 的 `isMap` 方法，否则调用 `getTag` 方法获取对象类型字符串是否等于 `[object Map]`。

## isMatch

> 执行一个深比较来确定object 是否包含有 source 的属性值。 

```js
_.isMatch(object, source)
```

```js
/**
 * Performs a partial deep comparison between `object` and `source` to
 * determine if `object` contains equivalent property values.
 *
 * **Note:** This method is equivalent to `matches` when `source` is
 * partially applied.
 *
 * Partial comparisons will match empty array and empty object `source`
 * values against any array or object value, respectively. See `isEqual`
 * for a list of supported value comparisons.
 *
 * @since 3.0.0
 * @category Lang
 * @param {Object} object The object to inspect.
 * @param {Object} source The object of property values to match.
 * @returns {boolean} Returns `true` if `object` is a match, else `false`.
 * @example
 *
 * const object = { 'a': 1, 'b': 2 }
 *
 * isMatch(object, { 'b': 2 })
 * // => true
 *
 * isMatch(object, { 'b': 1 })
 * // => false
 */
function isMatch(object, source) {
  return object === source || baseIsMatch(object, source, getMatchData(source))
}
```

`isMatch` 函数首先会判断 `object === source` 是否全等或调用 `baseIsMatch` 方法进行深比较，满足一个就
返回 `true`。

## getMatchData


```js
/**
 * Gets the property names, values, and compare flags of `object`.
 *
 * @private
 * @param {Object} object The object to query.
 * @returns {Array} Returns the match data of `object`.
 */
function getMatchData(object) {
  const result = keys(object)
  let length = result.length

  while (length--) {
    const key = result[length]
    const value = object[key]
    result[length] = [key, value, isStrictComparable(value)]
  }
  return result
}
```

`getMatchData` 函数首先会调用 `keys` 函数获取 `object` 的 `key` 数组，接着进入 `while` 循环，将 `[key, value, isStrictComparable(value)]` 插入 `result` ，最后将 `result` 返回。

## baseIsMatch

```js
/** Used to compose bitmasks for value comparisons. */
const COMPARE_PARTIAL_FLAG = 1
const COMPARE_UNORDERED_FLAG = 2

/**
 * The base implementation of `isMatch`.
 *
 * @private
 * @param {Object} object The object to inspect.
 * @param {Object} source The object of property values to match.
 * @param {Array} matchData The property names, values, and compare flags to match.
 * @param {Function} [customizer] The function to customize comparisons.
 * @returns {boolean} Returns `true` if `object` is a match, else `false`.
 */
function baseIsMatch(object, source, matchData, customizer) {
  let index = matchData.length
  const length = index
  const noCustomizer = !customizer

  if (object == null) {
    return !length
  }
  let data
  let result
  object = Object(object)
  while (index--) {
    data = matchData[index]
    if ((noCustomizer && data[2])
          ? data[1] !== object[data[0]]
          : !(data[0] in object)
        ) {
      return false
    }
  }
  while (++index < length) {
    data = matchData[index]
    const key = data[0]
    const objValue = object[key]
    const srcValue = data[1]

    if (noCustomizer && data[2]) {
      if (objValue === undefined && !(key in object)) {
        return false
      }
    } else {
      const stack = new Stack
      if (customizer) {
        result = customizer(objValue, srcValue, key, object, source, stack)
      }
      if (!(result === undefined
            ? baseIsEqual(srcValue, objValue, COMPARE_PARTIAL_FLAG | COMPARE_UNORDERED_FLAG, customizer, stack)
            : result
          )) {
        return false
      }
    }
  }
  return true
}
```
`baseIsMatch` 函数接收 4 个参数， `object` 检查对象、`source` 配置属性 、`matchData` 匹配的属性值和比较标志 、 `customizer` 自定义比较函数。

申明一些初始变量，然后进入 `while` 循环，`index--`，这里会将 `matchData[index]` 赋值给 `data`，然后进行 `noCustomizer` 自定义比较的判断。接下来又是一个 `while` 循环， `++index`，如果有 `noCustomizer` 并且 `objValue` 等于 `undefined` 、 `object` 上没有 `key` 返回 `false` 。

TODO: 占坑

## isNaN

> 检查 value 是否是 NaN. 

```js
_.isNaN(value)
```

```js
/**
 * Checks if `value` is `NaN`.
 *
 * **Note:** This method is based on
 * [`Number.isNaN`](https://mdn.io/Number/isNaN) and is not the same as
 * global [`isNaN`](https://mdn.io/isNaN) which returns `true` for
 * `undefined` and other non-number values.
 *
 * @static
 * @memberOf _
 * @since 0.1.0
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is `NaN`, else `false`.
 * @example
 *
 * _.isNaN(NaN);
 * // => true
 *
 * _.isNaN(new Number(NaN));
 * // => true
 *
 * isNaN(undefined);
 * // => true
 *
 * _.isNaN(undefined);
 * // => false
 */
function isNaN(value) {
  // An `NaN` primitive is the only value that is not equal to itself.
  // Perform the `toStringTag` check first to avoid errors with some
  // ActiveX objects in IE.
  return isNumber(value) && value != +value;
}
```

判断 `value` 是 `number` 并且不等于自身。

## isNative

> 检查 value 是否是原生函数

```js
_.isNative(value)
```

```js
/**
 * Used to match `RegExp`
 * [syntax characters](http://ecma-international.org/ecma-262/7.0/#sec-patterns).
 */
const reRegExpChar = /[\\^$.*+?()[\]{}|]/g

/** Used to detect if a method is native. */
const reIsNative = RegExp(`^${
  Function.prototype.toString.call(Object.prototype.hasOwnProperty)
    .replace(reRegExpChar, '\\$&')
    .replace(/hasOwnProperty|(function).*?(?=\\\()| for .+?(?=\\\])/g, '$1.*?')
}$`)

/**
 * Checks if `value` is a pristine native function.
 *
 * @since 3.0.0
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is a native function,
 *  else `false`.
 * @example
 *
 * isNative(Array.prototype.push)
 * // => true
 *
 * isNative(isDate)
 * // => false
 */
function isNative(value) {
  return isObject(value) && reIsNative.test(value)
}
```

判断是对象并且调用 `reIsNative` 正则 `test`，在 `reIsNative` 中会取到

```js
// "function hasOwnProperty() { [native code] }"
Function.prototype.toString.call(Object.prototype.hasOwnProperty)
  // function hasOwnProperty\(\) \{ \[native code\] \}
  .replace(reRegExpChar, '\\$&')
  // function.*?\(\) \{ \[native code\] \}
  .replace(/hasOwnProperty|(function).*?(?=\\\()| for .+?(?=\\\])/g, '$1.*?')
// ^function.*?\(\) \{ \[native code\] \}$
```

这个正则会匹配函数字符串内部有 `native code` 字符串的就是原生函数。

## isNil

> _.isNil(value)

```js
_.isNil(value)
```

```js
/**
 * Checks if `value` is `null` or `undefined`.
 *
 * @since 4.0.0
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is nullish, else `false`.
 * @example
 *
 * isNil(null)
 * // => true
 *
 * isNil(void 0)
 * // => true
 *
 * isNil(NaN)
 * // => false
 */
function isNil(value) {
  return value == null
}
```

函数内部返回了一个 `value == null` 判断，使用了双等判断否，`JavaScript` 会去做一个隐式的转换。

## isNull

> 检查 value 是否是 null.

```js
_.isNull(value)
```

```js
/**
 * Checks if `value` is `null`.
 *
 * @since 0.1.0
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is `null`, else `false`.
 * @example
 *
 * isNull(null)
 * // => true
 *
 * isNull(void 0)
 * // => false
 */
function isNull(value) {
  return value === null
}
```

返回一个全等 `value === null`，`JavaScript` 不会去做隐式转换。

## isNumber

> 检查 value 是否是原始数值型 或者 对象。 

```js
_.isNumber(value)
```

```js
/**
 * Checks if `value` is classified as a `Number` primitive or object.
 *
 * **Note:** To exclude `Infinity`, `-Infinity`, and `NaN`, which are
 * classified as numbers, use the `Number.isFinite` method.
 *
 * @since 0.1.0
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is a number, else `false`.
 * @see isInteger, toInteger, toNumber
 * @example
 *
 * isNumber(3)
 * // => true
 *
 * isNumber(Number.MIN_VALUE)
 * // => true
 *
 * isNumber(Infinity)
 * // => true
 *
 * isNumber('3')
 * // => false
 */
function isNumber(value) {
  return typeof value == 'number' ||
    (isObjectLike(value) && baseGetTag(value) == '[object Number]')
}
```

`value` 会有两种情况一种是基本类型 `number`，还有就是用 `new Number()` 构造函数生成的数字，类型为 `object`，需要第二章判断方式判断是一个对象并且对象类型字符串是 `[object Number]`。

## isObject

> 检查 value 是否是 Object 的 language type。 (例如： arrays, functions, objects, regexes, new Number(0), 以及 new String(''))

```js
_.isObject(value)
```

```js
/**
 * Checks if `value` is the
 * [language type](http://www.ecma-international.org/ecma-262/7.0/#sec-ecmascript-language-types)
 * of `Object`. (e.g. arrays, functions, objects, regexes, `new Number(0)`, and `new String('')`)
 *
 * @since 0.1.0
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is an object, else `false`.
 * @example
 *
 * isObject({})
 * // => true
 *
 * isObject([1, 2, 3])
 * // => true
 *
 * isObject(Function)
 * // => true
 *
 * isObject(null)
 * // => false
 */
function isObject(value) {
  const type = typeof value
  return value != null && (type == 'object' || type == 'function')
}
```

使用 `typeof` 获取 `value` 的类型，排除 `value` 等于 `null` 的情况，因为 `typeof null === 'object'`，判断 `value` 是 `object` 、`function` 就是一个对象。

## isObjectLike

> 检查 value 是否是 类对象。 类对象应该不是 null 以及 typeof 的结果是 "object"。

```js
/**
 * Checks if `value` is object-like. A value is object-like if it's not `null`
 * and has a `typeof` result of "object".
 *
 * @since 4.0.0
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is object-like, else `false`.
 * @example
 *
 * isObjectLike({})
 * // => true
 *
 * isObjectLike([1, 2, 3])
 * // => true
 *
 * isObjectLike(Function)
 * // => false
 *
 * isObjectLike(null)
 * // => false
 */
function isObjectLike(value) {
  return typeof value == 'object' && value !== null
}
```

`isObjectLike` 接收 `value` 作为参数，通过 `typeof` 判断类型 `object` 对象并且 `value` 不等于 `null`，因为 `typeof null` 等于 `object`。

## isPlainObject

> 检查 value 是否是普通对象。 也就是说该对象由 Object 构造函数创建或者 [[Prototype]] 为空。

```js
_.isPlainObject(value)
```

```js
/**
 * Checks if `value` is a plain object, that is, an object created by the
 * `Object` constructor or one with a `[[Prototype]]` of `null`.
 *
 * @since 0.8.0
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is a plain object, else `false`.
 * @example
 *
 * function Foo() {
 *   this.a = 1
 * }
 *
 * isPlainObject(new Foo)
 * // => false
 *
 * isPlainObject([1, 2, 3])
 * // => false
 *
 * isPlainObject({ 'x': 0, 'y': 0 })
 * // => true
 *
 * isPlainObject(Object.create(null))
 * // => true
 */
function isPlainObject(value) {
  if (!isObjectLike(value) || baseGetTag(value) != '[object Object]') {
    return false
  }
  if (Object.getPrototypeOf(value) === null) {
    return true
  }
  let proto = value
  while (Object.getPrototypeOf(proto) !== null) {
    proto = Object.getPrototypeOf(proto)
  }
  return Object.getPrototypeOf(value) === proto
}
```

`isPlainObject` 函数首先是对 `value` 类型的判断，排除不是对象的情况，`Object.getPrototypeOf` 会返回对象原型，如果等于 `null`，说明是最顶层对象，接下来是 `while` 循环，会一直向上找 `value` 的原型，最后返回 `Object.getPrototypeOf(value) === proto`。

## isRegExp

> 检查 value 是否是 RegExp 对象

```js
_.isRegExp(value)
```

```js
/* Node.js helper references. */
const nodeIsRegExp = nodeTypes && nodeTypes.isRegExp

/**
 * Checks if `value` is classified as a `RegExp` object.
 *
 * @since 0.1.0
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is a regexp, else `false`.
 * @example
 *
 * isRegExp(/abc/)
 * // => true
 *
 * isRegExp('/abc/')
 * // => false
 */
const isRegExp = nodeIsRegExp
  ? (value) => nodeIsRegExp(value)
  : (value) => isObjectLike(value) && baseGetTag(value) == '[object RegExp]'

```

`isRegExp` 是一个 3 元表达式，兼容 `node` 和浏览器环境，如果 `nodeIsRegExp` 为真说明是 `node` 环境，调用 `nodeIsRegExp` 方法，否则就是浏览器环境，判断 `value` 为对象并且对象类型字符串等于 `[object RegExp]`。

## isSafeInteger

> 检查 value 是否是安全整数。 这个整数应该是符合 IEEE-754 标准的非双精度浮点数。 

```js
_.isSafeInteger(value)
```

```js
/**
 * Checks if `value` is a safe integer. An integer is safe if it's an IEEE-754
 * double precision number which isn't the result of a rounded unsafe integer.
 *
 * **Note:** This method is based on
 * [`Number.isSafeInteger`](https://mdn.io/Number/isSafeInteger).
 *
 * @static
 * @memberOf _
 * @since 4.0.0
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is a safe integer, else `false`.
 * @example
 *
 * _.isSafeInteger(3);
 * // => true
 *
 * _.isSafeInteger(Number.MIN_VALUE);
 * // => false
 *
 * _.isSafeInteger(Infinity);
 * // => false
 *
 * _.isSafeInteger('3');
 * // => false
 */
function isSafeInteger(value) {
  return isInteger(value) && value >= -MAX_SAFE_INTEGER && value <= MAX_SAFE_INTEGER;
}
```

使用 `toInteger` 函数将 `value` 转化为整数，如果大于负的 `MAX_SAFE_INTEGER` 、大小于`MAX_SAFE_INTEGER` 返回 `true`。

## isSet

> 检查 value 是否是 Set 对象。

```js
_.isSet(value)
```

```js
/* Node.js helper references. */
const nodeIsSet = nodeTypes && nodeTypes.isSet

/**
 * Checks if `value` is classified as a `Set` object.
 *
 * @since 4.3.0
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is a set, else `false`.
 * @example
 *
 * isSet(new Set)
 * // => true
 *
 * isSet(new WeakSet)
 * // => false
 */
const isSet = nodeIsSet
  ? (value) => nodeIsSet(value)
  : (value) => isObjectLike(value) && getTag(value) == '[object Set]'

```

`isSet` 是一个 3 元表达式，兼容 `node` 和浏览器环境，如果 `nodeIsSet` 为真说明是 `node` 环境，调用 `nodeIsSet` 方法，否则就是浏览器环境，判断 `value` 为对象并且对象类型字符串等于 `[object Set]`。


## isString

> 检查 value 是否是原始字符串或者对象。

```js
_.isString(value)
```

```js
/**
 * Checks if `value` is classified as a `String` primitive or object.
 *
 * @since 0.1.0
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is a string, else `false`.
 * @example
 *
 * isString('abc')
 * // => true
 *
 * isString(1)
 * // => false
 */
function isString(value) {
  const type = typeof value
  return type == 'string' || (type == 'object' && value != null && !Array.isArray(value) && getTag(value) == '[object String]')
}
```

`value` 会有两种情况一种是基本类型 `string`，还有就是用 `new String()` 构造函数生成的字符串，类型为 `object`，需要第二章判断方式判断是一个对象并且对象类型字符串是 `[object String]`。

## isSymbol

> 检查 value 是否是原始 Symbol 或者对象。

```js

```

```js
/**
 * Checks if `value` is classified as a `Symbol` primitive or object.
 *
 * @since 4.0.0
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is a symbol, else `false`.
 * @example
 *
 * isSymbol(Symbol.iterator)
 * // => true
 *
 * isSymbol('abc')
 * // => false
 */
function isSymbol(value) {
  const type = typeof value
  return type == 'symbol' || (type == 'object' && value != null && getTag(value) == '[object Symbol]')
}
```

`value` 会有两种情况一种是基本类型 `symbol`，还有就是用 `new Symbol()` 构造函数生成，类型为 `object`，需要第二章判断方式判断是一个对象并且对象类型字符串是 `[object Symbol]`。

## isTypedArray

> 检查 value 是否是TypedArray。

```js
_.isSymbol(value)
```

```js
/** Used to match `toStringTag` values of typed arrays. */
const reTypedTag = /^\[object (?:Float(?:32|64)|(?:Int|Uint)(?:8|16|32)|Uint8Clamped)\]$/

/* Node.js helper references. */
const nodeIsTypedArray = nodeTypes && nodeTypes.isTypedArray

/**
 * Checks if `value` is classified as a typed array.
 *
 * @since 3.0.0
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is a typed array, else `false`.
 * @example
 *
 * isTypedArray(new Uint8Array)
 * // => true
 *
 * isTypedArray([])
 * // => false
 */
const isTypedArray = nodeIsTypedArray
  ? (value) => nodeIsTypedArray(value)
  : (value) => isObjectLike(value) && reTypedTag.test(getTag(value))
```

`isTypedArray` 是一个 3 元表达式，兼容 `node` 和浏览器环境，如果 `nodeIsTypedArray` 为真说明是 `node` 环境，调用 `nodeIsTypedArray` 方法，否则就是浏览器环境，判断 `value` 为对象并且对使用 `reTypedTag` 正则 `test`。

## isUndefined

> 检查 value 是否是 undefined.

```js
_.isUndefined(value)
```

```js
/**
 * Checks if `value` is `undefined`.
 *
 * @since 0.1.0
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is `undefined`, else `false`.
 * @example
 *
 * isUndefined(void 0)
 * // => true
 *
 * isUndefined(null)
 * // => false
 */
function isUndefined(value) {
  return value === undefined
}
```

全等 `value === undefined`。

## isWeakMap

> 检查 value 是否是 WeakMap 对象

```js
_.isWeakMap(value)
```

```js
/**
 * Checks if `value` is classified as a `WeakMap` object.
 *
 * @since 4.3.0
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is a weak map, else `false`.
 * @example
 *
 * isWeakMap(new WeakMap)
 * // => true
 *
 * isWeakMap(new Map)
 * // => false
 */
function isWeakMap(value) {
  return isObjectLike(value) && getTag(value) == '[object WeakMap]'
}
```

判断 `value` 是对象并且对象类型字符串等于 `[object WeakMap]`。

## isWeakSet

> 检查 value 是否是 WeakSet 对象

```js
_.isWeakSet(value)
```

```js
/**
 * Checks if `value` is classified as a `WeakSet` object.
 *
 * @since 4.3.0
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is a weak set, else `false`.
 * @example
 *
 * isWeakSet(new WeakSet)
 * // => true
 *
 * isWeakSet(new Set)
 * // => false
 */
function isWeakSet(value) {
  return isObjectLike(value) && getTag(value) == '[object WeakSet]'
}
```

判断 `value` 是对象并且对象类型字符串等于 `[object WeakSet]`。

## isFlattenable

> 判断是否是一个能展开的 `value`。

```js
/** Built-in value reference. */
const spreadableSymbol = Symbol.isConcatSpreadable

/**
 * Checks if `value` is a flattenable `arguments` object or array.
 *
 * @private
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is flattenable, else `false`.
 */
function isFlattenable(value) {
  return Array.isArray(value) || isArguments(value) ||
    !!(spreadableSymbol && value && value[spreadableSymbol])
}
```

对象的 `Symbol.isConcatSpreadable` 属性等于一个布尔值，表示该对象用于 `Array.prototype.concat()` 时，是否可以展开。

`isFlattenable` 接收 `value` 作为参数，通过 `Array.isArray` 、`isArguments` 判断 ``value`` 是数组或是 一个 `arguments` 对象或者是一个能展开的 `Symbol`。

## toArray

> 转换 value 为数组

```js
_.toArray(value)
```

```js

/** `Object#toString` result references. */
const mapTag = '[object Map]'
const setTag = '[object Set]'

/** Built-in value references. */
const symIterator = Symbol ? Symbol.iterator : undefined

/**
 * Converts `value` to an array.
 *
 * @since 0.1.0
 * @category Lang
 * @param {*} value The value to convert.
 * @returns {Array} Returns the converted array.
 * @example
 *
 * toArray({ 'a': 1, 'b': 2 })
 * // => [1, 2]
 *
 * toArray('abc')
 * // => ['a', 'b', 'c']
 *
 * toArray(1)
 * // => []
 *
 * toArray(null)
 * // => []
 */
function toArray(value) {
  if (!value) {
    return []
  }
  if (isArrayLike(value)) {
    return isString(value) ? stringToArray(value) : copyArray(value)
  }
  if (symIterator && value[symIterator]) {
    return iteratorToArray(value[symIterator]())
  }
  const tag = getTag(value)
  const func = tag == mapTag ? mapToArray : (tag == setTag ? setToArray : values)

  return func(value)
}
```

`toArray` 函数首先会进行非空判断，然后调用 `isArrayLike` 判断是否是类数组，如果是 `isString`，调用 `stringToArray` 转成数组，否则调用 `copyArray` 返回一个浅拷贝的数组。

如果是 `symIterator` 类型调用 `iteratorToArray` 返回转化后的数组，
不满足已上情况调用 `getTag` 获取 `value` 的对象类型字符串，这个会根据 `map` 、`set` 类型返回 `mapToArray`、`setToArray` 方法。

## toFinite

> 将值转换为有限数字。

```js
_.toFinite(value)
```

```js
/** Used as references for various `Number` constants. */
const INFINITY = 1 / 0
const MAX_INTEGER = 1.7976931348623157e+308

/**
 * Converts `value` to a finite number.
 *
 * @since 4.12.0
 * @category Lang
 * @param {*} value The value to convert.
 * @returns {number} Returns the converted number.
 * @example
 *
 * toFinite(3.2)
 * // => 3.2
 *
 * toFinite(Number.MIN_VALUE)
 * // => 5e-324
 *
 * toFinite(Infinity)
 * // => 1.7976931348623157e+308
 *
 * toFinite('3.2')
 * // => 3.2
 */
function toFinite(value) {
  if (!value) {
    return value === 0 ? value : 0
  }
  value = toNumber(value)
  if (value === INFINITY || value === -INFINITY) {
    const sign = (value < 0 ? -1 : 1)
    return sign * MAX_INTEGER
  }
  return value === value ? value : 0
}
```

`toFinite` 函数内部有多个判断，`value` 取非为真返回 0，使用 `toInteger` 函数将 `value` 转化为整数，如果小于负的 `MAX_SAFE_INTEGER` 返回 `-MAX_SAFE_INTEGER`，如果大于 `MAX_SAFE_INTEGER` 返回 `MAX_SAFE_INTEGER`，最后 `value` 等于自身返回 `value`，不是的话说明是 `NaN`，返回 0。

## toInteger

> 将 `value` 转换为整数。

```js
_.toInteger(value)
```

```js
/**
 * Converts `value` to an integer.
 *
 * **Note:** This method is loosely based on
 * [`ToInteger`](http://www.ecma-international.org/ecma-262/7.0/#sec-tointeger).
 *
 * @since 4.0.0
 * @category Lang
 * @param {*} value The value to convert.
 * @returns {number} Returns the converted integer.
 * @see isInteger, isNumber, toNumber
 * @example
 *
 * toInteger(3.2)
 * // => 3
 *
 * toInteger(Number.MIN_VALUE)
 * // => 0
 *
 * toInteger(Infinity)
 * // => 1.7976931348623157e+308
 *
 * toInteger('3.2')
 * // => 3
 */
function toInteger(value) {
  const result = toFinite(value)
  const remainder = result % 1

  return remainder ? result - remainder : result
}
```

`toInteger` 函数调用 `toFinite` 将 `value` 转成有效数字，然后对其进行 `% 1` 取值，如果有 `remainder` 返回 `result - remainder `，否则返回 `result`。

## toLength

> 转换 value 为用作类数组对象的长度整数。 

```js
_.toLength(value)
```

```js

/** Used as references for the maximum length and index of an array. */
const MAX_ARRAY_LENGTH = 4294967295

/**
 * Converts `value` to an integer suitable for use as the length of an
 * array-like object.
 *
 * **Note:** This method is based on
 * [`ToLength`](http://ecma-international.org/ecma-262/7.0/#sec-tolength).
 *
 * @since 4.0.0
 * @category Lang
 * @param {*} value The value to convert.
 * @returns {number} Returns the converted integer.
 * @example
 *
 * toLength(3.2)
 * // => 3
 *
 * toLength(Number.MIN_VALUE)
 * // => 0
 *
 * toLength(Infinity)
 * // => 4294967295
 *
 * toLength('3.2')
 * // => 3
 */
function toLength(value) {
  if (!value) {
    return 0
  }
  value = toInteger(value)
  if (value < 0) {
    return 0
  }
  if (value > MAX_ARRAY_LENGTH) {
    return MAX_ARRAY_LENGTH
  }
  return value
}
```

`toLength` 函数首先会进行非空哦按段，然后将 `value` 转换成整数，小于 0 返回 0，大于 `MAX_ARRAY_LENGTH` 返回 `MAX_ARRAY_LENGTH`，最后返回 `value` 。

## toNumber

> 将值转换为数字。

```js
_.toNumber(value)
```

```js
/** Used as references for various `Number` constants. */
const NAN = 0 / 0

/** Used to match leading and trailing whitespace. */
const reTrim = /^\s+|\s+$/g

/** Used to detect bad signed hexadecimal string values. */
const reIsBadHex = /^[-+]0x[0-9a-f]+$/i

/** Used to detect binary string values. */
const reIsBinary = /^0b[01]+$/i

/** Used to detect octal string values. */
const reIsOctal = /^0o[0-7]+$/i

/** Built-in method references without a dependency on `root`. */
const freeParseInt = parseInt

/**
 * Converts `value` to a number.
 *
 * @since 4.0.0
 * @category Lang
 * @param {*} value The value to process.
 * @returns {number} Returns the number.
 * @see isInteger, toInteger, isNumber
 * @example
 *
 * toNumber(3.2)
 * // => 3.2
 *
 * toNumber(Number.MIN_VALUE)
 * // => 5e-324
 *
 * toNumber(Infinity)
 * // => Infinity
 *
 * toNumber('3.2')
 * // => 3.2
 */
function toNumber(value) {
  if (typeof value == 'number') {
    return value
  }
  if (isSymbol(value)) {
    return NAN
  }
  if (isObject(value)) {
    const other = typeof value.valueOf == 'function' ? value.valueOf() : value
    value = isObject(other) ? `${other}` : other
  }
  if (typeof value != 'string') {
    return value === 0 ? value : +value
  }
  value = value.replace(reTrim, '')
  const isBinary = reIsBinary.test(value)
  return (isBinary || reIsOctal.test(value))
    ? freeParseInt(value.slice(2), isBinary ? 2 : 8)
    : (reIsBadHex.test(value) ? NAN : +value)
}
```

`toNumber` 函数内部有很多类型判断，
如果是 `number` 类型返回 `value`，
如果是 `isSymbol` 返回 `NaN`，
如果是 `object` 调用内置的 `valueOf` 方法，
如果不是字符串，等于 0 返回 0，否则用 `+value` 隐式转换后返回，
最后使用正则去除空格后调用 `freeParseInt` 转换。

## toPlainObject

> 转换 value 为普通对象。 包括继承的可枚举属性。

```js
_.toPlainObject(value)
```

```js
/**
 * Converts `value` to a plain object flattening inherited enumerable string
 * keyed properties of `value` to own properties of the plain object.
 *
 * @since 3.0.0
 * @category Lang
 * @param {*} value The value to convert.
 * @returns {Object} Returns the converted plain object.
 * @example
 *
 * function Foo() {
 *   this.b = 2
 * }
 *
 * Foo.prototype.c = 3
 *
 * assign({ 'a': 1 }, new Foo)
 * // => { 'a': 1, 'b': 2 }
 *
 * assign({ 'a': 1 }, toPlainObject(new Foo))
 * // => { 'a': 1, 'b': 2, 'c': 3 }
 */
function toPlainObject(value) {
  value = Object(value)
  const result = {}
  for (const key in value) {
    result[key] = value[value]
  }
  return result
}
```

`toPlainObject` 函数内部是一个 `for...in` 循环，申明空对象 `result` ，往对象上赋值，最后返回。

## toSafeInteger

> 将值转换为安全整数。

```js
_.toSafeInteger(value)
```

```js
/** Used as references for various `Number` constants. */
const MAX_SAFE_INTEGER = 9007199254740991

/**
 * Converts `value` to a safe integer. A safe integer can be compared and
 * represented correctly.
 *
 * @since 4.0.0
 * @category Lang
 * @param {*} value The value to convert.
 * @returns {number} Returns the converted integer.
 * @example
 *
 * toSafeInteger(3.2)
 * // => 3
 *
 * toSafeInteger(Number.MIN_VALUE)
 * // => 0
 *
 * toSafeInteger(Infinity)
 * // => 9007199254740991
 *
 * toSafeInteger('3.2')
 * // => 3
 */
function toSafeInteger(value) {
  if (!value) {
    return value === 0 ? value : 0
  }
  value = toInteger(value)
  if (value < -MAX_SAFE_INTEGER) {
    return -MAX_SAFE_INTEGER
  }
  if (value > MAX_SAFE_INTEGER) {
    return MAX_SAFE_INTEGER
  }
  return value
}
```

`toSafeInteger` 函数内部有多个判断，`value` 取非为真返回 0，使用 `toInteger` 函数将 `value` 转化为整数，如果小于负的 `MAX_SAFE_INTEGER` 返回 `-MAX_SAFE_INTEGER`，如果大于 `MAX_SAFE_INTEGER` 返回 `MAX_SAFE_INTEGER`。

## toString

> 如果 value 不是字符串，将其转换为字符串。 null 和 undefined 将返回空字符串。

```js
_.toString(value)
```

```js
/** Used as references for various `Number` constants. */
const INFINITY = 1 / 0

/** Used to convert symbols to primitives and strings. */
const symbolProto = Symbol ? Symbol.prototype : undefined
const symbolToString = symbolProto ? symbolProto.toString : undefined

/**
 * Converts `value` to a string. An empty string is returned for `null`
 * and `undefined` values. The sign of `-0` is preserved.
 *
 * @since 4.0.0
 * @category Lang
 * @param {*} value The value to convert.
 * @returns {string} Returns the converted string.
 * @example
 *
 * toString(null)
 * // => ''
 *
 * toString(-0)
 * // => '-0'
 *
 * toString([1, 2, 3])
 * // => '1,2,3'
 */
function toString(value) {
  if (value == null) {
    return ''
  }
  // Exit early for strings to avoid a performance hit in some environments.
  if (typeof value == 'string') {
    return value
  }
  if (Array.isArray(value)) {
    // Recursively convert values (susceptible to call stack limits).
    return `${map(value, (other) => other == null ? other : toString(other))}`
  }
  if (isSymbol(value)) {
    return symbolToString ? symbolToString.call(value) : ''
  }
  const result = `${value}`
  return (result == '0' && (1 / value) == -INFINITY) ? '-0' : result
}
```

`toString` 函数首先进行非空处理，如果是字符串直接返回，返回循环后的字符串模板，
如果是  `Symbol` 调用 `symbolToString` 方法，
最后判断使用 `es6` 模板转成字符串，等于字符串 0 或者等于 `INFINITY`，返回 `-1`，
否则返回 `result`。