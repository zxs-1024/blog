## 插件

### devtool

```js
const devtoolHook =
  typeof window !== 'undefined' && window.__VUE_DEVTOOLS_GLOBAL_HOOK__;

export default function devtoolPlugin(store) {
  if (!devtoolHook) return;

  store._devtoolHook = devtoolHook;

  devtoolHook.emit('vuex:init', store);

  devtoolHook.on('vuex:travel-to-state', targetState => {
    store.replaceState(targetState);
  });

  store.subscribe((mutation, state) => {
    devtoolHook.emit('vuex:mutation', mutation, state);
  });
}
```

根据 `window` 上的 `__VUE_DEVTOOLS_GLOBAL_HOOK_` 变量判断当前浏览器是否安装了 `vueTools`，
接着来看 `devtoolPlugin` 函数，`devtoolPlugin` 函数使用 `export default` 默认导出，
在 `Store` 实例的 `constructor` 中调用。

进入 `devtoolPlugin` 函数内部，接收 `store` 参数，`store` 调用时候传入的 `this`，也就是`Store` 实例，
判断没有 `devtoolHook` 直接 `retrun`，将 `devtoolHook` 赋值给 `store._devtoolHook`，会在 `Store` 实例的 `registerAction` 中用到。

向 `vueTools` `emit` `vuex:init` 事件，并将 `store` 传入，`devtoolHook` 监听到会根据 `store` 初始化 `vuex`。

`devtoolHook` 调用 `on` 方法监听 `vuex:travel-to-state`，监听到就调用回调函数，回调函数里会调用 `Store` 类的 `replaceState` 方法。

```js
replaceState (state) {
  this._withCommit(() => {
    this._vm._data.$$state = state
  })
}
```

`replaceState` 替换当前 `_vm._data.$$state`。

最后调用 `Store` 类的 `subscribe` 订阅，每一次 `mutation` 改变 `state`，都会调用 `devtoolHook` 的 `emit` 方法通知 `devtool` 改变 `mutation` `state`。

`devtoolHook` 原理 ？
占坑： 猜测是一个 `Vue Bus`。

### createLogger

`vuex` 有个内置的插件 `createLogger`，位于 `src/plugins/logger.js`:

```js
export default function createLogger({
  collapsed = true,
  filter = (mutation, stateBefore, stateAfter) => true,
  transformer = state => state,
  mutationTransformer = mut => mut,
  logger = console
} = {}) {
  return store => {
    let prevState = deepCopy(store.state);

    store.subscribe((mutation, state) => {
      if (typeof logger === 'undefined') {
        return;
      }
      const nextState = deepCopy(state);

      if (filter(mutation, prevState, nextState)) {
        const time = new Date();
        const formattedTime = ` @ ${pad(time.getHours(), 2)}:${pad(
          time.getMinutes(),
          2
        )}:${pad(time.getSeconds(), 2)}.${pad(time.getMilliseconds(), 3)}`;
        const formattedMutation = mutationTransformer(mutation);
        const message = `mutation ${mutation.type}${formattedTime}`;
        const startMessage = collapsed ? logger.groupCollapsed : logger.group;

        // render
        try {
          startMessage.call(logger, message);
        } catch (e) {
          console.log(message);
        }

        logger.log(
          '%c prev state',
          'color: #9E9E9E; font-weight: bold',
          transformer(prevState)
        );
        logger.log(
          '%c mutation',
          'color: #03A9F4; font-weight: bold',
          formattedMutation
        );
        logger.log(
          '%c next state',
          'color: #4CAF50; font-weight: bold',
          transformer(nextState)
        );

        try {
          logger.groupEnd();
        } catch (e) {
          logger.log('—— log end ——');
        }
      }

      prevState = nextState;
    });
  };
}
```

`createLogger` 接收一个 `options` 对象，默认为 `{}` :

- collapsed: 默认为 true, 自动展开记录的 mutation
- filter: 默认为 true，过滤 mutation 记录
- transformer: 在开始记录之前转换状态
- mutationTransformer: 格式化 mutation 记录
- logger: 默认为 console，自定义 console

`createLogger` 返回了一个函数，首先申明 `prevState` 变量，赋值为深拷贝后的 `store.state` 对象，
调用 `store` 的 `subscribe` 方法添加事件订阅，传入一个回调函数，在回调函数中接收 `mutation` `state` 两个参数，判断 `logger` 的类型为 `undefined` 就 `return`。

申明 `nextState` 变量，赋值为深拷贝后的回调函数中传入的 `state` 对象，
接着判断 `filter` 函数，这个默认为 `true`，进入 `if` 循环后会申明 `time` 变量保存当前事件戳，申明 `formattedTime` 变量保存格式化后的时间， 申明 `formattedMutation` 保存处理后的经过 `mutationTransformer`处理后的 `mutation`，申明 `message` 保存默认信息，申明 `startMessage` 变量，根据传入的 `collapsed` 赋值为不同的打印方法。

```js
console.groupCollapsed: 设置折叠的分组信息
console.group:          设置不折叠的分组信息
console.groupEnd:       结束当前的分组
```

接着使用 `call` 将 `startMessage` 的 `this` 绑定到 `logger` 上，并且传入 `message` 默认参数。

```js
// render
try {
  startMessage.call(logger, message);
} catch (e) {
  console.log(message);
}
```

接着就是调用 `logger.log` 打印，随后调用 `groupEnd` 结束当前的分组。

最后将 `prevState` 赋值为 `nextState`，保持状态更新。

两个处理时间的函数：

```js
// 调用数组的 join，返回指定数量的字符串
function repeat(str, times) {
  return new Array(times + 1).join(str);
}

// 保持总长度为 maxLength，在数字前补 0
function pad(num, maxLength) {
  return repeat('0', maxLength - num.toString().length) + num;
}
```
