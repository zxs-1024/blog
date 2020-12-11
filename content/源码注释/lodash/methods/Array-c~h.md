## chunk

> 将数组拆分成多个 size 长度的块，并组成一个新数组。 如果数组无法被分割成全部等长的块，那么最后剩余的元素将组成一个块。

```js
/**
 * Creates an array of elements split into groups the length of `size`.
 * If `array` can't be split evenly, the final chunk will be the remaining
 * elements.
 *
 * @since 3.0.0
 * @category Array
 * @param {Array} array The array to process.
 * @param {number} [size=1] The length of each chunk
 * @returns {Array} Returns the new array of chunks.
 * @example
 *
 * chunk(['a', 'b', 'c', 'd'], 2)
 * // => [['a', 'b'], ['c', 'd']]
 *
 * chunk(['a', 'b', 'c', 'd'], 3)
 * // => [['a', 'b', 'c'], ['d']]
 */
function chunk(array, size) {
  size = Math.max(size, 0)
  const length = array == null ? 0 : array.length
  if (!length || size < 1) {
    return []
  }
  let index = 0
  let resIndex = 0
  const result = new Array(Math.ceil(length / size))

  while (index < length) {
    result[resIndex++] = slice(array, index, (index += size))
  }
  return result
}
```

`chunk` 函数接收 `2` 个参数，`array` 处理数组，`size` 尺寸。

首先会调用 `Math.max` 方法取出 `size`，申明 `length` 变量保存数组长度，如果 `array == null` 长度为 0，
如果 `length` 为假或者 `size` 小于 1 ，返回空数组。

接着申明 `index`、`resIndex`、 `result` 初始变量，`result` 是由一个 `new Array` 生成的新数组，数组长度采用 `Math.ceil(length / size)` 向上取整，保证数组不均分时将多余的放在最后数组返回。

然后进入 `while` 循环 ，这里引入了一个 `slice` 方法，
`slice` 方法主要是将传入数组 `array` 根据 `array` 和 `end` 位置切割后返回，不包括 `end`， 将 `slice` 切割返回的数组保存到 `result` 的第 `resIndex` 上，`resIndex` 不断累加，循环结束后将 `result` 数组返回。

## compact

> 创建一个移除了所有假值的数组。例如：false、null、 0、""、undefined， 以及NaN 都是 “假值”。

```js
_.compact(array)
```

```js
/**
 * Creates an array with all falsey values removed. The values `false`, `null`,
 * `0`, `""`, `undefined`, and `NaN` are falsey.
 *
 * @since 0.1.0
 * @category Array
 * @param {Array} array The array to compact.
 * @returns {Array} Returns the new array of filtered values.
 * @example
 *
 * compact([0, 1, false, 2, '', 3])
 * // => [1, 2, 3]
 */
function compact(array) {
  let resIndex = 0
  const result = []

  if (array == null) {
    return result
  }

  for (const value of array) {
    if (value) {
      result[resIndex++] = value
    }
  }
  return result
}
```

`compact` 接收一个数组 `array`，首先会申明 `resIndex` `result` 初始变量。

接着对 `array` 进行非空判断，如果 `array` 等于 `null` ，`return` 空数组。

然后采用 `for...of` 循环，如果 `value` 为真 ，就将 `value` 保存到 `result` 的第 `resIndex` 上，`resIndex` 累加，循环结束后返回 `result`。

## concat

> 创建一个用任何数组或值连接的新数组。

```js
_.concat(array, [values])
```

```js
/**
  * Creates a new array concatenating `array` with any additional arrays
  * and/or values.
  *
  * @static
  * @memberOf _
  * @since 4.0.0
  * @category Array
  * @param {Array} array The array to concatenate.
  * @param {...*} [values] The values to concatenate.
  * @returns {Array} Returns the new concatenated array.
  * @example
  *
  * var array = [1];
  * var other = _.concat(array, 2, [3], [[4]]);
  *
  * console.log(other);
  * // => [1, 2, 3, [4]]
  *
  * console.log(array);
  * // => [1]
  */
  function concat() {
    var length = arguments.length;
    if (!length) {
      return [];
    }
    var args = Array(length - 1),
        array = arguments[0],
        index = length;

    while (index--) {
      args[index - 1] = arguments[index];
    }
    return arrayPush(isArray(array) ? copyArray(array) : [array], baseFlatten(args, 1));
  }
```

`concat` 函数使用 `arguments` 获取传入参数， 申明 `length` 保存参数长度，如果没有 `length`，`return` 空数组。

接着会申明一些变量，`args` 新数组、`array` 要合并数组，`index` 参数长度，
然后会使用 `while` 循环，`index` 累减，将剩余参数保存到 `args` 数组。

调用 `arrayPush` 方法，此时传入 2 个参数。

```js
isArray(array) ? copyArray(array) : [array]
```

第一个参数是三元表达式，`isArray` 判断如果是数组，就调用 `copyArray` 生成一个拷贝后的数组，如果不是将 `array` 包装成数组。

```js
baseFlatten(args, 1)
```

第二个参数是调用 `baseFlatten` 函数的返回，`baseFlatten` 函数是用来扁平化数组，传入参数 1，代表扁平化 1 层。

调用 `arrayPush`函数后，会返回一个合并后的数组，`concat` 函数最后会将合并后返回。

## difference

> 创建一个差异化后的数组，不包括使用 SameValueZero 方法提供的数组。

```js
_.difference(array, [values])
```

```js
/**
* Creates an array of `array` values not included in the other given arrays
* using [`SameValueZero`](http://ecma-international.org/ecma-262/7.0/#sec-samevaluezero)
* for equality comparisons. The order and references of result values are
* determined by the first array.
*
* **Note:** Unlike `pullAll`, this method returns a new array.
*
* @since 0.1.0
* @category Array
* @param {Array} array The array to inspect.
* @param {...Array} [values] The values to exclude.
* @returns {Array} Returns the new array of filtered values.
* @see union, unionBy, unionWith, without, xor, xorBy, xorWith,
* @example
*
* difference([2, 1], [2, 3])
* // => [1]
*/
function difference(array, ...values) {
  return isArrayLikeObject(array)
    ? baseDifference(array, baseFlatten(values, 1, isArrayLikeObject, true))
    : []
}
```

`difference` 接收 2 个参数，`array` 数组，`..values` 剩余参数。

通过 `isArrayLikeObject` 方法判断 `array` 是否是类数组，如果是就调用 `baseDifference` 函数作为返回，否则就返回一个空数组。

```js
baseFlatten(values, 1, isArrayLikeObject, true)
```

`baseFlatten` 会返回一个扁平化的数组。

调用 `baseDifference` 函数中将 `array` 和 `baseFlatten` 函数返回的扁平化的数组作为参数传入，最后返回差异化后的数组。

## differenceBy

> 这个方法类似 `_.difference`，除了它接受一个 `iteratee` 调用每一个数组和值。`iteratee` 会传入一个参数：(value)。

```js
/**
 * This method is like `difference` except that it accepts `iteratee` which
 * is invoked for each element of `array` and `values` to generate the criterion
 * by which they're compared. The order and references of result values are
 * determined by the first array. The iteratee is invoked with one argument:
 * (value).
 *
 * **Note:** Unlike `pullAllBy`, this method returns a new array.
 *
 * @since 4.0.0
 * @category Array
 * @param {Array} array The array to inspect.
 * @param {...Array} [values] The values to exclude.
 * @param {Function} iteratee The iteratee invoked per element.
 * @returns {Array} Returns the new array of filtered values.
 * @example
 *
 * differenceBy([2.1, 1.2], [2.3, 3.4], Math.floor)
 * // => [1.2]
 */
function differenceBy(array, ...values) {
  let iteratee = last(values)
  if (isArrayLikeObject(iteratee)) {
    iteratee = undefined
  }
  return isArrayLikeObject(array)
    ? baseDifference(array, baseFlatten(values, 1, isArrayLikeObject, true), iteratee)
    : []
}
```

`differenceBy` 接收 2 个参数，`array` 数组，`values` 剩余参数。

首先会调用 `last` 方法取出的 `values` 参数最后一个，调用 `isArrayLikeObject` 对取出的 `iteratee` 进行判断，如果是类数组对象，说明没有传入迭代器函数，将 `iteratee` 置为 `null`。

`differenceBy` 最后返回一个三元表达式，调用 `isArrayLikeObject` 判断 `array` 如果是类数组对象，返回调用 `baseDifference` 函数后返回的数组，相比与在 `difference` 函数内调用 `baseDifference`，多传了一个 `iteratee` 迭代函数，否则返回空数组。

在 `baseDifference` 函数中：

```js
if (iteratee) {
  values = map(values, (value) => iteratee(value))
}
```

`values` 是的每一项都会经过 `iteratee` 函数的处理。

## differenceWith

> 这个方法类似 `_.difference` ，除了它接受一个 `comparator` 调用每一个数组元素的值。 `comparator` 会传入 2 个参数：(arrVal, othVal)。

```js
/**
 * This method is like `difference` except that it accepts `comparator`
 * which is invoked to compare elements of `array` to `values`. The order and
 * references of result values are determined by the first array. The comparator
 * is invoked with two arguments: (arrVal, othVal).
 *
 * **Note:** Unlike `pullAllWith`, this method returns a new array.
 *
 * @since 4.0.0
 * @category Array
 * @param {Array} array The array to inspect.
 * @param {...Array} [values] The values to exclude.
 * @param {Function} [comparator] The comparator invoked per element.
 * @returns {Array} Returns the new array of filtered values.
 * @example
 *
 * const objects = [{ 'x': 1, 'y': 2 }, { 'x': 2, 'y': 1 }]
 *
 * differenceWith(objects, [{ 'x': 1, 'y': 2 }], isEqual)
 * // => [{ 'x': 2, 'y': 1 }]
 */
function differenceWith(array, ...values) {
  let comparator = last(values)
  if (isArrayLikeObject(comparator)) {
    comparator = undefined
  }
  return isArrayLikeObject(array)
    ? baseDifference(array, baseFlatten(values, 1, isArrayLikeObject, true), undefined, comparator)
    : []
}
```

`differenceWith` 函数与 `differenceBy` 相似，只不过调用 `baseDifference` 函数的时候第三个参数为 `undefined`，多了第四个参数 `comparator`。

在 `baseDifference` 函数中：

```js
if (comparator) {
  includes = arrayIncludesWith
  isCommon = false
}
```

如果有 `comparator` 会将引入的 `arrayIncludesWith` 的赋值给 `includes`，并且将 `isCommon` 赋值为 `false`，在 `for...of` 循环时不会进入第一个 `if` 判断，根据 `includes` 返回的布尔值将 `value` 插入 `result`，最后将 `result` 返回。

```js
function arrayIncludesWith(array, target, comparator) {
  if (array == null) {
    return false
  }

  for (const value of array) {
    if (comparator(target, value)) {
      return true
    }
  }
  return false
}
```

`arrayIncludesWith` 函数会迭代传入的数组，并且用 `comparator` 函数进行比较后返回。

## drop

> 裁剪数组中的前 N 个数组，返回剩余的部分。

```js
/**
 * Creates a slice of `array` with `n` elements dropped from the beginning.
 *
 * @since 0.5.0
 * @category Array
 * @param {Array} array The array to query.
 * @param {number} [n=1] The number of elements to drop.
 * @returns {Array} Returns the slice of `array`.
 * @example
 *
 * drop([1, 2, 3])
 * // => [2, 3]
 *
 * drop([1, 2, 3], 2)
 * // => [3]
 *
 * drop([1, 2, 3], 5)
 * // => []
 *
 * drop([1, 2, 3], 0)
 * // => [1, 2, 3]
 */
function drop(array, n=1) {
  const length = array == null ? 0 : array.length
  return length
    ? slice(array, n < 0 ? 0 : n, length)
    : []
}
```

`drop` 函数接收 2 个数组， `array` 数组，`n` 裁剪的个数，默认为 1 。

首先申明 `length` 来保存数组长度，默认为 0，`drop` 会返回一个三元表达式，如果有 `length` 就调用 `slice` 进行切割，返回剩余数组，其实也就是 `slice` 的一层包装。

## dropRight

> 从右边开始裁剪数组中的 N 个数组，返回剩余的部分。

```js
/**
 * Creates a slice of `array` with `n` elements dropped from the end.
 *
 * @since 3.0.0
 * @category Array
 * @param {Array} array The array to query.
 * @param {number} [n=1] The number of elements to drop.
 * @returns {Array} Returns the slice of `array`.
 * @example
 *
 * dropRight([1, 2, 3])
 * // => [1, 2]
 *
 * dropRight([1, 2, 3], 2)
 * // => [1]
 *
 * dropRight([1, 2, 3], 5)
 * // => []
 *
 * dropRight([1, 2, 3], 0)
 * // => [1, 2, 3]
 */
function dropRight(array, n=1) {
  const length = array == null ? 0 : array.length
  return length ? slice(array, 0, n < 0 ? 0 : -n) : []
}
```

`dropRight` 函数和 `drop` 函数类似，只是调用 `slice` 函数的参数有所不同，`n < 0` 就为 0，否则就为 `-n`，为负数时，`slice` 函数会从右侧开始切割。

## dropRightWhile

> 从右边开始裁剪数组，起点从 predicate 返回假值开始。predicate 会传入3个参数：(value, index, array)。

```js
/**
 * Creates a slice of `array` excluding elements dropped from the end.
 * Elements are dropped until `predicate` returns falsey. The predicate is
 * invoked with three arguments: (value, index, array).
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
 * dropRightWhile(users, ({ active }) => active)
 * // => objects for ['barney']
 */
function dropRightWhile(array, predicate) {
  return (array != null && array.length)
    ? baseWhile(array, predicate, true, true)
    : []
}
```

`dropRightWhile` 函数接收 2 个参数，`array` 数组、`predicate` 迭代函数。

`dropRightWhile` 会返回一个三元表达式，如果 `array` 不为 `null` 并且有 `length`，调用 `baseWhile` 函数，返回处理后的数组，`baseWhile` 调用 `predicate` 会对数组进行循环处理，并且删除调用 `predicate` 函数为 `false` 的元素，否则返回空数组。

## dropWhile

> 裁剪数组，起点从 predicate 返回假值开始。predicate 会传入3个参数：(value, index, array)。

```js
/**
 * Creates a slice of `array` excluding elements dropped from the beginning.
 * Elements are dropped until `predicate` returns falsey. The predicate is
 * invoked with three arguments: (value, index, array).
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
 * dropWhile(users, ({ active }) => active)
 * // => objects for ['pebbles']
 */
function dropWhile(array, predicate) {
  return (array != null && array.length)
    ? baseWhile(array, predicate, true)
    : []
}
```

`dropWhile` 处理逻辑与 `dropRightWhile` 相似，只是调用 `baseWhile` 函数的时候没有传第四个参数，默认从左往右开始截取。

## fill

> 指定 value 填充数组，从 start 到 end 的位置，但不包括 end 本身的位置。 

```js
/**
 * Fills elements of `array` with `value` from `start` up to, but not
 * including, `end`.
 *
 * **Note:** This method mutates `array`.
 *
 * @static
 * @memberOf _
 * @since 3.2.0
 * @category Array
 * @param {Array} array The array to fill.
 * @param {*} value The value to fill `array` with.
 * @param {number} [start=0] The start position.
 * @param {number} [end=array.length] The end position.
 * @returns {Array} Returns `array`.
 * @example
 *
 * var array = [1, 2, 3];
 *
 * _.fill(array, 'a');
 * console.log(array);
 * // => ['a', 'a', 'a']
 *
 * _.fill(Array(3), 2);
 * // => [2, 2, 2]
 *
 * _.fill([4, 6, 8, 10], '*', 1, 3);
 * // => [4, '*', '*', 10]
 */
function fill(array, value, start, end) {
  var length = array == null ? 0 : array.length;
  if (!length) {
    return [];
  }
  if (start && typeof start != 'number' && isIterateeCall(array, value, start)) {
    start = 0;
    end = length;
  }
  return baseFill(array, value, start, end);
}
```

`fill` 函数接收 4 个参数，`array` 填充数组、`value` 填充的值、`start` 开始位置，`end` 结束位置。

首先申明 `length` 变量保存数组 `length`，默认为 0，
如果没有 `length` 返回空数组。

接着判断如果有 `start`、 `start` 的类型不是 `number`，并且调用 `isIterateeCall` 函数检查参数是否来自迭代器调用，如果符合条件，将 `start` 赋值为 0，`end` 赋值为数组长度。

最后调用 `baseFill` 函数进行填充，并将填充后的数组返回。

## findIndex

> 这个方法类似 _.find。除了它返回最先通过 predicate 判断为真值的元素的 index ，而不是元素本身。

```js
/**
 * This method is like `_.find` except that it returns the index of the first
 * element `predicate` returns truthy for instead of the element itself.
 *
 * @static
 * @memberOf _
 * @since 1.1.0
 * @category Array
 * @param {Array} array The array to inspect.
 * @param {Function} [predicate=_.identity] The function invoked per iteration.
 * @param {number} [fromIndex=0] The index to search from.
 * @returns {number} Returns the index of the found element, else `-1`.
 * @example
 *
 * var users = [
 *   { 'user': 'barney',  'active': false },
 *   { 'user': 'fred',    'active': false },
 *   { 'user': 'pebbles', 'active': true }
 * ];
 *
 * _.findIndex(users, function(o) { return o.user == 'barney'; });
 * // => 0
 *
 * // The `_.matches` iteratee shorthand.
 * _.findIndex(users, { 'user': 'fred', 'active': false });
 * // => 1
 *
 * // The `_.matchesProperty` iteratee shorthand.
 * _.findIndex(users, ['active', false]);
 * // => 0
 *
 * // The `_.property` iteratee shorthand.
 * _.findIndex(users, 'active');
 * // => 2
 */
function findIndex(array, predicate, fromIndex) {
  var length = array == null ? 0 : array.length;
  if (!length) {
    return -1;
  }
  var index = fromIndex == null ? 0 : toInteger(fromIndex);
  if (index < 0) {
    index = nativeMax(length + index, 0);
  }
  return baseFindIndex(array, getIteratee(predicate, 3), index);
}
```

`findIndex` 函数接收 3 个参数，`array` 数组、`predicate` 迭代函数，`fromIndex` 搜索开始下标。

首先申明 `length` 变量保存数组长度，默认为 0，如果没有长度返回 `-1`，接着会处理 `index` 起始下标，如果 `index` 小于 0 ，取 `length + index` 和 0 的最大值，最后调用 `baseFindIndex` 返回处理后的数组。


`baseFindIndex` 函数

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

## findLastIndex

> 这个方式类似 _.findIndex ， 不过它是从右到左的。

```js
/**
  * This method is like `_.findIndex` except that it iterates over elements
  * of `collection` from right to left.
  *
  * @static
  * @memberOf _
  * @since 2.0.0
  * @category Array
  * @param {Array} array The array to inspect.
  * @param {Function} [predicate=_.identity] The function invoked per iteration.
  * @param {number} [fromIndex=array.length-1] The index to search from.
  * @returns {number} Returns the index of the found element, else `-1`.
  * @example
  *
  * var users = [
  *   { 'user': 'barney',  'active': true },
  *   { 'user': 'fred',    'active': false },
  *   { 'user': 'pebbles', 'active': false }
  * ];
  *
  * _.findLastIndex(users, function(o) { return o.user == 'pebbles'; });
  * // => 2
  *
  * // The `_.matches` iteratee shorthand.
  * _.findLastIndex(users, { 'user': 'barney', 'active': true });
  * // => 0
  *
  * // The `_.matchesProperty` iteratee shorthand.
  * _.findLastIndex(users, ['active', false]);
  * // => 2
  *
  * // The `_.property` iteratee shorthand.
  * _.findLastIndex(users, 'active');
  * // => 0
  */
function findLastIndex(array, predicate, fromIndex) {
  var length = array == null ? 0 : array.length;
  if (!length) {
    return -1;
  }
  var index = length - 1;
  if (fromIndex !== undefined) {
    index = toInteger(fromIndex);
    index = fromIndex < 0
      ? nativeMax(length + index, 0)
      : nativeMin(index, length - 1);
  }
  return baseFindIndex(array, getIteratee(predicate, 3), index, true);
}
```

`findLastIndex` 函数和 `findIndex` 相似，只是调用 `baseFindIndex` 函数时传入了第四个参数为 `true`，
在 `baseFindIndex` 中 `fromRight` 为真就从右往左开始循环。

## first -> head

> 获得数组的首个元素。

```js
/**
 * Gets the first element of `array`.
 *
 * @since 0.1.0
 * @alias first
 * @category Array
 * @param {Array} array The array to query.
 * @returns {*} Returns the first element of `array`.
 * @see last
 * @example
 *
 * head([1, 2, 3])
 * // => 1
 *
 * head([])
 * // => undefined
 */
function head(array) {
  return (array != null && array.length)
    ? array[0]
    : undefined
}
```

`head` 函数会返回一个三元表达式，如果传入 `array` 不为 `null` 并且有 `length` ，返回 `array` 的第一个，否则返回空数组。

## flatten

> 向上一级展平数组嵌套

```js
/**
 * Flattens `array` a single level deep.
 *
 * @since 0.1.0
 * @category Array
 * @param {Array} array The array to flatten.
 * @returns {Array} Returns the new flattened array.
 * @see flatMap, flatMapDeep, flatMapDepth, flattenDeep, flattenDepth
 * @example
 *
 * flatten([1, [2, [3, [4]], 5]])
 * // => [1, 2, [3, [4]], 5]
 */
function flatten(array) {
  const length = array == null ? 0 : array.length
  return length ? baseFlatten(array, 1) : []
}
```

`flatten` 函数只接收 `array` 参数，首先申明 `length` 变量保存数组 `length`。

最后会返回一个三元表达式，如果 `length` 为 `true`，调用 `baseFlatten` 函数传参为 `array, 1` ，`baseFlatten` 会返回扁平化一层后的数组，
如果 `length` 为 `false` ，则返回空数组。

## flattenDeep

> 递归展平数组。

```js
/** Used as references for various `Number` constants. */
const INFINITY = 1 / 0

/**
 * Recursively flattens `array`.
 *
 * @since 3.0.0
 * @category Array
 * @param {Array} array The array to flatten.
 * @returns {Array} Returns the new flattened array.
 * @see flatMap, flatMapDeep, flatMapDepth, flatten, flattenDepth
 * @example
 *
 * flattenDeep([1, [2, [3, [4]], 5]])
 * // => [1, 2, 3, 4, 5]
 */
function flattenDeep(array) {
  const length = array == null ? 0 : array.length
  return length ? baseFlatten(array, INFINITY) : []
}
```

`flattenDeep` 函数与 `flatten` 函数相似，只是调用 `baseFlatten` 时传入了 `INFINITY`，`baseFlatten` 会去递归展平数组，返回全部展开的数组。

## flattenDepth

> 根据 depth 递归展平数组的层级。

```js
/**
 * Recursively flatten `array` up to `depth` times.
 *
 * @since 4.4.0
 * @category Array
 * @param {Array} array The array to flatten.
 * @param {number} [depth=1] The maximum recursion depth.
 * @returns {Array} Returns the new flattened array.
 * @see flatMap, flatMapDeep, flatMapDepth, flattenDeep
 * @example
 *
 * const array = [1, [2, [3, [4]], 5]]
 *
 * flattenDepth(array, 1)
 * // => [1, 2, [3, [4]], 5]
 *
 * flattenDepth(array, 2)
 * // => [1, 2, 3, [4], 5]
 */
function flattenDepth(array, depth) {
  const length = array == null ? 0 : array.length
  if (!length) {
    return []
  }
  depth = depth === undefined ? 1 : +depth
  return baseFlatten(array, depth)
}
```

`flattenDepth` 函数接收 2 个参数，`array` 数组、`depth` 展平深度。

首先取出 `length` 长度，默认为 0，判断如果 `length` 为 `false`，返回空数组。

接着对 `depth` 进行处理，`depth`默认为 1 ，最后调用 `baseFlatten` 函数，并传入 `array ` 数组、`depth` 展平深度，返回递归展平后的数组。

## fromPairs

> 反向版 _.toPairs，这个方法返回一个由键值对构成的对象。

```js
/**
 * The inverse of `_.toPairs`; this method returns an object composed
 * from key-value `pairs`.
 *
 * @static
 * @memberOf _
 * @since 4.0.0
 * @category Array
 * @param {Array} pairs The key-value pairs.
 * @returns {Object} Returns the new object.
 * @example
 *
 * _.fromPairs([['a', 1], ['b', 2]]);
 * // => { 'a': 1, 'b': 2 }
 */
function fromPairs(pairs) {
  var index = -1,
    length = pairs == null ? 0 : pairs.length,
    result = {};

  while (++index < length) {
    var pair = pairs[index];
    result[pair[0]] = pair[1];
  }
  return result;
}
```

`fromPairs` 接收 `pairs` 数组，申明 `index` 为 -1、 `length` 数组 `pairs` 长度、`result` 空对象。
 
接着进行 `while` 循环，`index` 累加，申明 `pair` 变量保存当前循环的 `value`，接着以 `pair[0]` 为 `key` 、`pair[1]` 为 `value` 组装 `result` 对象，最后将 `result` 对象返回。

## head

> 获得数组的首个元素。

见 `first -> head`。