## class Store

我们在使用 `Vuex` 的时候，会实例化 `Store` 类，并且将一些 `options` 作为参数传入。

```js
export class Store {
  constructor(options = {}) {
    // Auto install if it is not done yet and `window` has `Vue`.
    // To allow users to avoid auto-installation in some cases,
    // this code should be placed here. See #731
    if (!Vue && typeof window !== 'undefined' && window.Vue) {
      install(window.Vue);
    }

    if (process.env.NODE_ENV !== 'production') {
      assert(Vue, `must call Vue.use(Vuex) before creating a store instance.`);
      assert(
        typeof Promise !== 'undefined',
        `vuex requires a Promise polyfill in this browser.`
      );
      assert(
        this instanceof Store,
        `store must be called with the new operator.`
      );
    }

    const { plugins = [], strict = false } = options;

    // store internal state
    this._committing = false;
    this._actions = Object.create(null);
    this._actionSubscribers = [];
    this._mutations = Object.create(null);
    this._wrappedGetters = Object.create(null);
    this._modules = new ModuleCollection(options);
    this._modulesNamespaceMap = Object.create(null);
    this._subscribers = [];
    this._watcherVM = new Vue();

    // bind commit and dispatch to self
    const store = this;
    const { dispatch, commit } = this;
    this.dispatch = function boundDispatch(type, payload) {
      return dispatch.call(store, type, payload);
    };
    this.commit = function boundCommit(type, payload, options) {
      return commit.call(store, type, payload, options);
    };

    // strict mode
    this.strict = strict;

    const state = this._modules.root.state;

    // init root module.
    // this also recursively registers all sub-modules
    // and collects all module getters inside this._wrappedGetters
    installModule(this, state, [], this._modules.root);

    // initialize the store vm, which is responsible for the reactivity
    // (also registers _wrappedGetters as computed properties)
    resetStoreVM(this, state);

    // apply plugins
    plugins.forEach(plugin => plugin(this));

    if (Vue.config.devtools) {
      devtoolPlugin(this);
    }
  }
}
```

我们来逐行看一下 `Store` 构造函数中的 `constructor` 代码。

```js
if (!Vue && typeof window !== 'undefined' && window.Vue) {
  install(window.Vue);
}
```

判断 `store.js` 开始申明的 `Vue` 变量、`window` 不为 `undefined` （说明在浏览器环境下）、`window` 上有 `Vue` 变量、如果全部符合就执行 `install` 方法进行自动安装。

这么做主要是为了防止在某些情况下避免自动安装，具体情况请看 [issues #731](https://github.com/vuejs/vuex/issues/731)

然后在非生产环境执行，运行一些断言函数。

```js
assert(Vue, `must call Vue.use(Vuex) before creating a store instance.`);
```

判断当前 `Vue` 变量， 在创建 `store` 实例之前必须调用 `Vue.use(Vuex)`。

```js
assert(
  typeof Promise !== 'undefined',
  `vuex requires a Promise polyfill in this browser.`
);
```

判断支持 `Promise` 对象， 因为 `vuex` 的 `registerAction` 时会将不是 `Promise` 的方法包装成 `Promise` , `store` 实例的 `dispatch` 方法也使用了 `Promise.all`，这也是为什么 `action` 支持异步调用的原因。

```js
assert(this instanceof Store, `store must be called with the new operator.`);
```

判断 `this` 必须是 `Store` 的实例。

断言函数的实现非常简单。

```js
export function assert(condition, msg) {
  if (!condition) throw new Error(`[vuex] ${msg}`);
}
```

将传入的 `condition` 在函数内取非，为 `true` 就抛出异常。

接下来是从 `options` 解构出 `plugins` `strict`。

```js
const { plugins = [], strict = false } = options;
```

`plugins`: `vuex` 的插件，数组，会在后面循环调用。

`strict`: 是否是严格模式，后面判断如果是严格模式的会执行 `enableStrictMode` 方法，确保只能通过 `mutation` 操作 `state`。

接下来就是一些初始参数的赋值。

```js
// 通过 mutation 修改 state 的标识
this._committing = false;
// 注册 action 储存到 _actions
this._actions = Object.create(null);
// 储存订阅 store 的 action
this._actionSubscribers = [];
// 注册 mutation 储存到 _mutations
this._mutations = Object.create(null);
// 注册 getter 储存到 _wrappedGetters
this._wrappedGetters = Object.create(null);
// ModuleCollection 实例解析后的 modules 模块收集器
this._modules = new ModuleCollection(options);
// 在 installModule 函数中 如果有命名空间就储存到 _modulesNamespaceMap 中
this._modulesNamespaceMap = Object.create(null);
// 储存订阅者
this._subscribers = [];
// 用 Vue 实例 实现 Store 的 watch 方法
this._watcherVM = new Vue();
```

使用 `call` 将 `dispatch` `commit` 的 `this` 绑定到当前的 `Store` 实例上。

```js
// bind commit and dispatch to self
const store = this;
const { dispatch, commit } = this;
this.dispatch = function boundDispatch(type, payload) {
  return dispatch.call(store, type, payload);
};
this.commit = function boundCommit(type, payload, options) {
  return commit.call(store, type, payload, options);
};
```

将解构出的 `strict` 变量赋值给 `this.strict` ，会在实例中使用。

```js
// strict mode
this.strict = strict;
```

### init module

接下来会调用 `installModule` 安装 `modules`。

```js
// init root module.
// this also recursively registers all sub-modules
// and collects all module getters inside this._wrappedGetters
installModule(this, state, [], this._modules.root);
```

第一次调用将 `this`、`state`（`this._modules.root.state`）、空数组、`this._modules.root`（`root module`）作为参数传入。

`installModule` 代码：

```js
function installModule(store, rootState, path, module, hot) {
  const isRoot = !path.length;
  const namespace = store._modules.getNamespace(path);

  // register in namespace map
  if (module.namespaced) {
    store._modulesNamespaceMap[namespace] = module;
  }

  // set state
  if (!isRoot && !hot) {
    const parentState = getNestedState(rootState, path.slice(0, -1));
    const moduleName = path[path.length - 1];
    store._withCommit(() => {
      Vue.set(parentState, moduleName, module.state);
    });
  }

  const local = (module.context = makeLocalContext(store, namespace, path));

  module.forEachMutation((mutation, key) => {
    const namespacedType = namespace + key;
    registerMutation(store, namespacedType, mutation, local);
  });

  module.forEachAction((action, key) => {
    const type = action.root ? key : namespace + key;
    const handler = action.handler || action;
    registerAction(store, type, handler, local);
  });

  module.forEachGetter((getter, key) => {
    const namespacedType = namespace + key;
    registerGetter(store, namespacedType, getter, local);
  });

  module.forEachChild((child, key) => {
    installModule(store, rootState, path.concat(key), child, hot);
  });
}
```

首先先根据 `path` 判断是否是 `root`，刚开始传入的 `path` 为空数组， 所以是 `isRoot = true`,
随后调用 `ModuleCollection` 类的 `getNamespace` 方法 根据 `path` 获取命名空间，因为 `this._modules` 是 `ModuleCollection` 类的实例。

接着判断 `module.namespaced` 是否为 `true`, `namespaced` 是在每个 `module` 的配置中设置的，如果为 `true` 就将 `namespace` 赋值为 `key`、`module` 为值存到 `construction` 的 `_modulesNamespaceMap` 变量上。

在 `helper.js` 我们会用 `getModuleByNamespace` 获取 `_modulesNamespaceMap` 下对应命名空间模块。

```js
// set state
if (!isRoot && !hot) {
  const parentState = getNestedState(rootState, path.slice(0, -1));
  const moduleName = path[path.length - 1];
  store._withCommit(() => {
    Vue.set(parentState, moduleName, module.state);
  });
}
```

非 `root module` 并且没有 `hot` 热更新，初始化的时候并没有进入 `if` 判断，注册子模块的时候才会进入
调用 `getNestedState` 方法取出父 `module` 的 `state`。

`path` 是一个数组，按模块嵌套排列，`path.slice(0, -1)` 传入除去自身的数组，就是父级。

```js
function getNestedState(state, path) {
  return path.length ? path.reduce((state, key) => state[key], state) : state;
}
```

`getNestedState` 返回一个三元表达式，如果有 `path.length` 就调用
`reduce` 方法取出对应嵌套的 `state` ，没有返回直接传入的 `state`。

然后调用 `store` 的 `_withCommit` 方法：

```js
_withCommit (fn) {
  const committing = this._committing
  this._committing = true
  fn()
  this._committing = committing
}
```

`_withCommit` 中执行传入的 `fn` 之前会将 `this._committing` 置为 `true` ，执行 `fn` 函数后，将 `committing` 回复恢复之前的状态。
这里主要是为了保证修改 `state` 只能通过调用 `_withCommit`，会调用 `enableStrictMode` 去检测 `state` 是否以预期的方式改变，我们在使用 `vuex` 中，就是通过 `mutation` 去改变 `state`。

调用 `makeLocalContext` 方法：

```js
const local = (module.context = makeLocalContext(store, namespace, path));
```

`makeLocalContext` 主要用来初始化 `dispatch`、`getter`、`commit`、`state`，通过 `defineProperties` 劫持 `getters`、`state`。

```js
/**
 * make localized dispatch, commit, getters and state
 * if there is no namespace, just use root ones
 */
function makeLocalContext(store, namespace, path) {
  const noNamespace = namespace === '';

  const local = {
    dispatch: noNamespace
      ? store.dispatch
      : (_type, _payload, _options) => {
          const args = unifyObjectStyle(_type, _payload, _options);
          const { payload, options } = args;
          let { type } = args;

          if (!options || !options.root) {
            type = namespace + type;
            if (
              process.env.NODE_ENV !== 'production' &&
              !store._actions[type]
            ) {
              console.error(
                `[vuex] unknown local action type: ${args.type}, global type: ${type}`
              );
              return;
            }
          }

          return store.dispatch(type, payload);
        },

    commit: noNamespace
      ? store.commit
      : (_type, _payload, _options) => {
          const args = unifyObjectStyle(_type, _payload, _options);
          const { payload, options } = args;
          let { type } = args;

          if (!options || !options.root) {
            type = namespace + type;
            if (
              process.env.NODE_ENV !== 'production' &&
              !store._mutations[type]
            ) {
              console.error(
                `[vuex] unknown local mutation type: ${args.type}, global type: ${type}`
              );
              return;
            }
          }

          store.commit(type, payload, options);
        }
  };

  // getters and state object must be gotten lazily
  // because they will be changed by vm update
  Object.defineProperties(local, {
    getters: {
      get: noNamespace
        ? () => store.getters
        : () => makeLocalGetters(store, namespace)
    },
    state: {
      get: () => getNestedState(store.state, path)
    }
  });

  return local;
}
```

声明 `noNamespace` 变量判断是否有命名空间，然后创建 `local` 对象，改对象有两个属性 `dispatch` `commit`，它们的值分别是 2 个三元表达式，如果是没有命名空间的，`dispatch` 就赋值为 `store.dispatch`，有命名空间就拼上再返回，`commit` 也是一样的道理。

然后通过 `Object.defineProperties` 劫持 `local` 对象的 `getters`、`state`。

```js
// getters and state object must be gotten lazily
// because they will be changed by vm update
Object.defineProperties(local, {
  getters: {
    get: noNamespace
      ? () => store.getters
      : () => makeLocalGetters(store, namespace)
  },
  state: {
    get: () => getNestedState(store.state, path)
  }
});
```

劫持 `getters` 的时候也是一个三元表达式，没有命名空间就将 `local` 的 `getters` 代理到 `store.getters` 上，有的话就将 `local` 的 `getters` 代理到 `makeLocalGetters` 函数的返回上。

我们来看一下 `makeLocalGetters` 方法：

```js
function makeLocalGetters(store, namespace) {
  const gettersProxy = {};

  const splitPos = namespace.length;
  Object.keys(store.getters).forEach(type => {
    // skip if the target getter is not match this namespace
    if (type.slice(0, splitPos) !== namespace) return;

    // extract local getter type
    const localType = type.slice(splitPos);

    // Add a port to the getters proxy.
    // Define as getter property because
    // we do not want to evaluate the getters in this time.
    Object.defineProperty(gettersProxy, localType, {
      get: () => store.getters[type],
      enumerable: true
    });
  });

  return gettersProxy;
}
```

`makeLocalGetters` 接收 `store` 和 `namespace` 作为参数。
首先申明 `gettersProxy` 变量，申明 `splitPos` 变量为命名空间长度，随后遍历 `store.getters` ,
匹配命名空间，失败就 `return` ，成功往下执行。

然后取出命名空间后的 `getter`、`type`，使用 `defineProperty` 为 `gettersProxy` 的 `localType` 添加 `get` 方法，劫持 `gettersProxy` 的 `localType` 的 `get` 返回 `store` 上对应的 `getter`，简单来说就是做了一个有命名空间情况下的代理。

`makeLocalContext` 函数最后会将 `local` 返回。

```js
const local = (module.context = makeLocalContext(store, namespace, path));
```

将 `makeLocalContext` 返回保存到 `local`、`module.context`。

下面就是循环注册 `mutation`、`action`、`getter`。

```js
module.forEachMutation((mutation, key) => {
  const namespacedType = namespace + key;
  registerMutation(store, namespacedType, mutation, local);
});

module.forEachAction((action, key) => {
  const type = action.root ? key : namespace + key;
  const handler = action.handler || action;
  registerAction(store, type, handler, local);
});

module.forEachGetter((getter, key) => {
  const namespacedType = namespace + key;
  registerGetter(store, namespacedType, getter, local);
});
```

调用 `module` 类的 `forEachMutation`、`forEachAction`、`forEachGetter`，取出对应的 `mutations`、`actions`、`getters` 和回调函数作为参数。

来看看 `registerMutation` 方法:

```js
function registerMutation(store, type, handler, local) {
  const entry = store._mutations[type] || (store._mutations[type] = []);
  entry.push(function wrappedMutationHandler(payload) {
    handler.call(store, local.state, payload);
  });
}
```

通过 `type` 取出 `store._mutations` 上对应的 `mutation`，没有就穿透赋值为空数组，然后将 `wrappedMutationHandler` 函数 `push` 到 `entry` 数组中，函数的参数也就是 `mutation` 时候的参数。

函数中调用 `call` 将 `handler` 函数 `this` 指向 `store`, 并将 `local.state`，`payload` 作为参数传入，这样 `_mutations[types]` 储存了所有的 `mutation`。

来看看 `registerMutation` 方法:

```js
function registerAction(store, type, handler, local) {
  const entry = store._actions[type] || (store._actions[type] = []);
  entry.push(function wrappedActionHandler(payload, cb) {
    let res = handler.call(
      store,
      {
        dispatch: local.dispatch,
        commit: local.commit,
        getters: local.getters,
        state: local.state,
        rootGetters: store.getters,
        rootState: store.state
      },
      payload,
      cb
    );
    if (!isPromise(res)) {
      res = Promise.resolve(res);
    }
    if (store._devtoolHook) {
      return res.catch(err => {
        store._devtoolHook.emit('vuex:error', err);
        throw err;
      });
    } else {
      return res;
    }
  });
}
```

通过 `type` 取出 `store._actions` 上对应的 `action`，没有就穿透赋值为空数组，然后将 `wrappedActionHandler` 函数 `push` 到 `entry` 数组中，函数中使用 `call` 将 `handler` 指向 `store`, `call` 的第二个参数是 `dispatch`、`commit`、`getters` 等包装后的对象，所以我们可以在 `commit` 的第一个参数中解构出需要的属性。

```js
// actions
const actions = {
  getAllProducts({ commit }) {
    shop.getProducts(products => {
      commit('setProducts', products);
    });
  }
};
```

`payload` 也就是额外参数，`cb` 回调函数倒是不怎么用到。

然后通过简易的 `isPromise` 方法判断 `res` 是否为 `Promise`，只是简单判断了 `then` 是是否为一个函数。

```js
export function isPromise(val) {
  return val && typeof val.then === 'function';
}
```

如果不是的话，调用 `Promise.resolve(res)` 将 `res` 包装成一个 `Promise`。

之后就是根据 `_devtoolHook` 判断当前浏览器是否有 `devtoolHook` 插件，应该是通过 `Promise.catch` 抛出错误，让 `devtoolHook` 捕获。

来看看 `registerGetter` 方法：

```js
function registerGetter(store, type, rawGetter, local) {
  if (store._wrappedGetters[type]) {
    if (process.env.NODE_ENV !== 'production') {
      console.error(`[vuex] duplicate getter key: ${type}`);
    }
    return;
  }
  store._wrappedGetters[type] = function wrappedGetter(store) {
    return rawGetter(
      local.state, // local state
      local.getters, // local getters
      store.state, // root state
      store.getters // root getters
    );
  };
}
```

开始判断如果有相同 `getter` 就抛出异常，
没有的话就以 `type` 为 `key`、`wrappedGetter` 为 `value` 储存到 `store._wrappedGetters` 对象上，每一个 `getter` 都是一个 `function`。

循环注册 `mutation action getter` 后，只剩下最后一段代码：

```js
module.forEachChild((child, key) => {
  installModule(store, rootState, path.concat(key), child, hot);
});
```

调用 `Module` 类的 `forEachChild` 方法，并且将回调函数传入。

```js
forEachChild (fn) {
  forEachValue(this._children, fn)
}
```

`forEachChild` 方法也调用了 `forEachValue` 遍历 `_children` 的 `key` 循环调用传入的 `fn`。

`_children` 是在 `ModuleCollection` 类中通过嵌套模块的递归注册建立父子关系的。

最后递归调用 `installModule` 完成所以嵌套模块的安装，到此 `installModule` 方法结束。

### resetStoreVM

`resetStoreVM` 主要用来重置 `Vue` 实例，实现响应式的 `state` `computed`。

```js
// initialize the store vm, which is responsible for the reactivity
// (also registers _wrappedGetters as computed properties)
resetStoreVM(this, state);
```

我们接着来看 `resetStoreVM` 方法：

```js
function resetStoreVM(store, state, hot) {
  const oldVm = store._vm;

  // bind store public getters
  store.getters = {};
  const wrappedGetters = store._wrappedGetters;
  const computed = {};
  forEachValue(wrappedGetters, (fn, key) => {
    // use computed to leverage its lazy-caching mechanism
    computed[key] = () => fn(store);
    Object.defineProperty(store.getters, key, {
      get: () => store._vm[key],
      enumerable: true // for local getters
    });
  });

  // use a Vue instance to store the state tree
  // suppress warnings just in case the user has added
  // some funky global mixins
  const silent = Vue.config.silent;
  Vue.config.silent = true;
  store._vm = new Vue({
    data: {
      $$state: state
    },
    computed
  });
  Vue.config.silent = silent;

  // enable strict mode for new vm
  if (store.strict) {
    enableStrictMode(store);
  }

  if (oldVm) {
    if (hot) {
      // dispatch changes in all subscribed watchers
      // to force getter re-evaluation for hot reloading.
      store._withCommit(() => {
        oldVm._data.$$state = null;
      });
    }
    Vue.nextTick(() => oldVm.$destroy());
  }
}
```

函数开始就取出 `store._vm`，初始值是 `undefind`，会在后面用到。

循环 `wrappedGetters` 处理所有 `getter`。

```js
// bind store public getters
store.getters = {};
const wrappedGetters = store._wrappedGetters;
const computed = {};
forEachValue(wrappedGetters, (fn, key) => {
  // use computed to leverage its lazy-caching mechanism
  computed[key] = () => fn(store);
  Object.defineProperty(store.getters, key, {
    get: () => store._vm[key],
    enumerable: true // for local getters
  });
});
```

将 `store` 的 `getters` 赋值为空对象， 取出保存所有注册 `getter` 的 `_wrappedGetters` 对象，申明 `computed` 对象。

接着循环 `wrappedGetters` 对象，将对应的 `key` 以及 `fn` 保存到 `computed`，这里的 `fn` 就是注册 `getter` 的 `wrappedGetter` 函数。

```js
computed[key] = () => fn(store);
```

然后通过 `defineProperty` 劫持 `store.getters` 的 `key`，代理到 `store._vm[key]`。

```js
// use a Vue instance to store the state tree
// suppress warnings just in case the user has added
// some funky global mixins
const silent = Vue.config.silent;
Vue.config.silent = true;
store._vm = new Vue({
  data: {
    $$state: state
  },
  computed
});
Vue.config.silent = silent;
```

保存 `Vue.config.silent` 变量，设置`Vue.config.silent = true`，取消 `Vue` 所有的日志与警告。

然后生成一个新的 `Vue` 实例，将 `state` 和 `computed` 作为参数传入，恢复 `Vue.config.silent`。因为将 `store.getters` 的 `key` 代理到 `store._vm[key]`，所以我们可以通过访问 `this.$store.getters.key` 访问到 `store._vm[key]`。

```js
// enable strict mode for new vm
if (store.strict) {
  enableStrictMode(store);
}
```

根据 `store.strict` 判断是否是严格模式，是的话调用 `enableStrictMode` 方法。

```js
function enableStrictMode(store) {
  store._vm.$watch(
    function() {
      return this._data.$$state;
    },
    () => {
      if (process.env.NODE_ENV !== 'production') {
        assert(
          store._committing,
          `do not mutate vuex store state outside mutation handlers.`
        );
      }
    },
    { deep: true, sync: true }
  );
}
```

`enableStrictMode` 将 `store` 作为参数，调用 `store._vm.$watch` 方法，也就是 `Vue` 实例的 `$watch` 方法，监测 `this._data.$$state` 的变化，就是生成新的 `Vue` 实例的时候传入的 `state`，判断不是生产模式，调用断言，如果 `store._committing` 是 `false`, 抛出异常，所以我们在使用 `vuex` 的时候，只能通过 `mutation` 方式改变 `store`。

`oldVm` 的注销：

```js
if (oldVm) {
  if (hot) {
    // dispatch changes in all subscribed watchers
    // to force getter re-evaluation for hot reloading.
    store._withCommit(() => {
      oldVm._data.$$state = null;
    });
  }
  Vue.nextTick(() => oldVm.$destroy());
}
```

如果有 `oldVm`, 并且是热更新模式，将 `oldVm._data.$$state` 置为 `null`，
接下来调用 `oldVm` 的 `$destroy` 方法注销 `oldVm` 实例。

插件的调用：

```js
// apply plugins
plugins.forEach(plugin => plugin(this));
```

循环传入的 `plugin` 数组，循环调用，并将 `this` 传入。

调用 `devtoolPlugin` 方法：

```js
if (Vue.config.devtools) {
  devtoolPlugin(this);
}
```

`constructor` 的末尾会判断 `Vue.config.devtools` 是否为真，调用 `devtoolPlugin` 方法，并将 `this` 作为参数传入，`devtoolPlugin` 实现请看 `插件 devtool` 部分。

至此 `Store` 类的 `constructor` 部分结束，我们往下来看看 `Store` 类中的方法。

代理 `state`:

```js
get state () {
  return this._vm._data.$$state
}
```

为 `state` 设置 `get`，访问 `Store` 实例的 `state` 的时候代理带 `this._vm._data.$$state`。

```js
set state (v) {
  if (process.env.NODE_ENV !== 'production') {
    assert(false, `use store.replaceState() to explicit replace store state.`)
  }
}
```

为 `state` 设置 `set`，不能直接修改 `state`， 非生产环境抛出异常，提示你使用 `store.replaceState` 方法修改 `state`。

### commit

修改 `Vuex` 的 `store` 只能通过 `mutation`，我们通过 `commit` 调用 `mutation`。

```js
commit (_type, _payload, _options) {
  // check object-style commit
  const {
    type,
    payload,
    options
  } = unifyObjectStyle(_type, _payload, _options)

  const mutation = { type, payload }
  const entry = this._mutations[type]
  if (!entry) {
    if (process.env.NODE_ENV !== 'production') {
      console.error(`[vuex] unknown mutation type: ${type}`)
    }
    return
  }
  this._withCommit(() => {
    entry.forEach(function commitIterator (handler) {
      handler(payload)
    })
  })
  this._subscribers.forEach(sub => sub(mutation, this.state))

  if (
    process.env.NODE_ENV !== 'production' &&
    options && options.silent
  ) {
    console.warn(
      `[vuex] mutation type: ${type}. Silent option has been removed. ` +
      'Use the filter functionality in the vue-devtools'
    )
  }
}
```

`commit` 接收 3 个参数，`_type` 就是 `mutation` 的 `type`，`_payload` 就是传入的参数，`_options` 参数会在下面调用，貌似没什么用处，只是用来判断是否 `console.warn`。

接下来调用 `unifyObjectStyle` 方法：

```js
function unifyObjectStyle(type, payload, options) {
  if (isObject(type) && type.type) {
    options = payload;
    payload = type;
    type = type.type;
  }

  if (process.env.NODE_ENV !== 'production') {
    assert(
      typeof type === 'string',
      `expects string as the type, but found ${typeof type}.`
    );
  }

  return { type, payload, options };
}
```

接收 `commit` 的三个参数，判断 `type` 如果是一个对象，并且有 `type` 属性，将 `options` 赋值为 `payload`，`payload` 赋值为 `type`，`type` 赋值为 `type.type`。

因为 `vuex` 允许对象风格的提交方式：

```js
store.commit({
  type: 'increment',
  amount: 10
});
```

处理成这样的形式：

```js
store.commit('increment', {
  amount: 10
});
```

然后从 `unifyObjectStyle` 结构出 `type`、`payload`、`options`，将包装 `type`、`payload` 成一个对象赋值给 `mutation` 变量，申明 `entry` 变量从储存所有 `mutation` 的 `this._mutations` 取出对应 `type` 的 `mutation`，没有对应 `mutation` 就 `return`，如果在非生产环境，顺便抛出个异常。

```js
this._withCommit(() => {
  entry.forEach(function commitIterator(handler) {
    handler(payload);
  });
});
```

接着调用 `this._withCommit` 方法，并将回调函数传入，这里会循环对应的 `mutation`，将 `payload` 参数传入并调用 `handler` 函数，需要注意的是 `mutation` 只能是是同步函数。

接着循环 `_subscribers`：

```js
this._subscribers.forEach(sub => sub(mutation, this.state));
```

`_subscribers` 是一个数组，循环调用里面的函数，并将 `mutation` `this.state` 传入。

最后判断非生产环境，并且 `options.silent` 为真，就抛出异常，提示 `Silent option` 已经删除，应该是和 `vue-devtools` 有关。

### dispatch

通过 `store.dispatch` 方法触发 `Action`:

```js
dispatch (_type, _payload) {
  // check object-style dispatch
  const {
    type,
    payload
  } = unifyObjectStyle(_type, _payload)

  const action = { type, payload }
  const entry = this._actions[type]
  if (!entry) {
    if (process.env.NODE_ENV !== 'production') {
      console.error(`[vuex] unknown action type: ${type}`)
    }
    return
  }

  this._actionSubscribers.forEach(sub => sub(action, this.state))

  return entry.length > 1
    ? Promise.all(entry.map(handler => handler(payload)))
    : entry[0](payload)
}
```

`dispatch` 接收 2 个参数，`action type` 和 `_payload` 参数。

与 `commit` 一样调用 `unifyObjectStyle` 方法处理对象形式的 `dispatch`，解构出 `type` `payload`，申明 `action` 对象包装 `type` `payload`，申明 `entry` 变量从 `this._actions` 中取出对应的 `action`，没有对应 `action` 就 `return`，如果在非生产环境，顺便抛出个异常。

接着循环 `_actionSubscribers`：

```js
this._subscribers.forEach(sub => sub(mutation, this.state));
```

`_actionSubscribers` 是一个数组，循环调用里面的函数，并将 `action` `this.state` 传入。

与 `commit` 不同的是，`dispatch` 最后会返回一个 `Promise`，
`entry` 是注册 `action` 时储存 `wrappedActionHandler` 函数的数组，在注册 `action` 时会将其包装成 `promise`，所以在 `action` 中支持异步操作，这里判断 `entry` 长度，如果是多个调用 `Promise.all` 方法，单个直接取第 0 个调用。

### subscribe

订阅 `store` 的 `mutation`：

```js
subscribe (fn) {
  return genericSubscribe(fn, this._subscribers)
}
```

`subscribe` 中 调用了 `genericSubscribe` 方法，并将回调和 `this._subscribers` 传入，返回一个函数可以停止订阅。
会在每个 `mutation` 完成后调用，通常用于插件，在 `plugins` 的 `devtool.js` 和 `logger.js` 都使用了。

### genericSubscribe

```js
function genericSubscribe(fn, subs) {
  if (subs.indexOf(fn) < 0) {
    subs.push(fn);
  }
  return () => {
    const i = subs.indexOf(fn);
    if (i > -1) {
      subs.splice(i, 1);
    }
  };
}
```

`genericSubscribe` 接收 `fn` 函数和一个 `subs` 数组作为参数，首先判断如果在 `subs` 没有 `fn` 函数，就往 `subs` 数组 `push` `fn` ，最后 `return` 一个 `function`，这个函数会取到当前函数在 `subs` 中的下标，然后使用 `splice` 从 `subs` 中删除，也就是说调用返回的函数可以停止订阅。

### subscribeAction

订阅 `store` 的 `action`。

```js
subscribeAction (fn) {
  return genericSubscribe(fn, this._actionSubscribers)
}
```

`subscribeAction` 中 调用了 `genericSubscribe` 方法，并将回调和 `this._actionSubscribers` 传入，返回一个函数可以停止订阅。

### watch

响应式地侦听 `fn` 的返回值，当值改变时调用回调函数。

```js
watch (getter, cb, options) {
  if (process.env.NODE_ENV !== 'production') {
    assert(typeof getter === 'function', `store.watch only accepts a function.`)
  }
  return this._watcherVM.$watch(() => getter(this.state, this.getters), cb, options)
}
```

判断非生产环境并且 `getter` 不是一个 `function` 抛出异常，随后会 `return` 一个函数，调用返回的函数可以停止监听，`this._watcherVM` 在 `constructor` 赋值成了一个 `Vue` 实例，其实就是基于 `Vue` 实例的 `$watch` 方法。

### replaceState

替换 `store` 的根状态。

```js
replaceState (state) {
  this._withCommit(() => {
    this._vm._data.$$state = state
  })
}
```

调用 `_withCommit` 并传入回调函数，在回调函数中会用传入的 `state` 替换当前 `_vm._data.$$state`。

### registerModule

使用 `store.registerModule` 方法注册模块：

```js
registerModule (path, rawModule, options = {}) {
  if (typeof path === 'string') path = [path]

  if (process.env.NODE_ENV !== 'production') {
    assert(Array.isArray(path), `module path must be a string or an Array.`)
    assert(path.length > 0, 'cannot register the root module by using registerModule.')
  }

  this._modules.register(path, rawModule)
  installModule(this, this.state, path, this._modules.get(path), options.preserveState)
  // reset store to update getters...
  resetStoreVM(this, this.state)
}
```

`registerModule` 方法接收 `path` 路径，`rawModule` 模块，`options` 配置作为参数。

首先判断 `path` 如果为字符串，就转成字符串数组，
在非生产环境断言，`path` 必须为一个数组，`path.length` 必须大于 0。

然后调用 `this._modules.register` 进行注册模块，`installModule` 进行模块安装，`resetStoreVM` 重设 `Vue` 实例。

### unregisterModule

卸载一个动态模块：

```js
unregisterModule (path) {
  if (typeof path === 'string') path = [path]

  if (process.env.NODE_ENV !== 'production') {
    assert(Array.isArray(path), `module path must be a string or an Array.`)
  }

  this._modules.unregister(path)
  this._withCommit(() => {
    const parentState = getNestedState(this.state, path.slice(0, -1))
    Vue.delete(parentState, path[path.length - 1])
  })
  resetStore(this)
}
```

调用 `this._modules.unregister` 进行模块注销，调用 `_withCommit`，将回调函数传入。

回调函数会调用 `getNestedState` 方法取出父 `module` 的 `state`，然后调用 `Vue.delete` 删除对应子模块，`resetStore` 进行 `store` 的重置，其他部分与 `registerModule` 一致。

### resetStore

```js
function resetStore(store, hot) {
  store._actions = Object.create(null);
  store._mutations = Object.create(null);
  store._wrappedGetters = Object.create(null);
  store._modulesNamespaceMap = Object.create(null);
  const state = store.state;
  // init all modules
  installModule(store, state, [], store._modules.root, true);
  // reset vm
  resetStoreVM(store, state, hot);
}
```

接收 `store` 和 是否 `hot` 作为参数，
将 `store` 的 `_actions`、`_mutations`、`_wrappedGetters`、`_modulesNamespaceMap` 置为 `null`。

调用 `installModule` 重新安装模块，调用 `resetStoreVM` 重设 `Vue` 实例。

### hotUpdate

开发过程中热重载 `mutation`、`module`、`action` 和 `getter`:

```js
hotUpdate (newOptions) {
  this._modules.update(newOptions)
  resetStore(this, true)
}
```

接收一个新的 `newOptions`，调用 `this._modules.update` 更新模块，然后调用 `resetStore` 重置 `store`。

余下的方法基本都在上文讲述过，到此 `class Store` 结束。
