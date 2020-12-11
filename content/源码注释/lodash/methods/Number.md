## clamp

> 返回限制在 min 和 max 之间的值。

```js
_.clamp(number, [lower], upper)
```

```js
/**
 * Clamps `number` within the inclusive `lower` and `upper` bounds.
 *
 * @since 4.0.0
 * @category Number
 * @param {number} number The number to clamp.
 * @param {number} lower The lower bound.
 * @param {number} upper The upper bound.
 * @returns {number} Returns the clamped number.
 * @example
 *
 * clamp(-10, -5, 5)
 * // => -5
 *
 * clamp(10, -5, 5)
 * // => 5
 */
function clamp(number, lower, upper) {
  number = +number
  lower = +lower
  upper = +upper
  lower = lower === lower ? lower : 0
  upper = upper === upper ? upper : 0
  if (number === number) {
    number = number <= upper ? number : upper
    number = number >= lower ? number : lower
  }
  return number
}
```

`clamp` 首先是使用 `+` 进行隐式转换成数字，接着是 `lower`、`upper` 的 `NaN` 处理，如果 `number === number` 说明不是 `NaN`，进行大小比较赋值，最后返回 `number`。

## inRange

> 检查 n 是否在 start 与 end 之间，但不包括 end。 如果 end 没有指定，那么 start 设置为0。 如果 start 大于 end，那么参数会交换以便支持负范围。

```js
_.inRange(number, [start=0], end)
```

```js
/**
 * Checks if `number` is between `start` and up to, but not including, `end`. If
 * `end` is not specified, it's set to `start` with `start` then set to `0`.
 * If `start` is greater than `end` the params are swapped to support
 * negative ranges.
 *
 * @since 3.3.0
 * @category Number
 * @param {number} number The number to check.
 * @param {number} [start=0] The start of the range.
 * @param {number} end The end of the range.
 * @returns {boolean} Returns `true` if `number` is in the range, else `false`.
 * @see range, rangeRight
 * @example
 *
 * inRange(3, 2, 4)
 * // => true
 *
 * inRange(4, 8)
 * // => true
 *
 * inRange(4, 2)
 * // => false
 *
 * inRange(2, 2)
 * // => false
 *
 * inRange(1.2, 2)
 * // => true
 *
 * inRange(5.2, 4)
 * // => false
 *
 * inRange(-3, -2, -6)
 * // => true
 */
function inRange(number, start, end) {
  if (end === undefined) {
    end = start
    start = 0
  }
  return baseInRange(+number, +start, +end)
}
```

`inRange` 函数会对没有 `end` 的情况进行处理，将 `start` 赋值给 `end`， `start` 赋值为 0，
然后返回 `baseInRange` 调用。

## baseInRange

```js
/**
 * The base implementation of `inRange` which doesn't coerce arguments.
 *
 * @private
 * @param {number} number The number to check.
 * @param {number} start The start of the range.
 * @param {number} end The end of the range.
 * @returns {boolean} Returns `true` if `number` is in the range, else `false`.
 */
function baseInRange(number, start, end) {
  return number >= Math.min(start, end) && number < Math.max(start, end)
}
```

`baseInRange` 函数返回 2 个大小比较。

```js
number >= Math.min(start, end)
```

`number` 大于等于 `start` 和 `end` 的最小值。

```js
number < Math.max(start, end)
```
`number` 小于 `start` 和 `end` 的最大值。

符合 2 个比较返回 `true`，否则返回 `false`。

## random

> 产生一个包括 min 与 max 之间的数。 如果只提供一个参数返回一个 0 到提供数之间的数。 如果 floating 设为 true，或者 min 或 max 是浮点数，结果返回浮点数。 

```js

```

```js
/** Built-in method references without a dependency on `root`. */
const freeParseFloat = parseFloat

/**
 * Produces a random number between the inclusive `lower` and `upper` bounds.
 * If only one argument is provided a number between `0` and the given number
 * is returned. If `floating` is `true`, or either `lower` or `upper` are
 * floats, a floating-point number is returned instead of an integer.
 *
 * **Note:** JavaScript follows the IEEE-754 standard for resolving
 * floating-point values which can produce unexpected results.
 *
 * @since 0.7.0
 * @category Number
 * @param {number} [lower=0] The lower bound.
 * @param {number} [upper=1] The upper bound.
 * @param {boolean} [floating] Specify returning a floating-point number.
 * @returns {number} Returns the random number.
 * @see uniqueId
 * @example
 *
 * random(0, 5)
 * // => an integer between 0 and 5
 *
 * random(5)
 * // => also an integer between 0 and 5
 *
 * random(5, true)
 * // => a floating-point number between 0 and 5
 *
 * random(1.2, 5.2)
 * // => a floating-point number between 1.2 and 5.2
 */
function random(lower, upper, floating) {
  if (floating === undefined) {
    if (typeof upper == 'boolean') {
      floating = upper
      upper = undefined
    }
    else if (typeof lower == 'boolean') {
      floating = lower
      lower = undefined
    }
  }
  if (lower === undefined && upper === undefined) {
    lower = 0
    upper = 1
  } else {
    lower = toFinite(lower)
    if (upper === undefined) {
      upper = lower
      lower = 0
    } else {
      upper = toFinite(upper)
    }
  }
  if (lower > upper) {
    const temp = lower
    lower = upper
    upper = temp
  }
  if (floating || lower % 1 || upper % 1) {
    const rand = Math.random()
    const randLength = `${rand}`.length - 1
    return Math.min(lower + (rand * (upper - lower + freeParseFloat(`1e-${randLength}`)), upper))
  }
  return lower + Math.floor(Math.random() * (upper - lower + 1))
}
```

`random` 函数接收 3 个函数，`lower` 最小值、 `upper` 最大值、`floating` 是否返回浮点数。

`random` 函数内部有 4 个 `if` 判断。

```js
if (floating === undefined) {
  if (typeof upper == 'boolean') {
    floating = upper
    upper = undefined
  }
  else if (typeof lower == 'boolean') {
    floating = lower
    lower = undefined
  }
}
```

首先判断 `floating` 是否等于 `undefined`，如果为 `undefined`，说明没有传入第三个参数，接着判断 `upper`、`upper` 类型是否是 `Boolean`，如果是则与 `floating` 进行交换赋值处理，此处主要是处理参数缺少的情况。

```js
if (lower === undefined && upper === undefined) {
  lower = 0
  upper = 1
} else {
  lower = toFinite(lower)
  if (upper === undefined) {
    upper = lower
    lower = 0
  } else {
    upper = toFinite(upper)
  }
}
```

如果 `upper`、`upper` 都为 `undefined`，取默认值 `0 ~ 1`，
否则将 `lower`、`upper` 转成整数，如果 `upper` 为 `undefined`，`upper` 赋值为 `lower`， `lower` 赋值为 0。

```js
if (lower > upper) {
  const temp = lower
  lower = upper
  upper = temp
}
```

如果 `lower` 大于 `upper`，对它们进行交换赋值。

```js
if (floating || lower % 1 || upper % 1) {
  const rand = Math.random()
  const randLength = `${rand}`.length - 1
  return Math.min(lower + (rand * (upper - lower + freeParseFloat(`1e-${randLength}`)), upper))
}
```
如果 `floating` 为真或者 `lower`、`upper` 不为整数，申明 `rand` 变量保存 `0 ~ 1` 随机数，`randLength` 变量保存随机数长度，这里会得到采用科学计数法保存随机数，并且调用 `Math.min` 函数取 `upper` 与得到随机数的最小值，然后返回。

```js
lower + Math.floor(Math.random() * (upper - lower + 1))
```

如果不满足上述条件，取到 `upper` 、`lower` 之差的随机数，向下取整，再加上 `lower`，就是 `upper` 、`lower` 之间的随机数，最后返回。

