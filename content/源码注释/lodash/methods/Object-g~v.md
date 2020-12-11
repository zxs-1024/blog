## get

> 根据对象路径获取值。 如果解析 value 是 undefined 会以 defaultValue 取代。

```js
_.get(object, path, [defaultValue])
```

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

`get` 函数接收 3 个参数，`object` 检索对象、`path` 路径、`defaultValue` 默认值。

申明 `result` 变量，如果 `object` 等于 `null` 将 `undefined` 赋值给 `result` ，否则就将 `baseGet` 函数调用返回赋值给 `result`。

函数最后返回一个三元表达式，这里会根据 `result` 是否等于 `undefined` ，返回 `defaultValue` 默认值或者 `result`。

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

## has

> 检查 path 是否是对象的直接属性。

```js
_.has(object, path)
```

```js
/** Used to check objects for own properties. */
const hasOwnProperty = Object.prototype.hasOwnProperty

/**
 * Checks if `key` is a direct property of `object`.
 *
 * @since 0.1.0
 * @category Object
 * @param {Object} object The object to query.
 * @param {string} key The key to check.
 * @returns {boolean} Returns `true` if `key` exists, else `false`.
 * @see hasIn, hasPath, hasPathIn
 * @example
 *
 * const object = { 'a': { 'b': 2 } }
 * const other = create({ 'a': create({ 'b': 2 }) })
 *
 * has(object, 'a')
 * // => true
 *
 * has(other, 'a')
 * // => false
 */
function has(object, key) {
  return object != null && hasOwnProperty.call(object, key)
}
```

`has` 函数接收 2 个参数，`object` 检索参数、`key` 检索路径。

如果 `object` 不等于 `null` 并且调用 `Object.prototype.hasOwnProperty` 方法获取 `object` 有除了原型属性 `key`，返回 `true`，否则返回 `false`。

## _.hasIn(object, path)

> 检查 path 是否是对象的直接 或者 继承属性。

```js
_.hasIn(object, path)
```

```js
/**
 * Checks if `path` is a direct or inherited property of `object`.
 *
 * @since 4.0.0
 * @category Object
 * @param {Object} object The object to query.
 * @param {string} key The key to check.
 * @returns {boolean} Returns `true` if `key` exists, else `false`.
 * @see has, hasPath, hasPathIn
 * @example
 *
 * const object = create({ 'a': create({ 'b': 2 }) })
 *
 * hasIn(object, 'a')
 * // => true
 *
 * hasIn(object, 'b')
 * // => false
 */
function hasIn(object, key) {
  return object != null && key in Object(object)
}
```

`hasIn` 函数与 `has` 相似，这里将 `Object.prototype.hasOwnProperty` 替换成 `key...in` 函数，` key...in` 方法会循环 `object` 对象的自身属性和继承属性。

## invert

> 创建一个键值倒置的对象。 如果 object 有重复的值，后面的值会覆盖前面的值。 如果 multiVal 为 true，重复的值则组成数组。

```js
_.invert(object)
```

```js
const toString = Object.prototype.toString

/**
 * Creates an object composed of the inverted keys and values of `object`.
 * If `object` contains duplicate values, subsequent values overwrite
 * property assignments of previous values.
 *
 * @since 0.7.0
 * @category Object
 * @param {Object} object The object to invert.
 * @returns {Object} Returns the new inverted object.
 * @example
 *
 * const object = { 'a': 1, 'b': 2, 'c': 1 }
 *
 * invert(object)
 * // => { '1': 'c', '2': 'b' }
 */
function invert(object) {
  const result = {}
  Object.keys(object).forEach((key) => {
    let value = object[key]
    if (value != null && typeof value.toString != 'function') {
      value = toString.call(value)
    }
    result[value] = key
  })
  return result
}
```

`invert` 接收一个原始对象 `object`，申明 `result` 空对象储存结果。

调用 `Object.keys` 获取对象 `object` 的 `key` 数组，然后进行遍历，这里会调用 `toString` 将 `value` 处理成 `String` 作为 `key`，然后将原来的 `key` 作为 `value` 赋值给 `result`，循环接触后将 `result` 返回。

## invertBy

> 这个方法类似 _.invert。 除了它接受 iteratee 调用每一个元素，可在返回值中定制key。 iteratee 会传入1个参数：(value)。

```js
_.invertBy(object, [iteratee=_.identity])
```

```js
const hasOwnProperty = Object.prototype.hasOwnProperty

/**
 * This method is like `invert` except that the inverted object is generated
 * from the results of running each element of `object` thru `iteratee`. The
 * corresponding inverted value of each inverted key is an array of keys
 * responsible for generating the inverted value. The iteratee is invoked
 * with one argument: (value).
 *
 * @since 4.1.0
 * @category Object
 * @param {Object} object The object to invert.
 * @param {Function} iteratee The iteratee invoked per element.
 * @returns {Object} Returns the new inverted object.
 * @example
 *
 * const object = { 'a': 1, 'b': 2, 'c': 1 }
 *
 * invertBy(object, value => `group${value}`)
 * // => { 'group1': ['a', 'c'], 'group2': ['b'] }
 */
function invertBy(object, iteratee) {
  const result = {}
  Object.keys(object).forEach((key) => {
    const value = iteratee(object[key])
    if (hasOwnProperty.call(result, value)) {
      result[value].push(key)
    } else {
      result[value] = [key]
    }
  })
  return result
}
```

`invertBy` 函数接收 2 个参数，`object` 倒置对象、`iteratee` 迭代函数。

申明空对象 `result` 储存结果，调用 `Object.keys` 获取对象 `object` 的 `key` 数组，然后 `forEach` 进行遍历，在回调函数中，调用 `iteratee` 函数生成 `value`，如果 `result` 中有这个 `key` 将 `key` 插入到 `result[value]`，否则包装成数组赋值给 `result[value]`，循环结束后将 `result` 返回。

## invoke

> 调用对象路径的方法

```js
_.invoke(object, path, [args])
```

```js
/**
 * Invokes the method at `path` of `object`.
 *
 * @since 4.0.0
 * @category Object
 * @param {Object} object The object to query.
 * @param {Array|string} path The path of the method to invoke.
 * @param {Array} [args] The arguments to invoke the method with.
 * @returns {*} Returns the result of the invoked method.
 * @example
 *
 * const object = { 'a': [{ 'b': { 'c': [1, 2, 3, 4] } }] }
 *
 * invoke(object, 'a[0].b.c.slice', [1, 3])
 * // => [2, 3]
 */
function invoke(object, path, args) {
  path = castPath(path, object)
  object = parent(object, path)
  const func = object == null ? object : object[toKey(last(path))]
  return func == null ? undefined : func.apply(object, args)
}
```

`invoke` 函数接收 3 个参数，`object` 检索对象、`path` 路径、`args` 调用参数。

`invoke` 函数首先会调用 `castPath` 获取对象路径表数组 `path`， 调用 `parent` 函数获取 `object` 的 `path` 父值，这里会尝试获取 `path` 的最后一个 `key`，得到 `func` 处理函数，随后调用 `func`，并传入 `args` 参数后返回。

## keys

> 创建 object 自身可枚举属性名为一个数组。 

```js
_.keys(object)
```

```js
/**
 * Creates an array of the own enumerable property names of `object`.
 *
 * **Note:** Non-object values are coerced to objects. See the
 * [ES spec](http://ecma-international.org/ecma-262/7.0/#sec-object.keys)
 * for more details.
 *
 * @since 0.1.0
 * @category Object
 * @param {Object} object The object to query.
 * @returns {Array} Returns the array of property names.
 * @see values, valuesIn
 * @example
 *
 * function Foo() {
 *   this.a = 1
 *   this.b = 2
 * }
 *
 * Foo.prototype.c = 3
 *
 * keys(new Foo)
 * // => ['a', 'b'] (iteration order is not guaranteed)
 *
 * keys('hi')
 * // => ['0', '1']
 */
function keys(object) {
  return isArrayLike(object)
    ? arrayLikeKeys(object)
    : Object.keys(Object(object))
}
```

`keys` 函数返回了一个三元表达式，`isArrayLike` 判断如果是类数组，就调用 `arrayLikeKeys` 函数返回处理后的数组，否则就是一个 `Object`，调用 `Object.keys` 方法返回对象 `key` 数组。

## keysIn

> 创建 object 自身 或 继承的可枚举属性名为一个数组。 


```js
_.keysIn(object)
```

```js
/**
 * Creates an array of the own and inherited enumerable property names of `object`.
 *
 * **Note:** Non-object values are coerced to objects.
 *
 * @static
 * @memberOf _
 * @since 3.0.0
 * @category Object
 * @param {Object} object The object to query.
 * @returns {Array} Returns the array of property names.
 * @example
 *
 * function Foo() {
 *   this.a = 1;
 *   this.b = 2;
 * }
 *
 * Foo.prototype.c = 3;
 *
 * _.keysIn(new Foo);
 * // => ['a', 'b', 'c'] (iteration order is not guaranteed)
 */
function keysIn(object) {
  return isArrayLike(object) ? arrayLikeKeys(object, true) : baseKeysIn(object);
}
```

`keysIn` 函数内会调用 `isArrayLike` 判断 `object` 是否是类数组，是类数组就调用 `arrayLikeKeys` 函数返回处理后的数组，否则就调用 `baseKeysIn` 函数将其调用结果返回。

## baseKeysIn

```js
/**
 * The base implementation of `_.keysIn` which doesn't treat sparse arrays as dense.
 *
 * @private
 * @param {Object} object The object to query.
 * @returns {Array} Returns the array of property names.
 */
function baseKeysIn(object) {
  if (!isObject(object)) {
    return nativeKeysIn(object);
  }
  var isProto = isPrototype(object),
    result = [];

  for (var key in object) {
    if (!(key == 'constructor' && (isProto || !hasOwnProperty.call(object, key)))) {
      result.push(key);
    }
  }
  return result;
}
```

`baseKeysIn` 函数会调用 `isObject` 方法判断 `object` 类型，如果不是对象，返回调用 `nativeKeysIn` 函数处理后的数组, `nativeKeysIn` 函数时简单的 `Object.keys()` 实现：

```js
function nativeKeysIn(object) {
  var result = [];
  if (object != null) {
    for (var key in Object(object)) {
      result.push(key);
    }
  }
  return result;
}
```

申明 `result` 数组，`for...in` 遍历 `Object`，将 `key` 插入 `result`，最后将 `result` 返回。

接着 `baseKeysIn` 函数进入 `for...in` 循环，这里有一个比较复杂得判断，

`key` 等于 `constructor` 并且 `isProto` 也就是 `isPrototype(object)` 是原型对象，或者 `!hasOwnProperty.call(object, key)` `object` 的属性上没有这个 `key`，然后在整体取非，也就是说不是 `constructor` 并且不是原型对象或者不是 `constructor` 并且 `object` 除原型外有这个属性，就将 `key` 插入 `result`，循环接触后将 `result` 返回。

## mapKeys

> 反向版 _.mapValues。 这个方法创建一个对象，对象的值与源对象相同，但 key 是通过 iteratee 产生的。

```js
_.mapKeys(object, [iteratee=_.identity])
```

```js
/**
 * The opposite of `mapValue` this method creates an object with the
 * same values as `object` and keys generated by running each own enumerable
 * string keyed property of `object` thru `iteratee`. The iteratee is invoked
 * with three arguments: (value, key, object).
 *
 * @since 3.8.0
 * @category Object
 * @param {Object} object The object to iterate over.
 * @param {Function} iteratee The function invoked per iteration.
 * @returns {Object} Returns the new mapped object.
 * @see mapValue
 * @example
 *
 * mapKey({ 'a': 1, 'b': 2 }, function(value, key) {
 *   return key + value
 * })
 * // => { 'a1': 1, 'b2': 2 }
 */
function mapKey(object, iteratee) {
  object = Object(object)
  const result = {}

  Object.keys(object).forEach((key) => {
    const value = object[key]
    result[iteratee(value, key, object)] = value
  })
  return result
}
```

`mapKey` 函数接收 2 个参数，`object` 迭代对象，`iteratee` 迭代函数。

首先调用 `Object` 方法转化 `object`，申明 `result` 空对象，调用 `Object.keys` 获取 `object` 的 `key` 数组，采用 `forEach` 循环，在循环中将 `key` 为 `iteratee` 迭代函数处理后的 `key`，`value` 还是原来的 `value`,最后将 `result` 返回。

## mapValues

> 创建一个对象，对象的key相同，值是通过 iteratee 产生的。 iteratee 会传入3个参数： (value, key, object)

```js
_.mapValues(object, [iteratee=_.identity])
```

```js
/**
 * Creates an object with the same keys as `object` and values generated
 * by running each own enumerable string keyed property of `object` thru
 * `iteratee`. The iteratee is invoked with three arguments:
 * (value, key, object).
 *
 * @since 2.4.0
 * @category Object
 * @param {Object} object The object to iterate over.
 * @param {Function} iteratee The function invoked per iteration.
 * @returns {Object} Returns the new mapped object.
 * @see mapKeys
 * @example
 *
 * const users = {
 *   'fred':    { 'user': 'fred',    'age': 40 },
 *   'pebbles': { 'user': 'pebbles', 'age': 1 }
 * }
 *
 * mapValue(users, ({ age }) => age)
 * // => { 'fred': 40, 'pebbles': 1 } (iteration order is not guaranteed)
 */
function mapValue(object, iteratee) {
  object = Object(object)
  const result = {}

  Object.keys(object).forEach((key) => {
    result[key] = iteratee(object[key], key, object)
  })
  return result
}
```

`mapValue` 函数接收 2 个参数，`object` 迭代对象、`iteratee` 迭代函数。

调用 `Object` 转化 `object`，申明空对象 `result`，调用 `Object.keys` 获取 `object` 的 `key` 数组，调用 `forEach` 遍历，然后调用 `iteratee` 迭代函数处理 `value` 赋值给 `result[key]`，最后将 `result` 返回。

## merge

> 递归合并来源对象的自身和继承的可枚举属性到目标对象。 跳过来源对象解析为 undefined 的属性。 数组和普通对象会递归合并，其他对象和值会被直接分配。 来源对象从左到右分配，后续的来源对象属性会覆盖之前分配的属性。

```js
_.merge(object, [sources])
```

```js
/**
 * This method is like `assign` except that it recursively merges own and
 * inherited enumerable string keyed properties of source objects into the
 * destination object. Source properties that resolve to `undefined` are
 * skipped if a destination value exists. Array and plain object properties
 * are merged recursively. Other objects and value types are overridden by
 * assignment. Source objects are applied from left to right. Subsequent
 * sources overwrite property assignments of previous sources.
 *
 * **Note:** This method mutates `object`.
 *
 * @since 0.5.0
 * @category Object
 * @param {Object} object The destination object.
 * @param {...Object} [sources] The source objects.
 * @returns {Object} Returns `object`.
 * @example
 *
 * const object = {
 *   'a': [{ 'b': 2 }, { 'd': 4 }]
 * }
 *
 * const other = {
 *   'a': [{ 'c': 3 }, { 'e': 5 }]
 * }
 *
 * merge(object, other)
 * // => { 'a': [{ 'b': 2, 'c': 3 }, { 'd': 4, 'e': 5 }] }
 */
const merge = createAssigner((object, source, srcIndex) => {
  baseMerge(object, source, srcIndex)
})
```

`createAssigner` 函数时 `createAssigner` 函数的返回函数，并传入了回调函数，回调函数接收 3 个参数，会调用 `baseMerge` 函数处理 `object`，`createAssigner` 函数在 `assign` 函数中说过。

## baseMerge

> baseMerge 函数时 merge 的基本实现。

```js
/**
 * The base implementation of `merge` without support for multiple sources.
 *
 * @private
 * @param {Object} object The destination object.
 * @param {Object} source The source object.
 * @param {number} srcIndex The index of `source`.
 * @param {Function} [customizer] The function to customize merged values.
 * @param {Object} [stack] Tracks traversed source values and their merged
 *  counterparts.
 */
function baseMerge(object, source, srcIndex, customizer, stack) {
  if (object === source) {
    return
  }
  baseFor(source, (srcValue, key) => {
    if (isObject(srcValue)) {
      stack || (stack = new Stack)
      baseMergeDeep(object, source, key, srcIndex, baseMerge, customizer, stack)
    }
    else {
      let newValue = customizer
        ? customizer(object[key], srcValue, `${key}`, object, source, stack)
        : undefined

      if (newValue === undefined) {
        newValue = srcValue
      }
      assignMergeValue(object, key, newValue)
    }
  }, keysIn)
}
```

`baseMerge` 函数接收 5 个参数，`object` 目标对象、`source` 源对象、`srcIndex` 源对象索引、`customizer` 自定义合并函数、`stack` 跟踪栈堆。

首先会判断 `object` 目标对象和 `source` 源对象如果全等，复杂类型是指同一指针，直接 `return`。

然后调用 `baseFor` 函数进行迭代，传入 `source` 源对象、回调函数、`keysIn` 返回对象的 `key` 数组函数。

我们来看看 `baseFor` 函数：

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
function baseFor(object, iteratee, keysFunc) {
  const iterable = Object(object)
  const props = keysFunc(object)
  let { length } = props
  let index = -1

  while (length--) {
    const key = props[++index]
    if (iteratee(iterable[key], key, iterable) === false) {
      break
    }
  }
  return object
}
```

`baseFor` 函数就是会获取源对象的 `key` 数组，进行 `while` 循环，不断调用 `iteratee` 迭代函数，直到 `iteratee` 返回 `false`，中断循环。

```js
(srcValue, key) => {
  if (isObject(srcValue)) {
    stack || (stack = new Stack)
    baseMergeDeep(object, source, key, srcIndex, baseMerge, customizer, stack)
  }
  else {
    let newValue = customizer
      ? customizer(object[key], srcValue, `${key}`, object, source, stack)
      : undefined

    if (newValue === undefined) {
      newValue = srcValue
    }
    assignMergeValue(object, key, newValue)
  }
}
```

而在这个迭代函数中，会判断 `srcValue` 是否是对象，如果是的话调用 `baseMergeDeep` 进行属性拷贝，并传入
`baseMerge` 函数自身实现递归调用，`stack` 用来负责跟踪栈堆。

否则进入 `else`，会判断是否有 `customizer` 函数，有的话调用 `customizer` 产生新的 `value`，否则赋值为 `undefined`，然后会对 `newValue` 进行判断，如果为 `undefined`，将原值赋值给 `newValue`。

最后调用 `assignMergeValue` 进行属性拷贝。

## baseMergeDeep

```js
/**
 * A specialized version of `baseMerge` for arrays and objects which performs
 * deep merges and tracks traversed objects enabling objects with circular
 * references to be merged.
 *
 * @private
 * @param {Object} object The destination object.
 * @param {Object} source The source object.
 * @param {string} key The key of the value to merge.
 * @param {number} srcIndex The index of `source`.
 * @param {Function} mergeFunc The function to merge values.
 * @param {Function} [customizer] The function to customize assigned values.
 * @param {Object} [stack] Tracks traversed source values and their merged
 *  counterparts.
 */
function baseMergeDeep(object, source, key, srcIndex, mergeFunc, customizer, stack) {
  const objValue = object[key]
  const srcValue = source[key]
  const stacked = stack.get(srcValue)

  if (stacked) {
    assignMergeValue(object, key, stacked)
    return
  }
  let newValue = customizer
    ? customizer(objValue, srcValue, `${key}`, object, source, stack)
    : undefined

  let isCommon = newValue === undefined

  if (isCommon) {
    const isArr = Array.isArray(srcValue)
    const isBuff = !isArr && isBuffer(srcValue)
    const isTyped = !isArr && !isBuff && isTypedArray(srcValue)

    newValue = srcValue
    if (isArr || isBuff || isTyped) {
      if (Array.isArray(objValue)) {
        newValue = objValue
      }
      else if (isArrayLikeObject(objValue)) {
        newValue = copyArray(objValue)
      }
      else if (isBuff) {
        isCommon = false
        newValue = cloneBuffer(srcValue, true)
      }
      else if (isTyped) {
        isCommon = false
        newValue = cloneTypedArray(srcValue, true)
      }
      else {
        newValue = []
      }
    }
    else if (isPlainObject(srcValue) || isArguments(srcValue)) {
      newValue = objValue
      if (isArguments(objValue)) {
        newValue = toPlainObject(objValue)
      }
      else if ((srcIndex && typeof objValue == 'function') || !isObject(objValue)) {
        newValue = initCloneObject(srcValue)
      }
    }
    else {
      isCommon = false
    }
  }
  if (isCommon) {
    // Recursively merge objects and arrays (susceptible to call stack limits).
    stack.set(srcValue, newValue)
    mergeFunc(newValue, srcValue, srcIndex, customizer, stack)
    stack['delete'](srcValue)
  }
  assignMergeValue(object, key, newValue)
}
```

`baseMergeDeep` 函数是深拷贝的基本实现，在 `baseMerge` 函数中是这样调用的：

```js
baseMergeDeep(object, source, key, srcIndex, baseMerge, customizer, stack)
```

首先会申明 `objValue`、`srcValue` 取出对应 `key` 的 `value`，`stack.get(srcValue)` 函数尝试获取 `stack` 缓存是否有这个 `value`，接着判断是否有这个缓存，如果有的话直接调用 `assignMergeValue` 进行值的复制。

`customizer` 迭代函数：

```js
let newValue = customizer
  ? customizer(objValue, srcValue, `${key}`, object, source, stack)
  : undefined

let isCommon = newValue === undefined
```

这里会申明一个 `newValue` ，来处理是否有 `customizer` 函数，如果有就调用并且将值赋值，否则就是 `undefined`，`isCommon` 就是没有传入 `customizer` 函数的情况。

在 `if (isCommon) {}` 判断中就是几个 `if` 判断，是数组、`Buffer`、类数组的情况进行 `newValue` 的赋值，如果是对象、`arguments` 也调用对应的方法进行 `newValue` 的复制，否则就将 `isCommon` 置为 `false`，最后一个 `if` 判断，如果 `isCommon` 为真调用 `stack.set` 设置栈堆，递归调用传入的 `mergeFunc` 函数，接着调用 `stack['delete']` 删除栈堆，最后调用 `assignMergeValue` 函数进行属性拷贝。

## assignMergeValues

```js
/**
 * This function is like `assignValue` except that it doesn't assign
 * `undefined` values.
 *
 * @private
 * @param {Object} object The object to modify.
 * @param {string} key The key of the property to assign.
 * @param {*} value The value to assign.
 */
function assignMergeValue(object, key, value) {
  if ((value !== undefined && !eq(object[key], value)) ||
      (value === undefined && !(key in object))) {
    baseAssignValue(object, key, value)
  }
}
```

`assignMergeValue` 函数是 `baseAssignValue` 包装，排除了 `object[key]` 、`value` 值相同或者 `object` 没有 `key` 键值的情况。

## baseAssignValue

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

`baseAssignValue` 函数会判断 `key` 等于 `__proto__` 就调用 `Object.defineProperty` 方法给对象加上属性，否则采用 `object[key]` 直接赋值。

## mergeWith

> 这个方法类似 _.merge。 除了它接受一个 customizer 决定如何合并。 如果 customizer 返回 undefined 将会由合并处理方法代替。

```js
_.mergeWith(object, sources, customizer)
```

```js
/**
 * This method is like `merge` except that it accepts `customizer` which
 * is invoked to produce the merged values of the destination and source
 * properties. If `customizer` returns `undefined`, merging is handled by the
 * method instead. The `customizer` is invoked with six arguments:
 * (objValue, srcValue, key, object, source, stack).
 *
 * **Note:** This method mutates `object`.
 *
 * @since 4.0.0
 * @category Object
 * @param {Object} object The destination object.
 * @param {...Object} sources The source objects.
 * @param {Function} customizer The function to customize assigned values.
 * @returns {Object} Returns `object`.
 * @example
 *
 * function customizer(objValue, srcValue) {
 *   if (Array.isArray(objValue)) {
 *     return objValue.concat(srcValue)
 *   }
 * }
 *
 * const object = { 'a': [1], 'b': [2] }
 * const other = { 'a': [3], 'b': [4] }
 *
 * mergeWith(object, other, customizer)
 * // => { 'a': [1, 3], 'b': [2, 4] }
 */
const mergeWith = createAssigner((object, source, srcIndex, customizer) => {
  baseMerge(object, source, srcIndex, customizer)
})
```

`mergeWith` 与 `merge` 方法相似，只是多传了一个 `customizer` 函数。

## omit

> 反向版 _.pick。 这个方法返回忽略属性之外的自身和继承的可枚举属性。

```js
_.omit(object, [props])
```

```js
/**
 * The opposite of `_.pick`; this method creates an object composed of the
 * own and inherited enumerable property paths of `object` that are not omitted.
 *
 * **Note:** This method is considerably slower than `_.pick`.
 *
 * @static
 * @since 0.1.0
 * @memberOf _
 * @category Object
 * @param {Object} object The source object.
 * @param {...(string|string[])} [paths] The property paths to omit.
 * @returns {Object} Returns the new object.
 * @example
 *
 * var object = { 'a': 1, 'b': '2', 'c': 3 };
 *
 * _.omit(object, ['a', 'c']);
 * // => { 'b': '2' }
 */
var omit = flatRest(function (object, paths) {
  var result = {};
  if (object == null) {
    return result;
  }
  var isDeep = false;
  paths = arrayMap(paths, function (path) {
    path = castPath(path, object);
    isDeep || (isDeep = path.length > 1);
    return path;
  });
  copyObject(object, getAllKeysIn(object), result);
  if (isDeep) {
    result = baseClone(result, CLONE_DEEP_FLAG | CLONE_FLAT_FLAG | CLONE_SYMBOLS_FLAG, customOmitClone);
  }
  var length = paths.length;
  while (length--) {
    baseUnset(result, paths[length]);
  }
  return result;
});
```

`omit` 函数是 `flatRest` 函数的调用返回，传入了回调函数，回调函数接收 2 个参数，`object` 遍历对象、`paths` 忽略 `key` 数组。

回调函数内部申明 `result` 空对象，对 `object` 进行非空判断。

然后调用 `arrayMap` 对 `paths` 进行遍历，在回调中会调用 `castPath` 转化成路径数组 `path`，并对 `isDeep` 赋值保存当前深度，接着调用 `copyObject` 函数进行属性拷贝。

如果 `isDeep` 为真，这里调用 `baseClone` 函数又对 `result` 进行了拷贝，实现了深拷贝防止指向同一指针的 `value`，接着会进行 `while` 循环， `length` 累减，调用 `baseUnset` 函数：

```js
/**
 * The base implementation of `_.unset`.
 *
 * @private
 * @param {Object} object The object to modify.
 * @param {Array|string} path The property path to unset.
 * @returns {boolean} Returns `true` if the property is deleted, else `false`.
 */
function baseUnset(object, path) {
  path = castPath(path, object);
  object = parent(object, path);
  return object == null || delete object[toKey(last(path))];
}
```

`baseUnset` 函数会判断如果 `object` 如果有 `path` 路径调用 `delete` 删除这个 `key`，最后将处理好的 `result` 返回。

## omitBy

> 反向版 _.pickBy。 这个方法返回经 predicate 判断不是真值的属性的自身和继承的可枚举属性。

```js
_.omitBy(object, [predicate=_.identity])
```

```js
/**
 * The opposite of `_.pickBy`; this method creates an object composed of
 * the own and inherited enumerable string keyed properties of `object` that
 * `predicate` doesn't return truthy for. The predicate is invoked with two
 * arguments: (value, key).
 *
 * @static
 * @memberOf _
 * @since 4.0.0
 * @category Object
 * @param {Object} object The source object.
 * @param {Function} [predicate=_.identity] The function invoked per property.
 * @returns {Object} Returns the new object.
 * @example
 *
 * var object = { 'a': 1, 'b': '2', 'c': 3 };
 *
 * _.omitBy(object, _.isNumber);
 * // => { 'b': '2' }
 */
function omitBy(object, predicate) {
  return pickBy(object, negate(getIteratee(predicate)));
}
```

`omitBy` 函数接收 `object` 源对象、`predicate` 迭代函数。

函数内部会返回 `pickBy` 函数的调用返回， `pickBy` 传入了 2 个参数 `object` 源对象，`negate(getIteratee(predicate))` 函数的调用返回，而 `negate` 函数的参数是调用 `getIteratee` 函数得到的迭代函数。

## getIteratee

```js
/**
 * Gets the appropriate "iteratee" function. If `_.iteratee` is customized,
 * this function returns the custom method, otherwise it returns `baseIteratee`.
 * If arguments are provided, the chosen function is invoked with them and
 * its result is returned.
 *
 * @private
 * @param {*} [value] The value to convert to an iteratee.
 * @param {number} [arity] The arity of the created iteratee.
 * @returns {Function} Returns the chosen function or its result.
 */
function getIteratee() {
  var result = lodash.iteratee || iteratee;
  result = result === iteratee ? baseIteratee : result;
  return arguments.length ? result(arguments[0], arguments[1]) : result;
}
```

`getIteratee` 函数会判断 `arguments.length` ，如果有就调用 `result` 函数，也就是 `iteratee`，然后传入
`arguments`，否则返回 `result`。

## negate

```js
/**
 * Creates a function that negates the result of the predicate `func`. The
 * `func` predicate is invoked with the `this` binding and arguments of the
 * created function.
 *
 * @static
 * @memberOf _
 * @since 3.0.0
 * @category Function
 * @param {Function} predicate The predicate to negate.
 * @returns {Function} Returns the new negated function.
 * @example
 *
 * function isEven(n) {
 *   return n % 2 == 0;
 * }
 *
 * _.filter([1, 2, 3, 4, 5, 6], _.negate(isEven));
 * // => [1, 3, 5]
 */
function negate(predicate) {
  if (typeof predicate != 'function') {
    throw new TypeError(FUNC_ERROR_TEXT);
  }
  return function () {
    var args = arguments;
    switch (args.length) {
      case 0: return !predicate.call(this);
      case 1: return !predicate.call(this, args[0]);
      case 2: return !predicate.call(this, args[0], args[1]);
      case 3: return !predicate.call(this, args[0], args[1], args[2]);
    }
    return !predicate.apply(this, args);
  };
}
```

`negate` 函数返回了一个 `function`，在这个 `function` 会对 `args.length` 长度进行处理，然后对`predicate` 调用后的值取非返回。

## pick

> 创建一个从 object 中选中的属性的对象。

```js
_.pick(object, [paths])
```

```js
/**
 * Creates an object composed of the picked `object` properties.
 *
 * @since 0.1.0
 * @category Object
 * @param {Object} object The source object.
 * @param {...(string|string[])} [paths] The property paths to pick.
 * @returns {Object} Returns the new object.
 * @example
 *
 * const object = { 'a': 1, 'b': '2', 'c': 3 }
 *
 * pick(object, ['a', 'c'])
 * // => { 'a': 1, 'c': 3 }
 */
function pick(object, ...paths) {
  return object == null ? {} : basePick(object, paths)
}
```

`pick` 函数接收 2 个参数， `object` 目标对象、`paths` 剩余参数。

`pick` 函数返回一个三元表达式，如果 `object == null` 返回空对象，否则返回调用 `basePick` 函数的返回。

## basePick

```js
/**
 * The base implementation of `pick` without support for individual
 * property identifiers.
 *
 * @private
 * @param {Object} object The source object.
 * @param {string[]} paths The property paths to pick.
 * @returns {Object} Returns the new object.
 */
function basePick(object, paths) {
  return basePickBy(object, paths, (value, path) => hasIn(object, path))
}
```

`basePick` 函数时 `pick` 的基本实现，会调用 `basePickBy` 函数，`basePickBy` 返回一个新的对象，传入的回调函数中，接收 2 个参数 `value, path`，并且调用 `hasIn` 函数检查对象的属性：

```js
function hasIn(object, key) {
  return object != null && key in Object(object)
}
```

## basePickBy

```js
/**
 * The base implementation of `pickBy`.
 *
 * @private
 * @param {Object} object The source object.
 * @param {string[]} paths The property paths to pick.
 * @param {Function} predicate The function invoked per property.
 * @returns {Object} Returns the new object.
 */
function basePickBy(object, paths, predicate) {
  let index = -1
  const length = paths.length
  const result = {}

  while (++index < length) {
    const path = paths[index]
    const value = baseGet(object, path)
    if (predicate(value, path)) {
      baseSet(result, castPath(path, object), value)
    }
  }
  return result
}
```

在 `basePickBy` 函数中会申明一些初始参数，然后进入 `while` 循环，`index` 累加，取出每次循环的 `path`、`value`，这里会调用 `basePick` 传入的 `predicate` 函数，如果对象上有这个 `key` 值就调用 `baseSet` 函数给 `result` 对象添加属性。

## pickBy

> 创建一个从 object 中经 predicate 判断为真值的属性为对象。 predicate 会传入1个参数：(value)

```js
_.pickBy(object, [predicate=_.identity])
```

```js
/**
 * Creates an object composed of the `object` properties `predicate` returns
 * truthy for. The predicate is invoked with two arguments: (value, key).
 *
 * @since 4.0.0
 * @category Object
 * @param {Object} object The source object.
 * @param {Function} predicate The function invoked per property.
 * @returns {Object} Returns the new object.
 * @example
 *
 * const object = { 'a': 1, 'b': '2', 'c': 3 }
 *
 * pickBy(object, isNumber)
 * // => { 'a': 1, 'c': 3 }
 */
function pickBy(object, predicate) {
  if (object == null) {
    return {}
  }
  const props = map(getAllKeysIn(object), (prop) => [prop])
  return basePickBy(object, props, (value, path) => predicate(value, path[0]))
}
```

`pickBy` 函数接收 2 个参数，`object` 目标对象、`predicate` 迭代函数。

首先对 `object` 做非空处理，接着调用 `map` 函数，并且传入 `getAllKeysIn` 返回的对象 `key` 数组和回调函数。

```js
function getAllKeysIn(object) {
  const result = []
  for (const key in object) {
    result.push(key)
  }
  if (!Array.isArray(object)) {
    result.push(...getSymbolsIn(object))
  }
  return result
}
```

`getAllKeysIn` 函数主要是调用 `for...in` 方法收集 `object` 上的 `key`，并插入 `result` 数组，最后将 `result` 返回。

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

`map` 函数内部会调用 `while` 循环，不断将 `iteratee` 迭代函数处理后的 `value` 插入 `result` ，
`(prop) => [prop]` 迭代函数会将 `prop` 包装成数组返回，
循环结束后返回 `result`。

在 `pickBy` 最后会调用 `basePickBy` 函数，传入 `object`、`props`、`(value, path) => predicate(value, path[0])` 回调函数，最后将函数处理后的对象返回。

## result

> 这个方法类似 _.get。 除了如果解析到的值是一个函数的话，就绑定 this 到这个函数并返回执行后的结果。

```js
_.result(object, path, [defaultValue])
```

```js
/**
 * This method is like `get` except that if the resolved value is a
 * function it's invoked with the `this` binding of its parent object and
 * its result is returned.
 *
 * @since 0.1.0
 * @category Object
 * @param {Object} object The object to query.
 * @param {Array|string} path The path of the property to resolve.
 * @param {*} [defaultValue] The value returned for `undefined` resolved values.
 * @returns {*} Returns the resolved value.
 * @example
 *
 * const object = { 'a': [{ 'b': { 'c1': 3, 'c2': () => 4 } }] }
 *
 * result(object, 'a[0].b.c1')
 * // => 3
 *
 * result(object, 'a[0].b.c2')
 * // => 4
 *
 * result(object, 'a[0].b.c3', 'default')
 * // => 'default'
 *
 * result(object, 'a[0].b.c3', () => 'default')
 * // => 'default'
 */
function result(object, path, defaultValue) {
  path = castPath(path, object)

  let index = -1
  let length = path.length

  // Ensure the loop is entered when path is empty.
  if (!length) {
    length = 1
    object = undefined
  }
  while (++index < length) {
    let value = object == null ? undefined : object[toKey(path[index])]
    if (value === undefined) {
      index = length
      value = defaultValue
    }
    object = typeof value == 'function' ? value.call(object) : value
  }
  return object
}
```

`result` 函数接收 3 个参数，`object` 目标对象、`path` 解析路径、`defaultValue` 默认值。

首先会调用 `castPath` 函数尝试转化 `path` 路径，然后处理 `path` 没有长度的情况，`length` 为 1，`object` 为 `undefined`。

进入 `while` 循环，`index` 累加，这里会申明 `value` 变量，调用 `toKey` 转化不是字符串的 `key`，然后将得到的值赋值给 `value`，
接着判断如果 `value === undefined` 就将 `value` 赋值为默认值。

然后会对 `value` 做一个类型判断，如果为 `function` 就调用 `call` 返回一个改变 `this` 的 `fucntion`。

循环结束后最后 `object` 返回。

## set

> 设置值到对象对应的属性路径上，如果没有则创建这部分路径。 缺少的索引属性会创建为数组，而缺少的属性会创建为对象。 使用 _.setWith 定制创建。

```js
_.set(object, path, value)
```

```js
/**
 * Sets the value at `path` of `object`. If a portion of `path` doesn't exist,
 * it's created. Arrays are created for missing index properties while objects
 * are created for all other missing properties. Use `setWith` to customize
 * `path` creation.
 *
 * **Note:** This method mutates `object`.
 *
 * @since 3.7.0
 * @category Object
 * @param {Object} object The object to modify.
 * @param {Array|string} path The path of the property to set.
 * @param {*} value The value to set.
 * @returns {Object} Returns `object`.
 * @see has, hasIn, get, unset
 * @example
 *
 * const object = { 'a': [{ 'b': { 'c': 3 } }] }
 *
 * set(object, 'a[0].b.c', 4)
 * console.log(object.a[0].b.c)
 * // => 4
 *
 * set(object, ['x', '0', 'y', 'z'], 5)
 * console.log(object.x[0].y.z)
 * // => 5
 */
function set(object, path, value) {
  return object == null ? object : baseSet(object, path, value)
}
```

`set` 函数接收 3 个参数，`object` 设置对象、`path` 设置路径、`value` 设置的值。

`set` 函数返回一个三元表达式，如果 `object == null` 返回 `object`，否则返回 `baseSet` 调用结果。

## baseSet

```js
/**
 * The base implementation of `set`.
 *
 * @private
 * @param {Object} object The object to modify.
 * @param {Array|string} path The path of the property to set.
 * @param {*} value The value to set.
 * @param {Function} [customizer] The function to customize path creation.
 * @returns {Object} Returns `object`.
 */
function baseSet(object, path, value, customizer) {
  if (!isObject(object)) {
    return object
  }
  path = castPath(path, object)

  const length = path.length
  const lastIndex = length - 1

  let index = -1
  let nested = object

  while (nested != null && ++index < length) {
    const key = toKey(path[index])
    let newValue = value

    if (index != lastIndex) {
      const objValue = nested[key]
      newValue = customizer ? customizer(objValue, key, nested) : undefined
      if (newValue === undefined) {
        newValue = isObject(objValue)
          ? objValue
          : (isIndex(path[index + 1]) ? [] : {})
      }
    }
    assignValue(nested, key, newValue)
    nested = nested[key]
  }
  return object
}
```

`baseSet` 函数首先会调用 `isObject` 判断 `object` 是否是对象，不是的话立刻返回，调用 `castPath` 函数尝试处理 `path`，申明一些基本变量。

进入 `while` 循环， `index` 累加，在回调中会取出 `key` 和对应的 `value`，这里会对取出 `nested` 也就是 `obejct` 对象的 `key`，如果有传入的 `customizer` 函数会调用 `customizer` 生成新的 `newValue`，如果 `newValue` 为 `undefined`，说明当前对象没有对应路径的 `key`，这里会根据 `objValue` 的类型，尝试将 `newValue` 赋值为空数组或空对象。

接着调用 `assignValue` 函数进行属性的赋值，并且对 `nested` 赋值为取出 `key` 后的值，继续循环。

循环结束后将 `object` 返回。

## setWith

> 这个方法类似 _.set。 除了它接受一个 customizer 决定如何设置对象路径的值。 如果 customizer 返回 undefined 将会有它的处理方法代替。 customizer 会传入3个参数：(nsValue, key, nsObject) 注意: 这个方法会改变源对象。

```js
_.setWith(object, path, value, [customizer])
```

```js
/**
 * This method is like `set` except that it accepts `customizer` which is
 * invoked to produce the objects of `path`. If `customizer` returns `undefined`
 * path creation is handled by the method instead. The `customizer` is invoked
 * with three arguments: (nsValue, key, nsObject).
 *
 * **Note:** This method mutates `object`.
 *
 * @since 4.0.0
 * @category Object
 * @param {Object} object The object to modify.
 * @param {Array|string} path The path of the property to set.
 * @param {*} value The value to set.
 * @param {Function} [customizer] The function to customize assigned values.
 * @returns {Object} Returns `object`.
 * @example
 *
 * const object = {}
 *
 * setWith(object, '[0][1]', 'a', Object)
 * // => { '0': { '1': 'a' } }
 */
function setWith(object, path, value, customizer) {
  customizer = typeof customizer == 'function' ? customizer : undefined
  return object == null ? object : baseSet(object, path, value, customizer)
}
```

`setWith` 函数与 `set` 相似，只是多了一个 `customizer` 处理函数，首先会对 `customizer` 进行类型判断，如果不是 `function` 就将 `customizer` 赋值为 `undefined`。

然后返回一个三元表达式，如果 `object == null` 返回 `object`，否则返回调用 `baseSet` 函数的返回，与 `set` 函数不同的是这里传入了 `customizer` 处理函数。

## toPairs

> 创建一个对象自身可枚举属性的键值对数组。

```js
_.toPairs(object)
```

```js
/**
 * Creates an array of own enumerable string keyed-value pairs for `object`
 * which can be consumed by `_.fromPairs`. If `object` is a map or set, its
 * entries are returned.
 *
 * @static
 * @memberOf _
 * @since 4.0.0
 * @alias entries
 * @category Object
 * @param {Object} object The object to query.
 * @returns {Array} Returns the key-value pairs.
 * @example
 *
 * function Foo() {
 *   this.a = 1;
 *   this.b = 2;
 * }
 *
 * Foo.prototype.c = 3;
 *
 * _.toPairs(new Foo);
 * // => [['a', 1], ['b', 2]] (iteration order is not guaranteed)
 */
var toPairs = createToPairs(keys);
```

`toPairs` 是 `createToPairs` 函数的返回函数，传入了 `keys` 函数。

## createToPairs

```js
/**
 * Creates a `_.toPairs` or `_.toPairsIn` function.
 *
 * @private
 * @param {Function} keysFunc The function to get the keys of a given object.
 * @returns {Function} Returns the new pairs function.
 */
function createToPairs(keysFunc) {
  return function(object) {
    var tag = getTag(object);
    if (tag == mapTag) {
      return mapToArray(object);
    }
    if (tag == setTag) {
      return setToPairs(object);
    }
    return baseToPairs(object, keysFunc(object));
  };
}
```

`createToPairs` 返回一个 `function`，也就是 `toPairs` 函数。

函数接收一个对象参数，使用 `getTag` 得到 `[object Type]` 形式的类型字符串，如果是 `Map` 类型返回 `mapToArray` 函数调用后的数组：

```js
/**
 * Converts `map` to its key-value pairs.
 *
 * @private
 * @param {Object} map The map to convert.
 * @returns {Array} Returns the key-value pairs.
 */
function mapToArray(map) {
  var index = -1,
      result = Array(map.size);

  map.forEach(function(value, key) {
    result[++index] = [key, value];
  });
  return result;
}
```

`mapToArray` 函数会循环往会以 `key: value` 的形式往 `result` 插入，最后将 `result` 返回。

如果是 `Tag` 类型返回 `setToPairs` 函数调用后的数组，与 `map` 类型一致。
最后是排除以上 2 种情况，调用 `baseToPairs` 函数：

```js
/**
  * The base implementation of `_.toPairs` and `_.toPairsIn` which creates an array
  * of key-value pairs for `object` corresponding to the property names of `props`.
  *
  * @private
  * @param {Object} object The object to query.
  * @param {Array} props The property names to get values for.
  * @returns {Object} Returns the key-value pairs.
  */
function baseToPairs(object, props) {
  return arrayMap(props, function (key) {
    return [key, object[key]];
  });
}
```

`baseToPairs` 函数返回 `arrayMap` 函数，并传入 `props` 和回调函数，回调函数会将 `key`、`value` 包装成数组返回。

```js
function arrayMap(array, iteratee) {
  var index = -1,
    length = array == null ? 0 : array.length,
    result = Array(length);

  while (++index < length) {
    result[index] = iteratee(array[index], index, array);
  }
  return result;
}
```

`arrayMap` 函数内部会进行 `while` 循环，调用 `iteratee` 函数，会将 `result` 的 `index` 赋值成 `key`、`value` 组成的数组，循环结束后将 `result` 返回。

## toPairsIn

> 创建一个对象自身和继承的可枚举属性的键值对数组。

```js
_.toPairsIn(object)
```

```js
/**
  * Creates an array of own and inherited enumerable string keyed-value pairs
  * for `object` which can be consumed by `_.fromPairs`. If `object` is a map
  * or set, its entries are returned.
  *
  * @static
  * @memberOf _
  * @since 4.0.0
  * @alias entriesIn
  * @category Object
  * @param {Object} object The object to query.
  * @returns {Array} Returns the key-value pairs.
  * @example
  *
  * function Foo() {
  *   this.a = 1;
  *   this.b = 2;
  * }
  *
  * Foo.prototype.c = 3;
  *
  * _.toPairsIn(new Foo);
  * // => [['a', 1], ['b', 2], ['c', 3]] (iteration order is not guaranteed)
  */
var toPairsIn = createToPairs(keysIn);
```

`toPairsIn` 是调用 `createToPairs` 函数返回的函数，与 `toPairs` 相似，只是传入了 `keysIn` 函数，`keysIn` 用来返回对象的 `key` 数组。

## transform

> _.reduce 的代替方法。 这个方法会改变对象为一个新的 accumulator 对象，来自每一次经 iteratee 处理自身可枚举对象的结果。 每次调用可能会改变 accumulator 对象。 iteratee 会传入4个对象：(accumulator, value, key, object)。 如果返回 false，iteratee 会提前退出。

```js
_.transform(object, [iteratee=_.identity], [accumulator])
```

```js
/**
 * An alternative to `reduce` this method transforms `object` to a new
 * `accumulator` object which is the result of running each of its own
 * enumerable string keyed properties thru `iteratee`, with each invocation
 * potentially mutating the `accumulator` object. If `accumulator` is not
 * provided, a new object with the same `[[Prototype]]` will be used. The
 * iteratee is invoked with four arguments: (accumulator, value, key, object).
 * Iteratee functions may exit iteration early by explicitly returning `false`.
 *
 * @since 1.3.0
 * @category Object
 * @param {Object} object The object to iterate over.
 * @param {Function} iteratee The function invoked per iteration.
 * @param {*} [accumulator] The custom accumulator value.
 * @returns {*} Returns the accumulated value.
 * @see reduce, reduceRight
 * @example
 *
 * transform([2, 3, 4], (result, n) => {
 *   result.push(n *= n)
 *   return n % 2 == 0
 * }, [])
 * // => [4, 9]
 *
 * transform({ 'a': 1, 'b': 2, 'c': 1 }, (result, value, key) => {
 *   (result[value] || (result[value] = [])).push(key)
 * }, {})
 * // => { '1': ['a', 'c'], '2': ['b'] }
 */
function transform(object, iteratee, accumulator) {
  const isArr = Array.isArray(object)
  const isArrLike = isArr || isBuffer(object) || isTypedArray(object)

  if (accumulator == null) {
    const Ctor = object && object.constructor
    if (isArrLike) {
      accumulator = isArr ? new Ctor : []
    }
    else if (isObject(object)) {
      accumulator = typeof Ctor == 'function'
        ? Object.create(Object.getPrototypeOf(object))
        : {}
    }
    else {
      accumulator = {}
    }
  }
  (isArrLike ? arrayEach : baseForOwn)(object, (value, index, object) =>
    iteratee(accumulator, value, index, object))
  return accumulator
}
```

`transform` 函数接收 3 个参数，`object` 迭代对象、`iteratee` 迭代函数，`accumulator` 收集器。

首先申明 `isArr` 变量保存 `object` 是否为数组，`isArrLike` 变量是否为类数组。

接着会判断 `accumulator == null` ，如果进入 `if` 判断，会获取 `object.constructor` 的原型对象 `Ctor`，如果是数组，`accumulator` 赋值为 `new Ctor`，如果是类数组，赋值为 `[]`。

如果 `object` 是一个对象，对象 `accumulator` 进行赋值，如果 `Ctor` 是一个 `function`，调用 `Object.create` 方法，创建一个具有指定原型且可选择性地包含指定属性的对象，这里只传入了 `Object.getPrototypeOf(object)`，获取 `object` 的原型，如果不满足已上条件将 `accumulator` 赋值为空对象。

接着是一个 3 元表达式，`arrayEach` 和 `baseForOwn` 都是迭代函数，根据 `isArrLike` 进行调用，这里会传入回调函数，回调函数中会调用 `iteratee` 迭代器对 `accumulator` 进行处理，最后将处理后的 `accumulator` 返回。

## unset

> 移除对象路径的属性。 注意: 这个方法会改变源对象

```js
_.unset(object, path)
```

```js
/**
 * Removes the property at `path` of `object`.
 *
 * **Note:** This method mutates `object`.
 *
 * @since 4.0.0
 * @category Object
 * @param {Object} object The object to modify.
 * @param {Array|string} path The path of the property to unset.
 * @returns {boolean} Returns `true` if the property is deleted, else `false`.
 * @see get, has, set
 * @example
 *
 * const object = { 'a': [{ 'b': { 'c': 7 } }] }
 * unset(object, 'a[0].b.c')
 * // => true
 *
 * console.log(object)
 * // => { 'a': [{ 'b': {} }] }
 *
 * unset(object, ['a', '0', 'b', 'c'])
 * // => true
 *
 * console.log(object)
 * // => { 'a': [{ 'b': {} }] }
 */
function unset(object, path) {
  return object == null ? true : baseUnset(object, path)
}
```

`unset` 函数与 `set` 函数相似，是 `baseUnset` 函数的简单包装。

## baseUnset

```js
/**
 * The base implementation of `unset`.
 *
 * @private
 * @param {Object} object The object to modify.
 * @param {Array|string} path The property path to unset.
 * @returns {boolean} Returns `true` if the property is deleted, else `false`.
 */
function baseUnset(object, path) {
  path = castPath(path, object)
  object = parent(object, path)
  return object == null || delete object[toKey(last(path))]
}
```

`baseUnset` 函数时 `unset` 的基本实现，首先调用 `castPath` 处理 `path`，调用 `parent` 函数获取 `object` 的父值，这里会返回 `object` 为 `null` 或者删除 `object` 的最后一个 `path` 的 `key` 值。

## update

> 此方法类似于_.set，除了接受 updater 生成要设置的值。

```js
_.update(object, path, updater)
```

```js
/**
 * This method is like `set` except that it accepts `updater` to produce the
 * value to set. Use `updateWith` to customize `path` creation. The `updater`
 * is invoked with one argument: (value).
 *
 * **Note:** This method mutates `object`.
 *
 * @since 4.6.0
 * @category Object
 * @param {Object} object The object to modify.
 * @param {Array|string} path The path of the property to set.
 * @param {Function} updater The function to produce the updated value.
 * @returns {Object} Returns `object`.
 * @example
 *
 * const object = { 'a': [{ 'b': { 'c': 3 } }] }
 *
 * update(object, 'a[0].b.c', n => n * n)
 * console.log(object.a[0].b.c)
 * // => 9
 *
 * update(object, 'x[0].y.z', n => n ? n + 1 : 0)
 * console.log(object.x[0].y.z)
 * // => 0
 */
function update(object, path, updater) {
  return object == null ? object : baseUpdate(object, path, updater)
}
```

`update` 函数接收 `object` 目标对象、`path` 路径、`updater` 更新函数。

`update` 函数是 `baseUpdate` 的简单包装。

## baseUpdate

```js
/**
 * The base implementation of `update`.
 *
 * @private
 * @param {Object} object The object to modify.
 * @param {Array|string} path The path of the property to update.
 * @param {Function} updater The function to produce the updated value.
 * @param {Function} [customizer] The function to customize path creation.
 * @returns {Object} Returns `object`.
 */
function baseUpdate(object, path, updater, customizer) {
  return baseSet(object, path, updater(baseGet(object, path)), customizer)
}
```

`baseUpdate` 函数内部会调用 `baseSet` 函数。

调用 `baseSet` 的第三个参数:

```js
updater(baseGet(object, path)) 
```

这里调用 `baseGet` 函数获取 `object` 上 `path` 对应的 `value`，然后调用 `updater` 函数生成新的 `value`，最后将调用 `baseSet` 函数后的 `object` 返回。

## updateWith

> 此方法类似于_.setWith，除了接受 updater 生成要设置的值。

```js
_.updateWith(object, path, updater, [customizer])
```

```js
/**
 * This method is like `update` except that it accepts `customizer` which is
 * invoked to produce the objects of `path`. If `customizer` returns `undefined`
 * path creation is handled by the method instead. The `customizer` is invoked
 * with three arguments: (nsValue, key, nsObject).
 *
 * **Note:** This method mutates `object`.
 *
 * @since 4.6.0
 * @category Object
 * @param {Object} object The object to modify.
 * @param {Array|string} path The path of the property to set.
 * @param {Function} updater The function to produce the updated value.
 * @param {Function} [customizer] The function to customize assigned values.
 * @returns {Object} Returns `object`.
 * @example
 *
 * const object = {}
 *
 * updateWith(object, '[0][1]', () => 'a', Object)
 * // => { '0': { '1': 'a' } }
 */
function updateWith(object, path, updater, customizer) {
  customizer = typeof customizer == 'function' ? customizer : undefined
  return object == null ? object : baseUpdate(object, path, updater, customizer)
}
```

`updateWith` 函数与 `update` 函数相似，只是多了一个参数 `customizer` 自定义函数。

首先会对 `customizer` 做类型判断，如果不是 `function` 将 `customizer` 赋值为 `undefined`，然后调用 `baseUpdate` 函数，多传入了 `customizer` 函数，最后将处理后的 `object` 返回。

## values

> 创建 object 自身可枚举属性的值为数组 

```js
_.values(object)
```

```js
/**
 * Creates an array of the own enumerable string keyed property values of `object`.
 *
 * **Note:** Non-object values are coerced to objects.
 *
 * @since 0.1.0
 * @category Object
 * @param {Object} object The object to query.
 * @returns {Array} Returns the array of property values.
 * @see keys, valuesIn
 * @example
 *
 * function Foo() {
 *   this.a = 1
 *   this.b = 2
 * }
 *
 * Foo.prototype.c = 3
 *
 * values(new Foo)
 * // => [1, 2] (iteration order is not guaranteed)
 *
 * values('hi')
 * // => ['h', 'i']
 */
function values(object) {
  return object == null ? [] : baseValues(object, keys(object))
}
```

`values` 函数返回一个三元表达式，如果是 `null` 返回 `[]`，否则返回调用 `baseValues` 函数后返回的数组，`keys` 函数是 `object` 的 `key` 数组。

## baseValues

```js
/**
 * The base implementation of `values` and `valuesIn` which creates an
 * array of `object` property values corresponding to the property names
 * of `props`.
 *
 * @private
 * @param {Object} object The object to query.
 * @param {Array} props The property names to get values for.
 * @returns {Object} Returns the array of property values.
 */
function baseValues(object, props) {
  return props == null ? [] : props.map((key) => object[key])
}
```

`baseValues` 函数返回一个三元表达式，如果 `props` 为 `null` 返回空数组，否则调用 `map` 函数返回 `object[key]`，也就是 `value`，此时就是 `value` 的集合，将其返回。

## valuesIn

> 创建一个自己的数组，并继承可枚举的对象的字符串键控属性值。

```js
_.valuesIn(object)
```

```js
/**
  * Creates an array of the own and inherited enumerable string keyed property
  * values of `object`.
  *
  * **Note:** Non-object values are coerced to objects.
  *
  * @static
  * @memberOf _
  * @since 3.0.0
  * @category Object
  * @param {Object} object The object to query.
  * @returns {Array} Returns the array of property values.
  * @example
  *
  * function Foo() {
  *   this.a = 1;
  *   this.b = 2;
  * }
  *
  * Foo.prototype.c = 3;
  *
  * _.valuesIn(new Foo);
  * // => [1, 2, 3] (iteration order is not guaranteed)
  */
function valuesIn(object) {
  return object == null ? [] : baseValues(object, keysIn(object));
}
```

`valuesIn` 函数与 `values` 函数相似，只是调用了 `keysIn` 函数获取了自身和继承的 `key` 数组。
