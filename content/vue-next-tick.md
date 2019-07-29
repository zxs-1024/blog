# vue nextTick 源码浅析

在下次 DOM 更新循环结束之后执行延迟回调。在修改数据之后立即使用这个方法，获取更新后的 DOM。

## \$nextTick 函数的注册

在 renderMixin 函数中我们会为 Vue.prototype 添加 \$nextTick 方法，在 core/instance/render.js 文件中：

```js
export function renderMixin(Vue: Class<Component>) {
  ...
  Vue.prototype.$nextTick = function(fn: Function) {
    return nextTick(fn, this)
  }
  ...
}
```

在 \$nextTick 方法中会返回 nextTick 函数的调用，并且在调用时传入了 fn 回调函数和 this，也就是 vue 实例。

## nextTick 函数

nextTick 函数申明在 src/core/util/next-tick.js 文件：

```js
export function nextTick(cb?: Function, ctx?: Object) {
  let _resolve
  callbacks.push(() => {
    if (cb) {
      try {
        cb.call(ctx)
      } catch (e) {
        handleError(e, ctx, 'nextTick')
      }
    } else if (_resolve) {
      _resolve(ctx)
    }
  })
  if (!pending) {
    pending = true
    if (useMacroTask) {
      macroTimerFunc()
    } else {
      microTimerFunc()
    }
  }
  // $flow-disable-line
  if (!cb && typeof Promise !== 'undefined') {
    return new Promise(resolve => {
      _resolve = resolve
    })
  }
}
```

nextTick 函数接收两个参数，cb 回调函数、ctx 上下文环境，在 \$nextTick 中传入的是 vue 实例。

nextTick 函数首先会申明 \_resolve 变量，如果当前环境支持 Promise，会将 resolve 赋值给 \_resolve 变量。

```js
callbacks.push(() => {
  if (cb) {
    try {
      cb.call(ctx)
    } catch (e) {
      handleError(e, ctx, 'nextTick')
    }
  } else if (_resolve) {
    _resolve(ctx)
  }
})
```

每一次调用 nextTick 函数，都会往 callbacks 中 push 函数，在函数中会判断 cb 是否为真，如果为真也就是传入了回调函数，会尝试将调用 call 将 cb 的 this 指向传入的 ctx 上下文环境，如果报错，就调用 handleError 函数抛出异常。

如果 \_resolve 为真，调用 \_resolve 函数，并且将 ctx 传入。

我们接着往下看：

```js
if (!pending) {
  pending = true
  if (useMacroTask) {
    macroTimerFunc()
  } else {
    microTimerFunc()
  }
}
```

如果 !pending 为真，也就是当前并没有在进行 nextTick 更新，将 pending 赋值为 true，说明正在进行 nextTick 更新。这里会判断 useMacroTask 是否为真，这个 useMacroTask 是什么呢？

```js
// Here we have async deferring wrappers using both microtasks and (macro) tasks.
// In < 2.4 we used microtasks everywhere, but there are some scenarios where
// microtasks have too high a priority and fire in between supposedly
// sequential events (e.g. #4521, #6690) or even between bubbling of the same
// event (#6566). However, using (macro) tasks everywhere also has subtle problems
// when state is changed right before repaint (e.g. #6813, out-in transitions).
// Here we use microtask by default, but expose a way to force (macro) task when
// needed (e.g. in event handlers attached by v-on).
let microTimerFunc
let macroTimerFunc
let useMacroTask = false
```

useMacroTask 是在 next-tick.js 开头申明的变量，默认为 false，这里作者给出了详细的注释。

> 在 Vue 2.4 之前都是使用的 microtasks，但是 microtasks 的优先级过高，在某些情况下可能会出现比事件冒泡更快的情况，但如果都使用 macrotasks 又可能会出现渲染的性能问题。所以在新版本中，会默认使用 microtasks，但在特殊情况下会使用 macrotasks，比如 v-on。

useMacroTask 默认为 false，这里会走 else 循环，优先调用 microTimerFunc 函数。

我们来看看 microTimerFunc 函数：

```js
// Determine microtask defer implementation.
/* istanbul ignore next, $flow-disable-line */
if (typeof Promise !== 'undefined' && isNative(Promise)) {
  const p = Promise.resolve()
  microTimerFunc = () => {
    p.then(flushCallbacks)
    // in problematic UIWebViews, Promise.then doesn't completely break, but
    // it can get stuck in a weird state where callbacks are pushed into the
    // microtask queue but the queue isn't being flushed, until the browser
    // needs to do some other work, e.g. handle a timer. Therefore we can
    // "force" the microtask queue to be flushed by adding an empty timer.
    if (isIOS) setTimeout(noop)
  }
} else {
  // fallback to macro
  microTimerFunc = macroTimerFunc
}
```

microTimerFunc 变量会在 next-tick.js 开头申明，默认为 undefined。

这里会判断调用 typeof 判断 Promise 的类型是否是 undefined，并且调用 isNative 判断 Promise 是否是原生的函数。

```js
/* istanbul ignore next */
export function isNative(Ctor: any): boolean {
  return typeof Ctor === 'function' && /native code/.test(Ctor.toString())
}
```

判断原型的话会判断函数 toString 后是否有 native code 字符串。

如果都为真，判断当前环境支持 Promise 函数，申明 p 变量保存 Promise.resolve()，p 就成了一个 立即 resolve 的 Promise 对象。

```js
microTimerFunc = () => {
  p.then(flushCallbacks)
  // in problematic UIWebViews, Promise.then doesn't completely break, but
  // it can get stuck in a weird state where callbacks are pushed into the
  // microtask queue but the queue isn't being flushed, until the browser
  // needs to do some other work, e.g. handle a timer. Therefore we can
  // "force" the microtask queue to be flushed by adding an empty timer.
  if (isIOS) setTimeout(noop)
}
```

接着将 microTimerFunc 赋值成一个函数，在函数中会调用 then 方法，并将 flushCallbacks 函数传入，flushCallbacks 会在下一次 microtask 的时候执行。

```js
export const isIOS =
  (UA && /iphone|ipad|ipod|ios/.test(UA)) || weexPlatform === 'ios'
```

如果 isIOS 为真，也就是当前设备是 IOS，为了兼容 UIWebViews 中出现的一些问题，回调被推到 microtask，但 microtask 没有刷新，我们可以添加空 setTimeout 来强制刷新 microtask。

```js
microTimerFunc = macroTimerFunc
```

如果当前环境不支持 Promise，采取降级处理，将 microTimerFunc 赋值成 macroTimerFunc，macroTimerFunc 会在
microTimerFunc 之前进行赋值。

```js
if (typeof setImmediate !== 'undefined' && isNative(setImmediate)) {
  macroTimerFunc = () => {
    setImmediate(flushCallbacks)
  }
} else if (
  typeof MessageChannel !== 'undefined' &&
  (isNative(MessageChannel) ||
    // PhantomJS
    MessageChannel.toString() === '[object MessageChannelConstructor]')
) {
  const channel = new MessageChannel()
  const port = channel.port2
  channel.port1.onmessage = flushCallbacks
  macroTimerFunc = () => {
    port.postMessage(1)
  }
} else {
  /* istanbul ignore next */
  macroTimerFunc = () => {
    setTimeout(flushCallbacks, 0)
  }
}
```

首先会判断如果当前环境支持 setImmediate，采用 macroTimerFunc 处理 flushCallbacks 函数，如果当前环境支持 MessageChannel 采用 MessageChannel 处理 flushCallbacks 函数，如果都不支持采用 setTimeout 处理 flushCallbacks 函数，这样实现了优雅的降级处理。

在 macroTimerFunc 和 microTimerFunc 的回调函数中，都会调用 flushCallbacks 函数，我们来看一下具体实现：

```js
const callbacks = []
let pending = false

function flushCallbacks() {
  pending = false
  const copies = callbacks.slice(0)
  callbacks.length = 0
  for (let i = 0; i < copies.length; i++) {
    copies[i]()
  }
}
```

flushCallbacks 函数首先会将 pending 置为 false，代表上一次的 nextTick 更新完毕。

这里会申明 copies 变量，采用 slice 赋值一份 callbacks 数组，然后将 callbacks 清空，这里采用了 slice 为了清空 callbacks 而不影响 copies 数组，callbacks.slice(0) 返回一个新的数组，是一个新的引用地址。

然后采用 for 循环，循环调用 copies 中的函数。

## withMacroTask

在 next-tick.js 中，除了暴露了 nextTick 函数， 还暴露了 withMacroTask 函数：

```js
/**
 * Wrap a function so that if any code inside triggers state change,
 * the changes are queued using a (macro) task instead of a microtask.
 */
export function withMacroTask(fn: Function): Function {
  return (
    fn._withTask ||
    (fn._withTask = function() {
      useMacroTask = true
      const res = fn.apply(null, arguments)
      useMacroTask = false
      return res
    })
  )
}
```

withMacroTask 返回传入的 fn 的 \_withTask 函数，这里用了传统赋值，如果 fn.\_withTask 为真，返回 fn.\_withTask，否则将 fn.\_withTask 赋值成一个函数，这个函数会将 useMacroTask 置为 true，使用 apply 将 this 指向 null，并用 res 变量保存返回，接着讲 useMacroTask 恢复成 false，最后返回 res。
我们知道当 useMacroTask 为 true 的时候会使用 macroTimerFunc 作为事件循环，调用 withMacroTask 函数传入的 fn 会插入到 microTask 任务队列。

withMacroTask 在 src/platforms/web/runtime/modules/events.js 中的 add 函数被调用:

```js
function add(
  event: string,
  handler: Function,
  once: boolean,
  capture: boolean,
  passive: boolean
) {
  handler = withMacroTask(handler)
  if (once) handler = createOnceHandler(handler, event, capture)
  target.addEventListener(
    event,
    handler,
    supportsPassive ? { capture, passive } : capture
  )
}
```

add 函数主要用来添加事件监听。

```js
function updateDOMListeners(oldVnode: VNodeWithData, vnode: VNodeWithData) {
  if (isUndef(oldVnode.data.on) && isUndef(vnode.data.on)) {
    return
  }
  const on = vnode.data.on || {}
  const oldOn = oldVnode.data.on || {}
  target = vnode.elm
  normalizeEvents(on)
  updateListeners(on, oldOn, add, remove, vnode.context)
  target = undefined
}
```

而 add 函数在 updateDOMListeners 函数中调用 updateListeners 函数时作为参数传入。

updateListeners 会被 updateComponentListeners、updateDOMListeners 函数调用。

| updateComponentListeners                |               updateDOMListeners                |
| --------------------------------------- | :---------------------------------------------: |
| initEvents updateChildComponent         |                  create update                  |
| ---------- componentVNodeHooks.prepatch |               createPatchFunction               |
|                                         |         Vue.prototype.**patch** = patch         |
|                                         | beforeMount lifecycleMixin {$destroy, $destroy} |

向上查看调用链。

## nextTick 调用

html

```html
<div id="app">{{ message }}</div>
```

js

```javascript
const vm = new Vue({
  el: '#app',
  data() {
    return {
      message: 'Hello World'
    }
  }
})
vm.message = 'Hello Vue'

console.log('正常调用', vm.$el.textContent)

vm.$nextTick(() => {
  console.log('nextTick 回调', vm.$el.textContent)
})

vm.$nextTick().then(() => {
  console.log('nextTick t', vm.$el.textContent)
})
// 正常调用 Hello World
// nextTick 回调 Hello Vue
// nextTick then Hello Vue
```
