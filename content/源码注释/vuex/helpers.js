/**
 * Reduce the code which written in Vue.js for getting the state.
 * @param {String} [namespace] - Module's namespace
 * @param {Object|Array} states # Object's item can be a function which accept state and getters for param, you can do something for state and getters in it.
 * @param {Object}
 * shopping-cart examples
 */
// states 处理成数组后循环
// 最后返回一个以 states type 为 key, this.$store.state[states type] 为值的对象
export const mapState = normalizeNamespace((namespace, states) => {
  const res = {}
  // 格式化 states
  // 将 states 转换成 [{key: products, val: fn}] 的格式
  normalizeMap(states).forEach(({ key, val }) => {
    // 以 key: value 形式存入 res
    res[key] = function mappedState () {
      // 取出 $store state getters
      let state = this.$store.state
      let getters = this.$store.getters
      // 如果有命名空间
      if (namespace) {
        // 通过 getModuleByNamespace 搜索对应模块，没有搜索到 return
        const module = getModuleByNamespace(this.$store, 'mapState', namespace)
        if (!module) {
          return
        }
        // 保存为命名空间 state getters
        state = module.context.state
        getters = module.context.getters
      }
      // 如果 val 是 function 将 val 指向 Vue 实例，并将得到的 state getters 传参
      // call 改变了 this 执行并且返回
      // 所以在 mapState 中也传入了 getters 参数
      // products(state, getters) {
      //   return state.products.all;
      // }
      // 不是 function 直接根据 key 返回对应的 state
      // return
      return typeof val === 'function'
        ? val.call(this, state, getters)
        : state[val]
    }
    // mark vuex getter for devtools
    res[key].vuex = true
  })
  return res
})

/**
 * Reduce the code which written in Vue.js for committing the mutation
 * @param {String} [namespace] - Module's namespace
 * @param {Object|Array} mutations # Object's item can be a function which accept `commit` function as the first param, it can accept anthor params. You can commit mutation and do any other things in this function. specially, You need to pass anthor params from the mapped function.
 * @return {Object}
 */
// mutations 处理成数组后循环
// 最后返回一个以 mutations type 为 key, this.$store.commit.apply(this, [type].concat(args)) 为值的对象
export const mapMutations = normalizeNamespace((namespace, mutations) => {
  const res = {}
  normalizeMap(mutations).forEach(({ key, val }) => {
    // 以 key: value 形式存入 res
    res[key] = function mappedMutation (...args) {
      // Get the commit method from store
      let commit = this.$store.commit
      if (namespace) {
        // 通过 getModuleByNamespace 搜索对应模块，没有搜索到 return
        const module = getModuleByNamespace(this.$store, 'mapMutations', namespace)
        if (!module) {
          return
        }
        commit = module.context.commit
      }
      return typeof val === 'function'
        ? val.apply(this, [commit].concat(args))
        : commit.apply(this.$store, [val].concat(args))
    }
  })
  return res
})

/**
 * Reduce the code which written in Vue.js for getting the getters
 * @param {String} [namespace] - Module's namespace
 * @param {Object|Array} getters
 * @return {Object}
 * ['evenOrOdd']
 * 这是后传入的是 normalizeNamespace 处理后的参数
 * namespace: ''
 * getters: ["evenOrOdd"]
 */
// getters 处理成数组后循环
// 最后返回一个以 getter type 为 key, this.$store.getters[getter type] 为值的对象
export const mapGetters = normalizeNamespace((namespace, getters) => {
  const res = {}
  // 格式化 getters
  // 将 getters 转换成 [{key: "evenOrOdd", val: "evenOrOdd"}] 的格式
  normalizeMap(getters).forEach(({ key, val }) => {
    // thie namespace has been mutate by normalizeNamespace
    // 根据 字符串拼 key 的形式处理命名空间的问题
    // 以 key: value 形式存入 res
    val = namespace + val
    res[key] = function mappedGetter () {
      // 通过 getModuleByNamespace 搜索对应模块，没有搜索到 return
      if (namespace && !getModuleByNamespace(this.$store, 'mapGetters', namespace)) {
        return
      }
      // 如果是开发环境 但是 store.getters 没有则报错
      if (process.env.NODE_ENV !== 'production' && !(val in this.$store.getters)) {
        console.error(`[vuex] unknown getter: ${val}`)
        return
      }
      // 最后没有问题则返回 实例上对应的 getter
      return this.$store.getters[val]
    }
    // mark vuex getter for devtools
    // 根据注释判断 应该是为了给 devtools 调试工具使用的
    res[key].vuex = true
  })
  // 返回 res {evenOrOdd: fn}
  // 最后应该是这样的
  // computed: {
  //  evenOrOdd: fn
  // }
  return res
})

/**
 * Reduce the code which written in Vue.js for dispatch the action
 * @param {String} [namespace] - Module's namespace
 * @param {Object|Array} actions # Object's item can be a function which accept `dispatch` function as the first param, it can accept anthor params. You can dispatch action and do any other things in this function. specially, You need to pass anthor params from the mapped function.
 * @return {Object}
 * ['increment','decrement','incrementIfOdd','incrementAsync']
 * 这是后传入的是 normalizeNamespace 处理后的参数
 * namespace: ''
 * actions: ["increment", "decrement", "incrementIfOdd", "incrementAsync"]
 */
// actions 处理成数组后循环
// 最后返回一个以 actions type 为 key, this.$store.apply(this, [type].concat(args)) 为值的对象
// 并且将 type 挂在到同名的 methods 上
export const mapActions = normalizeNamespace((namespace, actions) => {
  const res = {}
  // 格式化 actions
  // 将 actions 转换成 [{"key":"increment","val":"increment"},{"key":"decrement","val":"decrement"},{"key":"incrementIfOdd","val":"incrementIfOdd"},{"key":"incrementAsync","val":"incrementAsync"}] 的格式
  normalizeMap(actions).forEach(({ key, val }) => {
    // 根据 字符串拼 key 的形式处理命名空间的问题
    // 将 val 以 key: value 形式存入 res
    res[key] = function mappedAction (...args) {
      // get dispatch function from store
      let dispatch = this.$store.dispatch
      // 如果有命名空间
      if (namespace) {
        // 通过 getModuleByNamespace 搜索对应模块，没有搜索到 return
        const module = getModuleByNamespace(this.$store, 'mapActions', namespace)
        if (!module) {
          return
        }
        // 有对应的模块 就将 module.context.dispatch 赋值给 dispatch
        // dispatch 指向 this.$store.dispatch
        // TODO: dispatch boundDispatch 函数
        // 应该是将 res 存入的方法保存到 vue 的 methods 上
        dispatch = module.context.dispatch
      }
      // 如果 val 是 function 将 val 指向 Stroe 实例，并将得到的 dispatch 合并传参
      // 不是的话将 dispatch 指向 this.$store 并将得到的 val 合并传参
      return typeof val === 'function'
        ? val.apply(this, [dispatch].concat(args))
        : dispatch.apply(this.$store, [val].concat(args))
    }
  })
  // 最后应该是这样的
  // methods: {
  //  increment () {},
  //  decrement () {},
  //  incrementIfOdd () {},
  //  incrementAsync () {}
  // }
  return res
})

/**
 * Rebinding namespace param for mapXXX function in special scoped, and return them by simple object
 * @param {String} namespace
 * @return {Object}
 */
export const createNamespacedHelpers = (namespace) => ({
  mapState: mapState.bind(null, namespace),
  mapGetters: mapGetters.bind(null, namespace),
  mapMutations: mapMutations.bind(null, namespace),
  mapActions: mapActions.bind(null, namespace)
})

/**
 * Normalize the map
 * normalizeMap([1, 2, 3]) => [ { key: 1, val: 1 }, { key: 2, val: 2 }, { key: 3, val: 3 } ]
 * normalizeMap({a: 1, b: 2, c: 3}) => [ { key: 'a', val: 1 }, { key: 'b', val: 2 }, { key: 'c', val: 3 } ]
 * @param {Array|Object}
 * @return {Object}
 * 格式化 getter mutations actions states
 * 接收一个对象或者数组，转化成一个数组形式，数组元素是包含 key 和 value 的对象
 */
function normalizeMap (map) {
  return Array.isArray(map)
    ? map.map(key => ({ key, val: key }))
    : Object.keys(map).map(key => ({ key, val: map[key] }))
}

/**
 * Return a function expect two param contains namespace and map. it will normalize the namespace and then the param's function will handle the new namespace and the map.
 * @param {Function} fn
 * @return {Function}
 * 以 Counter 例子为准，
 * 第一次调用 mapGetters 传入 ['evenOrOdd'] 数组
 * 第二次调用 mapActions 传入 ['increment','decrement','incrementIfOdd','incrementAsync'] 数组
 * 以 shopping-card 为准
 * 第一次调用 mapState 传入 {products: fn} 对象
 * 第二次调用 mapState 传入 {checkoutStatus: fn} 对象
 */
function normalizeNamespace (fn) {
  return (namespace, map) => {
    // 判断不是字符串 进入
    if (typeof namespace !== 'string') {
      // 将 namespace 赋值给 map
      // namespace 置空
      map = namespace
      namespace = ''
      // 如果是字符串最后一个字符不是 / 则加入
      // 应该是处理命名空间的 毕竟提供了模块化的 module
    } else if (namespace.charAt(namespace.length - 1) !== '/') {
      namespace += '/'
    }
    // 将传入的 fn 加上处理后参数执行并且返回
    return fn(namespace, map)
  }
}

/**
 * Search a special module from store by namespace. if module not exist, print error message.
 * @param {Object} store
 * @param {String} helper
 * @param {String} namespace
 * @return {Object}
 */
function getModuleByNamespace (store, helper, namespace) {
  // _modulesNamespaceMap 在 Store 构造函数中 保存有命名空间的模块
  const module = store._modulesNamespaceMap[namespace]
  if (process.env.NODE_ENV !== 'production' && !module) {
    console.error(`[vuex] module namespace not found in ${helper}(): ${namespace}`)
  }
  return module
}
