import applyMixin from './mixin'
import devtoolPlugin from './plugins/devtool'
import ModuleCollection from './module/module-collection'
import { forEachValue, isObject, isPromise, assert } from './util'

let Vue // bind on install

export class Store {
  constructor (options = {}) {
    // Auto install if it is not done yet and `window` has `Vue`.
    // To allow users to avoid auto-installation in some cases,
    // this code should be placed here. See #731
    // 在浏览器环境下 && 没有执行过 install
    // 上面申明的 Vue 还是 null
    // 进行自动安装
    if (!Vue && typeof window !== 'undefined' && window.Vue) {
      install(window.Vue)
    }

    if (process.env.NODE_ENV !== 'production') {
      // 断言
      // 必须在创建 store 实例之前调用 install
      assert(Vue, `must call Vue.use(Vuex) before creating a store instance.`)
      // 支持 Promise
      assert(typeof Promise !== 'undefined', `vuex requires a Promise polyfill in this browser.`)
      // 必须是 Store 的实例
      assert(this instanceof Store, `store must be called with the new operator.`)
    }

    // plugins  插件数组
    // strict   严格模式
    const {
      plugins = [],
      strict = false
    } = options

    // store internal state
    // 通过 mutation 修改 state 的标识
    this._committing = false
    // 注册 action 储存到 _actions
    this._actions = Object.create(null)
    // 储存订阅 store 的 action
    this._actionSubscribers = []
    // 注册 mutation 储存到 _mutations
    this._mutations = Object.create(null)
    // 注册 getter 储存到 _wrappedGetters
    this._wrappedGetters = Object.create(null)
    // 处理 modules 模块收集器
    this._modules = new ModuleCollection(options)
    // 在 installModule 函数中 如果有命名空间就储存到 _modulesNamespaceMap 中
    // 储存有命名空间的 module
    this._modulesNamespaceMap = Object.create(null)
    // 储存订阅者
    this._subscribers = []
    // 用 Vue 实例 实现 Store 的 watch 方法
    this._watcherVM = new Vue()

    // bind commit and dispatch to self
    // 将 dispatch commit 指向当前的 Store 实例 、
    const store = this
    const { dispatch, commit } = this
    this.dispatch = function boundDispatch (type, payload) {
      return dispatch.call(store, type, payload)
    }
    this.commit = function boundCommit (type, payload, options) {
      return commit.call(store, type, payload, options)
    }

    // strict mode
    this.strict = strict
    // ModuleCollection 处理后的模块，顶层 state
    // state = { count: 0 }
    const state = this._modules.root.state

    // init root module.
    // this also recursively registers all sub-modules
    // and collects all module getters inside this._wrappedGetters
    // 注册 modules
    // vuex 提供了嵌套模块的写法 需要递归注册 modules
    installModule(this, state, [], this._modules.root)

    // initialize the store vm, which is responsible for the reactivity
    // (also registers _wrappedGetters as computed properties)
    // 重置 Vue 实例 实现响应式的 state computed
    resetStoreVM(this, state)

    // apply plugins
    // plugins 是在实例化 Store 时候传入的数组
    // 循环调用插件
    // 每一个插件就是一个函数 类似 createLogger
    plugins.forEach(plugin => plugin(this))

    // vueTools 插件处理
    if (Vue.config.devtools) {
      devtoolPlugin(this)
    }
  }

  get state () {
    return this._vm._data.$$state
  }
  set state (v) {
    if (process.env.NODE_ENV !== 'production') {
      assert(false, `use store.replaceState() to explicit replace store state.`)
    }
  }

  commit (_type, _payload, _options) {
    // check object-style commit
    // 统一格式
    const {
      type,
      payload,
      options
    } = unifyObjectStyle(_type, _payload, _options)

    const mutation = { type, payload }
    // 根据 type 取出对应 mutation
    const entry = this._mutations[type]
    if (!entry) {
      if (process.env.NODE_ENV !== 'production') {
        console.error(`[vuex] unknown mutation type: ${type}`)
      }
      return
    }
    // 在 _withCommit 函数回调中
    // 循环 entry 调用里面的 handler 函数
    // 根据 _committing 判断
    // 会在 _withCommit 置为 true 后调用传入的 fn
    // 只能通过 mutation 改变 state
    this._withCommit(() => {
      // entry 循环执行
      entry.forEach(function commitIterator (handler) {
        handler(payload)
      })
    })
    // 储存的 subscribe 循环执行
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

  dispatch (_type, _payload) {
    // check object-style dispatch
    // 统一格式
    const {
      type,
      payload
    } = unifyObjectStyle(_type, _payload)

    const action = { type, payload }
    // 根据 type 取出对应 action
    const entry = this._actions[type]
    if (!entry) {
      if (process.env.NODE_ENV !== 'production') {
        console.error(`[vuex] unknown action type: ${type}`)
      }
      return
    }

    this._actionSubscribers.forEach(sub => sub(action, this.state))

    // entry 是注册 action 时储存 wrappedActionHandler 函数的数组
    // 在注册 action 时会将其包装成 promise 所以支持异步操作
    // 判断 entry 长度 单个直接调用
    // 多个调用 Promise.all 方法
    return entry.length > 1
      ? Promise.all(entry.map(handler => handler(payload)))
      : entry[0](payload)
  }

  // 订阅 store 的 mutation
  subscribe (fn) {
    return genericSubscribe(fn, this._subscribers)
  }

  // 订阅 store 的 action 常用语插件
  subscribeAction (fn) {
    return genericSubscribe(fn, this._actionSubscribers)
  }

  watch (getter, cb, options) {
    if (process.env.NODE_ENV !== 'production') {
      assert(typeof getter === 'function', `store.watch only accepts a function.`)
    }
    return this._watcherVM.$watch(() => getter(this.state, this.getters), cb, options)
  }

  replaceState (state) {
    this._withCommit(() => {
      this._vm._data.$$state = state
    })
  }

  // 注册模块
  // 通过 register 注册 module
  // installModule 安装 module
  // resetStoreVM 重置 Vue 实例
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

  // 卸载模块
  unregisterModule (path) {
    // 转换成数组
    if (typeof path === 'string') path = [path]

    if (process.env.NODE_ENV !== 'production') {
      assert(Array.isArray(path), `module path must be a string or an Array.`)
    }

    this._modules.unregister(path)
    this._withCommit(() => {
      const parentState = getNestedState(this.state, path.slice(0, -1))
      Vue.delete(parentState, path[path.length - 1])
    })
    // 重置
    resetStore(this)
  }

  hotUpdate (newOptions) {
    this._modules.update(newOptions)
    resetStore(this, true)
  }

  // 在调用 fn 之前会将 _committing 置为 true
  // 执行完成后恢复 committing
  _withCommit (fn) {
    const committing = this._committing
    this._committing = true
    fn()
    this._committing = committing
  }
}

function genericSubscribe (fn, subs) {
  if (subs.indexOf(fn) < 0) {
    subs.push(fn)
  }
  return () => {
    const i = subs.indexOf(fn)
    if (i > -1) {
      subs.splice(i, 1)
    }
  }
}

function resetStore (store, hot) {
  store._actions = Object.create(null)
  store._mutations = Object.create(null)
  store._wrappedGetters = Object.create(null)
  store._modulesNamespaceMap = Object.create(null)
  const state = store.state
  // init all modules
  installModule(store, state, [], store._modules.root, true)
  // reset vm
  resetStoreVM(store, state, hot)
}

// params this state
// 重置 Vue 实例 实现响应式的 state computed
function resetStoreVM (store, state, hot) {
  // 初始值是 undefind
  const oldVm = store._vm
  // bind store public getters
  store.getters = {}
  // 取出注册 getter 时存放的 _wrappedGetters
  const wrappedGetters = store._wrappedGetters
  const computed = {}
  forEachValue(wrappedGetters, (fn, key) => {
    // use computed to leverage its lazy-caching mechanism
    // 将对应的 key 以及 fn 包装下保存到 computed
    computed[key] = () => fn(store)
    // 通过 defineProperty 劫持 store.getters 的 key
    // 代理到 store._vm[key]
    Object.defineProperty(store.getters, key, {
      get: () => store._vm[key],
      enumerable: true // for local getters
    })
  })

  // use a Vue instance to store the state tree
  // suppress warnings just in case the user has added
  // some funky global mixins
  // 用 vue 实例用来储存 state 并把处理后的 computed 实现动态计算
  // 并且用 store._vm 保存
  const silent = Vue.config.silent
  Vue.config.silent = true
  store._vm = new Vue({
    data: {
      $$state: state
    },
    computed
  })
  Vue.config.silent = silent

  // enable strict mode for new vm
  // 严格模式下 确保只能通过 mutation 改变store
  if (store.strict) {
    enableStrictMode(store)
  }

  // 有 3 种情况调用到 resetStoreVM 方法
  // class Store constructor 、resetStore 、registerModule
  // 将 state 置为 null 并且调用 $destroy 在 nextTic 回调中注销实例
  if (oldVm) {
    if (hot) {
      // dispatch changes in all subscribed watchers
      // to force getter re-evaluation for hot reloading.
      store._withCommit(() => {
        oldVm._data.$$state = null
      })
    }
    Vue.nextTick(() => oldVm.$destroy())
  }
}

// 初始化 installModul
// this, state, [], this._modules.root
// this._modules 是 new ModuleCollection(options) 的实例
// 此时传入的 path 为 []
// 注册 modules
// vuex 提供了嵌套模块的写法 需要递归注册
// modules mutation action getter
function installModule (store, rootState, path, module, hot) {
  // 根据 path 判断是否是 root
  const isRoot = !path.length
  // 根据 path 处理命名空间 + '/'
  // path ['cart'] => namespace 'cart/'
  // ModuleCollection 类的 getNamespace 方法
  const namespace = store._modules.getNamespace(path)
  // register in namespace map
  // 如果有设置 namespaced
  // 处理模块的命名空间
  // 在 helper.js 用 getModuleByNamespace 获取 _modulesNamespaceMap 下对应命名空间模块
  // installModule 的时候 如果有命名空间就储存到 _modulesNamespaceMap 中
  if (module.namespaced) {
    store._modulesNamespaceMap[namespace] = module
  }

  // set state
  // 不是 root 并且没有 hot
  // 嵌套 module
  if (!isRoot && !hot) {
    // 获取父级 state
    // path.slice(0, -1) 传入除去自身的数组 就是父级
    // path 是一个一维数组 按序排列
    const parentState = getNestedState(rootState, path.slice(0, -1))
    const moduleName = path[path.length - 1]
    // Vue.set
    // 使用 Vue.set 建立响应式的 module
    // 只能通过 _withCommit 方法
    store._withCommit(() => {
      Vue.set(parentState, moduleName, module.state)
    })
  }

  // 初始化 dispatch getter commit state
  // 通过 defineProperties 劫持 getters state
  const local = module.context = makeLocalContext(store, namespace, path)

  // 循环注册 mutation action getter
  // module 的 一系列方法
  // 都调用了 utils.js forEachValue
  module.forEachMutation((mutation, key) => {
    const namespacedType = namespace + key
    registerMutation(store, namespacedType, mutation, local)
  })

  module.forEachAction((action, key) => {
    const type = action.root ? key : namespace + key
    const handler = action.handler || action
    registerAction(store, type, handler, local)
  })

  module.forEachGetter((getter, key) => {
    const namespacedType = namespace + key
    registerGetter(store, namespacedType, getter, local)
  })

  // 递归处理嵌套模块
  module.forEachChild((child, key) => {
    installModule(store, rootState, path.concat(key), child, hot)
  })
}

/**
 * make localized dispatch, commit, getters and state
 * if there is no namespace, just use root ones
 */
// 初始化 dispatch getter commit state
// 通过 defineProperties 劫持 getters state
function makeLocalContext (store, namespace, path) {
  const noNamespace = namespace === ''

  const local = {
    dispatch: noNamespace ? store.dispatch : (_type, _payload, _options) => {
      const args = unifyObjectStyle(_type, _payload, _options)
      const { payload, options } = args
      let { type } = args

      if (!options || !options.root) {
        type = namespace + type
        if (process.env.NODE_ENV !== 'production' && !store._actions[type]) {
          console.error(`[vuex] unknown local action type: ${args.type}, global type: ${type}`)
          return
        }
      }

      return store.dispatch(type, payload)
    },

    commit: noNamespace ? store.commit : (_type, _payload, _options) => {
      const args = unifyObjectStyle(_type, _payload, _options)
      const { payload, options } = args
      let { type } = args

      if (!options || !options.root) {
        type = namespace + type
        if (process.env.NODE_ENV !== 'production' && !store._mutations[type]) {
          console.error(`[vuex] unknown local mutation type: ${args.type}, global type: ${type}`)
          return
        }
      }

      store.commit(type, payload, options)
    }
  }

  // getters and state object must be gotten lazily
  // because they will be changed by vm update
  // defineProperties 劫持 getters state
  Object.defineProperties(local, {
    getters: {
      // 没有命名空间 返回 store.getters
      // 有命名空间 返回 makeLocalGetters 处理后 store.getters
      get: noNamespace
        ? () => store.getters
        : () => makeLocalGetters(store, namespace)
    },
    state: {
      get: () => getNestedState(store.state, path)
    }
  })

  return local
}

// store namespace: 'cart/'
function makeLocalGetters (store, namespace) {
  const gettersProxy = {}
  const splitPos = namespace.length
  Object.keys(store.getters).forEach(type => {
    // skip if the target getter is not match this namespace
    // 匹配应命名空间 失败 return
    // 成功往下执行
    if (type.slice(0, splitPos) !== namespace) return

    // extract local getter type
    // 取出命名空间后的 getter type
    const localType = type.slice(splitPos)

    // Add a port to the getters proxy.
    // Define as getter property because
    // we do not want to evaluate the getters in this time.
    // 使用 defineProperty 为 gettersProxy 的 localType 添加 get
    // 劫持 gettersProxy 的 localType 的 get 返回 store 上对应的 getter
    Object.defineProperty(gettersProxy, localType, {
      get: () => store.getters[type],
      enumerable: true
    })
  })

  return gettersProxy
}

// 注册 mutation
function registerMutation (store, type, handler, local) {
  const entry = store._mutations[type] || (store._mutations[type] = [])
  entry.push(function wrappedMutationHandler (payload) {
    // handler 函数 this 指向 store, 传入当前 state
    // payload 是传参
    handler.call(store, local.state, payload)
  })
}

// 注册 action
function registerAction (store, type, handler, local) {
  // 取出 action 数组
  const entry = store._actions[type] || (store._actions[type] = [])
  entry.push(function wrappedActionHandler (payload, cb) {
    let res = handler.call(store, {
      dispatch: local.dispatch,
      commit: local.commit,
      getters: local.getters,
      state: local.state,
      rootGetters: store.getters,
      rootState: store.state
    }, payload, cb)
    // 如果是不 promise 包装成 promise
    if (!isPromise(res)) {
      res = Promise.resolve(res)
    }
    if (store._devtoolHook) {
      return res.catch(err => {
        store._devtoolHook.emit('vuex:error', err)
        throw err
      })
    } else {
      return res
    }
  })
}

// 注册 getter
function registerGetter (store, type, rawGetter, local) {
  // 有 相同 getter 报错
  if (store._wrappedGetters[type]) {
    if (process.env.NODE_ENV !== 'production') {
      console.error(`[vuex] duplicate getter key: ${type}`)
    }
    return
  }
  // 没有就存到 _wrappedGetters 上
  // 每一个getter 都是一个 function
  store._wrappedGetters[type] = function wrappedGetter (store) {
    return rawGetter(
      local.state, // local state
      local.getters, // local getters
      store.state, // root state
      store.getters // root getters
    )
  }
}

// 断言 通过 store._committing 判断
// 只能调用 _withCommit 处理 store
function enableStrictMode (store) {
  store._vm.$watch(function () { return this._data.$$state }, () => {
    if (process.env.NODE_ENV !== 'production') {
      assert(store._committing, `do not mutate vuex store state outside mutation handlers.`)
    }
  }, { deep: true, sync: true })
}

// 处理嵌套的 state
function getNestedState (state, path) {
  // 有 path.length
  // 调用 reduce 以 state 为初始值 取得对应 state
  // 没有返回 state
  return path.length
    ? path.reduce((state, key) => state[key], state)
    : state
}

function unifyObjectStyle (type, payload, options) {
  // type 是 纯对象处理
  if (isObject(type) && type.type) {
    options = payload
    payload = type
    type = type.type
  }

  if (process.env.NODE_ENV !== 'production') {
    assert(typeof type === 'string', `expects string as the type, but found ${typeof type}.`)
  }

  return { type, payload, options }
}

export function install (_Vue) {
  // 判断全局变量的 Vue 是否与传入 _Vue 的是一个实例
  // 避免重复安装
  if (Vue && _Vue === Vue) {
    if (process.env.NODE_ENV !== 'production') {
      console.error(
        '[vuex] already installed. Vue.use(Vuex) should be called only once.'
      )
    }
    return
  }
  // 首次安装保存实例
  Vue = _Vue
  // vuexInit
  applyMixin(Vue)
}
