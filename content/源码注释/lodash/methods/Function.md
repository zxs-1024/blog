## after

> 反向版 _.before。 这个方法创建一个新函数，当调用 N 次或者多次之后将触发 func 方法。

```js
_.after(n, func)
```

```js
/**
 * The opposite of `before`. This method creates a function that invokes
 * `func` once it's called `n` or more times.
 *
 * @since 0.1.0
 * @category Function
 * @param {number} n The number of calls before `func` is invoked.
 * @param {Function} func The function to restrict.
 * @returns {Function} Returns the new restricted function.
 * @example
 *
 * const saves = ['profile', 'settings']
 * const done = after(saves.length, () => console.log('done saving!'))
 *
 * forEach(saves, type => asyncSave({ 'type': type, 'complete': done }))
 * // => Logs 'done saving!' after the two async saves have completed.
 */
function after(n, func) {
  if (typeof func != 'function') {
    throw new TypeError('Expected a function')
  }
  return function(...args) {
    if (--n < 1) {
      return func.apply(this, args)
    }
  }
}
```

`after` 函数接收 2 个参数，`n` 调用 `func` 多少次执行、`func` 触发方法。

首先对 `func` 的类型判断，如果不是 `function` 抛出异常，然后 `return` 了一个 `function`。

调用 `after` 函数，返回的 `done` 函数:

```js
function(...args) {
  if (--n < 1) {}
    return func.apply(this, args)
  }
}
```

此时内部维持了一个对 `n` 变量的引用，产生了一个闭包，接下来第一次调用 `done`，此时的 `n` 为 2，不满足 `if` 判断，但是执行了 `--n` ，`n` 成了 1。

第二次调用 `done` 函数，`--n` 后就满足了条件，在 `function` 内部判断 `n` 小于 1 `return` 一个使用 `apply` 修正 `this` 指向的函数，返回了 `func.apply(this, args)`，调用 `apply` 后会改变 `this` 指向，并且执行。

## ary

> 创建一个最多接受 N 个参数，忽略多余参数的方法。

```js
_.ary(func, [n=func.length])
```

```js
/**
  * Creates a function that invokes `func`, with up to `n` arguments,
  * ignoring any additional arguments.
  *
  * @static
  * @memberOf _
  * @since 3.0.0
  * @category Function
  * @param {Function} func The function to cap arguments for.
  * @param {number} [n=func.length] The arity cap.
  * @param- {Object} [guard] Enables use as an iteratee for methods like `_.map`.
  * @returns {Function} Returns the new capped function.
  * @example
  *
  * _.map(['6', '8', '10'], _.ary(parseInt, 1));
  * // => [6, 8, 10]
  */
function ary(func, n, guard) {
  n = guard ? undefined : n;
  n = (func && n == null) ? func.length : n;
  return createWrap(func, WRAP_ARY_FLAG, undefined, undefined, undefined, undefined, n);
}
```

`ary` 函数接收 3 个参数，`func` 用于处理参数的函数、`n` 参数上线、`guard` 迭代器函数。

`ary` 函数首先会对 `n` 进行处理，如果有传入 `guard`，就将 `n` 赋值为 `undefined`，如果有传入 `func` 并且 `n == null` 就将 `func.length` 赋值给 `n`。

最后调用 `createWrap` 函数，返回函数调用返回的函数。

## createWrap

```js
/**
  * Creates a function that either curries or invokes `func` with optional
  * `this` binding and partially applied arguments.
  *
  * @private
  * @param {Function|string} func The function or method name to wrap.
  * @param {number} bitmask The bitmask flags.
  *    1 - `_.bind`
  *    2 - `_.bindKey`
  *    4 - `_.curry` or `_.curryRight` of a bound function
  *    8 - `_.curry`
  *   16 - `_.curryRight`
  *   32 - `_.partial`
  *   64 - `_.partialRight`
  *  128 - `_.rearg`
  *  256 - `_.ary`
  *  512 - `_.flip`
  * @param {*} [thisArg] The `this` binding of `func`.
  * @param {Array} [partials] The arguments to be partially applied.
  * @param {Array} [holders] The `partials` placeholder indexes.
  * @param {Array} [argPos] The argument positions of the new function.
  * @param {number} [ary] The arity cap of `func`.
  * @param {number} [arity] The arity of `func`.
  * @returns {Function} Returns the new wrapped function.
  */
function createWrap(func, bitmask, thisArg, partials, holders, argPos, ary, arity) {
  var isBindKey = bitmask & WRAP_BIND_KEY_FLAG;
  if (!isBindKey && typeof func != 'function') {
    throw new TypeError(FUNC_ERROR_TEXT);
  }
  var length = partials ? partials.length : 0;
  if (!length) {
    bitmask &= ~(WRAP_PARTIAL_FLAG | WRAP_PARTIAL_RIGHT_FLAG);
    partials = holders = undefined;
  }
  ary = ary === undefined ? ary : nativeMax(toInteger(ary), 0);
  arity = arity === undefined ? arity : toInteger(arity);
  length -= holders ? holders.length : 0;

  if (bitmask & WRAP_PARTIAL_RIGHT_FLAG) {
    var partialsRight = partials,
      holdersRight = holders;

    partials = holders = undefined;
  }
  var data = isBindKey ? undefined : getData(func);

  var newData = [
    func, bitmask, thisArg, partials, holders, partialsRight, holdersRight,
    argPos, ary, arity
  ];

  if (data) {
    mergeData(newData, data);
  }
  func = newData[0];
  bitmask = newData[1];
  thisArg = newData[2];
  partials = newData[3];
  holders = newData[4];
  arity = newData[9] = newData[9] === undefined
    ? (isBindKey ? 0 : func.length)
    : nativeMax(newData[9] - length, 0);

  if (!arity && bitmask & (WRAP_CURRY_FLAG | WRAP_CURRY_RIGHT_FLAG)) {
    bitmask &= ~(WRAP_CURRY_FLAG | WRAP_CURRY_RIGHT_FLAG);
  }
  if (!bitmask || bitmask == WRAP_BIND_FLAG) {
    var result = createBind(func, bitmask, thisArg);
  } else if (bitmask == WRAP_CURRY_FLAG || bitmask == WRAP_CURRY_RIGHT_FLAG) {
    result = createCurry(func, bitmask, arity);
  } else if ((bitmask == WRAP_PARTIAL_FLAG || bitmask == (WRAP_BIND_FLAG | WRAP_PARTIAL_FLAG)) && !holders.length) {
    result = createPartial(func, bitmask, thisArg, partials);
  } else {
    result = createHybrid.apply(undefined, newData);
  }
  var setter = data ? baseSetData : setData;
  return setWrapToString(setter(result, newData), func, bitmask);
}
```

## before

> 创建一个调用 func 的函数。 调用次数不超过 N 次。 之后再调用这个函数，将返回最后一个调用的结果。

```js
_.before(n, func)
```

```js
/**
 * Creates a function that invokes `func`, with the `this` binding and arguments
 * of the created function, while it's called less than `n` times. Subsequent
 * calls to the created function return the result of the last `func` invocation.
 *
 * @since 3.0.0
 * @category Function
 * @param {number} n The number of calls at which `func` is no longer invoked.
 * @param {Function} func The function to restrict.
 * @returns {Function} Returns the new restricted function.
 * @example
 *
 * jQuery(element).on('click', before(5, addContactToList))
 * // => Allows adding up to 4 contacts to the list.
 */
function before(n, func) {
  let result
  if (typeof func != 'function') {
    throw new TypeError('Expected a function')
  }
  return function(...args) {
    if (--n > 0) {
      result = func.apply(this, args)
    }
    if (n <= 1) {
      func = undefined
    }
    return result
  }
}
```

`before` 函数接收 2 个参数，`n` 调用 `func` 多少次执行、`func` 触发方法。

首先对 `func` 的类型判断，如果不是 `function` 抛出异常，然后 `return` 了一个 `function`。

调用 `before` 函数，返回的 `code` 函数:

```js
function(...args) {
  if (--n > 0) {
    result = func.apply(this, args)
  }
  if (n <= 1) {
    func = undefined
  }
  return result
}
```

此时内部维持了一个对 `n` 、 `result` 变量的引用，产生了一个闭包，接下来第一次调用 `code`，此时的 `n` 为 2，不满足 `if` 判断，但是执行了 `--n` ，`n` 成了 1，满足第一个 `if` 判断，将使用 `apply` 修正 `this` 指向的函数赋值给 `result` 变量，最后 `return result`。

随后满足第二个 `if` 判断，将 `func` 置为 `undefined`，第二次调用 `code` 函数，`--n` 为 0，不满足第一个 `if` 判断，此时不会返回函数，返回的是上次调用 `code` 的返回值 `result`。

## bind

> 创建一个函数 func，这个函数的 this 会被绑定在 thisArg。 并且任何附加在 _.bind 的参数会被传入到这个绑定函数上。 这个 _.bind.placeholder 的值，默认是以 _ 作为附加部分参数的占位符。 

```js
_.bind(func, thisArg, [partials])
```

```js
/**
  * Creates a function that invokes `func` with the `this` binding of `thisArg`
  * and `partials` prepended to the arguments it receives.
  *
  * The `_.bind.placeholder` value, which defaults to `_` in monolithic builds,
  * may be used as a placeholder for partially applied arguments.
  *
  * **Note:** Unlike native `Function#bind`, this method doesn't set the "length"
  * property of bound functions.
  *
  * @static
  * @memberOf _
  * @since 0.1.0
  * @category Function
  * @param {Function} func The function to bind.
  * @param {*} thisArg The `this` binding of `func`.
  * @param {...*} [partials] The arguments to be partially applied.
  * @returns {Function} Returns the new bound function.
  * @example
  *
  * function greet(greeting, punctuation) {
  *   return greeting + ' ' + this.user + punctuation;
  * }
  *
  * var object = { 'user': 'fred' };
  *
  * var bound = _.bind(greet, object, 'hi');
  * bound('!');
  * // => 'hi fred!'
  *
  * // Bound with placeholders.
  * var bound = _.bind(greet, object, _, '!');
  * bound('hi');
  * // => 'hi fred!'
  */
var bind = baseRest(function (func, thisArg, partials) {
  var bitmask = WRAP_BIND_FLAG;
  if (partials.length) {
    var holders = replaceHolders(partials, getHolder(bind));
    bitmask |= WRAP_PARTIAL_FLAG;
  }
  return createWrap(func, bitmask, thisArg, partials, holders);
});
```

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

## defer

> 延迟调用 func 直到当前堆栈清理完毕。 任何附加的参数会传入到 func。

```js
_.defer(func, [args])
```

```js
/**
 * Defers invoking the `func` until the current call stack has cleared. Any
 * additional arguments are provided to `func` when it's invoked.
 *
 * @since 0.1.0
 * @category Function
 * @param {Function} func The function to defer.
 * @param {...*} [args] The arguments to invoke `func` with.
 * @returns {number} Returns the timer id.
 * @example
 *
 * defer(text => console.log(text), 'deferred')
 * // => Logs 'deferred' after one millisecond.
 */
function defer(func, ...args) {
  if (typeof func != 'function') {
    throw new TypeError('Expected a function')
  }
  return setTimeout(func, 1, ...args)
}
```

`defer` 函数接收 2 个参数，`func` 延迟函数、`args` 延迟函数调用参数。

判断如果 `func` 不是 `function` 就抛出异常，接着返回 `setTimeout` 函数，传入 `func` 延迟函数，延迟 `1ms`，`args` 延迟函数调用参数，`func` 延迟函数会在下一次事件循环完成后执行。

## delay

> 延迟 wait 毫秒后调用 func。 任何附加的参数会传入到 func。

```js
_.delay(func, wait, [args])
```

```js
/**
 * Invokes `func` after `wait` milliseconds. Any additional arguments are
 * provided to `func` when it's invoked.
 *
 * @since 0.1.0
 * @category Function
 * @param {Function} func The function to delay.
 * @param {number} wait The number of milliseconds to delay invocation.
 * @param {...*} [args] The arguments to invoke `func` with.
 * @returns {number} Returns the timer id.
 * @example
 *
 * delay(text => console.log(text), 1000, 'later')
 * // => Logs 'later' after one second.
 */
function delay(func, wait, ...args) {
  if (typeof func != 'function') {
    throw new TypeError('Expected a function')
  }
  return setTimeout(func, +wait || 0, ...args)
}
```

`delay` 函数接收 3 个参数，`func` 延迟函数、`wait` 延迟时间、`args` 延迟函数调用参数。

判断如果 `func` 不是 `function` 就抛出异常，接着返回 `setTimeout` 函数，传入 `func` 延迟函数，延迟 时间 `wait` 默认为 0，`args` 延迟函数调用参数，`func` 延迟函数会在 `wait` 时间后执行。

## flip

> 创建一个翻转接收参数的 func 函数。

```js
_.flip(func)
```

```js
/**
 * Creates a function that invokes `func` with arguments reversed.
 *
 * @since 4.0.0
 * @category Function
 * @param {Function} func The function to flip arguments for.
 * @returns {Function} Returns the new flipped function.
 * @see reverse
 * @example
 *
 * const flipped = flip((...args) => args)
 *
 * flipped('a', 'b', 'c', 'd')
 * // => ['d', 'c', 'b', 'a']
 */
function flip(func) {
  if (typeof func != 'function') {
    throw new TypeError('Expected a function')
  }
  return function(...args) {
    return func.apply(this, args.reverse())
  }
}
```

`flip` 函数会返回一个 `function`，`function` 内部又返回了一个使用 `apply` 调用的 `func`，内部传入的参数使用 `reverse` 方法进行了反转。

## memoize

> 创建一个会缓存 func 结果的函数。 如果提供了 resolver，就用 resolver 的返回值作为 key 缓存函数的结果。 默认情况下用第一个参数作为缓存的 key。 func 在调用时 this 会绑定在缓存函数上。

```js
_.memoize(func, [resolver])
```

```js
/**
 * Creates a function that memoizes the result of `func`. If `resolver` is
 * provided, it determines the cache key for storing the result based on the
 * arguments provided to the memoized function. By default, the first argument
 * provided to the memoized function is used as the map cache key. The `func`
 * is invoked with the `this` binding of the memoized function.
 *
 * **Note:** The cache is exposed as the `cache` property on the memoized
 * function. Its creation may be customized by replacing the `memoize.Cache`
 * constructor with one whose instances implement the
 * [`Map`](http://ecma-international.org/ecma-262/7.0/#sec-properties-of-the-map-prototype-object)
 * method interface of `clear`, `delete`, `get`, `has`, and `set`.
 *
 * @since 0.1.0
 * @category Function
 * @param {Function} func The function to have its output memoized.
 * @param {Function} [resolver] The function to resolve the cache key.
 * @returns {Function} Returns the new memoized function.
 * @example
 *
 * const object = { 'a': 1, 'b': 2 }
 * const other = { 'c': 3, 'd': 4 }
 *
 * const values = memoize(values)
 * values(object)
 * // => [1, 2]
 *
 * values(other)
 * // => [3, 4]
 *
 * object.a = 2
 * values(object)
 * // => [1, 2]
 *
 * // Modify the result cache.
 * values.cache.set(object, ['a', 'b'])
 * values(object)
 * // => ['a', 'b']
 *
 * // Replace `memoize.Cache`.
 * memoize.Cache = WeakMap
 */
function memoize(func, resolver) {
  if (typeof func != 'function' || (resolver != null && typeof resolver != 'function')) {
    throw new TypeError('Expected a function')
  }
  const memoized = function(...args) {
    const key = resolver ? resolver.apply(this, args) : args[0]
    const cache = memoized.cache

    if (cache.has(key)) {
      return cache.get(key)
    }
    const result = func.apply(this, args)
    memoized.cache = cache.set(key, result) || cache
    return result
  }
  memoized.cache = new (memoize.Cache || MapCache)
  return memoized
}

memoize.Cache = MapCache
```

`memoize` 接收 2 个参数，`func` 需要缓存的函数、`resolver` 解析缓存 `key` 的函数。

函数开始是一个类型的 `func` 、`resolver` 的非空和类型判断，接着申明 `memoized` 函数：

```js
const memoized = function(...args) {
  const key = resolver ? resolver.apply(this, args) : args[0]
  const cache = memoized.cache

  if (cache.has(key)) {
    return cache.get(key)
  }
  const result = func.apply(this, args)
  memoized.cache = cache.set(key, result) || cache
  return result
}
```

`memoized` 函数内中首先申明 `resolver` 函数处理后的 `key`、函数的缓存对象 `cache`，接着调用 `has` 方法判断缓存中如果有这个 `key` 值，调用 `cache` 的 `get` 返回对象的 `value`。

如果缓存中没有 `key` 值，申明 `result` 变量保存使用 `apply` 调用的 `func` 函数的结果，然后为 `memoized` 的 `cache` 初始化缓存方法，最后返回 `result`。

```js
function memoize(func, resolver) {
  ...
  memoized.cache = new (memoize.Cache || MapCache)
  return memoized
}
```

`memoize` 函数的最后会为 `memoized` 添加 `cache` 属性，是 `memoize.Cache` 或者 `MapCache` 的实例，最后将 `memoized` 返回。

## negate

> 创建一个对 func 结果取反的函数。 用 predicate 对 func 检查的时候，this 绑定到创建的函数，并传入对应参数。

```js
_.negate(predicate)
```

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

`negate` 首先会函数类型判断，如果 `predicate` 不是函数就抛出异常。

`predicate` 函数最后返回一个 `function`，此函数会调用 `apply` 方法进行函数调用和 `this` 绑定，使用 `!` 取非，返回一个相反的结果。

## once

> 创建一个只能调用一次的函数。 重复调用返回第一次调用的结果。 func 调用时，this 绑定到创建的函数，并传入对应参数。

```js
_.once(func)
```

```js
/**
 * Creates a function that is restricted to invoking `func` once. Repeat calls
 * to the function return the value of the first invocation. The `func` is
 * invoked with the `this` binding and arguments of the created function.
 *
 * @since 0.1.0
 * @category Function
 * @param {Function} func The function to restrict.
 * @returns {Function} Returns the new restricted function.
 * @example
 *
 * const initialize = once(createApplication)
 * initialize()
 * initialize()
 * // => `createApplication` is invoked once
 */
function once(func) {
  return before(2, func)
}
```

`once` 函数是对 `before` 函数的包装，第一个参数为 2，代表调用次数不超过 2 次。

## overArgs

> 创建一个函数，调用时 func 参数会先一对一的改变。

```js
_.overArgs(func, [transforms=[_.identity]])
```

```js

/**
 * Creates a function that invokes `func` with its arguments transformed.
 *
 * @since 4.0.0
 * @category Function
 * @param {Function} func The function to wrap.
 * @param {Function[]} [transforms=[identity]]
 *  The argument transforms.
 * @returns {Function} Returns the new function.
 * @example
 *
 * function doubled(n) {
 *   return n * 2
 * }
 *
 * function square(n) {
 *   return n * n
 * }
 *
 * const func = overArgs((x, y) => [x, y], [square, doubled])
 *
 * func(9, 3)
 * // => [81, 6]
 *
 * func(10, 5)
 * // => [100, 10]
 */
function overArgs(func, transforms) {
  const funcsLength = transforms.length
  return function(...args) {
    let index = -1
    const length = Math.min(args.length, funcsLength)
    while (++index < length) {
      args[index] = transforms[index].call(this, args[index])
    }
    return func.apply(this, args)
  }
}
```

`overArgs` 接收 2 个参数，`func` 要包裹的函数、`transforms` 转换函数。

首先会申明 `funcsLength` 变量保存 `transforms` 的 `length`，然后会返回一个 `function`，也就是

```js
const func = overArgs((x, y) => [x, y], [square, doubled])
```

此时这个 `function` 就是这样：

```js
function(...args) {
  let index = -1
  const length = Math.min(args.length, funcsLength)
  while (++index < length) {
    args[index] = transforms[index].call(this, args[index])
  }
  return func.apply(this, args)
}
```

申明 `index` 变量为 -1、`length` 为 `args.length` 与 `funcsLength` 最小值，
接着进行 `while` 循环，`index` 累加，这里会对 `args[index]` 进行赋值，赋值为 `transforms` 对应的第 `index` 个转换函数，
循环结束后，将用 `apply` 调用 `func` 函数的结果返回。

## partial

> 创建一个函数。 该函数调用 func，并传入预设的参数。 这个方法类似 _.bind，除了它不会绑定 this。 这个 _.partial.placeholder 的值，默认是以 _ 作为附加部分参数的占位符。 

```js
_.partial(func, [partials])
```

```js
/**
 * Creates a function that invokes `func` with `partials` prepended to the
 * arguments it receives. This method is like `_.bind` except it does **not**
 * alter the `this` binding.
 *
 * The `_.partial.placeholder` value, which defaults to `_` in monolithic
 * builds, may be used as a placeholder for partially applied arguments.
 *
 * **Note:** This method doesn't set the "length" property of partially
 * applied functions.
 *
 * @static
 * @memberOf _
 * @since 0.2.0
 * @category Function
 * @param {Function} func The function to partially apply arguments to.
 * @param {...*} [partials] The arguments to be partially applied.
 * @returns {Function} Returns the new partially applied function.
 * @example
 *
 * function greet(greeting, name) {
 *   return greeting + ' ' + name;
 * }
 *
 * var sayHelloTo = _.partial(greet, 'hello');
 * sayHelloTo('fred');
 * // => 'hello fred'
 *
 * // Partially applied with placeholders.
 * var greetFred = _.partial(greet, _, 'fred');
 * greetFred('hi');
 * // => 'hi fred'
 */
var partial = baseRest(function (func, partials) {
  var holders = replaceHolders(partials, getHolder(partial));
  return createWrap(func, WRAP_PARTIAL_FLAG, undefined, partials, holders);
});
```


`partial` 函数是调用 `baseRest` 后返回的函数，并且传入了回调函数。

```js
function (func, partials) {
  var holders = replaceHolders(partials, getHolder(partial));
  return createWrap(func, WRAP_PARTIAL_FLAG, undefined, partials, holders);
}
```

在回调函数中会调用 `replaceHolders` 函数获取 `holders`，然后返回 `createWrap` 函数调用。

## rearg

> 创建一个调用 func 的函数。 所传递的参数根据 indexes 调整到对应位置。 第一个 index 对应到第一个传参，第二个 index 对应到第二个传参，以此类推。

```js
_.rearg(func, indexes)
```

```js
  /**
   * Creates a function that invokes `func` with arguments arranged according
   * to the specified `indexes` where the argument value at the first index is
   * provided as the first argument, the argument value at the second index is
   * provided as the second argument, and so on.
   *
   * @static
   * @memberOf _
   * @since 3.0.0
   * @category Function
   * @param {Function} func The function to rearrange arguments for.
   * @param {...(number|number[])} indexes The arranged argument indexes.
   * @returns {Function} Returns the new function.
   * @example
   *
   * var rearged = _.rearg(function(a, b, c) {
   *   return [a, b, c];
   * }, [2, 0, 1]);
   *
   * rearged('b', 'c', 'a')
   * // => ['a', 'b', 'c']
   */
  var rearg = flatRest(function (func, indexes) {
    return createWrap(func, WRAP_REARG_FLAG, undefined, undefined, undefined, indexes);
  });
```

`rearg` 函数是调用 `flatRest` 后返回的函数，调用 `flatRest` 函数时传入了一个回调函数，在回调函数中会返回调用 `createWrap` 函数后的返回值。

## rest

> 创建一个调用 func 的函数。 this 绑定到这个函数 并且 从 start 之后的参数都作为数组传入。 

```js
_.rest(func, [start=func.length-1])
```

```js
/**
 * Creates a function that invokes `func` with the `this` binding of the
 * created function and arguments from `start` and beyond provided as
 * an array.
 *
 * **Note:** This method is based on the
 * [rest parameter](https://mdn.io/rest_parameters).
 *
 * @static
 * @memberOf _
 * @since 4.0.0
 * @category Function
 * @param {Function} func The function to apply a rest parameter to.
 * @param {number} [start=func.length-1] The start position of the rest parameter.
 * @returns {Function} Returns the new function.
 * @example
 *
 * var say = _.rest(function(what, names) {
 *   return what + ' ' + _.initial(names).join(', ') +
 *     (_.size(names) > 1 ? ', & ' : '') + _.last(names);
 * });
 *
 * say('hello', 'fred', 'barney', 'pebbles');
 * // => 'hello fred, barney, & pebbles'
 */
function rest(func, start) {
  if (typeof func != 'function') {
    throw new TypeError(FUNC_ERROR_TEXT);
  }
  start = start === undefined ? start : toInteger(start);
  return baseRest(func, start);
}
```

`rest` 函数接收 2 个参数，`func` 要处理的函数、`start` 参数开始位置。

调用 `toInteger` 函数对 `start` 取整，然后返回 `baseRest` 的调用结果。

## baseRest

```js
/**
 * The base implementation of `_.rest` which doesn't validate or coerce arguments.
 *
 * @private
 * @param {Function} func The function to apply a rest parameter to.
 * @param {number} [start=func.length-1] The start position of the rest parameter.
 * @returns {Function} Returns the new function.
 */
function baseRest(func, start) {
  return setToString(overRest(func, start, identity), func + '');
}
```

`baseRest` 返回一个调用 `setToString` 后的返回值。

## setToString

```js
/**
 * Sets the `toString` method of `func` to return `string`.
 *
 * @private
 * @param {Function} func The function to modify.
 * @param {Function} string The `toString` result.
 * @returns {Function} Returns `func`.
 */
function setToString(func, string) {
  return Object.defineProperty(func, 'toString', {
    'configurable': true,
    'enumerable': false,
    'value': () => string,
    'writable': true
  })
}
```

`setToString` 方法是调用 `defineProperty` 方法为 `func` 的原型拦截了 `toString` 方法，设置为传入的 `string`。

## overRest

```js
/**
 * A specialized version of `baseRest` which transforms the rest array.
 *
 * @private
 * @param {Function} func The function to apply a rest parameter to.
 * @param {number} [start=func.length-1] The start position of the rest parameter.
 * @param {Function} transform The rest array transform.
 * @returns {Function} Returns the new function.
 */
function overRest(func, start, transform) {
  start = nativeMax(start === undefined ? (func.length - 1) : start, 0);
  return function () {
    var args = arguments,
      index = -1,
      length = nativeMax(args.length - start, 0),
      array = Array(length);

    while (++index < length) {
      array[index] = args[start + index];
    }
    index = -1;
    var otherArgs = Array(start + 1);
    while (++index < start) {
      otherArgs[index] = args[index];
    }
    otherArgs[start] = transform(array);
    return apply(func, this, otherArgs);
  };
}
```

`overRest` 接收 3 个参数， `func` 重置参数的函数、`start` 参数起始位置、`transform` 剩余数组转换。

通过 `nativeMax` 也就是 `Math.max`，得到 `start` ，
然后会返回一个 `function`，函数内部会进行 2 个 `while` 循环，第一个 `while` 会将 `start` 之后的参数保存到 `array`，然后将 `start` 之前的参数保存到 `otherArgs`，最后返回 `apply` 函数的调用结果。


```js
/**
 * A faster alternative to `Function#apply`, this function invokes `func`
 * with the `this` binding of `thisArg` and the arguments of `args`.
 *
 * @private
 * @param {Function} func The function to invoke.
 * @param {*} thisArg The `this` binding of `func`.
 * @param {Array} args The arguments to invoke `func` with.
 * @returns {*} Returns the result of `func`.
 */
function apply(func, thisArg, args) {
  switch (args.length) {
    case 0: return func.call(thisArg);
    case 1: return func.call(thisArg, args[0]);
    case 2: return func.call(thisArg, args[0], args[1]);
    case 3: return func.call(thisArg, args[0], args[1], args[2]);
  }
  return func.apply(thisArg, args);
}
```

`apply` 内部也是基原生的 `apply` 方法实现。

## spread

> 创建一个调用 func 的函数。 this 绑定到这个函数上。 把参数作为数组传入，类似于 Function#apply 

```js
_.spread(func, [start=0])
```

```js
/**
 * Creates a function that invokes `func` with the `this` binding of the
 * create function and an array of arguments much like
 * [`Function#apply`](http://www.ecma-international.org/ecma-262/7.0/#sec-function.prototype.apply).
 *
 * **Note:** This method is based on the
 * [spread operator](https://mdn.io/spread_operator).
 *
 * @static
 * @memberOf _
 * @since 3.2.0
 * @category Function
 * @param {Function} func The function to spread arguments over.
 * @param {number} [start=0] The start position of the spread.
 * @returns {Function} Returns the new function.
 * @example
 *
 * var say = _.spread(function(who, what) {
 *   return who + ' says ' + what;
 * });
 *
 * say(['fred', 'hello']);
 * // => 'fred says hello'
 *
 * var numbers = Promise.all([
 *   Promise.resolve(40),
 *   Promise.resolve(36)
 * ]);
 *
 * numbers.then(_.spread(function(x, y) {
 *   return x + y;
 * }));
 * // => a Promise of 76
 */
function spread(func, start) {
  if (typeof func != 'function') {
    throw new TypeError(FUNC_ERROR_TEXT);
  }
  start = start == null ? 0 : nativeMax(toInteger(start), 0);
  return baseRest(function (args) {
    var array = args[start],
      otherArgs = castSlice(args, 0, start);

    if (array) {
      arrayPush(otherArgs, array);
    }
    return apply(func, this, otherArgs);
  });
}
```

`spread` 接收 2 个参数，`func` 包装函数、`start` 开始位置。

进行 `func` 类型盘点，如果不是 `function`，抛出异常，接着是对 `start` 变量的处理，调用 `nativeMax` 方法取 `start` 和 0 的最大值，默认为 0。

`spread` 函数最后会返回调用 `baseRest` 函数后的返回函数，
在传入 `baseRest` 的回调函数中，申明 `array` 取到第 `start` 个参数，`otherArgs` 取到剩余参数，最后调用 `apply` 返回，并且将 `otherArgs` 参数传入。

## castSlice

```js
/**
 * Casts `array` to a slice if it's needed.
 *
 * @private
 * @param {Array} array The array to inspect.
 * @param {number} start The start position.
 * @param {number} [end=array.length] The end position.
 * @returns {Array} Returns the cast slice.
 */
function castSlice(array, start, end) {
  var length = array.length;
  end = end === undefined ? length : end;
  return (!start && end >= length) ? array : baseSlice(array, start, end);
}
```

函数会对传入 `end` 进行处理，然后调用 `baseSlice` 返回切割数组。

## baseSlice

```js
/**
 * The base implementation of `_.slice` without an iteratee call guard.
 *
 * @private
 * @param {Array} array The array to slice.
 * @param {number} [start=0] The start position.
 * @param {number} [end=array.length] The end position.
 * @returns {Array} Returns the slice of `array`.
 */
function baseSlice(array, start, end) {
  var index = -1,
    length = array.length;

  if (start < 0) {
    start = -start > length ? 0 : (length + start);
  }
  end = end > length ? length : end;
  if (end < 0) {
    end += length;
  }
  length = start > end ? 0 : ((end - start) >>> 0);
  start >>>= 0;

  var result = Array(length);
  while (++index < length) {
    result[index] = array[index + start];
  }
  return result;
}
```

见 `Array` 的 `slice` 方法。

## throttle

> 创建一个节流函数，在 wait 秒内最多执行 func 一次的函数。

```js
_.throttle(func, [wait=0], [options={}])
```

```js
/**
 * Creates a throttled function that only invokes `func` at most once per
 * every `wait` milliseconds (or once per browser frame). The throttled function
 * comes with a `cancel` method to cancel delayed `func` invocations and a
 * `flush` method to immediately invoke them. Provide `options` to indicate
 * whether `func` should be invoked on the leading and/or trailing edge of the
 * `wait` timeout. The `func` is invoked with the last arguments provided to the
 * throttled function. Subsequent calls to the throttled function return the
 * result of the last `func` invocation.
 *
 * **Note:** If `leading` and `trailing` options are `true`, `func` is
 * invoked on the trailing edge of the timeout only if the throttled function
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
 * for details over the differences between `throttle` and `debounce`.
 *
 * @since 0.1.0
 * @category Function
 * @param {Function} func The function to throttle.
 * @param {number} [wait=0]
 *  The number of milliseconds to throttle invocations to; if omitted,
 *  `requestAnimationFrame` is used (if available).
 * @param {Object} [options={}] The options object.
 * @param {boolean} [options.leading=true]
 *  Specify invoking on the leading edge of the timeout.
 * @param {boolean} [options.trailing=true]
 *  Specify invoking on the trailing edge of the timeout.
 * @returns {Function} Returns the new throttled function.
 * @example
 *
 * // Avoid excessively updating the position while scrolling.
 * jQuery(window).on('scroll', throttle(updatePosition, 100))
 *
 * // Invoke `renewToken` when the click event is fired, but not more than once every 5 minutes.
 * const throttled = throttle(renewToken, 300000, { 'trailing': false })
 * jQuery(element).on('click', throttled)
 *
 * // Cancel the trailing throttled invocation.
 * jQuery(window).on('popstate', throttled.cancel)
 */
function throttle(func, wait, options) {
  let leading = true
  let trailing = true

  if (typeof func != 'function') {
    throw new TypeError('Expected a function')
  }
  if (isObject(options)) {
    leading = 'leading' in options ? !!options.leading : leading
    trailing = 'trailing' in options ? !!options.trailing : trailing
  }
  return debounce(func, wait, {
    'leading': leading,
    'maxWait': wait,
    'trailing': trailing
  })

```

`throttle` 函数也是 `debounce` 函数的封装，传入了 `leading` 、 `maxWait`、`trailing`。

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

在 `debounce` 函数中如果 `leading` 为真，则会直接调用 `invokeFunc`，`invokeFunc` 会调用 `func` 回调函数，而有 `maxWait` 则会符合 `shouldInvoke` 判断条件，每次 `maxWait` 间隔时间都会调用一次 `func` 回调函数。

## unary

> 创建一个最多接受一个参数的函数，忽略多余的参数。

```js
_.unary(func)
```

```js
/**
  * Creates a function that accepts up to one argument, ignoring any
  * additional arguments.
  *
  * @static
  * @memberOf _
  * @since 4.0.0
  * @category Function
  * @param {Function} func The function to cap arguments for.
  * @returns {Function} Returns the new capped function.
  * @example
  *
  * _.map(['6', '8', '10'], _.unary(parseInt));
  * // => [6, 8, 10]
  */
function unary(func) {
  return ary(func, 1);
}
```

`unary` 函数会返回一个经过 `ary` 函数处理后的函数，并传入了参数 1，返回最多接受 1 个参数的函数。

## ary

```js
/**
  * Creates a function that invokes `func`, with up to `n` arguments,
  * ignoring any additional arguments.
  *
  * @static
  * @memberOf _
  * @since 3.0.0
  * @category Function
  * @param {Function} func The function to cap arguments for.
  * @param {number} [n=func.length] The arity cap.
  * @param- {Object} [guard] Enables use as an iteratee for methods like `_.map`.
  * @returns {Function} Returns the new capped function.
  * @example
  *
  * _.map(['6', '8', '10'], _.ary(parseInt, 1));
  * // => [6, 8, 10]
  */
function ary(func, n, guard) {
  n = guard ? undefined : n;
  n = (func && n == null) ? func.length : n;
  return createWrap(func, WRAP_ARY_FLAG, undefined, undefined, undefined, undefined, n);
}
```

`ary` 函数接收 3 个参数，`func` 用于处理参数的函数、`n` 参数上线、`guard` 迭代器函数。

`ary` 函数首先会对 `n` 进行处理，如果有传入 `guard`，就将 `n` 赋值为 `undefined`，如果有传入 `func` 并且 `n == null` 就将 `func.length` 赋值给 `n`。

最后调用 `createWrap` 函数，返回函数调用返回的函数。

## wrap

> 创建一个函数。提供的 value 包装在 wrapper 函数的第一个参数里。 任何附加的参数都提供给 wrapper 函数。 被调用时 this 绑定在创建的函数上。

```js
_.wrap(value, [wrapper=identity])
```

```js
 /**
  * Creates a function that provides `value` to `wrapper` as its first
  * argument. Any additional arguments provided to the function are appended
  * to those provided to the `wrapper`. The wrapper is invoked with the `this`
  * binding of the created function.
  *
  * @static
  * @memberOf _
  * @since 0.1.0
  * @category Function
  * @param {*} value The value to wrap.
  * @param {Function} [wrapper=identity] The wrapper function.
  * @returns {Function} Returns the new function.
  * @example
  *
  * var p = _.wrap(_.escape, function(func, text) {
  *   return '<p>' + func(text) + '</p>';
  * });
  *
  * p('fred, barney, & pebbles');
  * // => '<p>fred, barney, &amp; pebbles</p>'
  */
function wrap(value, wrapper) {
  return partial(castFunction(wrapper), value);
}
```

`wrap` 函数接收 2 个参数，要包装的值、`wrapper` 包装函数。

函数内部其实是调用 `partial` 函数后的返回，调用 `partial` 函数是传入经过 `castFunction` 函数处理的 `wrapper` 包装函数。

```js
function castFunction(value) {
  return typeof value == 'function' ? value : identity;
}
```

`castFunction` 函数内部会判断 `value` 类型，如果不是 `function`，返回 `identity` 函数。

```js
function identity(value) {
  return value;
}
```

`identity` 函数其实就是返回传入参数的函数。

## partial

```js
/**
  * Creates a function that invokes `func` with `partials` prepended to the
  * arguments it receives. This method is like `_.bind` except it does **not**
  * alter the `this` binding.
  *
  * The `_.partial.placeholder` value, which defaults to `_` in monolithic
  * builds, may be used as a placeholder for partially applied arguments.
  *
  * **Note:** This method doesn't set the "length" property of partially
  * applied functions.
  *
  * @static
  * @memberOf _
  * @since 0.2.0
  * @category Function
  * @param {Function} func The function to partially apply arguments to.
  * @param {...*} [partials] The arguments to be partially applied.
  * @returns {Function} Returns the new partially applied function.
  * @example
  *
  * function greet(greeting, name) {
  *   return greeting + ' ' + name;
  * }
  *
  * var sayHelloTo = _.partial(greet, 'hello');
  * sayHelloTo('fred');
  * // => 'hello fred'
  *
  * // Partially applied with placeholders.
  * var greetFred = _.partial(greet, _, 'fred');
  * greetFred('hi');
  * // => 'hi fred'
  */
var partial = baseRest(function (func, partials) {
  var holders = replaceHolders(partials, getHolder(partial));
  return createWrap(func, WRAP_PARTIAL_FLAG, undefined, partials, holders);
});
```