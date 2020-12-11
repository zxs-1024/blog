## add

> 相加两个数。

```js
_.add(augend, addend)
```

```js
/**
 * Adds two numbers.
 *
 * @since 3.4.0
 * @category Math
 * @param {number} augend The first number in an addition.
 * @param {number} addend The second number in an addition.
 * @returns {number} Returns the total.
 * @example
 *
 * add(6, 4)
 * // => 10
 */
const add = createMathOperation((augend, addend) => augend + addend, 0)
```

`add` 函数是调用 `createMathOperation` 函数返回的函数，并且传入了回调函数和初始值 0。

传入的回调函数：

```js
(augend, addend) => augend + addend
```

回调函数会在 `createMathOperation` 函数中进行处理，然后返回一个 `fucntion`，改 `function` 会返回调用 `operator` 也就是传入的回调函数的返回值。

## createMathOperation

```js
/**
 * Creates a function that performs a mathematical operation on two values.
 *
 * @private
 * @param {Function} operator The function to perform the operation.
 * @param {number} [defaultValue] The value used for `undefined` arguments.
 * @returns {Function} Returns the new mathematical operation function.
 */
function createMathOperation(operator, defaultValue) {
  return (value, other) => {
    if (value === undefined && other === undefined) {
      return defaultValue
    }
    if (value !== undefined && other === undefined) {
      return value
    }
    if (other !== undefined && value === undefined) {
      return other
    }
    if (typeof value == 'string' || typeof other == 'string') {
      value = baseToString(value)
      other = baseToString(other)
    }
    else {
      value = baseToNumber(value)
      other = baseToNumber(other)
    }
    return operator(value, other)
  }
}
```

`createMathOperation` 函数接收 2 个参数，`operator` 回调函数、`defaultValue` 初始值。

调用 `createMathOperation` 后会返回一个函数，函数接收 2 个 `value`。

函数首先会对 `value`、`other` 做非空判断，如果都为 `undefined` 返回默认值，如果其中一个 `value` 为 `undefined`，返回另一个值。

接着会对 `value`、`other` 做类型判断，如果为 `string`，调用 `baseToString` 进行字符串转换，
否则调用 `baseToNumber` 进行数字转换。

最后会返回 `operator(value, other)` ，`operator` 也就是传入的回调函数。

## ceil

> 根据 precision 向上舍入 number。

```js
_.ceil(number, [precision=0])
```

```js
/**
 * Computes `number` rounded up to `precision`.
 *
 * @since 3.10.0
 * @category Math
 * @param {number} number The number to round up.
 * @param {number} [precision=0] The precision to round up to.
 * @returns {number} Returns the rounded up number.
 * @example
 *
 * ceil(4.006)
 * // => 5
 *
 * ceil(6.004, 2)
 * // => 6.01
 *
 * ceil(6040, -2)
 * // => 6100
 */
const ceil = createRound('ceil')
```

`ceil` 函数是 `createRound` 函数的返回函数，传入了 `ceil` 字符串。

## createRound

```js
/**
 * Creates a function like `round`.
 *
 * @private
 * @param {string} methodName The name of the `Math` method to use when rounding.
 * @returns {Function} Returns the new round function.
 */
function createRound(methodName) {
  const func = Math[methodName]
  return (number, precision) => {
    precision = precision == null ? 0 : Math.min(precision, 292)
    if (precision) {
      // Shift with exponential notation to avoid floating-point issues.
      // See [MDN](https://mdn.io/round#Examples) for more details.
      let pair = `${number}e`.split('e')
      const value = func(`${pair[0]}e${+pair[1] + precision}`)

      pair = `${value}e`.split('e')
      return +`${pair[0]}e${+pair[1] - precision}`
    }
    return func(number)
  }
}
```

`createRound` 函数接收一个原生 `Math` 方法字符串 `methodName`，比方说 `ceil`。

申明 `func` 函数取出原生 `Math` 方法，然后返回一个 `function`，`function` 接收 2 个参数，`number` 需要四舍五入的数、`precision` 精确位数。

首先对 `precision` 进行处理，默认为 0，最大值为 292。

如果 `precision` 为真，这里为了防止浮点数问题，做了特殊处理采用，转成科学计数法和字符串拼接的方式进行运算，最后使用 `+` 进行隐式转换成数字后返回。

如果 `precision` 为假，直接返回 `return func(number)` 函数调用。

## divide

> 两数相除。

```js
_.divide(dividend, divisor)
```

```js
/**
 * Divide two numbers.
 *
 * @since 4.7.0
 * @category Math
 * @param {number} dividend The first number in a division.
 * @param {number} divisor The second number in a division.
 * @returns {number} Returns the quotient.
 * @example
 *
 * divide(6, 4)
 * // => 1.5
 */
const divide = createMathOperation((dividend, divisor) => dividend / divisor, 1)
```

`divide` 函数与 `add` 函数相似，传入了相除的回调函数和默认值 1。

## floor

> 根据 precision 向下保留 number。

```js
_.floor(number, [precision=0])
```

```js
/**
 * Computes `number` rounded down to `precision`.
 *
 * @since 3.10.0
 * @category Math
 * @param {number} number The number to round down.
 * @param {number} [precision=0] The precision to round down to.
 * @returns {number} Returns the rounded down number.
 * @example
 *
 * floor(4.006)
 * // => 4
 *
 * floor(0.046, 2)
 * // => 0.04
 *
 * floor(4060, -2)
 * // => 4000
 */
const floor = createRound('floor')
```

`floor` 函数与 `ceil` 函数相似，调用 `Math.floor` 方法。

## max

> 计算 array 中最大的值。 如果 array 是 空的或者假值将会返回 undefined。

```js
_.max(array)
```

```js
/**
 * Computes the maximum value of `array`. If `array` is empty or falsey,
 * `undefined` is returned.
 *
 * @static
 * @since 0.1.0
 * @memberOf _
 * @category Math
 * @param {Array} array The array to iterate over.
 * @returns {*} Returns the maximum value.
 * @example
 *
 * _.max([4, 2, 8, 6]);
 * // => 8
 *
 * _.max([]);
 * // => undefined
 */
function max(array) {
  return (array && array.length)
    ? baseExtremum(array, identity, baseGt)
    : undefined;
}
```

`max` 函数返回一个三元表达式，如果有 `array` 并且有 `length`，返回 `baseExtremum` 调用，否则返回 `undefined`，调用 `baseExtremum` 函数时传入了 `array`、 `identity` 、`baseGt` 函数。

```js
function identity(value) {
  return value;
}

function baseGt(value, other) {
  return value > other;
}
```

`identity` 只是一个返回原值的 `function`， `baseGt` 是一个比较大小返回 `Boolean` 的 `function`。

## baseExtremum

```js
/**
 * The base implementation of methods like `_.max` and `_.min` which accepts a
 * `comparator` to determine the extremum value.
 *
 * @private
 * @param {Array} array The array to iterate over.
 * @param {Function} iteratee The iteratee invoked per iteration.
 * @param {Function} comparator The comparator used to compare values.
 * @returns {*} Returns the extremum value.
 */
function baseExtremum(array, iteratee, comparator) {
  var index = -1,
      length = array.length;

  while (++index < length) {
    var value = array[index],
        current = iteratee(value);

    if (current != null && (computed === undefined
          ? (current === current && !isSymbol(current))
          : comparator(current, computed)
        )) {
      var computed = current,
          result = value;
    }
  }
  return result;
}
```

`baseExtremum` 接收 3个参数， `array` 数组，`iteratee` 迭代函数、`comparator` 比较函数。

申明初始变量，`index` -1、`length` 数组长度，
然后进入 `while` 循环，得到 `iteratee` 迭代函数处理的 `current`，然后调用 `comparator` 比较函数，循环赋值 `result` ，最近返回 `result`。

## maxBy

> 这个方法类似 _.max 除了它接受 iteratee 调用每一个元素，根据返回的 value 决定排序准则。 iteratee 会传入1个参数：(value)。

```js
_.maxBy(array, [iteratee=_.identity])
```

```js
/**
 * This method is like `max` except that it accepts `iteratee` which is
 * invoked for each element in `array` to generate the criterion by which
 * the value is ranked. The iteratee is invoked with one argument: (value).
 *
 * @since 4.0.0
 * @category Math
 * @param {Array} array The array to iterate over.
 * @param {Function} iteratee The iteratee invoked per element.
 * @returns {*} Returns the maximum value.
 * @example
 *
 * const objects = [{ 'n': 1 }, { 'n': 2 }]
 *
 * maxBy(objects, ({ n }) => n)
 * // => { 'n': 2 }
 */
function maxBy(array, iteratee) {
  let result
  if (array == null) {
    return result
  }
  for (const value of array) {
    let computed
    const current = iteratee(value)

    if (current != null && (computed === undefined
          ? (current === current && !isSymbol(current))
          : (current > computed)
        )) {
      computed = current
      result = value
    }
  }
  return result
}
```

`baseExtremum` 接收 2个参数， `array` 数组，`iteratee` 迭代函数。

首先会进行非空判断，接着进入 `for...of` 循环，`current` 为迭代函数 `iteratee` 处理后的值，不断比较赋值，最后将 `result` 返回。

## mean

> 计算 array 的平均值。

```js
_.mean(array)
```

```js
/**
 * Computes the mean of the values in `array`.
 *
 * @since 4.0.0
 * @category Math
 * @param {Array} array The array to iterate over.
 * @returns {number} Returns the mean.
 * @example
 *
 * mean([4, 2, 8, 6])
 * // => 5
 */
function mean(array) {
  return baseMean(array, (value) => value)
}
```

`mean` 函数是 `baseMean` 的封装，传入 `array` 数组、返回原值的 `function`。

## baseMean

```js
/**
 * The base implementation of `_.mean` and `_.meanBy` without support for
 * iteratee shorthands.
 *
 * @private
 * @param {Array} array The array to iterate over.
 * @param {Function} iteratee The function invoked per iteration.
 * @returns {number} Returns the mean.
 */
function baseMean(array, iteratee) {
  var length = array == null ? 0 : array.length;
  return length ? (baseSum(array, iteratee) / length) : NAN;
}
```

`baseMean` 函数接收 2 个参数，`array` 数组，`iteratee` 迭代函数。

取出 `array` 的 `length`，然后返回一个三元表达式，如果有 `length`，调用 `baseSum` 返回值除以 `length` 取平均值，否则返回 `NaN`。


## meanBy

```js
/** Used as references for various `Number` constants. */
const NAN = 0 / 0

/**
 * This method is like `mean` except that it accepts `iteratee` which is
 * invoked for each element in `array` to generate the value to be averaged.
 * The iteratee is invoked with one argument: (value).
 *
 * @since 4.7.0
 * @category Math
 * @param {Array} array The array to iterate over.
 * @param {Function} iteratee The iteratee invoked per element.
 * @returns {number} Returns the mean.
 * @example
 *
 * const objects = [{ 'n': 4 }, { 'n': 2 }, { 'n': 8 }, { 'n': 6 }]
 *
 * meanBy(objects, ({ n }) => n)
 * // => 5
 */
function meanBy(array, iteratee) {
  const length = array == null ? 0 : array.length
  return length ? (baseSum(array, iteratee) / length) : NAN
}
```

`meanBy` 函数接收 2 个参数，`array` 数组，`iteratee` 迭代函数。

取出 `array` 的 `length`，如果有 `length`，调用 `baseSum` 返回值除以 `length` 取平均值，否则返回 `NaN`。

## baseSum

```js
/**
 * The base implementation of `sum` and `sumBy`.
 *
 * @private
 * @param {Array} array The array to iterate over.
 * @param {Function} iteratee The function invoked per iteration.
 * @returns {number} Returns the sum.
 */
function baseSum(array, iteratee) {
  let result

  for (const value of array) {
    const current = iteratee(value)
    if (current !== undefined) {
      result = result === undefined ? current : (result + current)
    }
  }
  return result
}
```

`baseSum` 函数内部是一个 `for..of` 循环，累加 `iteratee` 迭代函数处理的 `current`，最后将 `result` 返回。

## min

> 计算 array 中最小的值。 如果 array 是 空的或者假值将会返回 undefined。

```js
_.min(array)
```

```js
/**
 * Computes the minimum value of `array`. If `array` is empty or falsey,
 * `undefined` is returned.
 *
 * @static
 * @since 0.1.0
 * @memberOf _
 * @category Math
 * @param {Array} array The array to iterate over.
 * @returns {*} Returns the minimum value.
 * @example
 *
 * _.min([4, 2, 8, 6]);
 * // => 2
 *
 * _.min([]);
 * // => undefined
 */
function min(array) {
  return (array && array.length)
    ? baseExtremum(array, identity, baseLt)
    : undefined;
}
```

如果有 `array` 并且有 `length`，返回 `baseExtremum` 调用，否则返回 `undefined`，并且传入 `identity` 、`baseLt` 函数。

```js
function identity(value) {
  return value;
}

function baseLt(value, other) {
  return value < other;
}
```

## minBy

> 这个方法类似 _.min。 除了它接受 iteratee 调用每一个元素，根据返回的 value 决定排序准则。 iteratee 会传入1个参数：(value)。

```js
_.minBy(array, [iteratee=_.identity])
```

```js
/**
 * This method is like `min` except that it accepts `iteratee` which is
 * invoked for each element in `array` to generate the criterion by which
 * the value is ranked. The iteratee is invoked with one argument: (value).
 *
 * @since 4.0.0
 * @category Math
 * @param {Array} array The array to iterate over.
 * @param {Function} iteratee The iteratee invoked per element.
 * @returns {*} Returns the minimum value.
 * @example
 *
 * const objects = [{ 'n': 1 }, { 'n': 2 }]
 *
 * minBy(objects, ({ n }) => n)
 * // => { 'n': 1 }
 */
function minBy(array, iteratee) {
  let result
  if (array == null) {
    return result
  }
  for (const value of array) {
    let computed
    const current = iteratee(value)

    if (current != null && (computed === undefined
          ? (current === current && !isSymbol(current))
          : (current < computed)
        )) {
      computed = current
      result = value
    }
  }
  return result
}
```

实现基本与 `maxBy` 一致。

## multiply

> 两数相乘。

```js
_.multiply(multiplier, multiplicand)
```

```js
/**
 * Multiply two numbers.
 *
 * @since 4.7.0
 * @category Math
 * @param {number} multiplier The first number in a multiplication.
 * @param {number} multiplicand The second number in a multiplication.
 * @returns {number} Returns the product.
 * @example
 *
 * multiply(6, 4)
 * // => 24
 */
const multiply = createMathOperation((multiplier, multiplicand) => multiplier * multiplicand, 1)
```

`multiply` 函数与 `add` 函数相似，传入了相乘的回调函数。

## round

> 根据 precision 四舍五入 number。

```js
_.round(number, [precision=0])
```

```js

/**
 * Computes `number` rounded to `precision`.
 *
 * @since 3.10.0
 * @category Math
 * @param {number} number The number to round.
 * @param {number} [precision=0] The precision to round to.
 * @returns {number} Returns the rounded number.
 * @example
 *
 * round(4.006)
 * // => 4
 *
 * round(4.006, 2)
 * // => 4.01
 *
 * round(4060, -2)
 * // => 4100
 */
const round = createRound('round')
```

`round` 函数是 `createRound('round')` 函数的返回值。

## subtract

> 两数相减。

```js
_.subtract(minuend, subtrahend)
```

```js
/**
 * Subtract two numbers.
 *
 * @since 4.0.0
 * @category Math
 * @param {number} minuend The first number in a subtraction.
 * @param {number} subtrahend The second number in a subtraction.
 * @returns {number} Returns the difference.
 * @example
 *
 * subtract(6, 4)
 * // => 2
 */
const subtract = createMathOperation((minuend, subtrahend) => minuend - subtrahend, 0)
```

`subtract` 函数与 `add` 函数相似，传入了相减的回调函数。

## sum

> 计算 array 中值的总和

```js
_.sum(array)
```

```js
/**
 * Computes the sum of the values in `array`.
 *
 * @since 3.4.0
 * @category Math
 * @param {Array} array The array to iterate over.
 * @returns {number} Returns the sum.
 * @example
 *
 * sum([4, 2, 8, 6])
 * // => 20
 */
function sum(array) {
  return (array != null && array.length)
    ? baseSum(array, (value) => value)
    : 0
}
```

判断如果有 `array` 并且有 `length`，调用 `baseSum` 函数返回，否则就返回 0.

## sumBy

> 这个方法类似 _.sum。 除了它接受 iteratee 调用每一个元素，根据返回的 value 决定如何计算。 iteratee 会传入1个参数：(value)。

```js
_.sumBy(array, [iteratee=_.identity])
```

```js
/**
 * This method is like `sum` except that it accepts `iteratee` which is
 * invoked for each element in `array` to generate the value to be summed.
 * The iteratee is invoked with one argument: (value).
 *
 * @since 4.0.0
 * @category Math
 * @param {Array} array The array to iterate over.
 * @param {Function} iteratee The iteratee invoked per element.
 * @returns {number} Returns the sum.
 * @example
 *
 * const objects = [{ 'n': 4 }, { 'n': 2 }, { 'n': 8 }, { 'n': 6 }]
 *
 * sumBy(objects, ({ n }) => n)
 * // => 20
 */
function sumBy(array, iteratee) {
  return (array != null && array.length)
    ? baseSum(array, iteratee)
    : 0
}
```

`sumBy` 函数比 `sum` 多一个迭代函数，调用 `baseSum` 函数式会把迭代函数传入。