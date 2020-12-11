## countBy

> 创建一个组成对象，key 是经过 iteratee 处理的集合的结果，value 是处理结果的次数。 iteratee 会传入一个参数：(value)。

```js
_.countBy(collection, [iteratee=_.identity])
```

```js
/** Used to check objects for own properties. */
const hasOwnProperty = Object.prototype.hasOwnProperty

/**
 * Creates an object composed of keys generated from the results of running
 * each element of `collection` thru `iteratee`. The corresponding value of
 * each key is the number of times the key was returned by `iteratee`. The
 * iteratee is invoked with one argument: (value).
 *
 * @since 0.5.0
 * @category Collection
 * @param {Array|Object} collection The collection to iterate over.
 * @param {Function} iteratee The iteratee to transform keys.
 * @returns {Object} Returns the composed aggregate object.
 * @example
 *
 * const users = [
 *   { 'user': 'barney', 'active': true },
 *   { 'user': 'betty', 'active': true },
 *   { 'user': 'fred', 'active': false }
 * ]
 *
 * countBy(users, 'active');
 * // => { 'true': 2, 'false': 1 }
 */
function countBy(collection, iteratee) {
  return reduce(collection, (result, value, key) => {
    key = iteratee(value)
    if (hasOwnProperty.call(result, key)) {
      ++result[key]
    } else {
      baseAssignValue(result, key, 1)
    }
    return result
  }, {})
}
```

`countBy` 函数接收 2 个参数 `collection` 收集数组、`iteratee` 迭代器函数。

在 `countBy` 函数内部 `return` 了一个 `reduce` 函数，以 `{}` 为初始值。

在 `reduce` 的回调函数中，会将 `key` 赋值为迭代器函数处理后的 `value`，
接着调用 `hasOwnProperty` 判断 `result` 是否有 `key` 属性，如果有就将 `result[key]` 也就是将 `value + 1`，否则就调用 `baseAssignValue` 函数实现一个简单的属性赋值，回调函数会返回处理后的 `result`，以便继续循环，
最后会将 `reduce` 函数处理后的对象返回。

## each -> forEach

## eachRight -> forEachRight

## every

> 通过 predicate 检查集合中的元素是否都返回 真值，只要 predicate 返回一次假值，遍历就停止，并返回 false。 predicate 会传入3个参数：(value, index|key, collection)

```js
_.every(collection, [predicate=_.identity])
```

```js
/**
 * Checks if `predicate` returns truthy for **all** elements of `array`.
 * Iteration is stopped once `predicate` returns falsey. The predicate is
 * invoked with three arguments: (value, index, array).
 *
 * **Note:** This method returns `true` for
 * [empty arrays](https://en.wikipedia.org/wiki/Empty_set) because
 * [everything is true](https://en.wikipedia.org/wiki/Vacuous_truth) of
 * elements of empty arrays.
 *
 * @since 5.0.0
 * @category Array
 * @param {Array} array The array to iterate over.
 * @param {Function} predicate The function invoked per iteration.
 * @returns {boolean} Returns `true` if all elements pass the predicate check,
 *  else `false`.
 * @example
 *
 * every([true, 1, null, 'yes'], Boolean)
 * // => false
 */
function every(array, predicate) {
  let index = -1
  const length = array == null ? 0 : array.length

  while (++index < length) {
    if (!predicate(array[index], index, array)) {
      return false
    }
  }
  return true
}
```

`every` 函数接收 2 个数组，`array` 数组，`predicate` 断言函数。

申明初始变量 `index` -1，申明 `length` 变量储存数组长度，默认为 1。

进入 `while` 循环，`index` 累加，在循环中不断调用 `predicate` 断言函数，如果 `!predicate()` 为真  ，返回 `false` 退出循环，循环结束返回 `true`，说明全部符合断言函数。

## filter

> 遍历集合中的元素，筛选出一个经过 predicate 检查结果为真值的数组，predicate 会传入3个参数：(value, index|key, collection)。

```js
_.filter(collection, [predicate=_.identity])
```

```js
/**
 * Iterates over elements of `array`, returning an array of all elements
 * `predicate` returns truthy for. The predicate is invoked with three
 * arguments: (value, index, array).
 *
 * **Note:** Unlike `remove`, this method returns a new array.
 *
 * @since 5.0.0
 * @category Array
 * @param {Array} array The array to iterate over.
 * @param {Function} predicate The function invoked per iteration.
 * @returns {Array} Returns the new filtered array.
 * @see pull, pullAll, pullAllBy, pullAllWith, pullAt, remove, reject
 * @example
 *
 * const users = [
 *   { 'user': 'barney', 'active': true },
 *   { 'user': 'fred',   'active': false }
 * ]
 *
 * filter(users, ({ active }) => active)
 * // => objects for ['barney']
 */
function filter(array, predicate) {
  let index = -1
  let resIndex = 0
  const length = array == null ? 0 : array.length
  const result = []

  while (++index < length) {
    const value = array[index]
    if (predicate(value, index, array)) {
      result[resIndex++] = value
    }
  }
  return result
}
```

`filter` 函数接收 2 个数组，`array` 数组，`predicate` 断言函数。

申明初始变量 `index` 、 `resIndex` 、 `length` 、`result`。

进入 `while` 循环，`index` 累加，申明 `value` 变量储存当前循环的 `value`，
如果调用 `predicate` 函数返回为真，`resIndex` 累加，将 `value` 赋值给 `result` 数组的第 `resIndex` 个。

循环结束后，最后将 `result` 数组返回。

## find

> 遍历集合中的元素，返回最先经 predicate 检查为真值的元素。 predicate 会传入3个元素：(value, index|key, collection)。

```js
_.find(collection, [predicate=_.identity], [fromIndex=0])
```

```js
/**
  * Iterates over elements of `collection`, returning the first element
  * `predicate` returns truthy for. The predicate is invoked with three
  * arguments: (value, index|key, collection).
  *
  * @static
  * @memberOf _
  * @since 0.1.0
  * @category Collection
  * @param {Array|Object} collection The collection to inspect.
  * @param {Function} [predicate=_.identity] The function invoked per iteration.
  * @param {number} [fromIndex=0] The index to search from.
  * @returns {*} Returns the matched element, else `undefined`.
  * @example
  *
  * var users = [
  *   { 'user': 'barney',  'age': 36, 'active': true },
  *   { 'user': 'fred',    'age': 40, 'active': false },
  *   { 'user': 'pebbles', 'age': 1,  'active': true }
  * ];
  *
  * _.find(users, function(o) { return o.age < 40; });
  * // => object for 'barney'
  *
  * // The `_.matches` iteratee shorthand.
  * _.find(users, { 'age': 1, 'active': true });
  * // => object for 'pebbles'
  *
  * // The `_.matchesProperty` iteratee shorthand.
  * _.find(users, ['active', false]);
  * // => object for 'fred'
  *
  * // The `_.property` iteratee shorthand.
  * _.find(users, 'active');
  * // => object for 'barney'
  */
var find = createFind(findIndex);
```

`createFind` 函数是调用 `createFind` 返回的函数，传入了 `findIndex` 函数，`findIndex` 函数在数组篇有提到过是用来根据 `value` 获取所在数组下标。

## findLast

> 这个方法类似 _.find，除了它是从右至左遍历集合的。

```js
_.findLast(collection, [predicate=_.identity])
```

```js
/**
 * This method is like `find` except that it iterates over elements of
 * `collection` from right to left.
 *
 * @since 2.0.0
 * @category Collection
 * @param {Array|Object} collection The collection to inspect.
 * @param {Function} predicate The function invoked per iteration.
 * @param {number} [fromIndex=collection.length-1] The index to search from.
 * @returns {*} Returns the matched element, else `undefined`.
 * @see find, findIndex, findKey, findLastIndex, findLastKey
 * @example
 *
 * findLast([1, 2, 3, 4], n => n % 2 == 1)
 * // => 3
 */
const findLast = createFind(findLastIndex)
```

`findLast` 函数是调用 `createFind` 函数后返回的函数，传入了 `findLastIndex` 函数，`findLastIndex` 是获取 `value` 所在的最后一个下标。

## createFind

```js
/**
  * Creates a `_.find` or `_.findLast` function.
  *
  * @private
  * @param {Function} findIndexFunc The function to find the collection index.
  * @returns {Function} Returns the new find function.
  */
function createFind(findIndexFunc) {
  return function (collection, predicate, fromIndex) {
    var iterable = Object(collection);
    if (!isArrayLike(collection)) {
      var iteratee = getIteratee(predicate, 3);
      collection = keys(collection);
      predicate = function (key) { return iteratee(iterable[key], key, iterable); };
    }
    var index = findIndexFunc(collection, predicate, fromIndex);
    return index > -1 ? iterable[iteratee ? collection[index] : index] : undefined;
  };
}
```

`createFind` 函数会接受一个 `findIndexFunc` 获取数组下标的函数。

函数内部会返回一个 `function`，接着 `collection` 检查集合、`predicate` 迭代函数、`fromIndex` 起始位置。

首先申明 `iterable`，调用 `Object` 处理 `collection`，调用 `isArrayLike` 函数判断 `collection`  是否是类数组，如果是 `object`，就调用 `getIteratee` 返回迭代器函数 `iteratee`，调用 `keys` 函数获取 `collection` 的 `key` 数组赋值给 `collection`，这里会将 `predicate` 重新赋返回值为 `iteratee` 函数调用的函数。

如果是类数组的话，这里会调用传入的 `findIndexFunc` 函数获取对应下标位置，如果 `index` 大于 -1，说明数组中有这个 `value`，将 `iterable` 对应的值，这个取值的 `key` 是一个三元表达式：

```js
iteratee ? collection[index] : index
```

如果 `iteratee` 为真，说明 `collection` 是一个对象，`collection[index]` 代表 `key` 值，否则是 `collection` 数组，取值的就是 `index` 下标。

## flatMap

> 创建一个扁平化的数组，每一个值会传入 iteratee 处理，处理结果会与值合并。 iteratee 会传入3个参数：(value, index|key, array)。

```js
_.flatMap(collection, [iteratee=_.identity])
```

```js
/**
 * Creates a flattened array of values by running each element in `collection`
 * thru `iteratee` and flattening the mapped results. The iteratee is invoked
 * with three arguments: (value, index|key, collection).
 *
 * @since 4.0.0
 * @category Collection
 * @param {Array|Object} collection The collection to iterate over.
 * @param {Function} iteratee The function invoked per iteration.
 * @returns {Array} Returns the new flattened array.
 * @see flatMapDeep, flatMapDepth, flatten, flattenDeep, flattenDepth, map, mapKeys, mapValues
 * @example
 *
 * function duplicate(n) {
 *   return [n, n]
 * }
 *
 * flatMap([1, 2], duplicate)
 * // => [1, 1, 2, 2]
 */
function flatMap(collection, iteratee) {
  return baseFlatten(map(collection, iteratee), 1)
}
```

`flatMap` 函数接收 `collection` 集合、 `iteratee` 迭代器函数。

```js
map(collection, iteratee)
```

将经过 `iteratee` 迭代函数处理的数组作为第一个参数传入 `baseFlatten`，第二个参数为 1，调用 `baseFlatten` 函数，返回将结果返回。


`baseFlatten` 函数：

```js
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

`baseFlatten` 接收 `array` 数组、`depth` 深度, `predicate` 断言函数, `isStrict` 是否严格, `result` 默认为空数组。

判断 `array == null` 如果等于 `null` ， 返回传入的 `result`。

进入 `for...of ` 循环，然后判断 `depth > 0` 并且调用传入 `predicate` 函数为真，满足条件再次判断 `depth > 1` ，就递归调用 `baseFlatten` 扁平化数组，
不满足就将 `...value` 插入 `result` 数组，如果 `isStrict` 为 `false`，将 `value` 赋值为 `result` 的第 `result.length` 个， 循环结束后将 `result` 数组返回。

## flatMapDeep

```js
_.flatMapDeep(collection, [iteratee=_.identity])
```

```js
/** Used as references for various `Number` constants. */
const INFINITY = 1 / 0

/**
 * This method is like `flatMap` except that it recursively flattens the
 * mapped results.
 *
 * @since 4.7.0
 * @category Collection
 * @param {Array|Object} collection The collection to iterate over.
 * @param {Function} iteratee The function invoked per iteration.
 * @returns {Array} Returns the new flattened array.
 * @see flatMap, flatMapDepth, flatten, flattenDeep, flattenDepth, map, mapKeys, mapValues
 * @example
 *
 * function duplicate(n) {
 *   return [[[n, n]]]
 * }
 *
 * flatMapDeep([1, 2], duplicate)
 * // => [1, 1, 2, 2]
 */
function flatMapDeep(collection, iteratee) {
  return baseFlatten(map(collection, iteratee), INFINITY)
}
```

`flatMapDeep` 函数与 `flatMap` 函数相似，只是传入第二个参数不是 1，而是 `INFINITY`，`baseFlatten` 会一直迭代循环，直到把数组完全扁平化。


## flatMapDepth

```js
_.flatMapDepth(collection, [iteratee=_.identity], [depth=1])
```

```js
/**
 * This method is like `flatMap` except that it recursively flattens the
 * mapped results up to `depth` times.
 *
 * @since 4.7.0
 * @category Collection
 * @param {Array|Object} collection The collection to iterate over.
 * @param {Function} iteratee The function invoked per iteration.
 * @param {number} [depth=1] The maximum recursion depth.
 * @returns {Array} Returns the new flattened array.
 * @see flatMap, flatMapDeep, flatten, flattenDeep, flattenDepth, map, mapKeys, mapValues
 * @example
 *
 * function duplicate(n) {
 *   return [[[n, n]]]
 * }
 *
 * flatMapDepth([1, 2], duplicate, 2)
 * // => [[1, 1], [2, 2]]
 */
function flatMapDepth(collection, iteratee, depth) {
  depth = depth === undefined ? 1 : +depth
  return baseFlatten(map(collection, iteratee), depth)
}
```

`baseFlatten` 函数与 `flatMap` 函数相比，多传入了 `depth` 函数，首先会对 `depth` 进行判断，默认为 1，然后将 `depth` 作为 `baseFlatten` 函数的第三个参数传入。

## forEach

> 调用 iteratee 遍历集合中的元素， iteratee 会传入3个参数：(value, index|key, collection)。 如果显式的返回 false ，iteratee 会提前退出。 

```js
_.forEach(collection, [iteratee=_.identity])
```

```js
/**
 * Iterates over elements of `collection` and invokes `iteratee` for each element.
 * The iteratee is invoked with three arguments: (value, index|key, collection).
 * Iteratee functions may exit iteration early by explicitly returning `false`.
 *
 * **Note:** As with other "Collections" methods, objects with a "length"
 * property are iterated like arrays. To avoid this behavior use `forIn`
 * or `forOwn` for object iteration.
 *
 * @since 0.1.0
 * @alias each
 * @category Collection
 * @param {Array|Object} collection The collection to iterate over.
 * @param {Function} iteratee The function invoked per iteration.
 * @returns {Array|Object} Returns `collection`.
 * @see forEachRight, forIn, forInRight, forOwn, forOwnRight
 * @example
 *
 * forEach([1, 2], value => console.log(value))
 * // => Logs `1` then `2`.
 *
 * forEach({ 'a': 1, 'b': 2 }, (value, key) => console.log(key))
 * // => Logs 'a' then 'b' (iteration order is not guaranteed).
 */
function forEach(collection, iteratee) {
  const func = Array.isArray(collection) ? arrayEach : baseEach
  return func(collection, iteratee)
}
```

`forEach` 接收 2 个参数， `collection` 数组集合，`iteratee` 迭代器函数。

首先会调用 `Array.isArray` 判断 `collection` 是否是数组，如果是数组将 `arrayEach` 赋值给 `func`，否则将 `baseEach` 赋值给 `func`，最后调用 `func`，并将循环后 `collection` 返回。

## arrayEach

```js
function arrayEach(array, iteratee) {
  let index = -1
  const length = array == null ? 0 : array.length

  while (++index < length) {
    if (iteratee(array[index], index, array) === false) {
      break
    }
  }
  return array
}
```

`arrayEach` 函数接收 2 个参数，`array` 数组、`iteratee` 迭代器函数。

申明 `index` 、`length` 初始变量，
进入 `while` 循环，随后在循环中调用 `iteratee` 迭代器函数，如果迭代器函数返回 `false` 将会跳出循环，返回 `array`，弥补了原生 `arrayEach` 不能跳出循环的缺陷。

## forEachRight

> 这个方法类似 _.forEach，除了它是从右到左遍历的集合中的元素的。

```js
_.forEachRight(collection, [iteratee=_.identity])
```

```js
/**
 * This method is like `forEach` except that it iterates over elements of
 * `collection` from right to left.
 *
 * @since 2.0.0
 * @alias eachRight
 * @category Collection
 * @param {Array|Object} collection The collection to iterate over.
 * @param {Function} iteratee The function invoked per iteration.
 * @returns {Array|Object} Returns `collection`.
 * @see forEach, forIn, forInRight, forOwn, forOwnRight
 * @example
 *
 * forEachRight([1, 2], value => console.log(value))
 * // => Logs `2` then `1`.
 */
function forEachRight(collection, iteratee) {
  const func = Array.isArray(collection) ? arrayEachRight : baseEachRight
  return func(collection, iteratee)
}
```

`forEachRight` 与 `forEach` 函数实现基本一致，只是调用 `arrayEachRight` 、`baseEachRight` 方法有所不同，`arrayEachRight` 是在 `while` 中将 `array.length` 递减。

## groupBy

> 创建一个对象组成，key 是经 iteratee 处理的结果， value 是产生 key 的元素数组。 iteratee 会传入1个参数：(value)。

```js
_.groupBy(collection, [iteratee=_.identity])
```

```js
/** Used to check objects for own properties. */
const hasOwnProperty = Object.prototype.hasOwnProperty

/**
 * Creates an object composed of keys generated from the results of running
 * each element of `collection` thru `iteratee`. The order of grouped values
 * is determined by the order they occur in `collection`. The corresponding
 * value of each key is an array of elements responsible for generating the
 * key. The iteratee is invoked with one argument: (value).
 *
 * @since 0.1.0
 * @category Collection
 * @param {Array|Object} collection The collection to iterate over.
 * @param {Function} iteratee The iteratee to transform keys.
 * @returns {Object} Returns the composed aggregate object.
 * @example
 *
 * groupBy([6.1, 4.2, 6.3], Math.floor)
 * // => { '4': [4.2], '6': [6.1, 6.3] }
 */
function groupBy(collection, iteratee) {
  return reduce(collection, (result, value, key) => {
    key = iteratee(value)
    if (hasOwnProperty.call(result, key)) {
      result[key].push(value)
    } else {
      baseAssignValue(result, key, [value])
    }
    return result
  }, {})
}
```

`groupBy` 与 `countBy` 函数相似， 接收 2 个参数， `collection` 集合、`iteratee` 迭代器函数。


在 `groupBy` 函数内部 `return` 了一个 `reduce` 函数，以 `{}` 为初始值。

在 `reduce` 的回调函数中，会将 `key` 赋值为迭代器函数处理后的 `value`，
接着调用 `hasOwnProperty` 判断 `result` 是否有 `key` 属性，如果有就将 `result[key]` 迭代函数处理后得到的 `value` 插入数组，否则就调用 `baseAssignValue` 函数实现一个简单的属性赋值，回调函数会返回处理后的 `result`，以便继续循环，
最后会将 `reduce` 函数处理后的对象返回。

## includes

> 检查 值 是否在 集合中，如果集合是字符串，那么检查 值 是否在字符串中。 其他情况用 SameValueZero 等值比较。 如果指定 fromIndex 是负数，从结尾开始检索。

```js
_.includes(collection, value, [fromIndex=0])
```

```js
/**
  * Checks if `value` is in `collection`. If `collection` is a string, it's
  * checked for a substring of `value`, otherwise
  * [`SameValueZero`](http://ecma-international.org/ecma-262/7.0/#sec-samevaluezero)
  * is used for equality comparisons. If `fromIndex` is negative, it's used as
  * the offset from the end of `collection`.
  *
  * @static
  * @memberOf _
  * @since 0.1.0
  * @category Collection
  * @param {Array|Object|string} collection The collection to inspect.
  * @param {*} value The value to search for.
  * @param {number} [fromIndex=0] The index to search from.
  * @param- {Object} [guard] Enables use as an iteratee for methods like `_.reduce`.
  * @returns {boolean} Returns `true` if `value` is found, else `false`.
  * @example
  *
  * _.includes([1, 2, 3], 1);
  * // => true
  *
  * _.includes([1, 2, 3], 1, 2);
  * // => false
  *
  * _.includes({ 'a': 1, 'b': 2 }, 1);
  * // => true
  *
  * _.includes('abcd', 'bc');
  * // => true
  */
function includes(collection, value, fromIndex, guard) {
  collection = isArrayLike(collection) ? collection : values(collection);
  fromIndex = (fromIndex && !guard) ? toInteger(fromIndex) : 0;

  var length = collection.length;
  if (fromIndex < 0) {
    fromIndex = nativeMax(length + fromIndex, 0);
  }
  return isString(collection)
    ? (fromIndex <= length && collection.indexOf(value, fromIndex) > -1)
    : (!!length && baseIndexOf(collection, value, fromIndex) > -1);
}
```

`includes` 函数接收 4 个参数，`collection` 集合、`value` 检索的值、`fromIndex` 检索下标、`guard` 是否允许迭代器语法。

如果 `collection` 不是数组，将调用 `values` 函数处理 ，申明 `fromIndex` 默认为 0 、申明 `length` 变量保存数组长度，如果 `fromIndex` 为负数的情况，调用 `Math.max` 方法返回 `length + fromIndex` 和 0 之间的最大值。

```js
var nativeMax = Math.max
```

最后返回一个三元表达式，如果 `collection` 是字符串，使用 `indexOf` 函数判断 `collection` 是否含有这个 `value` ，否则使用 `baseIndexOf` 方法返回布尔值。

## invokeMap

> 调用 path 的方法处理集合中的每一个元素，返回处理的数组。 如何附加的参数会传入到调用方法中。如果方法名是个函数，集合中的每个元素都会被调用到。

```js
_.invokeMap(collection, path, [args])
```

```js
/**
 * Invokes the method at `path` of each element in `collection`, returning
 * an array of the results of each invoked method. Any additional arguments
 * are provided to each invoked method. If `path` is a function, it's invoked
 * for, and `this` bound to, each element in `collection`.
 *
 * @since 4.0.0
 * @category Collection
 * @param {Array|Object} collection The collection to iterate over.
 * @param {Array|Function|string} path The path of the method to invoke or
 *  the function invoked per iteration.
 * @param {Array} [args] The arguments to invoke each method with.
 * @returns {Array} Returns the array of results.
 * @example
 *
 * invokeMap([[5, 1, 7], [3, 2, 1]], 'sort')
 * // => [[1, 5, 7], [1, 2, 3]]
 *
 * invokeMap([123, 456], String.prototype.split, [''])
 * // => [['1', '2', '3'], ['4', '5', '6']]
 */
function invokeMap(collection, path, args) {
  let index = -1
  const isFunc = typeof path == 'function'
  const result = isArrayLike(collection) ? new Array(collection.length) : []

  baseEach(collection, (value) => {
    result[++index] = isFunc ? path.apply(value, args) : invoke(value, path, args)
  })
  return result
}
```

`invokeMap` 函数接收 3 个参数，`collection` 集合、`path` 调用的方法名、`args` `argments` 。

申明初始变量 `index` 为 -1 ，`isFunc` 变量保存 `path` 是否是一个函数，申明 `result` 变量为数组。

调用 `baseEach` 传入 `collection` 和回调函数:

```js
result[++index] = isFunc ? path.apply(value, args) : invoke(value, path, args)
```
在回调函数中，判断 `isFunc` 如果为真，将 `result[++index]` 赋值为 `path` 函数处理后的 `value`，赋值调用 `invoke` 函数后的 `value`，
最后将 `result` 返回。

## keyBy

> 创建一个对象组成。key 是经 iteratee 处理的结果，value 是产生key的元素。 iteratee 会传入1个参数：(value)。

```js
_.keyBy(collection, [iteratee=_.identity])
```

```js
/**
 * Creates an object composed of keys generated from the results of running
 * each element of `collection` thru `iteratee`. The corresponding value of
 * each key is the last element responsible for generating the key. The
 * iteratee is invoked with one argument: (value).
 *
 * @since 4.0.0
 * @category Collection
 * @param {Array|Object} collection The collection to iterate over.
 * @param {Function} iteratee The iteratee to transform keys.
 * @returns {Object} Returns the composed aggregate object.
 * @see groupBy, partition
 * @example
 *
 * const array = [
 *   { 'dir': 'left', 'code': 97 },
 *   { 'dir': 'right', 'code': 100 }
 * ]
 *
 * keyBy(array, ({ code }) => String.fromCharCode(code))
 * // => { 'a': { 'dir': 'left', 'code': 97 }, 'd': { 'dir': 'right', 'code': 100 } }
 */
function keyBy(collection, iteratee) {
  return reduce(collection, (result, value, key) => (
    baseAssignValue(result, iteratee(value), value), result
  ), {})
}
```

`keyBy` 函数接收 2 个参数，`collection` 集合、`iteratee` 迭代器函数。

`keyBy` 内部直接 `return` 了一个 `reduce` 函数，`reduce` 函数中传入 3 个参数，`collection` 集合、回调函数、以及初始值 `{}`。

在 `reduce` 的回调中，会调用 `baseAssignValue` 函数，传入 `result` 初始值、`iteratee(value)` 迭代器处理后的 `value` 、`value` ，进行简单的属性拷贝，最后 `reduce` 会返回处理后的对象。

## map

> 创建一个经过 iteratee 处理的集合中每一个元素的结果数组。 iteratee 会传入3个参数：(value, index|key, collection)。 

```js
_.map(collection, [iteratee=_.identity])
```

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

`map` 函数接收 2 个参数，`array` 数组、`iteratee` 迭代器函数。

申请初始变量 `index` 、`length` 数组长度、`result` 数组长度，默认为 0。

接着进行 `while` 循环，`index` 累加，不断向 `result` 插入 `iteratee` 迭代器函数处理后的 `value` ，循环结束将 `result` 数组返回。

## orderBy

> 这个方法类似 _.sortBy，除了它允许指定 iteratees 结果如何排序。 如果没指定 orders，所有值以升序排序。 其他情况，指定 "desc" 降序，指定 "asc" 升序其对应值。

```js
_.orderBy(collection, [iteratees=[_.identity]], [orders])
```

```js
/**
 * This method is like `sortBy` except that it allows specifying the sort
 * orders of the iteratees to sort by. If `orders` is unspecified, all values
 * are sorted in ascending order. Otherwise, specify an order of "desc" for
 * descending or "asc" for ascending sort order of corresponding values.
 * You may also specify a compare function for an order.
 *
 * @since 4.0.0
 * @category Collection
 * @param {Array|Object} collection The collection to iterate over.
 * @param {Array[]|Function[]|Object[]|string[]} [iteratees=[identity]]
 *  The iteratees to sort by.
 * @param {(string|function)[]} [orders] The sort orders of `iteratees`.
 * @returns {Array} Returns the new sorted array.
 * @see reverse
 * @example
 *
 * const users = [
 *   { 'user': 'fred',   'age': 48 },
 *   { 'user': 'barney', 'age': 34 },
 *   { 'user': 'fred',   'age': 40 },
 *   { 'user': 'barney', 'age': 36 }
 * ]
 *
 * // Sort by `user` in ascending order and by `age` in descending order.
 * orderBy(users, ['user', 'age'], ['asc', 'desc'])
 * // => objects for [['barney', 36], ['barney', 34], ['fred', 48], ['fred', 40]]
 *
 * // Sort by `user` then by `age` using custom compare functions for each
 * orderBy(users, ['user', 'age'], [
 *   (a, b) => a.localeCompare(b, 'de', { sensitivity: 'base' }),
 *   (a, b) => a - b,
 * ])
 *
 */
function orderBy(collection, iteratees, orders) {
  if (collection == null) {
    return []
  }
  if (!Array.isArray(iteratees)) {
    iteratees = iteratees == null ? [] : [iteratees]
  }
  if (!Array.isArray(orders)) {
    orders = orders == null ? [] : [orders]
  }
  return baseOrderBy(collection, iteratees, orders)
}
```

`orderBy` 函数接收 3 个参数，`collection` 迭代集合、`iteratees` 迭代函数、`orders` 排序顺序。

如果 `collection` 为 `null`，返回空数组，

判断 `iteratees` 迭代器函数 、`orders` 排序如果不是数组就都包装成数组，最后调用 `baseOrderBy` 方法返回排序后的数组。

## baseOrderBy

```js
/**
 * The base implementation of `orderBy` without param guards.
 *
 * @private
 * @param {Array|Object} collection The collection to iterate over.
 * @param {Function[]|Object[]|string[]} iteratees The iteratees to sort by.
 * @param {string[]} orders The sort orders of `iteratees`.
 * @returns {Array} Returns the new sorted array.
 */
function baseOrderBy(collection, iteratees, orders) {
  let index = -1
  iteratees = iteratees.length ? iteratees : [(value) => value]

  const result = baseMap(collection, (value, key, collection) => {
    const criteria = iteratees.map((iteratee) => iteratee(value))
    return { 'criteria': criteria, 'index': ++index, 'value': value }
  })

  return baseSortBy(result, (object, other) => compareMultiple(object, other, orders))
}
```

`baseOrderBy` 函数接收 3 个参数，`collection` 迭代集合、`iteratees` 迭代函数、`orders` 排序顺序。

申明初始 `index`，`iteratees` 迭代函数，如果没有 `length` 就简单包装成一个 `return` 原值的函数数组。

接下来会申明 `result` 变量用来保存 `baseMap` 函数调用返回，`baseMap` 是一个简单的迭代函数方法，此时接收
`collection` 迭代集合和一个回调函数，在回调函数中会循环调用 `iteratees` 中的方法处理 `value` ，最后 `return` 处理后的对象，并加上了 `criteria` 处理后的 `value` 以及 `index` 。

在函数最后调用了 `baseSortBy` 函数，将 `result` 和一个回调函数传入进行排序。

## baseMap

> 简单迭代函数。

```js
/**
  * The base implementation of `_.map` without support for iteratee shorthands.
  *
  * @private
  * @param {Array|Object} collection The collection to iterate over.
  * @param {Function} iteratee The function invoked per iteration.
  * @returns {Array} Returns the new mapped array.
  */
function baseMap(collection, iteratee) {
  var index = -1,
    result = isArrayLike(collection) ? Array(collection.length) : [];

  baseEach(collection, function (value, key, collection) {
    result[++index] = iteratee(value, key, collection);
  });
  return result;
}
```

`baseMap` 申明初始变量 -1， `result` 如果不是类数组，赋值为 `[]]`。

调用 `baseEach` 函数，将 `result` 的每一项处理成调用 `iteratee` 函数后的，
循环结束后将 `result` 返回。


## baseSortBy

```js
/**
 * The base implementation of `sortBy` which uses `comparer` to define the
 * sort order of `array` and replaces criteria objects with their corresponding
 * values.
 *
 * @private
 * @param {Array} array The array to sort.
 * @param {Function} comparer The function to define sort order.
 * @returns {Array} Returns `array`.
 */
function baseSortBy(array, comparer) {
  let { length } = array

  array.sort(comparer)
  while (length--) {
    array[length] = array[length].value
  }
  return array
}
```

`baseSortBy` 函数接收 2 个参数，`array` 数组和比较函数。

首先申明 `length` 保存 `array` 数组长度。 接着调用 `sort` 函数，传入 `comparer` 比较函数进行排序。


然后进入 `while` 循环，将 `array` 的每个赋值成 `array` 的 `length` 的 `value`，这里主要是将排序后的数组中的每一个恢复成原来的 `value`，循环结束后将 `array` 返回。

## compareMultiple

> 将值的多个属性与另一个进行比较排序。

```js
/**
 * Used by `orderBy` to compare multiple properties of a value to another
 * and stable sort them.
 *
 * If `orders` is unspecified, all values are sorted in ascending order. Otherwise,
 * specify an order of "desc" for descending or "asc" for ascending sort order
 * of corresponding values.
 *
 * @private
 * @param {Object} object The object to compare.
 * @param {Object} other The other object to compare.
 * @param {(string|function)[]} orders The order to sort by for each property.
 * @returns {number} Returns the sort order indicator for `object`.
 */
function compareMultiple(object, other, orders) {
  let index = -1
  const objCriteria = object.criteria
  const othCriteria = other.criteria
  const length = objCriteria.length
  const ordersLength = orders.length

  while (++index < length) {
    const order = index < ordersLength ? orders[index] : null
    const cmpFn = (order && typeof order === 'function') ? order: compareAscending
    const result = cmpFn(objCriteria[index], othCriteria[index])
    if (result) {
      if (order && typeof order !== 'function') {
        return result * (order == 'desc' ? -1 : 1)
      }
      return result
    }
  }
  // Fixes an `Array#sort` bug in the JS engine embedded in Adobe applications
  // that causes it, under certain circumstances, to provide the same value for
  // `object` and `other`. See https://github.com/jashkenas/underscore/pull/1247
  // for more details.
  //
  // This also ensures a stable sort in V8 and other engines.
  // See https://bugs.chromium.org/p/v8/issues/detail?id=90 for more details.
  return object.index - other.index
}
```

`compareMultiple` 函数接收 3 个参数，`object` 比较对象、`other` 另一个比较对象、`orders` 排序顺序，此时 `compareMultiple` 为 `sort` 的回调函数。

申明初始变量 `objCriteria` `othCriteria` 是 `baseOrderBy` 函数中迭代器函数处理后的 `value`， 保存`value` 的 `length` ，`orders` 的 `length` 。

在 `while` 循环中， `index` 累加，保存 `order` 、 `cmpFn` 变量，如果没有 `order` 就使用 `compareAscending` 按照默认升序处理，最后返回 `result`。

## partition

> 创建一个拆分为两部分的数组。 第一部分是 predicate 检查为真值的，第二部分是 predicate 检查为假值的。 predicate 会传入3个参数：(value, index|key, collection)。

```js

```

```js
/**
 * Creates an array of elements split into two groups, the first of which
 * contains elements `predicate` returns truthy for, the second of which
 * contains elements `predicate` returns falsey for. The predicate is
 * invoked with one argument: (value).
 *
 * @since 3.0.0
 * @category Collection
 * @param {Array|Object} collection The collection to iterate over.
 * @param {Function} predicate The function invoked per iteration.
 * @returns {Array} Returns the array of grouped elements.
 * @see groupBy, keyBy
 * @example
 *
 * const users = [
 *   { 'user': 'barney',  'age': 36, 'active': false },
 *   { 'user': 'fred',    'age': 40, 'active': true },
 *   { 'user': 'pebbles', 'age': 1,  'active': false }
 * ]
 *
 * partition(users, ({ active }) => active)
 * // => objects for [['fred'], ['barney', 'pebbles']]
 */
function partition(collection, predicate) {
  return reduce(collection, (result, value, key) => (
    result[predicate(value) ? 0 : 1].push(value), result
  ), [[], []])
}

```

`partition` 函数接收 2 个参数，`collection` 迭代集合、`predicate` 迭代函数。

`partition` 函数返回一个 `reduce` 方法，传入 `collection` 迭代集合、回调函数、`[[], []]` 初始值，
在回调函数中如果调用迭代器函数 `predicate(value)` 返回为真往初始值第 0 个插入 `value`，否则就往第 1 个掺入，最后将处理后的数组返回。

## reduce

> 通过 iteratee 遍历集合中的每个元素。 每次返回的值会作为下一次 iteratee 使用。 如果没有提供 accumulator，则集合中的第一个元素作为 accumulator。 iteratee 会传入4个参数：(accumulator, value, index|key, collection)。 

```js
_.reduce(collection, [iteratee=_.identity], [accumulator])
```

```js
/**
 * Reduces `collection` to a value which is the accumulated result of running
 * each element in `collection` thru `iteratee`, where each successive
 * invocation is supplied the return value of the previous. If `accumulator`
 * is not given, the first element of `collection` is used as the initial
 * value. The iteratee is invoked with four arguments:
 * (accumulator, value, index|key, collection).
 *
 * Many lodash methods are guarded to work as iteratees for methods like
 * `reduce`, `reduceRight`, and `transform`.
 *
 * The guarded methods are:
 * `assign`, `defaults`, `defaultsDeep`, `includes`, `merge`, `orderBy`,
 * and `sortBy`
 *
 * @since 0.1.0
 * @category Collection
 * @param {Array|Object} collection The collection to iterate over.
 * @param {Function} iteratee The function invoked per iteration.
 * @param {*} [accumulator] The initial value.
 * @returns {*} Returns the accumulated value.
 * @see reduceRight, transform
 * @example
 *
 * reduce([1, 2], (sum, n) => sum + n, 0)
 * // => 3
 *
 * reduce({ 'a': 1, 'b': 2, 'c': 1 }, (result, value, key) => {
 *   (result[value] || (result[value] = [])).push(key)
 *   return result
 * }, {})
 * // => { '1': ['a', 'c'], '2': ['b'] } (iteration order is not guaranteed)
 */
function reduce(collection, iteratee, accumulator) {
  const func = Array.isArray(collection) ? arrayReduce : baseReduce
  const initAccum = arguments.length < 3
  return func(collection, iteratee, accumulator, initAccum, baseEach)
}
```

`reduce` 函数接收 3 个参数，`collection` 集合、 `iteratee` 迭代器函数、`accumulator` 初始值。

判断 `collection` 是否是数组，将不同的迭代函数赋值给 `func` 变量， ，调用 `func` 函数并且将 `reduce` 函数接收的参数传入，并且加入了 2 个参数，`initAccum` 表示 `arguments.length < 3`、`baseEach` 循环方法，最后会返回 `func` 函数调用后返回的值。


## arrayReduce

```js
/**
 * A specialized version of `reduce` for arrays.
 *
 * @private
 * @param {Array} [array] The array to iterate over.
 * @param {Function} iteratee The function invoked per iteration.
 * @param {*} [accumulator] The initial value.
 * @param {boolean} [initAccum] Specify using the first element of `array` as
 *  the initial value.
 * @returns {*} Returns the accumulated value.
 */
function arrayReduce(array, iteratee, accumulator, initAccum) {
  let index = -1
  const length = array == null ? 0 : array.length

  if (initAccum && length) {
    accumulator = array[++index]
  }
  while (++index < length) {
    accumulator = iteratee(accumulator, array[index], index, array)
  }
  return accumulator
}
```

接下来看 `arrayReduce` 函数，如果 `reduce` 第一个参数 `collection` 是数组，就会调用 `arrayReduce`，`arrayReduce` 接收 4 个参数，`array` 数组、`iteratee` 迭代器函数、`accumulator` 初始值。

申明初始变量 `index` 、`length`，这里会判断 `initAccum` 变量，`reduce` 函数调用是是 `false`，不会进入判断，这个判断是将数组的第一个插入 `accumulator` 数组，
然后进入 `while` 循环，`index` 累加，调用 `iteratee` 迭代器函数，将参数传入，最后返回 `accumulator`。

## reduceRight

> 这个方法类似 _.reduce ，除了它是从右到左遍历的。

```js
_.reduceRight(collection, [iteratee=_.identity], [accumulator])
```

```js
/**
 * This method is like `reduce` except that it iterates over elements of
 * `collection` from right to left.
 *
 * @since 0.1.0
 * @category Collection
 * @param {Array|Object} collection The collection to iterate over.
 * @param {Function} iteratee The function invoked per iteration.
 * @param {*} [accumulator] The initial value.
 * @returns {*} Returns the accumulated value.
 * @see reduce
 * @example
 *
 * const array = [[0, 1], [2, 3], [4, 5]]
 *
 * reduceRight(array, (flattened, other) => flattened.concat(other), [])
 * // => [4, 5, 2, 3, 0, 1]
 */
function reduceRight(collection, iteratee, accumulator) {
  const func = Array.isArray(collection) ? arrayReduceRight : baseReduce
  const initAccum = arguments.length < 3
  return func(collection, iteratee, accumulator, initAccum, baseEachRight)
}
```

`reduceRight` 函数与 `reduce` 方法相似，在循环的时候是调用 `arrayReduceRight`，会向右开始循环处理。

## reject

> 反向版 _.filter，这个方法返回 predicate 检查为非真值的元素。

```js
_.reject(collection, [predicate=_.identity])
```

```js
/**
 * The opposite of `filter` this method returns the elements of `collection`
 * that `predicate` does **not** return truthy for.
 *
 * @since 0.1.0
 * @category Collection
 * @param {Array|Object} collection The collection to iterate over.
 * @param {Function} predicate The function invoked per iteration.
 * @returns {Array} Returns the new filtered array.
 * @see pull, pullAll, pullAllBy, pullAllWith, pullAt, remove, filter
 * @example
 *
 * const users = [
 *   { 'user': 'barney', 'active': true },
 *   { 'user': 'fred',   'active': false }
 * ]
 *
 * reject(users, ({ active }) => active)
 * // => objects for ['fred']
 */
function reject(collection, predicate) {
  const func = Array.isArray(collection) ? filter : filterObject
  return func(collection, negate(predicate))
}
```

`reject` 函数接收 2 个数组，`array` 数组，`predicate` 断言函数。

首先判断 `collection` 是否是数组保存不同的循环方法，最后调用 `func` ，并且将 `collection` 和 `negate` 否定函数处理后的 `predicate` 断言函数传入，会产生于 `filter` 相反的效果。

## negate

> 否定函数。

```js
/**
 * Creates a function that negates the result of the predicate `func`. The
 * `func` predicate is invoked with the `this` binding and arguments of the
 * created function.
 *
 * @since 3.0.0
 * @category Function
 * @param {Function} predicate The predicate to negate.
 * @returns {Function} Returns the new negated function.
 * @example
 *
 * function isEven(n) {
 *   return n % 2 == 0
 * }
 *
 * filter([1, 2, 3, 4, 5, 6], negate(isEven))
 * // => [1, 3, 5]
 */
function negate(predicate) {
  if (typeof predicate != 'function') {
    throw new TypeError('Expected a function')
  }
  return function(...args) {
    return !predicate.apply(this, args)
  }
}
```

`negate` 首先会函数类型判断，最后返回一个相反处理结果的函数。

## sample

> 从集合中随机获得元素

```js
_.sample(collection)
```

```js
/**
 * Gets a random element from `array`.
 *
 * @since 2.0.0
 * @category Array
 * @param {Array} array The array to sample.
 * @returns {*} Returns the random element.
 * @example
 *
 * sample([1, 2, 3, 4])
 * // => 2
 */
function sample(array) {
  const length = array == null ? 0 : array.length
  return length ? array[Math.floor(Math.random() * length)] : undefined
}
```

申明 `length` 变量保存 `array` 长度，默认为 0。

如果 `length` 为真，调用 `Math.floor(Math.random() * length)` 获取数组长度的随机数，返回 `array` 随机一个元素，否则返回 `undefined`。

## sampleSizes

> 获得从集合中随机获得 N 个元素 Gets n random elements from collection.

```js
_.sampleSize(collection, [n=0])
```

```js
/**
 * Gets `n` random elements at unique keys from `array` up to the
 * size of `array`.
 *
 * @since 4.0.0
 * @category Array
 * @param {Array} array The array to sample.
 * @param {number} [n=1] The number of elements to sample.
 * @returns {Array} Returns the random elements.
 * @example
 *
 * sampleSize([1, 2, 3], 2)
 * // => [3, 1]
 *
 * sampleSize([1, 2, 3], 4)
 * // => [2, 3, 1]
 */
function sampleSize(array, n) {
  n = n == null ? 1 : n
  const length = array == null ? 0 : array.length
  if (!length || n < 1) {
    return []
  }
  n = n > length ? length : n
  let index = -1
  const lastIndex = length - 1
  const result = copyArray(array)
  while (++index < n) {
    const rand = index + Math.floor(Math.random() * (lastIndex - index + 1))
    const value = result[rand]
    result[rand] = result[index]
    result[index] = value
  }
  return slice(result, 0, n)
}
```

`sampleSize` 函数接收 2 个参数，`array` 数组、`n` 个数。

申明初始变量，`n` 默认为 1，申明 `length` 保存数组长度，默认为 0，如果没有 `length` 或者 `n < 1`，返回空数组。

`n` 大于 `length` 将 `length` 辅助给 `n`，保证不超出数组长度。

调用 `copyArray` 保存一个 `array` 的浅拷贝，随后进入 `while` 循环，`index` 累加，采用 `Math.random` 取一个随机下标 `rand`，下标起始位置会随着 `index` 增加而增加，并将得到的与当前数组的 `index` 做交换，循环完毕后会将随机得到的 `value` 交换到数组的前面部分，最后调用 `slice` 截取前面的数组，实现的十分巧妙。

## copyArray

> 数组浅拷贝。

```js
/**
 * Copies the values of `source` to `array`.
 *
 * @private
 * @param {Array} source The array to copy values from.
 * @param {Array} [array=[]] The array to copy values to.
 * @returns {Array} Returns `array`.
 */
function copyArray(source, array) {
  let index = -1
  const length = source.length

  array || (array = new Array(length))
  while (++index < length) {
    array[index] = source[index]
  }
  return array
}
```

`while` 循环数组，简单的浅拷贝实现。

## shuffle

> 创建一个被打乱元素的集合。 使用了 Fisher-Yates shuffle 版本。

```js
_.shuffle(collection)
```

```js
/**
 * Creates an array of shuffled values, using a version of the
 * [Fisher-Yates shuffle](https://en.wikipedia.org/wiki/Fisher-Yates_shuffle).
 *
 * @since 0.1.0
 * @category Array
 * @param {Array} array The array to shuffle.
 * @returns {Array} Returns the new shuffled array.
 * @example
 *
 * shuffle([1, 2, 3, 4])
 * // => [4, 1, 3, 2]
 */
function shuffle(array) {
  const length = array == null ? 0 : array.length
  if (!length) {
    return []
  }
  let index = -1
  const lastIndex = length - 1
  const result = copyArray(array)
  while (++index < length) {
    const rand = index + Math.floor(Math.random() * (lastIndex - index + 1))
    const value = result[rand]
    result[rand] = result[index]
    result[index] = value
  }
  return result
}
```

`shuffle` 函数与之前的 `sampleSize` 思路一致，只是 `while` 循环的数组的长度，接收一个需要乱序的数组。

申明初始变量，调用 `copyArray` 保存一个 `array` 的浅拷贝，随后进入 `while` 循环，`index` 累加，采用 `Math.random` 取一个随机下标 `rand`，下标起始位置会随着 `index` 增加而增加，并将得到的与当前数组的 `index` 做交换，循环完毕后会将随机得到的 `value` 交换到数组 `index`，最后将 `result` 返回。

## size

> 返回集合的长度或对象中可枚举属性的个数。

```js
_.size(collection)
```

```js
/** `Object#toString` result references. */
const mapTag = '[object Map]'
const setTag = '[object Set]'

/**
 * Gets the size of `collection` by returning its length for array-like
 * values or the number of own enumerable string keyed properties for objects.
 *
 * @since 0.1.0
 * @category Collection
 * @param {Array|Object|string} collection The collection to inspect.
 * @returns {number} Returns the collection size.
 * @example
 *
 * size([1, 2, 3])
 * // => 3
 *
 * size({ 'a': 1, 'b': 2 })
 * // => 2
 *
 * size('pebbles')
 * // => 7
 */
function size(collection) {
  if (collection == null) {
    return 0
  }
  if (isArrayLike(collection)) {
    return isString(collection) ? stringSize(collection) : collection.length
  }
  const tag = getTag(collection)
  if (tag == mapTag || tag == setTag) {
    return collection.size
  }
  return Object.keys(collection).length
}
```

`collection` 可以是数组，对象，字符串。

如果是 `null` 返回 0，调用 `isArrayLike` 判断是否是类数组，如果是有 2 中可能，是字符串就调用 `stringSize` 返回字符串长度，不是字符串就返回 `collection` 的 `length` 。

使用 `getTag` 函数得到 `[object Type]` 形式的类型字符串，如果是 `Map`、`Set` 类型返回 `collection` 的 `size`。

经过上面的判断，应该只剩下 `Object` 类型了，调用 `Object.keys()` 将 `collection` 转成数组，返回数组长度。

## some

> 通过 predicate 检查集合中的元素是否存在任意真值的元素，只要 predicate 返回一次真值，遍历就停止，并返回 true。 predicate 会传入3个参数：(value, index|key, collection)。

```js
_.some(collection, [predicate=_.identity])
```

```js
/**
 * Checks if `predicate` returns truthy for **any** element of `array`.
 * Iteration is stopped once `predicate` returns truthy. The predicate is
 * invoked with three arguments: (value, index, array).
 *
 * @since 5.0.0
 * @category Array
 * @param {Array} array The array to iterate over.
 * @param {Function} predicate The function invoked per iteration.
 * @returns {boolean} Returns `true` if any element passes the predicate check,
 *  else `false`.
 * @example
 *
 * some([null, 0, 'yes', false], Boolean)
 * // => true
 */
function some(array, predicate) {
  let index = -1
  const length = array == null ? 0 : array.length

  while (++index < length) {
    if (predicate(array[index], index, array)) {
      return true
    }
  }
  return false
}
```

`some` 函数接收 2 个参数， `array` 数组、`predicate` 断言函数。

申明 `index` 为 -1，申明 `length` 变量保存数组长度。

然后进入 `while` 循环， `index` 累加，在循环中调用 `predicate` 断言函数，如果返回为真就 `return true`，中断循环，如果循环未中断，返回 `false`。

## sortBy

> 创建一个元素数组。 以 iteratee 处理的结果升序排序。 这个方法执行稳定排序，也就是说相同元素会保持原始排序。 iteratees 会传入1个参数：(value)。


```js
_.sortBy(collection, [iteratees=[_.identity]])
```

```js
/**
  * Creates an array of elements, sorted in ascending order by the results of
  * running each element in a collection thru each iteratee. This method
  * performs a stable sort, that is, it preserves the original sort order of
  * equal elements. The iteratees are invoked with one argument: (value).
  *
  * @static
  * @memberOf _
  * @since 0.1.0
  * @category Collection
  * @param {Array|Object} collection The collection to iterate over.
  * @param {...(Function|Function[])} [iteratees=[_.identity]]
  *  The iteratees to sort by.
  * @returns {Array} Returns the new sorted array.
  * @example
  *
  * var users = [
  *   { 'user': 'fred',   'age': 48 },
  *   { 'user': 'barney', 'age': 36 },
  *   { 'user': 'fred',   'age': 40 },
  *   { 'user': 'barney', 'age': 34 }
  * ];
  *
  * _.sortBy(users, [function(o) { return o.user; }]);
  * // => objects for [['barney', 36], ['barney', 34], ['fred', 48], ['fred', 40]]
  *
  * _.sortBy(users, ['user', 'age']);
  * // => objects for [['barney', 34], ['barney', 36], ['fred', 40], ['fred', 48]]
  */
var sortBy = baseRest(function (collection, iteratees) {
  if (collection == null) {
    return [];
  }
  var length = iteratees.length;
  if (length > 1 && isIterateeCall(collection, iteratees[0], iteratees[1])) {
    iteratees = [];
  } else if (length > 2 && isIterateeCall(iteratees[0], iteratees[1], iteratees[2])) {
    iteratees = [iteratees[0]];
  }
  return baseOrderBy(collection, baseFlatten(iteratees, 1), []);
});
```

`orderBy` 是 `sortBy` 函数的复杂实现，`sortBy` 接收 2 个参数，`collection` 集合、 `iteratees` 迭代器函数。

`iteratees` 可以接收数组形式的参数，如果长度大于 1，并且调用 `isIterateeCall` 判断是否来自迭代器调用,
最后调用 `baseOrderBy` 方法，将 `collection` 和调用 `baseFlatten` 函数扁平化的 `iteratees` 迭代器函数数组传入，相比于 `orderBy` 第三个参数传了一个空数组，不会进行定制排序。




## isIterateeCall

> 检查给定参数是否来自迭代器调用。

```js
/**
  * Checks if the given arguments are from an iteratee call.
  *
  * @private
  * @param {*} value The potential iteratee value argument.
  * @param {*} index The potential iteratee index or key argument.
  * @param {*} object The potential iteratee object argument.
  * @returns {boolean} Returns `true` if the arguments are from an iteratee call,
  *  else `false`.
  */
function isIterateeCall(value, index, object) {
  if (!isObject(object)) {
    return false;
  }
  var type = typeof index;
  if (type == 'number'
    ? (isArrayLike(object) && isIndex(index, object.length))
    : (type == 'string' && index in object)
  ) {
    return eq(object[index], value);
  }
  return false;
}
```