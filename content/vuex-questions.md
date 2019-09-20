## 问题总结

### global eventBus 有何缺陷

`eventBus` 比较适合简单应用，但是随着需求增加，组件之间通信增多，`eventBus` 就显得不够直观，不方便我们管理，而且随着组件复用的增多，多个组件通信，又相互通信，就容易导致混乱。

### \$store 如何注入到所有子组件

`$store` 是在 vuex install 初始化的时候赋值的，来看一下代码：

```js
/**
 * Vuex init hook, injected into each instances init hooks list.
 */

function vuexInit() {
  const options = this.$options;
  if (options.store) {
    this.$store =
      typeof options.store === 'function' ? options.store() : options.store;
  } else if (options.parent && options.parent.$store) {
    this.$store = options.parent.$store;
  }
}
```

在 `vuexInit` 方法中，首先判断如果有 `this.$options.store` 说明是 `root` 节点，判断 `store` 如果是 `function` 就将函数执行后的返回赋值给 `this.$store` ，否则将 `options.store` 直接赋值给 `this.$store`。

不是 `root` 节点就从父组件中获取 `$store`，这样就保证只有一个全局的 `$store`。

### mapState 实现

`mapState` 请看 `src/helpers.js` 的 `mapState` 部分。

### mapGetter 如何映射

`mapGetter` 方法最后会返回一个对象，这个对象的每一个 `key` 值是 `mappedGetter` 方法，`mappedGetter` 会返回 `this.$store.getters[key]`。

```js
mapGetters({
  // 把 `this.doneCount` 映射为 `this.$store.getters.doneTodosCount`
  doneCount: 'doneTodosCount'
});
```

### Mutation 同步 && Action 异步

在注册 `action` 时储会将 `action` 的回调包装成 `promise`，通过 `dispatch` 方法触发 `action` 的时候，最后 `return` 的是个 `Promise` 对象，所以 `action` 支持异步。

注册 `mutation` 和通过 `commit` 方法触发 `mutation` 的时候，都只是一个同步的代码，仍然是同步代码。

### dispatch 方法实现

`dispatch` 请看 `src/store.js` 的 `dispatch` 部分。

### module 分割实现 && 局部状态 namespaced

实例化 `ModuleCollection`

请看 `class ModuleCollection`。

### 如何调用 vue-devtools

在 `devtoolPlugin` 方法中，取出挂在 `window` 对象的 `__VUE_DEVTOOLS_GLOBAL_HOOK__` 保存到 `devtoolHook`，通过 `emit` `vuex:init` 初始化 `store`：

```js
devtoolHook.emit('vuex:init', store);
```

```js
devtoolHook.on('vuex:travel-to-state', targetState => {
  store.replaceState(targetState);
});
```

```js
store.subscribe((mutation, state) => {
  devtoolHook.emit('vuex:mutation', mutation, state);
});
```

```js
export default function devtoolPlugin(store) {
  if (!devtoolHook) return;

  store._devtoolHook = devtoolHook;

  // 向 vueTools emit 事件 并传入当前的 store
  // devtoolHook 监听到会根据 store 初始化 vuex
  devtoolHook.emit('vuex:init', store);

  // devtoolHook 监听 vuex:travel-to-state，调用回调函数
  devtoolHook.on('vuex:travel-to-state', targetState => {
    store.replaceState(targetState);
  });

  store.subscribe((mutation, state) => {
    devtoolHook.emit('vuex:mutation', mutation, state);
  });
}
```

### 内置 logger 插件实现

请看插件 `devtool` 部分。

### hotUpdate

使用 `webpack` 的 `Hot Module Replacement API` 实现热重载。

```js
if (module.hot) {
  module.hot.accept(['./getters', './actions', './mutations'], () => {
    store.hotUpdate({
      getters: require('./getters'),
      actions: require('./actions'),
      mutations: require('./mutations')
    });
  });
}
```

### 时间穿梭功能实现

当我们调用 `devtoolHook` 方法的时候，会调用 `devtoolHook` 的 `on` 方法监听 `vuex:travel-to-state` 事件。

在 `vue-devtools` 的源码的 `src/bridge.js` 中：

```js
import { EventEmitter } from 'events';
```

我们看到事件监听是通过 `Node` 的 `EventEmitter` 监听的。

```js
devtoolHook.on('vuex:travel-to-state', targetState => {
  store.replaceState(targetState);
});
```

在回调函数中接收 `targetState` 参数，调用 `Store` 的 `replaceState` 方法去修改 `this._vm._data.$$state`，当我们点击 `devtoolHook` 的某一条 `mutation` 历史记录，就能穿梭到历史记录。

但是这个历史记录又是怎么出现的呢？是通过调用 `store.subscribe` 方法：

```js
store.subscribe((mutation, state) => {
  devtoolHook.emit('vuex:mutation', mutation, state);
});
```

每当调用 `commit` 方法的时候，都会调用

```js
this._subscribers.forEach(sub => sub(mutation, this.state));
```

循环调用 `_subscribers` 中的回调函数，回调函数会调用 `devtoolHook.emit` 方法，发送 `vuex:mutation`，说明改变了 `mutation`，并把 `mutation` 和 `state` 作为参数传入，`devtoolHook` 就会储存 `mutation` 的历史记录了。

`vuex` 相关在 `vue-devtools/src/backend/vuex.js`:

```js
// application -> devtool
hook.on('vuex:mutation', ({ type, payload }) => {
  if (!SharedData.recordVuex) return;

  const index = mutations.length;

  mutations.push({
    type,
    payload,
    index,
    handlers: store._mutations[type]
  });

  bridge.send('vuex:mutation', {
    mutation: {
      type: type,
      payload: stringify(payload),
      index
    },
    timestamp: Date.now()
  });
});
```

看到是通过一个 `mutations` 数组模拟这个历史记录，每次监听到 `vuex:mutation` 事件就是 `push` `mutation` 相关。
