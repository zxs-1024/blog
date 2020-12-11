
## baseFlatten

> 返回扁平化的数组。

```js
/**
 * The base implementation of `flatten` with support for restricting flattening.
 *
 * @private
 * @param {Array} array The array to flatten.
 * @param {number} depth The maximum recursion depth.
 * @param {boolean} [predicate=isFlattenable] The function invoked per iteration.
 * @param {boolean} [isStrict] Restrict to values that pass `predicate` checks.
 * @param {Array} [result=[]] The initial result value.
 * @returns {Array} Returns the new flattened array.
 */
function baseFlatten(array, depth, predicate, isStrict, result) {
  predicate || (predicate = isFlattenable)
  result || (result = [])

  if (array == null) {
    return result
  }

  for (const value of array) {
    if (depth > 0 && predicate(value)) {
      if (depth > 1) {
        // Recursively flatten arrays (susceptible to call stack limits).
        baseFlatten(value, depth - 1, predicate, isStrict, result)
      } else {
        result.push(...value)
      }
    } else if (!isStrict) {
      result[result.length] = value
    }
  }
  return result
}
```

在 `difference` 函数中调用：

```js
baseFlatten(values, 1, isArrayLikeObject, true)
```

`baseFlatten` 接收 `array` 数组、`depth` 深度, `predicate` 断言函数, `isStrict` 是否严格, `result` 默认为空数组。

判断 `array == null` 如果等于 `null` ， 返回传入的 `result`。

进入 `for...of ` 循环，然后判断 `depth > 0` 并且调用传入 `predicate` 函数为真，就是 `isArrayLikeObject`， 满足条件再次判断 `depth > 1` ，就递归调用 `baseFlatten` 扁平化数组，
不满足就将 `...value` 插入 `result` 数组，此时 `isStrict` 为 `true`，并不会进入 `else if` 判断， 最后将 `result` 数组返回。

## isFlattenable

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

## baseDifference

```js
/** Used as the size to enable large array optimizations. */
const LARGE_ARRAY_SIZE = 200

/**
 * The base implementation of methods like `difference` without support
 * for excluding multiple arrays.
 *
 * @private
 * @param {Array} array The array to inspect.
 * @param {Array} values The values to exclude.
 * @param {Function} [iteratee] The iteratee invoked per element.
 * @param {Function} [comparator] The comparator invoked per element.
 * @returns {Array} Returns the new array of filtered values.
 */
function baseDifference(array, values, iteratee, comparator) {
  let includes = arrayIncludes
  let isCommon = true
  const result = []
  const valuesLength = values.length

  if (!array.length) {
    return result
  }
  if (iteratee) {
    values = map(values, (value) => iteratee(value))
  }
  if (comparator) {
    includes = arrayIncludesWith
    isCommon = false
  }
  else if (values.length >= LARGE_ARRAY_SIZE) {
    includes = cacheHas
    isCommon = false
    values = new SetCache(values)
  }
  outer:
  for (let value of array) {
    const computed = iteratee == null ? value : iteratee(value)

    value = (comparator || value !== 0) ? value : 0
    if (isCommon && computed === computed) {
      let valuesIndex = valuesLength
      while (valuesIndex--) {
        if (values[valuesIndex] === computed) {
          continue outer
        }
      }
      result.push(value)
    }
    else if (!includes(values, computed, comparator)) {
      result.push(value)
    }
  }
  return result
}
```

`baseDifference` 接收 `array` `values` `iteratee` `comparator` 四个函数，但是 `difference` 只传 2 个函数，没有 `iteratee` `comparator` 跳过 2 个 `if` 判断，判断数组长度大于 200，使用 `SetCache` 类缓存 `values`。

进入 `for..of` 循环，此时 `iteratee === null` ，申明 `computed` 赋值为 `value`，接着使用 `while` 循环，将满足条件的 `value` 插入数组，最后将 `result` 返回。


## baseAssignValue

> 简单的属性拷贝。
```js
/**
 * The base implementation of `assignValue` and `assignMergeValue` without
 * value checks.
 *
 * @private
 * @param {Object} object The object to modify.
 * @param {string} key The key of the property to assign.
 * @param {*} value The value to assign.
 */
function baseAssignValue(object, key, value) {
  if (key == '__proto__') {
    Object.defineProperty(object, key, {
      'configurable': true,
      'enumerable': true,
      'value': value,
      'writable': true
    })
  } else {
    object[key] = value
  }
}
```

`baseAssignValue` 接收 2 个参数 `object` 赋值对象、`key`、`value` 。

判断 `key` 如果是 `__proto__` 是会调用 `Object.defineProperty` 为对象赋值，否则进行简单的属性赋值，
改方法只要是要进行简单的属性拷贝。

## baseWhile

```js
/**
 * The base implementation of methods like `dropWhile` and `takeWhile`.
 *
 * @private
 * @param {Array} array The array to query.
 * @param {Function} predicate The function invoked per iteration.
 * @param {boolean} [isDrop] Specify dropping elements instead of taking them.
 * @param {boolean} [fromRight] Specify iterating from right to left.
 * @returns {Array} Returns the slice of `array`.
 */
function baseWhile(array, predicate, isDrop, fromRight) {
  const { length } = array
  let index = fromRight ? length : -1

  while ((fromRight ? index-- : ++index < length) &&
    predicate(array[index], index, array)) {}

  return isDrop
    ? slice(array, (fromRight ? 0 : index), (fromRight ? index + 1 : length))
    : slice(array, (fromRight ? index + 1 : 0), (fromRight ? length : index))
}
```

## baseFill

```js
/**
  * The base implementation of `_.fill` without an iteratee call guard.
  *
  * @private
  * @param {Array} array The array to fill.
  * @param {*} value The value to fill `array` with.
  * @param {number} [start=0] The start position.
  * @param {number} [end=array.length] The end position.
  * @returns {Array} Returns `array`.
  */
function baseFill(array, value, start, end) {
  var length = array.length;

  start = toInteger(start);
  if (start < 0) {
    start = -start > length ? 0 : (length + start);
  }
  end = (end === undefined || end > length) ? length : toInteger(end);
  if (end < 0) {
    end += length;
  }
  end = start > end ? 0 : toLength(end);
  while (start < end) {
    array[start++] = value;
  }
  return array;
}
```

`baseFill` 是 `fill` 函数的基本实现，首先是处理 `length`、 `start`、 `end` 变量。

申明 `length` 变量，保存数组 `length`，调用 `toInteger` 对 `start` 取整，这里会对 `start` 做临界判断，如果 `start < 0`，`-start > length` 就将 `start` 赋值为 0，否则就赋值为 `length + start`。

接着对 `end` 也做了临界判断，`end` 等于 `undefined` 或者大于 `length` 情况，将 `end` 赋值为 `length`，否则将 `length` 赋值为调用 `toInteger` 取整后的 `end`，
`end < 0`， 赋值为 `end += length`。

然后进入 `while` 循环， `start` 累加，将 `array[start]` 赋值为 `value`，最后将填充后的 `array` 返回。

## baseFindIndex

```js
/**
 * The base implementation of `findIndex` and `findLastIndex`.
 *
 * @private
 * @param {Array} array The array to inspect.
 * @param {Function} predicate The function invoked per iteration.
 * @param {number} fromIndex The index to search from.
 * @param {boolean} [fromRight] Specify iterating from right to left.
 * @returns {number} Returns the index of the matched value, else `-1`.
 */
function baseFindIndex(array, predicate, fromIndex, fromRight) {
  const { length } = array
  let index = fromIndex + (fromRight ? 1 : -1)

  while ((fromRight ? index-- : ++index < length)) {
    if (predicate(array[index], index, array)) {
      return index
    }
  }
  return -1
}
```

`findIndex` 函数接收 4 个参数，`array` 数组、`predicate` 迭代函数，`fromIndex` 搜索开始下标，`fromRight` 是否从右到左。

开始申明 `length` 变量保存 `array` 长度，申明 `index` 初始下标，
接着通过 `while` 循环不断迭代， `fromRight` 为真 说明从右到左，`index` 累减，否则 `index` 累加小于数组长度，在循环中有个 `if` 判断，判断 `predicate` 函数的返回值判断是否为真，为真的话返回对象下标，否则返回 -1。

## castArrayLikeObject

```js
/**
 * Casts `value` to an empty array if it's not an array like object.
 *
 * @private
 * @param {*} value The value to inspect.
 * @returns {Array|Object} Returns the cast array-like object.
 */
function castArrayLikeObject(value) {
  return isArrayLikeObject(value) ? value : []
}
```

`castArrayLikeObject` 函数只是 `isArrayLikeObject` 的简单封装，如果 `value` 是对象数组则返回 `value`，否则返回空数组。

## map

```js
/**
 * Creates an array of values by running each element of `array` thru `iteratee`.
 * The iteratee is invoked with three arguments: (value, index, array).
 *
 * @since 5.0.0
 * @category Array
 * @param {Array} array The array to iterate over.
 * @param {Function} iteratee The function invoked per iteration.
 * @returns {Array} Returns the new mapped array.
 * @example
 *
 * function square(n) {
 *   return n * n
 * }
 *
 * map([4, 8], square)
 * // => [16, 64]
 */
function map(array, iteratee) {
  let index = -1
  const length = array == null ? 0 : array.length
  const result = new Array(length)

  while (++index < length) {
    result[index] = iteratee(array[index], index, array)
  }
  return result
}
```

`map` 函数接收 2 个参数， `array` 数组、`iteratee` 迭代器函数，申明 `result` 空数组，通过 `while` 循环，`index` 不断累加，将经过迭代器函数处理的 `value` 插入 `result`，最后将 `result` 返回。


### baseIntersection

```js
/**
 * The base implementation of methods like `intersection` that accepts an
 * array of arrays to inspect.
 *
 * @private
 * @param {Array} arrays The arrays to inspect.
 * @param {Function} [iteratee] The iteratee invoked per element.
 * @param {Function} [comparator] The comparator invoked per element.
 * @returns {Array} Returns the new array of shared values.
 */
function baseIntersection(arrays, iteratee, comparator) {
  const includes = comparator ? arrayIncludesWith : arrayIncludes
  const length = arrays[0].length
  const othLength = arrays.length
  const caches = new Array(othLength)
  const result = []

  let array
  let maxLength = Infinity
  let othIndex = othLength

  while (othIndex--) {
    array = arrays[othIndex]
    if (othIndex && iteratee) {
      array = map(array, (value) => iteratee(value))
    }
    maxLength = Math.min(array.length, maxLength)
    caches[othIndex] = !comparator && (iteratee || (length >= 120 && array.length >= 120))
      ? new SetCache(othIndex && array)
      : undefined
  }
  array = arrays[0]

  let index = -1
  const seen = caches[0]

  outer:
  while (++index < length && result.length < maxLength) {
    let value = array[index]
    const computed = iteratee ? iteratee(value) : value

    value = (comparator || value !== 0) ? value : 0
    if (!(seen
          ? cacheHas(seen, computed)
          : includes(result, computed, comparator)
        )) {
      othIndex = othLength
      while (--othIndex) {
        const cache = caches[othIndex]
        if (!(cache
              ? cacheHas(cache, computed)
              : includes(arrays[othIndex], computed, comparator))
            ) {
          continue outer
        }
      }
      if (seen) {
        seen.push(computed)
      }
      result.push(value)
    }
  }
  return result
}
```

TODO: 占坑

## strictLastIndexOf

```js

/**
 * A specialized version of `lastIndexOf` which performs strict equality
 * comparisons of values, i.e. `===`.
 *
 * @private
 * @param {Array} array The array to inspect.
 * @param {*} value The value to search for.
 * @param {number} fromIndex The index to search from.
 * @returns {number} Returns the index of the matched value, else `-1`.
 */
function strictLastIndexOf(array, value, fromIndex) {
  let index = fromIndex + 1
  while (index--) {
    if (array[index] === value) {
      return index
    }
  }
  return index
}
```

`strictLastIndexOf` 函数首先申明 `index` 变量为 `fromIndex + 1`，接着进入 `while` 循环，`index` 累减，如果 `array[index]` 与 `value` 全等，返回 `index` 下标，否则循环完毕返回 `index` 为 -1。

## baseFindIndex

```js
/**
 * The base implementation of `findIndex` and `findLastIndex`.
 *
 * @private
 * @param {Array} array The array to inspect.
 * @param {Function} predicate The function invoked per iteration.
 * @param {number} fromIndex The index to search from.
 * @param {boolean} [fromRight] Specify iterating from right to left.
 * @returns {number} Returns the index of the matched value, else `-1`.
 */
function baseFindIndex(array, predicate, fromIndex, fromRight) {
  const { length } = array
  let index = fromIndex + (fromRight ? 1 : -1)

  while ((fromRight ? index-- : ++index < length)) {
    if (predicate(array[index], index, array)) {
      return index
    }
  }
  return -1
}
```

`baseFindIndex` 函数首先会申明 `length` 变量保存数组长度，接着申明 `index`。

接着进入 `while` 循环，这里会根据 `fromRight` 是否为真，最升序、降序的处理，在循环中会调用 `predicate` 函数，如果为真，返回 `index` 下标，否则返回 -1。

## isIndex

> 检查是否是一个有效的索引

```js
/** Used as references for various `Number` constants. */
const MAX_SAFE_INTEGER = 9007199254740991

/** Used to detect unsigned integer values. */
const reIsUint = /^(?:0|[1-9]\d*)$/

/**
 * Checks if `value` is a valid array-like index.
 *
 * @private
 * @param {*} value The value to check.
 * @param {number} [length=MAX_SAFE_INTEGER] The upper bounds of a valid index.
 * @returns {boolean} Returns `true` if `value` is a valid index, else `false`.
 */
function isIndex(value, length) {
  const type = typeof value
  length = length == null ? MAX_SAFE_INTEGER : length

  return !!length &&
    (type == 'number' ||
      (type != 'symbol' && reIsUint.test(value))) &&
        (value > -1 && value % 1 == 0 && value < length)
}
```

## basePullAll

> pullAllBy 的基本实现。

```js
/**
 * The base implementation of `pullAllBy`.
 *
 * @private
 * @param {Array} array The array to modify.
 * @param {Array} values The values to remove.
 * @param {Function} [iteratee] The iteratee invoked per element.
 * @param {Function} [comparator] The comparator invoked per element.
 * @returns {Array} Returns `array`.
 */
function basePullAll(array, values, iteratee, comparator) {
  const indexOf = comparator ? baseIndexOfWith : baseIndexOf
  const length = values.length

  let index = -1
  let seen = array

  if (array === values) {
    values = copyArray(values)
  }
  if (iteratee) {
    seen = map(array, (value) => iteratee(value))
  }
  while (++index < length) {
    let fromIndex = 0
    const value = values[index]
    const computed = iteratee ? iteratee(value) : value

    while ((fromIndex = indexOf(seen, computed, fromIndex, comparator)) > -1) {
      if (seen !== array) {
        seen.splice(fromIndex, 1)
      }
      array.splice(fromIndex, 1)
    }
  }
  return array
}
```

`basePullAll` 函数接收 4 个参数，`array` 数组、`values` 要删除的值、`iteratee` 迭代器函数、`comparator` 比较函数。

首先申明 `indexOf` 变量，这里是一个三元表达式，如果有传入 `comparator` ，就是 `baseIndexOfWith`，否则赋值为 `baseIndexOf`。

申明 `length` 变量保存 `values` 长度，如果 `array` 与 `values` 全等，此时都是一个数组，为复杂对象、指针相同，调用 `copyArray` 函数赋值数组拷贝，赋值给 `values`。

如果有 `iteratee` 迭代器函数，将循环调用 `iteratee` 后的数组赋值给 `seen`。

接下来是双重 `while` 循环，第一层中 `index` 累加，申明 `fromIndex` 变量为 0 ，申明 `value` 变量保存循环的值，申明 `computed` 变量保存迭代器处理后的 `value`。

在第二层中会调用 `indexOf` 方法，传入 `seen` 迭代器函数处理后的数组、`computed` 处理后的 `value`、`fromIndex` 循环 `index`，`comparator` 比较函数，取出对应下标，并且赋值给 `fromIndex`，如果当前数组中有这个 `computed`，通过 `while` 会调用 `splice` 方法删除数组其中一个，最后将 `array` 返回。


## basePullAt

```js
/**
 * The base implementation of `pullAt` without support for individual
 * indexes or capturing the removed elements.
 *
 * @private
 * @param {Array} array The array to modify.
 * @param {number[]} indexes The indexes of elements to remove.
 * @returns {Array} Returns `array`.
 */
function basePullAt(array, indexes) {
  let length = array ? indexes.length : 0 // 2
  const lastIndex = length - 1 // 1

  while (length--) { // 1 0
    let previous // undiefind 3
    const index = indexes[length] // 3 1
    if (length == lastIndex || index !== previous) {
      previous = index // 3
      if (isIndex(index)) {
        array.splice(index, 1)
      } else {
        baseUnset(array, index)
      }
    }
  }
  return array
}
```

`basePullAt` 函数接收 2 个参数，`array` 要修改数组、`indexes` 删除的元素的索引。

首先申明 `length` 变量保存 `indexes` 长度，默认为 0，`lastIndex` 为 `length - 1`。

进入 `while` 循环，`length` 累减，在循环中会从 `indexes` 取出删除元素下标，
这里有个 `if` 判断，判断 `length == lastIndex`，第一次循环会符合这个条件，第二次循环会比较 `index !== previous`。

进入 `if`，会调用 `isIndex` 判断 `index` 为有效下标，是就调用 `splice` 删除 `index` 所在下标元素，此方法会修改原数组，如果不是就调用 `baseUnset` 删除 `array` 中的这个路径，最后将数组返回。

## baseSortedIndex

> 执行数组的二进制搜索以确定“值”的索引, 插入数组中。

```js
/** Used as references for the maximum length and index of an array. */
const MAX_ARRAY_LENGTH = 4294967295
const HALF_MAX_ARRAY_LENGTH = MAX_ARRAY_LENGTH >>> 1

/**
 * The base implementation of `sortedIndex` and `sortedLastIndex` which
 * performs a binary search of `array` to determine the index at which `value`
 * should be inserted into `array` in order to maintain its sort order.
 *
 * @private
 * @param {Array} array The sorted array to inspect.
 * @param {*} value The value to evaluate.
 * @param {boolean} [retHighest] Specify returning the highest qualified index.
 * @returns {number} Returns the index at which `value` should be inserted
 *  into `array`.
 */
function baseSortedIndex(array, value, retHighest) {
  let low = 0
  let high = array == null ? low : array.length

  if (typeof value == 'number' && value === value && high <= HALF_MAX_ARRAY_LENGTH) {
    while (low < high) {
      const mid = (low + high) >>> 1
      const computed = array[mid]
      if (computed !== null && !isSymbol(computed) &&
          (retHighest ? (computed <= value) : (computed < value))) {
        low = mid + 1
      } else {
        high = mid
      }
    }
    return high
  }
  return baseSortedIndexBy(array, value, (value) => value, retHighest)
}
```

`baseSortedIndex` 函数接收 3 个参数，`array` 数组、`value` 要插入的值、`retHighest` 是否返回最大索引。

申明 `low` 变量为 0，申明 `high` 变量为数组长度，默认为 0。

这里会进行一些判断， `value` 是 `number` 类型、`value` 不是 `NaN`、`high` 小于最大数组长度，
进入 `if` 判断后，会进行 `while` 循环。

此时 `low + high` 为正数，运算的结果与右移运算符（>>）完全一致。

```js
const mid = (low + high) >>> 1
```

> 右移运算符（>>）表示将一个数的二进制值向右移动指定的位数，头部补0，即除以2的指定次方（最高位即符号位不参与移动）。

```js
5 >> 1
// 2
// 相当于 5 / 2 = 2

21 >> 2
// 5
// 相当于 21 / 4 = 5
```

申明 `computed` 保存 `mid` 下标对应的  `value`，这里会判断 `computed` 不为 `null`、`computed` 不是 `isSymbol`，以及是否传入 `retHighest` 对 `computed < value` 的比较，如果全部符合，就将 `low` 赋值为 `mid + 1` ，继续循环，直到进入 `else` 循环将 `mid` 赋值给 `high`，或者循环结束 `return high`。

```js
return baseSortedIndexBy(array, value, (value) => value, retHighest)
```

如果不满足上面的条件，`baseSortedIndex` 函数最后会调用 `baseSortedIndexBy` 函数，将它的调用结果返回。

## baseSortedIndexBy

```js
/** Used as references for the maximum length and index of an array. */
const MAX_ARRAY_LENGTH = 4294967295
const MAX_ARRAY_INDEX = MAX_ARRAY_LENGTH - 1

/**
 * The base implementation of `sortedIndexBy` and `sortedLastIndexBy`
 * which invokes `iteratee` for `value` and each element of `array` to compute
 * their sort ranking. The iteratee is invoked with one argument (value).
 *
 * @private
 * @param {Array} array The sorted array to inspect.
 * @param {*} value The value to evaluate.
 * @param {Function} iteratee The iteratee invoked per element.
 * @param {boolean} [retHighest] Specify returning the highest qualified index.
 * @returns {number} Returns the index at which `value` should be inserted
 *  into `array`.
 */
function baseSortedIndexBy(array, value, iteratee, retHighest) {
  value = iteratee(value)

  let low = 0
  let high = array == null ? 0 : array.length
  const valIsNaN = value !== value
  const valIsNull = value === null
  const valIsSymbol = isSymbol(value)
  const valIsUndefined = value === undefined

  while (low < high) {
    let setLow
    const mid = Math.floor((low + high) / 2)
    const computed = iteratee(array[mid])
    const othIsDefined = computed !== undefined
    const othIsNull = computed === null
    const othIsReflexive = computed === computed
    const othIsSymbol = isSymbol(computed)

    if (valIsNaN) {
      setLow = retHighest || othIsReflexive
    } else if (valIsUndefined) {
      setLow = othIsReflexive && (retHighest || othIsDefined)
    } else if (valIsNull) {
      setLow = othIsReflexive && othIsDefined && (retHighest || !othIsNull)
    } else if (valIsSymbol) {
      setLow = othIsReflexive && othIsDefined && !othIsNull && (retHighest || !othIsSymbol)
    } else if (othIsNull || othIsSymbol) {
      setLow = false
    } else {
      setLow = retHighest ? (computed <= value) : (computed < value)
    }
    if (setLow) {
      low = mid + 1
    } else {
      high = mid
    }
  }
  return Math.min(high, MAX_ARRAY_INDEX)
}
```

`baseSortedIndexBy` 是 `sortedIndex` 这一系列函数的基本实现，接收 4 和参数，`array`检查数组、`value` 检查值、`iteratee` 迭代函数、`retHighest` 是否返回最大索引。

首先会调用 `iteratee` 处理 `value`，

```js
let low = 0
let high = array == null ? 0 : array.length
const valIsNaN = value !== value
const valIsNull = value === null
const valIsSymbol = isSymbol(value)
const valIsUndefined = value === undefined
```

申明一系列初始变量，方面后面调用。

接着会进入 `while` 循环，在循环中也申明一系列变量：

```js
const mid = Math.floor((low + high) / 2) // 取中间 index
const computed = iteratee(array[mid]) // 中间值
const othIsDefined = computed !== undefined
const othIsNull = computed === null
const othIsReflexive = computed === computed
const othIsSymbol = isSymbol(computed)
```

接着就是很多类型判断，这里会根据类型将 `setLow` 赋值，然后会判断 `setLow` 如果为真，`low` 赋值为 `mid + 1`，否则就将 `high` 赋值为 `mid` 继续循环。

最后返回 `high` 与 `MAX_ARRAY_INDEX` 之间的最小值。

## baseSortedUniq

```js
/**
 * The base implementation of `sortedUniq` and `sortedUniqBy`.
 *
 * @private
 * @param {Array} array The array to inspect.
 * @param {Function} [iteratee] The iteratee invoked per element.
 * @returns {Array} Returns the new duplicate free array.
 */
function baseSortedUniq(array, iteratee) {
  let seen
  let index = -1
  let resIndex = 0

  const { length } = array
  const result = []

  while (++index < length) {
    const value = array[index], computed = iteratee ? iteratee(value) : value
    if (!index || !eq(computed, seen)) {
      seen = computed
      result[resIndex++] = value === 0 ? 0 : value
    }
  }
  return result
}
```

`baseSortedUniq` 函数接收 2 个参数，`array` 检查数组、 `iteratee` 迭代函数。

首先申明一系列变量：

```js
let seen
let index = -1 // 起始 index
let resIndex = 0 // result 下标

const { length } = array // 数组长度
const result = [] // 要返回数组
```

进入 `while` 循环，`index` 累加，这里会申明 `value` 变量保存下标对应的 `value`， `computed` 迭代器函数 `iteratee` 处理后的 `value`。

接着进行判断，判断 `!index` 为真，`index` 初始值为 -1，循环累加，是第一个循环时，`index` 为 0 的情况，或者 `computed` 与 `seen` 不相等， 进入判断后会将 `seen` 赋值为 `computed`，这里保存了临时变量 `seen`，实现数组的去重，将 `value` 插入 `result`。

循环结束后，将 `result` 返回。


## baseUniq

> union 函数的基本实现。

```js
/** Used as the size to enable large array optimizations. */
const LARGE_ARRAY_SIZE = 200

/**
 * The base implementation of `uniqBy`.
 *
 * @private
 * @param {Array} array The array to inspect.
 * @param {Function} [iteratee] The iteratee invoked per element.
 * @param {Function} [comparator] The comparator invoked per element.
 * @returns {Array} Returns the new duplicate free array.
 */
function baseUniq(array, iteratee, comparator) {
  let index = -1
  let includes = arrayIncludes
  let isCommon = true

  const { length } = array
  const result = []
  let seen = result

  if (comparator) {
    isCommon = false
    includes = arrayIncludesWith
  }
  else if (length >= LARGE_ARRAY_SIZE) {
    const set = iteratee ? null : createSet(array)
    if (set) {
      return setToArray(set)
    }
    isCommon = false
    includes = cacheHas
    seen = new SetCache
  }
  else {
    seen = iteratee ? [] : result
  }
  outer:
  while (++index < length) {
    let value = array[index]
    const computed = iteratee ? iteratee(value) : value

    value = (comparator || value !== 0) ? value : 0
    if (isCommon && computed === computed) {
      let seenIndex = seen.length
      while (seenIndex--) {
        if (seen[seenIndex] === computed) {
          continue outer
        }
      }
      if (iteratee) {
        seen.push(computed)
      }
      result.push(value)
    }
    else if (!includes(seen, computed, comparator)) {
      if (seen !== result) {
        seen.push(computed)
      }
      result.push(value)
    }
  }
  return result
}
```

`baseUniq` 函数接收 3 个参数，`array` 数组、`iteratee` 迭代函数、`comparator` 比较函数。

开始是申明一些初始变量:

```js
let index = -1
let includes = arrayIncludes
let isCommon = true

const { length } = array
const result = []
let seen = result
```

如果传入了 `comparator` 比较函数，将 `isCommon` 赋值 `true` ，`includes` 赋值为
`arrayIncludesWith` 函数，如果数组长度大于 `LARGE_ARRAY_SIZE` 200 ，会使用 `SetCache` 类做缓存优化。

接着进入 `while` 循环，`index` 累加，申明 `value` 变量保存当前循环 `value`，申明 `computed`变量不保存迭代函数 `iteratee` 处理后的 `value`。

接着会判断 `isCommon`，`isCommon` 为 `true` 说明没有传入 `length < LARGE_ARRAY_SIZE`，按照普通模式处理，`seenIndex` 累减，如果 `seenIndex` 对应的 `value` 与 `computed` 相等， `continue outer`，如果有 `iteratee` ，将 `computed` 插入 `seen`，接着将 `value` 插入 `result`，最后将 `result` 返回。


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