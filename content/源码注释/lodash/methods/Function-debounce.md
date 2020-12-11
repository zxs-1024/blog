## debounce 

> 创建一个防抖动函数。 该函数会在 wait 毫秒后调用 func 方法。

```js
_.debounce(func, [wait=0], [options={}])
```

```js
/**
 * Creates a debounced function that delays invoking `func` until after `wait`
 * milliseconds have elapsed since the last time the debounced function was
 * invoked, or until the next browser frame is drawn. The debounced function
 * comes with a `cancel` method to cancel delayed `func` invocations and a
 * `flush` method to immediately invoke them. Provide `options` to indicate
 * whether `func` should be invoked on the leading and/or trailing edge of the
 * `wait` timeout. The `func` is invoked with the last arguments provided to the
 * debounced function. Subsequent calls to the debounced function return the
 * result of the last `func` invocation.
 *
 * **Note:** If `leading` and `trailing` options are `true`, `func` is
 * invoked on the trailing edge of the timeout only if the debounced function
 * is invoked more than once during the `wait` timeout.
 *
 * If `wait` is `0` and `leading` is `false`, `func` invocation is deferred
 * until the next tick, similar to `setTimeout` with a timeout of `0`.
 *
 * If `wait` is omitted in an environment with `requestAnimationFrame`, `func`
 * invocation will be deferred until the next frame is drawn (typically about
 * 16ms).
 *
 * See [David Corbacho's article](https://css-tricks.com/debouncing-throttling-explained-examples/)
 * for details over the differences between `debounce` and `throttle`.
 *
 * @since 0.1.0
 * @category Function
 * @param {Function} func The function to debounce.
 * @param {number} [wait=0]
 *  The number of milliseconds to delay; if omitted, `requestAnimationFrame` is
 *  used (if available).
 * @param {Object} [options={}] The options object.
 * @param {boolean} [options.leading=false]
 *  Specify invoking on the leading edge of the timeout.
 * @param {number} [options.maxWait]
 *  The maximum time `func` is allowed to be delayed before it's invoked.
 * @param {boolean} [options.trailing=true]
 *  Specify invoking on the trailing edge of the timeout.
 * @returns {Function} Returns the new debounced function.
 * @example
 *
 * // Avoid costly calculations while the window size is in flux.
 * jQuery(window).on('resize', debounce(calculateLayout, 150))
 *
 * // Invoke `sendMail` when clicked, debouncing subsequent calls.
 * jQuery(element).on('click', debounce(sendMail, 300, {
 *   'leading': true,
 *   'trailing': false
 * }))
 *
 * // Ensure `batchLog` is invoked once after 1 second of debounced calls.
 * const debounced = debounce(batchLog, 250, { 'maxWait': 1000 })
 * const source = new EventSource('/stream')
 * jQuery(source).on('message', debounced)
 *
 * // Cancel the trailing debounced invocation.
 * jQuery(window).on('popstate', debounced.cancel)
 *
 * // Check for pending invocations.
 * const status = debounced.pending() ? "Pending..." : "Ready"
 */
function debounce(func, wait, options) {
  let lastArgs,
    lastThis,
    maxWait,
    result,
    timerId,
    lastCallTime

  let lastInvokeTime = 0
  let leading = false
  let maxing = false
  let trailing = true

  // Bypass `requestAnimationFrame` by explicitly setting `wait=0`.
  const useRAF = (!wait && wait !== 0 && typeof root.requestAnimationFrame === 'function')

  if (typeof func != 'function') {
    throw new TypeError('Expected a function')
  }
  wait = +wait || 0
  if (isObject(options)) {
    leading = !!options.leading
    maxing = 'maxWait' in options
    maxWait = maxing ? Math.max(+options.maxWait || 0, wait) : maxWait
    trailing = 'trailing' in options ? !!options.trailing : trailing
  }

  function invokeFunc(time) {
    const args = lastArgs
    const thisArg = lastThis

    lastArgs = lastThis = undefined
    lastInvokeTime = time
    result = func.apply(thisArg, args)
    return result
  }

  function startTimer(pendingFunc, wait) {
    if (useRAF) {
      return root.requestAnimationFrame(pendingFunc)
    }
    return setTimeout(pendingFunc, wait)
  }

  function cancelTimer(id) {
    if (useRAF) {
      return root.cancelAnimationFrame(id)
    }
    clearTimeout(id)
  }

  function leadingEdge(time) {
    // Reset any `maxWait` timer.
    lastInvokeTime = time
    // Start the timer for the trailing edge.
    timerId = startTimer(timerExpired, wait)
    // Invoke the leading edge.
    return leading ? invokeFunc(time) : result
  }

  function remainingWait(time) {
    const timeSinceLastCall = time - lastCallTime
    const timeSinceLastInvoke = time - lastInvokeTime
    const timeWaiting = wait - timeSinceLastCall

    return maxing
      ? Math.min(timeWaiting, maxWait - timeSinceLastInvoke)
      : timeWaiting
  }

  function shouldInvoke(time) {
    const timeSinceLastCall = time - lastCallTime
    const timeSinceLastInvoke = time - lastInvokeTime

    // Either this is the first call, activity has stopped and we're at the
    // trailing edge, the system time has gone backwards and we're treating
    // it as the trailing edge, or we've hit the `maxWait` limit.
    return (lastCallTime === undefined || (timeSinceLastCall >= wait) ||
      (timeSinceLastCall < 0) || (maxing && timeSinceLastInvoke >= maxWait))
  }

  function timerExpired() {
    const time = Date.now()
    if (shouldInvoke(time)) {
      return trailingEdge(time)
    }
    // Restart the timer.
    timerId = startTimer(timerExpired, remainingWait(time))
  }

  function trailingEdge(time) {
    timerId = undefined

    // Only invoke if we have `lastArgs` which means `func` has been
    // debounced at least once.
    if (trailing && lastArgs) {
      return invokeFunc(time)
    }
    lastArgs = lastThis = undefined
    return result
  }

  function cancel() {
    if (timerId !== undefined) {
      cancelTimer(timerId)
    }
    lastInvokeTime = 0
    lastArgs = lastCallTime = lastThis = timerId = undefined
  }

  function flush() {
    return timerId === undefined ? result : trailingEdge(Date.now())
  }

  function pending() {
    return timerId !== undefined
  }

  function debounced(...args) {
    const time = Date.now()
    const isInvoking = shouldInvoke(time)

    lastArgs = args
    lastThis = this
    lastCallTime = time

    if (isInvoking) {
      if (timerId === undefined) {
        return leadingEdge(lastCallTime)
      }
      if (maxing) {
        // Handle invocations in a tight loop.
        timerId = startTimer(timerExpired, wait)
        return invokeFunc(lastCallTime)
      }
    }
    if (timerId === undefined) {
      timerId = startTimer(timerExpired, wait)
    }
    return result
  }
  debounced.cancel = cancel
  debounced.flush = flush
  debounced.pending = pending
  return debounced
}
```

`debounce` 函数接收 3 个参数，`func` 防抖函数、`wait` 延迟毫秒数、`options` 选项。

首先是申明一些初始变量，接收是判断当前环境是否支持 `requestAnimationFrame` 方法：

```js
const useRAF = (!wait && wait !== 0 && typeof root.requestAnimationFrame === 'function')
```

会在下面用到，如果不支持 `requestAnimationFrame` 方法，会以 `setTimeout` 方法向下兼容。

对参数的一些处理：

```js
if (typeof func != 'function') {
  throw new TypeError('Expected a function')
}
wait = +wait || 0
if (isObject(options)) {
  leading = !!options.leading
  maxing = 'maxWait' in options
  maxWait = maxing ? Math.max(+options.maxWait || 0, wait) : maxWait
  trailing = 'trailing' in options ? !!options.trailing : trailing
}
```

判断 `func` 是否为 `function`，不是就抛出异常，`wait` 默认为 0 ，如果 `options` 是一个对象，就从 `options` 中取出值赋值给上面申明的一些初始变量。

接下来都是一些函数的申明，暂且不看，我们来看最后的一段：

```js
debounced.cancel = cancel
debounced.flush = flush
debounced.pending = pending
return debounced
```

`debounce` 函数最后返回的是 `debounced` 函数，并且将 `cancel` 、`flush` 、`pending` 添加到 `debounced` 上，来看看 `debounced` 函数：

```js
function debounced(...args) {
  const time = Date.now()
  const isInvoking = shouldInvoke(time)

  lastArgs = args
  lastThis = this
  lastCallTime = time

  if (isInvoking) {
    if (timerId === undefined) {
      return leadingEdge(lastCallTime)
    }
    if (maxing) {
      // Handle invocations in a tight loop.
      timerId = startTimer(timerExpired, wait)
      return invokeFunc(lastCallTime)
    }
  }
  if (timerId === undefined) {
    timerId = startTimer(timerExpired, wait)
  }
  return result
}
```

`debounced` 函数内部会申明一个 `time` 变量保存初次调用的时间戳，接着是调用 `shouldInvoke` 函数，传入 `time` 变量，`shouldInvoke` 会返回一个布尔值，代表是否被调用：

```js
function shouldInvoke(time) {
  const timeSinceLastCall = time - lastCallTime
  const timeSinceLastInvoke = time - lastInvokeTime

  // Either this is the first call, activity has stopped and we're at the
  // trailing edge, the system time has gone backwards and we're treating
  // it as the trailing edge, or we've hit the `maxWait` limit.
  return (lastCallTime === undefined || (timeSinceLastCall >= wait) ||
    (timeSinceLastCall < 0) || (maxing && timeSinceLastInvoke >= maxWait))
}
```

此时 `lastCallTime` 只是申明了变量为 `undefined` ，所以 `timeSinceLastCall` 是 `NaN`，`timeSinceLastInvoke` 为 `time` 减去 `lastInvokeTime` ，初次调用时 `lastInvokeTime` 为 0 ，所以 `timeSinceLastInvoke` 等于 `time`，这里做了条件判断，当 `lastCallTime === undefined` 初次调用、`timeSinceLastCall >= wait` 上次触发时间大于等待时间、`timeSinceLastCall < 0` 上次触发时间小于 0、`maxing && timeSinceLastInvoke >= maxWait)` 有最大限制时间并且上次调用时间大于 `maxWait` 最大调用时间。

```js
lastArgs = args
lastThis = this
lastCallTime = time
```

对 `debounce` 函数初始变量进行赋值，`lastArgs` 当前参数、`lastThis` 当前 `this` 对象、`lastCallTime` 上次调用 `debounced` 的时间。

```js
if (isInvoking) {
  if (timerId === undefined) {
    return leadingEdge(lastCallTime)
  }
  if (maxing) {
    // Handle invocations in a tight loop.
    timerId = startTimer(timerExpired, wait)
    return invokeFunc(lastCallTime)
  }
}
```

如果 `isInvoking` 为真，这个有 2 个判断， 没有 `timerId` 说明是第一次调用，返回 `leadingEdge` 函数的调用结果:

```js
function leadingEdge(time) {
  // Reset any `maxWait` timer.
  lastInvokeTime = time
  // Start the timer for the trailing edge.
  timerId = startTimer(timerExpired, wait)
  // Invoke the leading edge.
  return leading ? invokeFunc(time) : result
}
```

`leadingEdge` 更新 `lastInvokeTime`，调用 `startTimer` 函数生成定时器函数：

```js
function startTimer(pendingFunc, wait) {
  if (useRAF) {
    return root.requestAnimationFrame(pendingFunc)
  }
  return setTimeout(pendingFunc, wait)
}
```

`startTimer` 主要用来进行定时器的降级处理，如果支持 `requestAnimationFrame` 函数，就返回 ``requestAnimationFrame`，不支持就返回 `setTimeout`。


接着返回了一个三元表达式，`leading` 是 `options` 配置的参数，返回 `invokeFunc(time)` 函数调用结果，否则返回 `result`。

```js
function invokeFunc(time) {
  const args = lastArgs
  const thisArg = lastThis

  lastArgs = lastThis = undefined
  lastInvokeTime = time
  result = func.apply(thisArg, args)
  return result
}
```

`invokeFunc` 函数接收一个 `time` 参数，申明变量保存调用参数、调用 `this`，然后清除 `lastArgs` 、 `lastThis`，更新 `lastInvokeTime`，最后使用 `apply` 将 `this` 指向 `thisArg`，传入 `args` 参数，使用
`result` 变量保存函数返回，最后 `return result` 。


如果有 `maxing` 说明 `options` 传入了 `maxWait` 最大限制时间，这里会调用 `startTimer` 函数生成定时器函数，然后返回 `invokeFunc` 函数，传入 `lastCallTime` 变量。

```js
if (timerId === undefined) {
  timerId = startTimer(timerExpired, wait)
}
```

不满足 `isInvoking` 的情况，`timerId` 等于 `undefined` 调用 `startTimer` 重设 `timerId`，
函数最后会返回 `result`。

```js
debounced.cancel = cancel
debounced.flush = flush
debounced.pending = pending
return debounced;
```

在 `debounced` 函数的最后，会将 `cancel` 、`flush` 添加到 `debounced` 函数的属性上，最后将 `debounced` 函数返回。

`cancel` 函数:

```js
function cancel() {
  if (timerId !== undefined) {
    cancelTimer(timerId)
  }
  lastInvokeTime = 0
  lastArgs = lastCallTime = lastThis = timerId = undefined
}
```

`cancel` 主要是为了取消 `debounce` 的调用，判断有 `timerId` 就使用 `cancelTimer` 消除定时器：

```js
function cancelTimer(id) {
  if (useRAF) {
    return root.cancelAnimationFrame(id)
  }
  clearTimeout(id)
}
```

也是对 `timer` 进行了降级处理，然后 `lastInvokeTime` 重置为 0，重置 `lastArgs` 、`lastCallTime` 、`lastThis` 、 `timerId` 变量。

`flush` 函数：

```js
function flush() {
  return timerId === undefined ? result : trailingEdge(Date.now())
}
```

如果 `timerId` 为 `undefined` 说明还没有首次调用，返回 `result`，否则调用 `trailingEdge` 函数，并且传入 `Date.now()` ：

`trailingEdge` 函数：

```js
function trailingEdge(time) {
  timerId = undefined

  // Only invoke if we have `lastArgs` which means `func` has been
  // debounced at least once.
  if (trailing && lastArgs) {
    return invokeFunc(time)
  }
  lastArgs = lastThis = undefined
  return result
}
```

重置 `timerId`，如果设置 `trailing` 超时后调用并且有 `lastArgs` 参数， 返回 `invokeFunc` 函数的调用，
然后重置 `lastArgs` 、`lastThis`，返回 `result`。


`pending` 函数：

```js
function pending() {
  return timerId !== undefined
}
```

根据 `timerId` 来判断是否正在 `pending`，返回布尔值。