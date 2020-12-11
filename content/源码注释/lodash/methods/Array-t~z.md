## tail

> 获取数组中除了第一个元素的剩余数组。

```js
_.tail(array)
```

```js
/**
 * Gets all but the first element of `array`.
 *
 * @since 4.0.0
 * @category Array
 * @param {Array} array The array to query.
 * @returns {Array} Returns the slice of `array`.
 * @example
 *
 * tail([1, 2, 3])
 * // => [2, 3]
 */
function tail(array) {
  const length = array == null ? 0 : array.length
  if (!length) {
    return []
  }
  const [, ...result] = array
  return result
}
```

`tail` 函数开始是申明 `length` 变量保存 `array` 长度，默认为 0，接着判断如果 `length` 为 `false`，`return` 空数组。

然后使用了数组解构、`spread` 获取了数组中除了第一个元素的剩余数组 `result` ，
最后将 `result` 返回。

## take

> 从数组的起始元素开始提取 N 个元素。

```js
_.take(array, [n=1])
```

```js
/**
 * Creates a slice of `array` with `n` elements taken from the beginning.
 *
 * @since 0.1.0
 * @category Array
 * @param {Array} array The array to query.
 * @param {number} [n=1] The number of elements to take.
 * @returns {Array} Returns the slice of `array`.
 * @example
 *
 * take([1, 2, 3])
 * // => [1]
 *
 * take([1, 2, 3], 2)
 * // => [1, 2]
 *
 * take([1, 2, 3], 5)
 * // => [1, 2, 3]
 *
 * take([1, 2, 3], 0)
 * // => []
 */
function take(array, n=1) {
  if (!(array != null && array.length)) {
    return []
  }
  return slice(array, 0, n < 0 ? 0 : n)
}
```

`take` 函数只是 `slice` 函数的简单包装，接收 2 个参数，`array` 数组、`n` 提取个数，默认为 1 。

开始是对 `array` 的非空和有效长度判断，如果不符合，`return` 空数组。

最后调用 `slice` 函数，传入 `start` 0，`end` 最小为 0，返回切割后的数组。

## takeRight

> 从数组的结束元素开始提取 N 个数组。

```js
_.takeRight(array, [n=1])
```

```js
/**
 * Creates a slice of `array` with `n` elements taken from the end.
 *
 * @since 3.0.0
 * @category Array
 * @param {Array} array The array to query.
 * @param {number} [n=1] The number of elements to take.
 * @returns {Array} Returns the slice of `array`.
 * @example
 *
 * takeRight([1, 2, 3])
 * // => [3]
 *
 * takeRight([1, 2, 3], 2)
 * // => [2, 3]
 *
 * takeRight([1, 2, 3], 5)
 * // => [1, 2, 3]
 *
 * takeRight([1, 2, 3], 0)
 * // => []
 */
function takeRight(array, n=1) {
  const length = array == null ? 0 : array.length
  if (!length) {
    return []
  }
  n = length - n
  return slice(array, n < 0 ? 0 : n, length)
}
```

`takeRight` 函数接收 2 个参数，`array` 数组、`n` 提取个数，默认为 1 。

申明 `length` 变量保存 `array` 长度，默认为 0，如果 `length` 为 `fasle`，`return` 空数组。

将 `n` 赋值为 `length - n`，
最后调用 `slice` ，与 `take` 方法不同的就是调用 `slice` 函数传入的第 3 个参数为 `length` 数组长度。

## takeRightWhile

> 从数组的最右边开始提取数组，直到 predicate 返回假值。predicate 会传入三个参数：(value, index, array)。

```js
_.takeRightWhile(array, [predicate=_.identity])
```

```js
/**
 * Creates a slice of `array` with elements taken from the end. Elements are
 * taken until `predicate` returns falsey. The predicate is invoked with
 * three arguments: (value, index, array).
 *
 * @since 3.0.0
 * @category Array
 * @param {Array} array The array to query.
 * @param {Function} predicate The function invoked per iteration.
 * @returns {Array} Returns the slice of `array`.
 * @example
 *
 * const users = [
 *   { 'user': 'barney',  'active': false },
 *   { 'user': 'fred',    'active': true },
 *   { 'user': 'pebbles', 'active': true }
 * ]
 *
 * takeRightWhile(users, ({ active }) => active)
 * // => objects for ['fred', 'pebbles']
 */
function takeRightWhile(array, predicate) {
  return (array != null && array.length)
    ? baseWhile(array, predicate, false, true)
    : []
}
```

`takeRightWhile` 函数接收 2 个参数，`array` 数组、`predicate` 迭代器函数。

函数会 `return` 一个三元表达式，如果 `array` 不为 `null` 并且有长度，就调用 `baseWhile` 函数返回处理后的数组，否则返回空数组。

## takeWhile

> 从数组的开始提取数组，直到 predicate 返回假值。predicate 会传入三个参数：(value, index, array)。

```js
/**
 * Creates a slice of `array` with elements taken from the beginning. Elements
 * are taken until `predicate` returns falsey. The predicate is invoked with
 * three arguments: (value, index, array).
 *
 * @since 3.0.0
 * @category Array
 * @param {Array} array The array to query.
 * @param {Function} predicate The function invoked per iteration.
 * @returns {Array} Returns the slice of `array`.
 * @example
 *
 * const users = [
 *   { 'user': 'barney',  'active': true },
 *   { 'user': 'fred',    'active': true },
 *   { 'user': 'pebbles', 'active': false }
 * ]
 *
 * takeWhile(users, ({ active }) => active)
 * // => objects for ['barney', 'fred']
 */
function takeWhile(array, predicate) {
  return (array != null && array.length)
    ? baseWhile(array, predicate)
    : []
}
```

`takeWhile` 与 `takeRightWhile` 函数调用一致，只是 `takeRightWhile` 函数调用 `baseWhile` 的时候传入了第四个参数为 `true`，`baseWhile` 会从右向左处理数组。

## union

> 创建顺序排列的唯一值组成的数组。所有值经过 SameValueZero 等值比较。

```js
_.union([arrays])
```

```js
/**
 * Creates an array of unique values, in order, from all given arrays using
 * [`SameValueZero`](http://ecma-international.org/ecma-262/7.0/#sec-samevaluezero)
 * for equality comparisons.
 *
 * @since 0.1.0
 * @category Array
 * @param {...Array} [arrays] The arrays to inspect.
 * @returns {Array} Returns the new array of combined values.
 * @see difference, unionBy, unionWith, without, xor, xorBy
 * @example
 *
 * union([2, 3], [1, 2])
 * // => [2, 3, 1]
 */
function union(...arrays) {
  return baseUniq(baseFlatten(arrays, 1, isArrayLikeObject, true))
}
```

`union` 函数使用 `reset` 运算符将参数转成数组，
调用 `baseUniq` 函数，并将 `baseFlatten` 扁平化 `arrays` 数组作为参数传入，最后返回调用 `baseUniq` 返回的数组。

## unionBy

> 这个方法类似 _.union，除了它接受一个 iteratee 调用每一个数组和值。iteratee 会传入一个参数：(value)。

```js
_.unionBy([arrays], [iteratee=_.identity])
```

```js
/**
 * This method is like `union` except that it accepts `iteratee` which is
 * invoked for each element of each `arrays` to generate the criterion by
 * which uniqueness is computed. Result values are chosen from the first
 * array in which the value occurs. The iteratee is invoked with one argument:
 * (value).
 *
 * @since 4.0.0
 * @category Array
 * @param {...Array} [arrays] The arrays to inspect.
 * @param {Function} iteratee The iteratee invoked per element.
 * @returns {Array} Returns the new array of combined values.
 * @see difference, union, unionWith, without, xor, xorBy
 * @example
 *
 * unionBy([2.1], [1.2, 2.3], Math.floor)
 * // => [2.1, 1.2]
 */
function unionBy(...arrays) {
  let iteratee = last(arrays)
  if (isArrayLikeObject(iteratee)) {
    iteratee = undefined
  }
  return baseUniq(baseFlatten(arrays, 1, isArrayLikeObject, true), iteratee)
}
```

`unionBy` 接收 `arrays` 数组，
首先调用 `last` 方法获取 `arrays` 数组的最后一个参数， `iteratee` 迭代函数，
如果 `isArrayLikeObject` 是类数组对象，就将 `iteratee` 值为 `undefined`，说明没有传入 `iteratee`。

最后调用 `baseUniq` 函数，并且之前的 `iteratee` 函数传入。

## unionWith

> 这个方法类似 _.union， 除了它接受一个 comparator 调用每一个数组元素的值。 comparator 会传入2个参数：(arrVal, othVal)。

```js
_.unionWith([arrays], [comparator])
```

```js
/**
 * This method is like `union` except that it accepts `comparator` which
 * is invoked to compare elements of `arrays`. Result values are chosen from
 * the first array in which the value occurs. The comparator is invoked
 * with two arguments: (arrVal, othVal).
 *
 * @since 4.0.0
 * @category Array
 * @param {...Array} [arrays] The arrays to inspect.
 * @param {Function} [comparator] The comparator invoked per element.
 * @returns {Array} Returns the new array of combined values.
 * @see difference, union, unionBy, without, xor, xorBy
 * @example
 *
 * const objects = [{ 'x': 1, 'y': 2 }, { 'x': 2, 'y': 1 }]
 * const others = [{ 'x': 1, 'y': 1 }, { 'x': 1, 'y': 2 }]
 *
 * unionWith(objects, others, isEqual)
 * // => [{ 'x': 1, 'y': 2 }, { 'x': 2, 'y': 1 }, { 'x': 1, 'y': 1 }]
 */
function unionWith(...arrays) {
  let comparator = last(arrays)
  comparator = typeof comparator == 'function' ? comparator : undefined
  return baseUniq(baseFlatten(arrays, 1, isArrayLikeObject, true), undefined, comparator)
}
```

`unionWith` 函数接收 `arrays` 数组，调用 `last` 函数取出 `comparator` 比较函数。

如果 `comparator` 不是 `function` 就将 `comparator` 赋值为 `undefined`，最后调用 `baseUniq` 方法，只是此时的参数与 `unionBy` 不同，第 2 个参数为 `undefined` ，第 3 个参数为 `comparator` 函数。

`baseUniq` 函数：

```js
/** Used as the size to enable large array optimizations. */
const LARGE_ARRAY_SIZE = 200

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

## uniq

> 创建一个不重复的数组副本。使用了 SameValueZero 等值比较。只有首次出现的元素才会被保留。

```js
_.uniq(array)
```

```js
/**
 * Creates a duplicate-free version of an array, using
 * [`SameValueZero`](http://ecma-international.org/ecma-262/7.0/#sec-samevaluezero)
 * for equality comparisons, in which only the first occurrence of each element
 * is kept. The order of result values is determined by the order they occur
 * in the array.
 *
 * @since 0.1.0
 * @category Array
 * @param {Array} array The array to inspect.
 * @returns {Array} Returns the new duplicate free array.
 * @see uniqBy, uniqWith
 * @example
 *
 * uniq([2, 1, 2])
 * // => [2, 1]
 */
function uniq(array) {
  return (array != null && array.length)
    ? baseUniq(array)
    : []
}
```

`uniq` 返回一个三元表达式，如果 `array` 不为 `null` 并且有长度，返回调用 `baseUniq` 函数后的数组，否则
返回空数组。

## uniqBy

> 这个方法类似 _.uniq，除了它接受一个 iteratee 调用每一个数组和值来计算唯一性。iteratee 会传入一个参数：(value)。

```js
_.uniqBy(array, [iteratee=_.identity])
```

```js
/**
 * This method is like `uniq` except that it accepts `iteratee` which is
 * invoked for each element in `array` to generate the criterion by which
 * uniqueness is computed. The order of result values is determined by the
 * order they occur in the array. The iteratee is invoked with one argument:
 * (value).
 *
 * @since 4.0.0
 * @category Array
 * @param {Array} array The array to inspect.
 * @param {Function} iteratee The iteratee invoked per element.
 * @returns {Array} Returns the new duplicate free array.
 * @see uniq, uniqWith
 * @example
 *
 * uniqBy([2.1, 1.2, 2.3], Math.floor)
 * // => [2.1, 1.2]
 */
function uniqBy(array, iteratee) {
  return (array != null && array.length)
    ? baseUniq(array, iteratee)
    : []
}
```

`uniqBy` 函数与 `uniq` 函数相似，只是多传入了 `iteratee` 迭代函数。


## uniqWith

> 这个方法类似 _.union， 除了它接受一个 comparator 调用每一个数组元素的值。 comparator 会传入2个参数：(arrVal, othVal)。

```js
_.uniqWith(array, [comparator])
```

```js
/**
 * This method is like `uniq` except that it accepts `comparator` which
 * is invoked to compare elements of `array`. The order of result values is
 * determined by the order they occur in the array.The comparator is invoked
 * with two arguments: (arrVal, othVal).
 *
 * @since 4.0.0
 * @category Array
 * @param {Array} array The array to inspect.
 * @param {Function} [comparator] The comparator invoked per element.
 * @returns {Array} Returns the new duplicate free array.
 * @see uniq, uniqBy
 * @example
 *
 * const objects = [{ 'x': 1, 'y': 2 }, { 'x': 2, 'y': 1 }, { 'x': 1, 'y': 2 }]
 *
 * uniqWith(objects, isEqual)
 * // => [{ 'x': 1, 'y': 2 }, { 'x': 2, 'y': 1 }]
 */
function uniqWith(array, comparator) {
  comparator = typeof comparator == 'function' ? comparator : undefined
  return (array != null && array.length)
    ? baseUniq(array, undefined, comparator)
    : []
}
```

`uniqWith` 函数首先会对 `comparator` 进行类型判断，如果 `comparator` 不是 `function`，赋值为 `undefined`。

然后会返回一个三元表达式，`array` 为有效数组，就调用 `baseUniq` 函数，传入第三个参数为 `comparator`，将函数返回值返回，否则就返回空数组。

## unzip

> 这个方法类似 _.zip，除了它接收一个打包后的数组并且还原为打包前的状态。

```js
_.unzip(array)
```

```js
/**
 * This method is like `zip` except that it accepts an array of grouped
 * elements and creates an array regrouping the elements to their pre-zip
 * configuration.
 *
 * @since 1.2.0
 * @category Array
 * @param {Array} array The array of grouped elements to process.
 * @returns {Array} Returns the new array of regrouped elements.
 * @see unzipWith, zip, zipObject, zipObjectDeep, zipWith
 * @example
 *
 * const zipped = zip(['a', 'b'], [1, 2], [true, false])
 * // => [['a', 1, true], ['b', 2, false]]
 *
 * unzip(zipped)
 * // => [['a', 'b'], [1, 2], [true, false]]
 */
function unzip(array) {
  if (!(array != null && array.length)) {
    return []
  }
  let length = 0
  array = filter(array, (group) => {
    if (isArrayLikeObject(group)) {
      length = Math.max(group.length, length)
      return true
    }
  })
  let index = -1
  const result = new Array(length)
  while (++index < length) {
    result[index] = map(array, baseProperty(index))
  }
  return result
}
```

`unzip` 函数首先会进行 `array` 非空及长度判断，申明 `length` 变量为 0。

调用 `filter` 函数，循环 `array` 取出 `array` 中 `group` 的最大长度，保存在 `length`。

接着进入 `while` 循环， `index` 累加，这里会将 `map` 函数处理后数组赋值给 `result` 的 `index`。

```js
function baseProperty(key) {
  return (object) => object == null ? undefined : object[key]
}
```

`baseProperty` 函数会返回 `object` 对应的 `value`。

最后将 `result` 返回。

## unzipWith

> 这个方法类似 _.unzip，除了它接受一个 iteratee 来决定如何重组解包后的数组。iteratee 会传入4个参数：(accumulator, value, index, group)。每组的第一个元素作为初始化的值。

```js
_.unzipWith(array, [iteratee=_.identity])
```

```js
/**
 * This method is like `unzip` except that it accepts `iteratee` to specify
 * how regrouped values should be combined. The iteratee is invoked with the
 * elements of each group: (...group).
 *
 * @since 3.8.0
 * @category Array
 * @param {Array} array The array of grouped elements to process.
 * @param {Function} iteratee The function to combine
 *  regrouped values.
 * @returns {Array} Returns the new array of regrouped elements.
 * @example
 *
 * const zipped = zip([1, 2], [10, 20], [100, 200])
 * // => [[1, 10, 100], [2, 20, 200]]
 *
 * unzipWith(zipped, add)
 * // => [3, 30, 300]
 */
function unzipWith(array, iteratee) {
  if (!(array != null && array.length)) {
    return []
  }
  const result = unzip(array)
  return map(result, (group) => iteratee.apply(undefined, group))
}
```

`unzipWith` 函数接收 2 个参数，`array` 数组、`iteratee` 迭代函数。

首先会对数组对非空、长度判断。

接着调用 `unzip` 函数对数组进行 `解包`，`map` 循环，调用 `iteratee` 函数循环处理 `result` 数组的每一项，最将处理后的 `result` 返回。

## without

> 创建一个移除了所有提供的 values 的数组。使用了 SameValueZero 等值比较。

```js
_.without(array, [values])
```

```js
/**
 * Creates an array excluding all given values using
 * [`SameValueZero`](http://ecma-international.org/ecma-262/7.0/#sec-samevaluezero)
 * for equality comparisons.
 *
 * **Note:** Unlike `pull`, this method returns a new array.
 *
 * @since 0.1.0
 * @category Array
 * @param {Array} array The array to inspect.
 * @param {...*} [values] The values to exclude.
 * @returns {Array} Returns the new array of filtered values.
 * @see difference, union, unionBy, unionWith, xor, xorBy, xorWith
 * @example
 *
 * without([2, 1, 2, 3], 1, 2)
 * // => [3]
 */
function without(array, ...values) {
  return isArrayLikeObject(array) ? baseDifference(array, values) : []
}
```

## xor

> 创建一个包含了所有唯一值的数组。使用了 symmetric difference 等值比较。

```js
_.xor([arrays])
```

```js
/**
 * Creates an array of unique values that is the
 * [symmetric difference](https://en.wikipedia.org/wiki/Symmetric_difference)
 * of the given arrays. The order of result values is determined by the order
 * they occur in the arrays.
 *
 * @since 2.4.0
 * @category Array
 * @param {...Array} [arrays] The arrays to inspect.
 * @returns {Array} Returns the new array of filtered values.
 * @see difference, union, unionBy, unionWith, without, xorBy, xorWith
 * @example
 *
 * xor([2, 1], [2, 3])
 * // => [1, 3]
 */
function xor(...arrays) {
  return baseXor(filter(arrays, isArrayLikeObject))
}
```

## xorBy

> 这个方法类似 _.xor，除了它接受一个 iteratee 调用每一个数组和值。iteratee 会传入一个参数：(value)。

```js
_.xorBy([arrays], [iteratee=_.identity])
```

```js
/**
 * This method is like `xor` except that it accepts `iteratee` which is
 * invoked for each element of each `arrays` to generate the criterion by
 * which they're compared. The order of result values is determined
 * by the order they occur in the arrays. The iteratee is invoked with one
 * argument: (value).
 *
 * @since 4.0.0
 * @category Array
 * @param {...Array} [arrays] The arrays to inspect.
 * @param {Function} iteratee The iteratee invoked per element.
 * @returns {Array} Returns the new array of filtered values.
 * @see difference, union, unionBy, unionWith, without, xor, xorWith
 * @example
 *
 * xorBy([2.1, 1.2], [2.3, 3.4], Math.floor)
 * // => [1.2, 3.4]
 */
function xorBy(...arrays) {
  let iteratee = last(arrays)
  if (isArrayLikeObject(iteratee)) {
    iteratee = undefined
  }
  return baseXor(filter(arrays, isArrayLikeObject), iteratee)
}
```

## xorWith

> 这个方法类似 _.xor，除了它接受一个 comparator 调用每一个数组元素的值。 comparator 会传入2个参数：(arrVal, othVal)。

```js
_.xorBy([arrays], [iteratee=_.identity])
```

```js
/**
 * This method is like `xor` except that it accepts `comparator` which is
 * invoked to compare elements of `arrays`. The order of result values is
 * determined by the order they occur in the arrays. The comparator is invoked
 * with two arguments: (arrVal, othVal).
 *
 * @since 4.0.0
 * @category Array
 * @param {...Array} [arrays] The arrays to inspect.
 * @param {Function} [comparator] The comparator invoked per element.
 * @returns {Array} Returns the new array of filtered values.
 * @see difference, union, unionBy, unionWith, without, xor, xorBy
 * @example
 *
 * const objects = [{ 'x': 1, 'y': 2 }, { 'x': 2, 'y': 1 }]
 * const others = [{ 'x': 1, 'y': 1 }, { 'x': 1, 'y': 2 }]
 *
 * xorWith(objects, others, isEqual)
 * // => [{ 'x': 2, 'y': 1 }, { 'x': 1, 'y': 1 }]
 */
function xorWith(...arrays) {
  let comparator = last(arrays)
  comparator = typeof comparator == 'function' ? comparator : undefined
  return baseXor(filter(arrays, isArrayLikeObject), undefined, comparator)
}
```

## zip

> 创建一个打包所有元素后的数组。第一个元素包含所有提供数组的第一个元素，第二个包含所有提供数组的第二个元素，以此类推。

```js
_.zip([arrays])
```

```js
/**
 * Creates an array of grouped elements, the first of which contains the
 * first elements of the given arrays, the second of which contains the
 * second elements of the given arrays, and so on.
 *
 * @since 0.1.0
 * @category Array
 * @param {...Array} [arrays] The arrays to process.
 * @returns {Array} Returns the new array of grouped elements.
 * @see unzip, unzipWith, zipObject, zipObjectDeep, zipWith
 * @example
 *
 * zip(['a', 'b'], [1, 2], [true, false])
 * // => [['a', 1, true], ['b', 2, false]]
 */
function zip(...arrays) {
  return unzip(arrays)
}
```

## zipObject

> 这个方法类似 _.fromPairs，除了它接受2个数组，一个作为属性名，一个作为属性值。

```js
_.zipObject([props=[]], [values=[]])
```

```js
/**
 * This method is like `fromPairs` except that it accepts two arrays,
 * one of property identifiers and one of corresponding values.
 *
 * @since 0.4.0
 * @category Array
 * @param {Array} [props=[]] The property identifiers.
 * @param {Array} [values=[]] The property values.
 * @returns {Object} Returns the new object.
 * @see unzip, unzipWith, zip, zipObjectDeep, zipWith
 * @example
 *
 * zipObject(['a', 'b'], [1, 2])
 * // => { 'a': 1, 'b': 2 }
 */
function zipObject(props, values) {
  return baseZipObject(props || [], values || [], assignValue)
}
```

## zipObjectDeep

> 这个方法类似 _.zipObject，除了它支持属性路径。 This method is like _.zipObject except that it supports property paths。

```js
_.zipObjectDeep([props=[]], [values=[]])
```

```js
/**
 * This method is like `zipObject` except that it supports property paths.
 *
 * @since 4.1.0
 * @category Array
 * @param {Array} [props=[]] The property identifiers.
 * @param {Array} [values=[]] The property values.
 * @returns {Object} Returns the new object.
 * @see unzip, unzipWith, zip, zipObject, zipWith
 * @example
 *
 * zipObjectDeep(['a.b[0].c', 'a.b[1].d'], [1, 2])
 * // => { 'a': { 'b': [{ 'c': 1 }, { 'd': 2 }] } }
 */
function zipObjectDeep(props, values) {
  return baseZipObject(props || [], values || [], baseSet)
}
```

## zipWith

> 这个方法类似 _.zip， 除了它接受一个 iteratee 决定如何重组值。 iteratee 会调用每一组元素。

```js
_.zipWith([arrays], [iteratee=_.identity])
```

```js
/**
 * This method is like `zip` except that it accepts `iteratee` to specify
 * how grouped values should be combined. The iteratee is invoked with the
 * elements of each group: (...group).
 *
 * @since 3.8.0
 * @category Array
 * @param {...Array} [arrays] The arrays to process.
 * @param {Function} iteratee The function to combine
 *  grouped values.
 * @returns {Array} Returns the new array of grouped elements.
 * @see unzip, unzipWith, zip, zipObject, zipObjectDeep, zipWith
 * @example
 *
 * zipWith([1, 2], [10, 20], [100, 200], (a, b, c) => a + b + c)
 * // => [111, 222]
 */
function zipWith(...arrays) {
  const length = arrays.length
  let iteratee = length > 1 ? arrays[length - 1] : undefined
  iteratee = typeof iteratee == 'function' ? (arrays.pop(), iteratee) : undefined
  return unzipWith(arrays, iteratee)
}
```
