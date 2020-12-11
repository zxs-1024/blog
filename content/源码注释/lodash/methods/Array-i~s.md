
## indexOf

> 根据 value 使用 SameValueZero 等值比较返回数组中首次匹配的 index， 如果 fromIndex 为负值，将从数组尾端索引进行匹配，如果将 fromIndex 设置为 true，将使用更快的二进制检索机制。

```js
/**
 * Gets the index at which the first occurrence of `value` is found in `array`
 * using [`SameValueZero`](http://ecma-international.org/ecma-262/7.0/#sec-samevaluezero)
 * for equality comparisons. If `fromIndex` is negative, it's used as the
 * offset from the end of `array`.
 *
 * @since 0.1.0
 * @category Array
 * @param {Array} array The array to inspect.
 * @param {*} value The value to search for.
 * @param {number} [fromIndex=0] The index to search from.
 * @returns {number} Returns the index of the matched value, else `-1`.
 * @example
 *
 * indexOf([1, 2, 1, 2], 2)
 * // => 1
 *
 * // Search from the `fromIndex`.
 * indexOf([1, 2, 1, 2], 2, 2)
 * // => 3
 */
function indexOf(array, value, fromIndex) {
  const length = array == null ? 0 : array.length
  if (!length) {
    return -1
  }
  let index = fromIndex == null ? 0 : +fromIndex
  if (index < 0) {
    index = Math.max(length + index, 0)
  }
  return baseIndexOf(array, value, index)
}
```

`indexOf` 函数接收 3 个参数， `array` 匹配数组、`value` 匹配值、`fromIndex` 起始位置。

申明 `length` 变量，默认为 0，如果 `length` 为 `false` 返回 -1，
申明 `index` 变量保存 `fromIndex` 起始位置，默认为 0，
如果 `index` 小于 0，将 `index` 赋值为 `length + index` 和 0 之间的最大值。

最后会返回调用 `baseIndexOf` 函数返回的下标。

## initial

> 获取数组中除了最后一个元素之外的所有元素。

```js
/**
 * Gets all but the last element of `array`.
 *
 * @since 0.1.0
 * @category Array
 * @param {Array} array The array to query.
 * @returns {Array} Returns the slice of `array`.
 * @example
 *
 * initial([1, 2, 3])
 * // => [1, 2]
 */
function initial(array) {
  const length = array == null ? 0 : array.length
  return length ? slice(array, 0, -1) : []
}
```

`initial` 函数接收一个 `array` 参数，首先申明 `length` 变量保存数组长度，默认为 0。

最后返回一个三元表达式，如果 `length` 为真，调用 `slice` 函数切割数组，此时传参为 `0, -1`，会从第 0 个开始截取到数组长度位置，单不包括最后一个，否则就返回空数组。

## intersection

> 创建一个包含所有使用 SameValueZero 进行等值比较后筛选的唯一值数组。

```js
/**
 * Creates an array of unique values that are included in all given arrays
 * using [`SameValueZero`](http://ecma-international.org/ecma-262/7.0/#sec-samevaluezero)
 * for equality comparisons. The order and references of result values are
 * determined by the first array.
 *
 * @since 0.1.0
 * @category Array
 * @param {...Array} [arrays] The arrays to inspect.
 * @returns {Array} Returns the new array of intersecting values.
 * @example
 *
 * intersection([2, 1], [2, 3])
 * // => [2]
 */
function intersection(...arrays) {
  const mapped = map(arrays, castArrayLikeObject)
  return (mapped.length && mapped[0] === arrays[0])
    ? baseIntersection(mapped)
    : []
}
```

`intersection` 函数首先申明 `mapped` 变量，调用 `map` 函数处理 `arrays` 数组后赋值给 `mapped`。

`castArrayLikeObject` 函数：

```js
function castArrayLikeObject(value) {
  return isArrayLikeObject(value) ? value : []
}
```

`castArrayLikeObject` 函数只是 `isArrayLikeObject` 的简单封装，如果 `value` 是对象类数组则返回 `value`，否则返回空数组。

`map` 函数：

```js
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

`map` 函数接收 2 个参数， `array` 数组、`iteratee` 迭代器函数。

申明 `result` 空数组，通过 `while` 循环，`index` 累加，将经过迭代器函数处理的 `value` 插入 `result`，最后将 `result` 返回。

`intersection` 函数最后会返回一个三元表达式，如果 `mapped` 有长度并且 `mapped[0]` 与 `arrays[0]` 全等，就调用 `baseIntersection` 函数返回处理后的数组，否则就返回空数组。

## intersectionBy

> 这个方法类似 _.intersection，除了它接受一个 iteratee 调用每一个数组和值。iteratee 会传入一个参数：(value)。

```js
/**
 * This method is like `intersection` except that it accepts `iteratee`
 * which is invoked for each element of each `arrays` to generate the criterion
 * by which they're compared. The order and references of result values are
 * determined by the first array. The iteratee is invoked with one argument:
 * (value).
 *
 * @since 4.0.0
 * @category Array
 * @param {...Array} [arrays] The arrays to inspect.
 * @param {Function} iteratee The iteratee invoked per element.
 * @returns {Array} Returns the new array of intersecting values.
 * @example
 *
 * intersectionBy([2.1, 1.2], [2.3, 3.4], Math.floor)
 * // => [2.1]
 */
function intersectionBy(...arrays) {
  let iteratee = last(arrays)
  const mapped = map(arrays, castArrayLikeObject)

  if (iteratee === last(mapped)) {
    iteratee = undefined
  } else {
    mapped.pop()
  }
  return (mapped.length && mapped[0] === arrays[0])
    ? baseIntersection(mapped, iteratee)
    : []
}
```

`intersectionBy` 接收 `arrays` 参数数组。

首先申明 `iteratee` 变量，调用 `last` 函数获取 `arrays` 最后一个，
申明 `mapped` 变量处理 `arrays` 数组。

接着会对判断 `iteratee` 是否全等于 `mapped` 的最后一个，如果是将 `iteratee` 赋值为 `undefined`，否则调用 `pop` 方法删除 `mapped` 最后一个元素，这个 `if` 应该是用来是否传入了判断 `iteratee` 迭代函数，因为 `mapped` 数组排除了不是数组的元素，如果与 `iteratee` 不全等就说明是 `iteratee` 迭代函数。

最后会返回一个三元表达式，如果 `mapped` 有 `length` 并且 `mapped[0]` 全等于 `arrays[0]`， 
调用 `baseIntersection` 函数，此时传入了第 2 个参数 `iteratee` 迭代函数，返回 `baseIntersection` 函数函数调用返回的数组，否则就返回空数组。

## intersectionWith

> 这个方法类似 _.intersection，除了它接受一个 comparator 调用每一个数组和值。iteratee 会传入2个参数：((arrVal, othVal)。

```js
/**
 * This method is like `intersection` except that it accepts `comparator`
 * which is invoked to compare elements of `arrays`. The order and references
 * of result values are determined by the first array. The comparator is
 * invoked with two arguments: (arrVal, othVal).
 *
 * @since 4.0.0
 * @category Array
 * @param {...Array} [arrays] The arrays to inspect.
 * @param {Function} [comparator] The comparator invoked per element.
 * @returns {Array} Returns the new array of intersecting values.
 * @example
 *
 * const objects = [{ 'x': 1, 'y': 2 }, { 'x': 2, 'y': 1 }]
 * const others = [{ 'x': 1, 'y': 1 }, { 'x': 1, 'y': 2 }]
 *
 * intersectionWith(objects, others, isEqual)
 * // => [{ 'x': 1, 'y': 2 }]
 */
function intersectionWith(...arrays) {
  let comparator = last(arrays)
  const mapped = map(arrays, castArrayLikeObject)

  comparator = typeof comparator == 'function' ? comparator : undefined
  if (comparator) {
    mapped.pop()
  }
  return (mapped.length && mapped[0] === arrays[0])
    ? baseIntersection(mapped, undefined, comparator)
    : []
}
```

`intersectionWith` 函数开始与 `intersectionBy` 函数相似，这里会对 `comparator` 进行类型判断，如果不是 `function` 就将 `comparator` 赋值为 `undefined`，然后判断如果 `comparator` 为真，调用 `pop` 方法将 `mapped` 最后一个元素删除。

最后也是调用了 `baseIntersection` 函数，只是第二个参数是 `undefined`，传了第三个参数是 `comparator` 比较函数。

## join

> 将数组中的所有元素转换为由 separator 分隔的字符串。

```js
/**
  * Converts all elements in `array` into a string separated by `separator`.
  *
  * @static
  * @memberOf _
  * @since 4.0.0
  * @category Array
  * @param {Array} array The array to convert.
  * @param {string} [separator=','] The element separator.
  * @returns {string} Returns the joined string.
  * @example
  *
  * _.join(['a', 'b', 'c'], '~');
  * // => 'a~b~c'
  */
function join(array, separator) {
  return array == null ? '' : nativeJoin.call(array, separator);
}
```

`join` 返回一个三元表达式，如果 `array` 等于 `null`，返回空字符串，
否则调用原生数组的 `join` 函数，拼接字符串，然后返回。

```js
var arrayProto = Array.prototype
var nativeJoin = arrayProto.join
```

`nativeJoin` 就是 `Array.prototype.join`，是数组原生方法 `join` 的简单封装。

## last

> 获取数组中的最后一个元素。

```js
/**
 * Gets the last element of `array`.
 *
 * @since 0.1.0
 * @category Array
 * @param {Array} array The array to query.
 * @returns {*} Returns the last element of `array`.
 * @example
 *
 * last([1, 2, 3])
 * // => 3
 */
function last(array) {
  const length = array == null ? 0 : array.length
  return length ? array[length - 1] : undefined
}
```

申明 `length` 变量保存 `array.length`，默认为 0。

最后返回一个三元表达式，如果 `length` 为真返回数组最后一个，否则返回 `undefined`。

## lastIndexOf

> 这个方法类似 _.indexOf，除了它是从右到左遍历元素的。

```js
/**
 * This method is like `indexOf` except that it iterates over elements of
 * `array` from right to left.
 *
 * @since 0.1.0
 * @category Array
 * @param {Array} array The array to inspect.
 * @param {*} value The value to search for.
 * @param {number} [fromIndex=array.length-1] The index to search from.
 * @returns {number} Returns the index of the matched value, else `-1`.
 * @example
 *
 * lastIndexOf([1, 2, 1, 2], 2)
 * // => 3
 *
 * // Search from the `fromIndex`.
 * lastIndexOf([1, 2, 1, 2], 2, 2)
 * // => 1
 */
function lastIndexOf(array, value, fromIndex) {
  const length = array == null ? 0 : array.length
  if (!length) {
    return -1
  }
  let index = length
  if (fromIndex !== undefined) {
    index = index < 0 ? Math.max(length + index, 0) : Math.min(index, length - 1)
  }
  return value === value
    ? strictLastIndexOf(array, value, index)
    : baseFindIndex(array, baseIsNaN, index, true)
}
```

`lastIndexOf` 接收 3 个参数，`array` 数组、`value` 检索值、`fromIndex` 起始位置。

首先申明 `length` 变量，保存数组长度，默认为 0，如果 `length` 为 `false`，返回 -1。

如果 `fromIndex` 不等于 `undefined`，处理起始 `index` 。

最后返回一个三元表达式，如果 `value === value`，这里是做了 `value` 是 `NaN` 的处理，
如果不是 `NaN` 返回 `strictLastIndexOf` 函数返回的下标，
如果是 `NaN` 的话就调用 `baseFindIndex` ，并将 `baseIsNaN` 作为迭代函数传入，返回数组中符合迭代函数的下标。

`strictLastIndexOf` 函数：

```js
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


`baseFindIndex` 函数：

```js
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

## nth

> 获取数组索引的 value

```js
/**
 * Gets the element at index `n` of `array`. If `n` is negative, the nth
 * element from the end is returned.
 *
 * @since 4.11.0
 * @category Array
 * @param {Array} array The array to query.
 * @param {number} [n=0] The index of the element to return.
 * @returns {*} Returns the nth element of `array`.
 * @example
 *
 * const array = ['a', 'b', 'c', 'd']
 *
 * nth(array, 1)
 * // => 'b'
 *
 * nth(array, -2)
 * // => 'c'
 */
function nth(array, n) {
  const length = array == null ? 0 : array.length
  if (!length) {
    return
  }
  n += n < 0 ? length : 0
  return isIndex(n, length) ? array[n] : undefined
}
```

`nth` 函数接收 2 个参数，`array` 数组、`n` 下标。

申明 `length` 变量保存数组长度，默认为 0，如果 `length` 为 `false` 中端执行，接着就是 `n` 为负数时的处理。

最后返回一个三元表达式，调用 `isIndex` 方法，判断是否是一个有效的索引，如果是有效索引就将 `array[n]` 返回，否则就返回 `undefined`。

## pull

> 移除所有经过 SameValueZero 等值比较为 true 的元素。

```js
/**
 * Removes all given values from `array` using
 * [`SameValueZero`](http://ecma-international.org/ecma-262/7.0/#sec-samevaluezero)
 * for equality comparisons.
 *
 * **Note:** Unlike `without`, this method mutates `array`. Use `remove`
 * to remove elements from an array by predicate.
 *
 * @since 2.0.0
 * @category Array
 * @param {Array} array The array to modify.
 * @param {...*} [values] The values to remove.
 * @returns {Array} Returns `array`.
 * @see pullAll, pullAllBy, pullAllWith, pullAt, remove, reject
 * @example
 *
 * const array = ['a', 'b', 'c', 'a', 'b', 'c']
 *
 * pull(array, 'a', 'c')
 * console.log(array)
 * // => ['b', 'b']
 */
function pull(array, ...values) {
  return pullAll(array, values)
}
```

`pull` 函数是 `pullAll` 函数的简单封装，返回 `pullAll` 执行后的数组。

## pullAll

> 这个方式类似 _.pull，除了它接受数组形式的一系列值。 

```js
/**
 * This method is like `pull` except that it accepts an array of values to remove.
 *
 * **Note:** Unlike `difference`, this method mutates `array`.
 *
 * @since 4.0.0
 * @category Array
 * @param {Array} array The array to modify.
 * @param {Array} values The values to remove.
 * @returns {Array} Returns `array`.
 * @see pull, pullAllBy, pullAllWith, pullAt, remove, reject
 * @example
 *
 * const array = ['a', 'b', 'c', 'a', 'b', 'c']
 *
 * pullAll(array, ['a', 'c'])
 * console.log(array)
 * // => ['b', 'b']
 */
function pullAll(array, values) {
  return (array != null && array.length && values != null && values.length)
    ? basePullAll(array, values)
    : array
}
```

`pullAll` 函数接收 `array` 函数，`values` 要删除的值。

`pullAll` 函数返回一个三元表达式，如果 `array` 和 `values` 不为 `null` 并且有长度，返回调用 `basePullAll` 函数处理后的数组，否则直接返回 `array` 。

`basePullAll` 函数：

```js
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

申明 `length` 变量保存 `values` 长度，如果 `array` 与 `values` 全等，此时都是一个数组，为复杂对象、指针相同，调用 `copyArray` 函数进行数组拷贝，赋值给 `values`。

如果有 `iteratee` 迭代器函数，将循环调用 `iteratee` 后的数组赋值给 `seen`。

接下来是双重 `while` 循环，第一层中 `index` 累加，申明 `fromIndex` 变量为 0 ，申明 `value` 变量保存循环的值，申明 `computed` 变量保存迭代器处理后的 `value`。

在第二层中会调用 `indexOf` 方法，传入 `seen` 迭代器函数处理后的数组、`computed` 处理后的 `value`、`fromIndex` 循环 `index`，`comparator` 比较函数，取出对应下标，并且赋值给 `fromIndex`，如果当前数组中有这个 `computed`，有 `fromIndex` 下标。

接着判断 `seen` 不全等于 `array` 数组，调用 `splice` 删除 `seen` 的 `fromIndex` 下标元素，
然后调用 `splice` 方法删除 `array` 数组的 `fromIndex` 下标元素，最后将 `array` 返回。

## pullAllBy

> 这个方法类似 _.pullAll，除了它接受一个 iteratee 调用每一个数组元素的值。 iteratee 会传入一个参数：(value)。 

```js
/**
 * This method is like `pullAll` except that it accepts `iteratee` which is
 * invoked for each element of `array` and `values` to generate the criterion
 * by which they're compared. The iteratee is invoked with one argument: (value).
 *
 * **Note:** Unlike `differenceBy`, this method mutates `array`.
 *
 * @since 4.0.0
 * @category Array
 * @param {Array} array The array to modify.
 * @param {Array} values The values to remove.
 * @param {Function} iteratee The iteratee invoked per element.
 * @returns {Array} Returns `array`.
 * @see pull, pullAll, pullAllWith, pullAt, remove, reject
 * @example
 *
 * const array = [{ 'x': 1 }, { 'x': 2 }, { 'x': 3 }, { 'x': 1 }]
 *
 * pullAllBy(array, [{ 'x': 1 }, { 'x': 3 }], 'x')
 * console.log(array)
 * // => [{ 'x': 2 }]
 */
function pullAllBy(array, values, iteratee) {
  return (array != null && array.length && values != null && values.length)
    ? basePullAll(array, values, iteratee)
    : array
}
```

`pullAllBy` 接收三个参数，`array` 数组、`values` 要删除的值、`iteratee` 迭代器函数。

首先会对 `array` 、`values` 的非空和长度判断，都满足就调用 `basePullAll` 函数返回处理后的数组，调用 `basePullAll` 函数时传入了 `iteratee` 迭代函数，如果不满足返回 `array`。

## pullAllWith

> > 这个方法类似 _.pullAll，除了它接受一个 comparator 调用每一个数组元素的值。 comparator 会传入一个参数：(value)。 

```js
/**
 * This method is like `pullAll` except that it accepts `comparator` which
 * is invoked to compare elements of `array` to `values`. The comparator is
 * invoked with two arguments: (arrVal, othVal).
 *
 * **Note:** Unlike `differenceWith`, this method mutates `array`.
 *
 * @since 4.6.0
 * @category Array
 * @param {Array} array The array to modify.
 * @param {Array} values The values to remove.
 * @param {Function} [comparator] The comparator invoked per element.
 * @returns {Array} Returns `array`.
 * @see pull, pullAll, pullAllBy, pullAt, remove, reject
 * @example
 *
 * const array = [{ 'x': 1, 'y': 2 }, { 'x': 3, 'y': 4 }, { 'x': 5, 'y': 6 }]
 *
 * pullAllWith(array, [{ 'x': 3, 'y': 4 }], isEqual)
 * console.log(array)
 * // => [{ 'x': 1, 'y': 2 }, { 'x': 5, 'y': 6 }]
 */
function pullAllWith(array, values, comparator) {
  return (array != null && array.length && values != null && values.length)
    ? basePullAll(array, values, undefined, comparator)
    : array
}
```

`pullAllWith` 函数与 `pullAllBy` 相似，只是调用 `basePullAll` 函数的时候传入的第三个参数为 `undefined`，增加了第四个参数 `comparator`。

## pullAt

> 从与索引对应的数组中删除元素，并返回已删除元素的数组。

```js
/**
 * Removes elements from `array` corresponding to `indexes` and returns an
 * array of removed elements.
 *
 * **Note:** Unlike `at`, this method mutates `array`.
 *
 * @since 3.0.0
 * @category Array
 * @param {Array} array The array to modify.
 * @param {...(number|number[])} [indexes] The indexes of elements to remove.
 * @returns {Array} Returns the new array of removed elements.
 * @see pull, pullAll, pullAllBy, pullAllWith, remove, reject
 * @example
 *
 * const array = ['a', 'b', 'c', 'd']
 * const pulled = pullAt(array, [1, 3])
 *
 * console.log(array)
 * // => ['a', 'c']
 *
 * console.log(pulled)
 * // => ['b', 'd']
 */
function pullAt(array, ...indexes) {
  const length = array == null ? 0 : array.length
  const result = baseAt(array, indexes)

  basePullAt(array, map(indexes, (index) => isIndex(index, length) ? +index : index).sort(compareAscending))
  return result
}
```

`pullAt` 函数接收 2 个参数， `array` 数组、`indexes` 下标数组。

首先申明 `length` 变量保存 `array` 长度，默认为 0 ，
申明 `result` 变量保存调用 `baseAt` 返回的数组，`baseAt` 函数会返回 `array` 中对应 `indexes` 的数组。

接调用 `basePullAt` 方法，方法比较长，拆开来看。

```js
map(indexes, (index) => isIndex(index, length) ? +index : index)
```

调用 `map` 函数，循环 `indexes`，在回调函数中调用 `isIndex` 判断有效下标，如果是采用 `+` 隐式转化，确保 `index` 是数字，如果不是仍旧将 `index` 返回。

```js
indexes.sort(compareAscending)
```

经过 `map` 处理后会连缀 `sort` 函数，并传入 `compareAscending` 比较函数，按照升序进行排序，最后将 `result` 返回。

`basePullAt` 函数：

```js
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

## remove

> 移除经过 predicate 处理为真值的元素，并返回被移除的元素。predicate 会传入3个参数：(value, index, array) 

```js
/**
 * Removes all elements from `array` that `predicate` returns truthy for
 * and returns an array of the removed elements. The predicate is invoked
 * with three arguments: (value, index, array).
 *
 * **Note:** Unlike `filter`, this method mutates `array`. Use `pull`
 * to pull elements from an array by value.
 *
 * @since 2.0.0
 * @category Array
 * @param {Array} array The array to modify.
 * @param {Function} predicate The function invoked per iteration.
 * @returns {Array} Returns the new array of removed elements.
 * @see pull, pullAll, pullAllBy, pullAllWith, pullAt, reject, filter
 * @example
 *
 * const array = [1, 2, 3, 4]
 * const evens = remove(array, n => n % 2 == 0)
 *
 * console.log(array)
 * // => [1, 3]
 *
 * console.log(evens)
 * // => [2, 4]
 */
function remove(array, predicate) {
  const result = []
  if (!(array != null && array.length)) {
    return result
  }
  let index = -1
  const indexes = []
  const { length } = array

  while (++index < length) {
    const value = array[index]
    if (predicate(value, index, array)) {
      result.push(value)
      indexes.push(index)
    }
  }
  basePullAt(array, indexes)
  return result
}
```

`remove` 函数接收 2 个参数，`remove` 要修改数组、 `predicate` 迭代函数。

申明 `result` 空数组保存结果，接着是对 `array` 的非空处理，然后申明一些初始变量。

接着进入 `while` 循环，`index` 累加，申明 `value` 保存当前 `value`， 这里会判断调用 `predicate` 函数的结果，如果为真，就将 `value` 插入 `result` 数组，`index` 下标插入 `indexes` 数组，`while` 循环结束后，会调用 `basePullAt` 删除 `array` 符合的元素，此方法会修改原 `array` 数组，最后将符合条件的 `result` 返回。


## reverse

> 反转数组，使第一个元素成为最后一个元素，第二个元素成为倒数第二个元素，依此类推。

```js
 /**
  * Reverses `array` so that the first element becomes the last, the second
  * element becomes the second to last, and so on.
  *
  * **Note:** This method mutates `array` and is based on
  * [`Array#reverse`](https://mdn.io/Array/reverse).
  *
  * @static
  * @memberOf _
  * @since 4.0.0
  * @category Array
  * @param {Array} array The array to modify.
  * @returns {Array} Returns `array`.
  * @example
  *
  * var array = [1, 2, 3];
  *
  * _.reverse(array);
  * // => [3, 2, 1]
  *
  * console.log(array);
  * // => [3, 2, 1]
  */
function reverse(array) {
  return array == null ? array : nativeReverse.call(array);
}
```

`reverse` 函数只是简单包装了一个原生数组的 `reverse` 方法。 

```js
var arrayProto = Array.prototype
var nativeReverse = arrayProto.reverse
```

`nativeReverse` 就是`Array.prototype.reverse` ，只是增加了一个非空判断。

## slice

> 创建一个裁剪后的数组，从 start 到 end 的位置，但不包括 end 本身的位置。 

```js
_.slice(array, [start=0], [end=array.length])
```

```js
/**
 * Creates a slice of `array` from `start` up to, but not including, `end`.
 *
 * **Note:** This method is used instead of
 * [`Array#slice`](https://mdn.io/Array/slice) to ensure dense arrays are
 * returned.
 *
 * @since 3.0.0
 * @category Array
 * @param {Array} array The array to slice.
 * @param {number} [start=0] The start position. A negative index will be treated as an offset from the end.
 * @param {number} [end=array.length] The end position. A negative index will be treated as an offset from the end.
 * @returns {Array} Returns the slice of `array`.
 * @example
 *
 * var array = [1, 2, 3, 4]
 *
 * _.slice(array, 2)
 * // => [3, 4]
 */
function slice(array, start, end) {
  let length = array == null ? 0 : array.length
  if (!length) {
    return []
  }
  start = start == null ? 0 : start
  end = end === undefined ? length : end

  if (start < 0) {
    start = -start > length ? 0 : (length + start)
  }
  end = end > length ? length : end
  if (end < 0) {
    end += length
  }
  length = start > end ? 0 : ((end - start) >>> 0)
  start >>>= 0

  let index = -1
  const result = new Array(length)
  while (++index < length) {
    result[index] = array[index + start]
  }
  return result
}
```

`slice` 函数接收 3 个参数，`array` 要切割数组、`start` 起始位置、`end` 结束位置。

申明 `length` 变量保存 `array` 长度，默认为 0，如果 `length` 为 `false`，返回空数组，
对 `start` 和 `end` 进行赋值处理，`start` 默认为 0，`end` 默认为数组长度，
接着是当 `start < 0` 时和 `end < 0` 的处理。

```js
length = start > end ? 0 : ((end - start) >>> 0)
start >>>= 0
```

> `>>>` 带符号位的右移运算符（>>>）表示将一个数的二进制形式向右移动，包括符号位也参与移动，头部补 0。所以，该运算总是得到正值。对于正数，该运算的结果与右移运算符（>>）完全一致，区别主要在于负数。

参考：[运算符](http://javascript.ruanyifeng.com/grammar/operator.html#toc16)

申明 `index` 初始值 `-1`，申明 `result` 保存循环结果，进入 `while` 循环，将 `array[index + start]` 赋值给 `result[index]`，最后将 `result` 返回。


## sortedIndex

> 使用二进制的方式检索来决定 value 应该插入在数组中位置。它的 index 应该尽可能的小以保证数组的排序。

```js
/**
 * Uses a binary search to determine the lowest index at which `value`
 * should be inserted into `array` in order to maintain its sort order.
 *
 * @since 0.1.0
 * @category Array
 * @param {Array} array The sorted array to inspect.
 * @param {*} value The value to evaluate.
 * @returns {number} Returns the index at which `value` should be inserted
 *  into `array`.
 * @example
 *
 * sortedIndex([30, 50], 40)
 * // => 1
 */
function sortedIndex(array, value) {
  return baseSortedIndex(array, value)
}
```

`sortedIndex` 函数 `baseSortedIndex` 函数的包装。

`baseSortedIndex` 函数：

```js
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

申明 `computed` 保存 `mid` 下标对应的  `value`，这里会判断 `computed` 不为 `null`、`computed` 不是 `symbol` 类型，以及是否传入 `retHighest` 对 `computed < value` 的比较，如果全部符合，就将 `low` 赋值为 `mid + 1` ，继续循环，直到进入 `else` 循环将 `mid` 赋值给 `high`，或者循环结束 `return high`。

```js
return baseSortedIndexBy(array, value, (value) => value, retHighest)
```

如果不满足上面的条件，`baseSortedIndex` 函数最后会调用 `baseSortedIndexBy` 函数，将它的调用结果返回。

## sortedIndexBy

> 这个方法类似 _.sortedIndex，除了它接受一个 iteratee 调用每一个数组和值来计算排序。iteratee 会传入一个参数：(value)。

```js
/**
 * This method is like `sortedIndex` except that it accepts `iteratee`
 * which is invoked for `value` and each element of `array` to compute their
 * sort ranking. The iteratee is invoked with one argument: (value).
 *
 * @since 4.0.0
 * @category Array
 * @param {Array} array The sorted array to inspect.
 * @param {*} value The value to evaluate.
 * @param {Function} iteratee The iteratee invoked per element.
 * @returns {number} Returns the index at which `value` should be inserted
 *  into `array`.
 * @example
 *
 * const objects = [{ 'n': 4 }, { 'n': 5 }]
 *
 * sortedIndexBy(objects, { 'n': 4 }, ({ n }) => n)
 * // => 0
 */
function sortedIndexBy(array, value, iteratee) {
  return baseSortedIndexBy(array, value, iteratee)
}
```

`sortedIndexBy` 函数是 `baseSortedIndexBy` 函数的包装。

`baseSortedIndexBy` 函数：

```js
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

`baseSortedIndexBy` 是 `sortedIndex` 这一系列函数的基本实现，接收 4 个参数，`array` 要检查数组、`value` 检查值、`iteratee` 迭代函数、`retHighest` 是否返回最大索引。

首先会调用 `iteratee` 处理 `value`，申明一系列初始变量，方面后面调用。

```js
let low = 0
let high = array == null ? 0 : array.length
const valIsNaN = value !== value
const valIsNull = value === null
const valIsSymbol = isSymbol(value)
const valIsUndefined = value === undefined
```

接着会进入 `while` 循环，在循环中也申明了一系列变量：

```js
const mid = Math.floor((low + high) / 2) // 取中间 index
const computed = iteratee(array[mid]) // 中间值
const othIsDefined = computed !== undefined
const othIsNull = computed === null
const othIsReflexive = computed === computed
const othIsSymbol = isSymbol(computed)
```

接着就是很多类型判断，这里会根据类型将 `setLow` 赋值，然后会判断 `setLow` 如果为真，`low` 赋值为 `mid + 1`，否则就将 `high` 赋值为 `mid` ，继续循环。

最后返回 `high` 与 `MAX_ARRAY_INDEX` 之间的最小值。

## sortedIndexOf

> 这个方法类似 _.indexOf，除了它是执行二进制来检索已经排序的数组的。

```js
/**
 * This method is like `indexOf` except that it performs a binary
 * search on a sorted `array`.
 *
 * @since 4.0.0
 * @category Array
 * @param {Array} array The array to inspect.
 * @param {*} value The value to search for.
 * @returns {number} Returns the index of the matched value, else `-1`.
 * @example
 *
 * sortedIndexOf([4, 5, 5, 5, 6], 5)
 * // => 1
 */
function sortedIndexOf(array, value) {
  const length = array == null ? 0 : array.length
  if (length) {
    const index = baseSortedIndex(array, value)
    if (index < length && eq(array[index], value)) {
      return index
    }
  }
  return -1
}
```

`sortedIndexOf` 函数接收 2 个参数，`array` 数组、`value` 匹配的值。

申明 `length` 保存数组 `length`，默认为 0，
如果 `length` 为真，调用 `baseSortedIndex` 获取 `value` 位于 `array` 的下标。

如果 `index < length` 并且调用 `eq` 比较 `array[index]` 和 `value` 是否相等，如果相等返回 `index` 下标，否则返回 -1 。

## sortedLastIndex

> 此方法类似于_.sortedIndex，除了它返回应将值插入数组的最高索引，以便维护其排序顺序。

```js
/**
 * This method is like `sortedIndex` except that it returns the highest
 * index at which `value` should be inserted into `array` in order to
 * maintain its sort order.
 *
 * @since 3.0.0
 * @category Array
 * @param {Array} array The sorted array to inspect.
 * @param {*} value The value to evaluate.
 * @returns {number} Returns the index at which `value` should be inserted
 *  into `array`.
 * @example
 *
 * sortedLastIndex([4, 5, 5, 5, 6], 5)
 * // => 4
 */
function sortedLastIndex(array, value) {
  return baseSortedIndex(array, value, true)
}
```

`sortedIndex` 函数与 `sortedLastIndex` 函数相似，只是调用 `baseSortedIndex` 函数的时候传入第三个参数为 `true`，`baseSortedIndex` 函数会返回最大的匹配值索引。

## sortedUniq

> 这个方法类似 _.uniq，除了它会排序并优化数组。

```js
_.sortedUniq(array)
```

```js
/**
 * This method is like `uniq` except that it only works
 * for sorted arrays.
 * If the input array is known to be sorted `sortedUniq` is
 * faster than `uniq`.
 *
 * @since 4.0.0
 * @category Array
 * @param {Array} array The array to inspect.
 * @returns {Array} Returns the new duplicate free array.
 * @example
 *
 * sortedUniq([1, 1, 2])
 * // => [1, 2]
 */
function sortedUniq(array) {
  return (array != null && array.length)
    ? baseSortedUniq(array)
    : []
}
```

`sortedUniq` 函数返回一个三元表达式，如果 `array` 不为 `null` 并且有 `length`，会返回 `baseSortedUniq` 函数的处理后的不重复数组，否则返回空数组。

`baseSortedUniq` 函数：

```js
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

## sortedUniqBy

> 这个方法类似 _.uniqBy，除了它接受一个 iteratee 调用每一个数组和值来排序并优化数组。

```js
_.sortedUniqBy(array, [iteratee])
```

```js
/**
 * This method is like `uniqBy` except that it's designed and optimized
 * for sorted arrays.
 *
 * @since 4.0.0
 * @category Array
 * @param {Array} array The array to inspect.
 * @param {Function} iteratee The iteratee invoked per element.
 * @returns {Array} Returns the new duplicate free array.
 * @example
 *
 * sortedUniqBy([1.1, 1.2, 2.3, 2.4], Math.floor)
 * // => [1.1, 2.3]
 */
function sortedUniqBy(array, iteratee) {
  return (array != null && array.length)
    ? baseSortedUniq(array, iteratee)
    : []
}
```

`sortedUniq` 函数与 `sortedUniqBy` 函数相似，只是调用 `baseSortedUniq` 时传入了 `iteratee` 迭代函数。
