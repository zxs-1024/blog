# vuex 辅助工具函数的实践与解析

Vuex 是一个专为 Vue.js 应用程序开发的*状态管理模式*。它采用集中式存储管理应用的所有组件的状态，并以相应的规则保证状态以一种可预测的方式发生变化。

在 vuex 中提供了几个辅助函数来帮助我们减少代码的重复和冗余。

**PS: 文章辅助函数介绍部分内容引用 [Vuex 文档](https://vuex.vuejs.org/zh/)。**

## 辅助函数介绍

### mapState

由于 Vuex 的状态存储是响应式的，从 store 实例中读取状态最简单的方法就是在计算属性中返回某个状态：

```js
// 创建一个 Counter 组件
const Counter = {
  template: `<div>{{ count }}</div>`,
  computed: {
    count() {
      return store.state.count
    }
  }
}
```

当一个组件需要获取多个状态时候，我们可以使用 mapState 辅助函数帮助我们生成计算属性：

```js
import { mapState } from 'vuex'

export default {
  // ...
  computed: mapState({
    // 箭头函数可使代码更简练
    count: state => state.count,

    // 传字符串参数 'count' 等同于 `state => state.count`
    countAlias: 'count',

    // 为了能够使用 `this` 获取局部状态，必须使用常规函数
    countPlusLocalState(state) {
      return state.count + this.localCount
    }
  })
}
```

当映射的计算属性的名称与 state 的子节点名称相同时，我们也可以给 mapState 传一个字符串数组。如果当前 computed 中有其他的 computed，可以通过对象展开运算符 `...` 与当前 vue 实例的 computed 进行合并。

```js
computed: {
  localComputed () { /* ... */ },
  // 使用对象展开运算符将此对象混入到外部对象中
  ...mapState({
    // 映射 this.count 为 store.state.count
    'count'
  })
}
```

### mapGetters

mapGetters 辅助函数仅仅是将 store 中的 getter 映射到局部计算属性：

```js
import { mapGetters } from 'vuex'

export default {
  // ...
  computed: {
    // 使用对象展开运算符将 getter 混入 computed 对象中
    ...mapGetters([
      'doneTodosCount',
      'anotherGetter'
      // ...
    ])
  }
}
```

如果你想将一个 getter 属性另取一个名字，使用对象形式：

```js
mapGetters({
  // 把 `this.doneCount` 映射为 `this.$store.getters.doneTodosCount`
  doneCount: 'doneTodosCount'
})
```

### mapMutations

你可以在组件中使用 `this.$store.commit('xxx')` 提交 mutation，或者使用 mapMutations 辅助函数将组件中的 methods 映射为 `store.commit` 调用（需要在根节点注入 store）。

```js
import { mapMutations } from 'vuex'

export default {
  // ...
  methods: {
    ...mapMutations([
      'increment', // 将 `this.increment()` 映射为 `this.$store.commit('increment')`

      // `mapMutations` 也支持载荷：
      'incrementBy' // 将 `this.incrementBy(amount)` 映射为 `this.$store.commit('incrementBy', amount)`
    ]),
    ...mapMutations({
      add: 'increment' // 将 `this.add()` 映射为 `this.$store.commit('increment')`
    })
  }
}
```

### mapActions

你在组件中使用 `this.$store.dispatch('xxx')` 分发 action，或者使用 mapActions 辅助函数将组件的 methods 映射为 `store.dispatch` 调用（需要先在根节点注入 store）：

```js
import { mapActions } from 'vuex'

export default {
  // ...
  methods: {
    ...mapActions([
      'increment', // 将 `this.increment()` 映射为 `this.$store.dispatch('increment')`

      // `mapActions` 也支持载荷：
      'incrementBy' // 将 `this.incrementBy(amount)` 映射为 `this.$store.dispatch('incrementBy', amount)`
    ]),
    ...mapActions({
      add: 'increment' // 将 `this.add()` 映射为 `this.$store.dispatch('increment')`
    })
  }
}
```

### createNamespacedHelpers

你可以通过使用 createNamespacedHelpers 创建基于某个命名空间辅助函数。它返回一个对象，对象里有新的绑定在给定命名空间值上的组件绑定辅助函数：

```js
import { createNamespacedHelpers } from 'vuex'

const { mapState, mapActions } = createNamespacedHelpers('some/nested/module')

export default {
  computed: {
    // 在 `some/nested/module` 中查找
    ...mapState({
      a: state => state.a,
      b: state => state.b
    })
  },
  methods: {
    // 在 `some/nested/module` 中查找
    ...mapActions(['foo', 'bar'])
  }
}
```

## 项目实战

在构建大型应用的时候，我们会将 Vuex 相关代码分割到模块中。下面是项目结构示例：

```bash
├── index.html
├── main.js
├── api
│   └── ... # 抽取出API请求
├── components
│   ├── App.vue
│   └── ...
└── store
    ├── index.js          # 我们组装模块并导出 store 的地方
    ├── actions.js        # 根级别的 action
    ├── mutations.js      # 根级别的 mutation
    └── modules
        ├── user.js       # 用户信息模块
        └── config.js     # 配置模块
        └── permission.js # 权限模块
```

### vue-help Example 🌰

为了让小伙伴们对项目更加直观，写了个小 Demo [Github | vue-helps](https://github.com/zhanghao-zhoushan/vue-helpers)，也可以访问 [Github Page | vue-helps Example 🌰](https://zhanghao-zhoushan.github.io/vue-helpers/dist/index.html#/store)。

### 结合 minxins

我们可以将可以复用的部分提取到 mixin 中，只要引入 mixin ，就能在页面中直接调用。

** html :**

在页面调用 checkPermission 方法，如果没有权限，则返回 false，对应的 html 不渲染。

```html
<div>
  <p>{{permissions}}</p>

  <el-button
    type="primary"
    v-if="checkPermission('vuex-helpers:permissionsButton:update')"
    @click="updatePermissions"
    >更新权限</el-button
  >
  <el-button
    type="danger"
    :disabled="!checkPermission('vuex-helpers:permissionsButton:reset')"
    >修改权限</el-button
  >
</div>
```

**javascript :**

在 javascript 中引入 checkPermissionMixin:

```js
import checkPermissionMixin from '../mixins/checkPermissionMixin'

export default {
  mixins: [checkPermissionMixin],

  created() {
    this.updatePermissions()
    // this.$store.dispatch('permission/updatePermissions')
  }
}
```

**checkPermissionMixin :**

在 checkPermissionMixin 中调用辅助工具函数，获取权限列表，并申明 checkPermission 检测权限的函数。

```js
import { mapState, mapGetters, mapActions } from 'vuex'

export default {
  computed: mapGetters('permission', ['permissions']),

  // computed: mapState({
  //   permissions: state => state.permission.permissions
  // }),

  methods: {
    ...mapActions('permission', ['updatePermissions']),

    checkPermission(permission) {
      return this.permissions.includes(permission)
    }
  }
}
```

## 源码解析

在 vue 的入口文件 `index.js` 使用 `export default` 默认导出了 mapState、mapMutations、 mapGetters、 mapActions、createNamespacedHelpers 辅助工具函数。

```js
import { Store, install } from './store'
import {
  mapState,
  mapMutations,
  mapGetters,
  mapActions,
  createNamespacedHelpers
} from './helpers'

export default {
  Store,
  install,
  version: '__VERSION__',
  mapState,
  mapMutations,
  mapGetters,
  mapActions,
  createNamespacedHelpers
}
```

我们可以通过解构的方式获得 vuex 暴露的辅助工具函数。

```js
import { mapState, mapMutations, mapGetters, mapActions } from 'vuex'
```

关于辅助工具函数的代码在 `src/helpers.js`:

```js
export const mapState = normalizeNamespace((namespace, states) => {
  ...
  return res
})

export const mapMutations = normalizeNamespace((namespace, mutations) => {
  ...
  return res
})

export const mapGetters = normalizeNamespace((namespace, getters) => {
  ...
  return res
})

export const mapActions = normalizeNamespace((namespace, actions) => {
  ...
  return res
})

export const createNamespacedHelpers = (namespace) => ({
  ...
})
```

可以看到 `helpers.js` 向外暴露了 5 个辅助工具函数，在 vuex 入口文件中包装成对象后暴露出去。

### mapState

mapState 辅助函数帮助我们生成计算属性。

来看一下具体实现：

```js
/**
 * Reduce the code which written in Vue.js for getting the state.
 * @param {String} [namespace] - Module's namespace
 * @param {Object|Array} states # Object's item can be a function which accept state and getters for param, you can do something for state and getters in it.
 * @param {Object}
 */
export const mapState = normalizeNamespace((namespace, states) => {
  const res = {}
  normalizeMap(states).forEach(({ key, val }) => {
    res[key] = function mappedState() {
      let state = this.$store.state
      let getters = this.$store.getters
      if (namespace) {
        const module = getModuleByNamespace(this.$store, 'mapState', namespace)
        if (!module) {
          return
        }
        state = module.context.state
        getters = module.context.getters
      }
      return typeof val === 'function'
        ? val.call(this, state, getters)
        : state[val]
    }
    // mark vuex getter for devtools
    res[key].vuex = true
  })
  return res
})
```

mapState 函数是经过 normalizeNamespace 函数处理后返回的函数，在调用 normalizeNamespace 的时候传入了回调函数。

### normalizeNamespace

我们先来看看 normalizeNamespace 函数：

```js
/**
 * Return a function expect two param contains namespace and map. it will normalize the namespace and then the param's function will handle the new namespace and the map.
 * @param {Function} fn
 * @return {Function}
 */
function normalizeNamespace(fn) {
  return (namespace, map) => {
    if (typeof namespace !== 'string') {
      map = namespace
      namespace = ''
    } else if (namespace.charAt(namespace.length - 1) !== '/') {
      namespace += '/'
    }
    return fn(namespace, map)
  }
}
```

normalizeNamespace 函数接收一个 fn 回调作为参数，也就是 mapState 传入的回调函数。

```js
;(namespace, map) => {
  if (typeof namespace !== 'string') {
    map = namespace
    namespace = ''
  } else if (namespace.charAt(namespace.length - 1) !== '/') {
    namespace += '/'
  }
  return fn(namespace, map)
}
```

此时 mapState 就是这个返回的函数，它接收 namespace 、map 作为参数，namespace 就是命名空间，map 就是传过来的 state。

首先会判断 namespace 是否是一个字符串，因为 mapState 第一个参数是可选的，如果不是字符串就说明没有命名空间，第一个参数就是传入的 state，将 namespace 赋值给 map，然后将 namespace 赋值为空字符串。进入 `else if` 后判断 namespace 最后一个字符串是否是 `/`，没有就拼上 `/` 。

当调用 mapState 的时候，就会返回 `fn(namespace, map)` 函数的运行后的结果，就是一个 res 对象。

**PS: normalizeNamespace 是一个高阶函数实现，高阶函数是接收一个或者多个函数作为参数，并返回一个新函数的函数。**

我们来看一下 mapState 中的 fn 具体实现。

首先申明一个 res 对象，作为循环赋值后返回结果，然后调用 normalizeMap 函数, normalizeMap 接收一个对象或者数组，转化成一个数组形式，数组元素是包含 key 和 value 的对象。

### normalizeMap

```js
/**
 * Normalize the map
 * normalizeMap([1, 2, 3]) => [ { key: 1, val: 1 }, { key: 2, val: 2 }, { key: 3, val: 3 } ]
 * normalizeMap({a: 1, b: 2, c: 3}) => [ { key: 'a', val: 1 }, { key: 'b', val: 2 }, { key: 'c', val: 3 } ]
 * @param {Array|Object} map
 * @return {Object}
 */
function normalizeMap(map) {
  return Array.isArray(map)
    ? map.map(key => ({ key, val: key }))
    : Object.keys(map).map(key => ({ key, val: map[key] }))
}
```

经过 normalizeMap 函数处理后，会转化成一个数组， `[{key: key, val: fn}]` 的格式，调用 forEach 循环处。

在 forEach 的回调函数中，使用解构取出 key 和 value，每一次循环就以 key 为键，mappedState 函数为 value 存入 res 对象，
在 mappedState 函数中，声明 state 和 getters 变量保存 `this.$store.state` 和 `this.$store.getters`。

接着判断传入的 namespace，如果有 namespace 就调用 getModuleByNamespace 函数搜索对应模块，如果没有搜索到就 return，有对应模块的话将对应模块的 state、getters 赋值给声明的 state 和 getters 变量。

mappedState 最后判断 val 是否是 function，是就调用 call 将 val 的 this 绑定到 Vue 实例，并将 state、 getters 作为参数传递，执行后返回，不是 function 根据 key 返回对应的 state。

### getModuleByNamespace

getModuleByNamespace 函数主要用来搜索具有命名空间的模块。

```js
/**
 * Search a special module from store by namespace. if module not exist, print error message.
 * @param {Object} store
 * @param {String} helper
 * @param {String} namespace
 * @return {Object}
 */
function getModuleByNamespace(store, helper, namespace) {
  const module = store._modulesNamespaceMap[namespace]
  if (process.env.NODE_ENV !== 'production' && !module) {
    console.error(
      `[vuex] module namespace not found in ${helper}(): ${namespace}`
    )
  }
  return module
}
```

函数开始申明 module 变量，然后根据 namespace 从 `store._modulesNamespaceMap` 取出对应模块，
`_modulesNamespaceMap` 这个变量是在 Store 类中，调用 installModule 时候保存所以所有命名空间模块的变量。

判断非生产环境并且没有对应模块，抛出异常，最后将 module 变量返回。

forEach 最后还有一段：

```js
// mark vuex getter for devtools
res[key].vuex = true
```

应该是 devtools 需要这个属性判断 value 是否属于 vuex。

完成 forEach 循环后会将处理后的 res 对象返回。

### mapMutations

mapMutations 辅助函数将组件中的 methods 映射为 `store.commit` 调用。

来看一下具体实现：

```js
/**
 * Reduce the code which written in Vue.js for committing the mutation
 * @param {String} [namespace] - Module's namespace
 * @param {Object|Array} mutations # Object's item can be a function which accept `commit` function as the first param, it can accept anthor params. You can commit mutation and do any other things in this function. specially, You need to pass anthor params from the mapped function.
 * @return {Object}
 */
export const mapMutations = normalizeNamespace((namespace, mutations) => {
  const res = {}
  normalizeMap(mutations).forEach(({ key, val }) => {
    res[key] = function mappedMutation(...args) {
      // Get the commit method from store
      let commit = this.$store.commit
      if (namespace) {
        const module = getModuleByNamespace(
          this.$store,
          'mapMutations',
          namespace
        )
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
```

mapMutations 处理过程与 mapState 相似，我看来看看传入 normalizeNamespace 的回调函数。

首先也是申明 res 空对象，经过 normalizeMap 函数处理后的 mutations 调用 forEach 循环处理，在 forEach 的回调函数中， 使用解构取出 key 和 value，每一次循环就以 key 为键、mappedMutation 函数为 value 存入 res 对象， 在 mappedMutation 函数中，声明 commit 变量保存 this.\$store.commit 。

判断传入的 namespace，如果有 namespace 就调用 getModuleByNamespace 函数搜索对应模块，如果没有搜索到就 return，有对应模块的话对应模块的将 commit 赋值给声明的 commit 变量。

mappedMutation 最后判断 val 是否是 function，是就调用 apply 将 val 的 this 绑定到 Vue 实例，并将 commit 和 args 合并成一个数组作为参数传递，，val 不是 function 就将 commit 调用 apply 改变了 this 指向，将 val 和 args 合并成一个数组作为参数传递，执行后返回。

最后将 res 对象返回。

### mapGetters

mapGetters 辅助函数将 store 中的 getter 映射到局部计算属性。

来看一下具体实现：

```js
/**
 * Reduce the code which written in Vue.js for getting the getters
 * @param {String} [namespace] - Module's namespace
 * @param {Object|Array} getters
 * @return {Object}
 */
export const mapGetters = normalizeNamespace((namespace, getters) => {
  const res = {}
  normalizeMap(getters).forEach(({ key, val }) => {
    // thie namespace has been mutate by normalizeNamespace
    val = namespace + val
    res[key] = function mappedGetter() {
      if (
        namespace &&
        !getModuleByNamespace(this.$store, 'mapGetters', namespace)
      ) {
        return
      }
      if (
        process.env.NODE_ENV !== 'production' &&
        !(val in this.$store.getters)
      ) {
        console.error(`[vuex] unknown getter: ${val}`)
        return
      }
      return this.$store.getters[val]
    }
    // mark vuex getter for devtools
    res[key].vuex = true
  })
  return res
})
```

我看来看看传入 normalizeNamespace 的回调函数。

首先也是申明 res 空对象，经过 normalizeMap 函数处理后的 getters 调用 forEach 循环处理，在 forEach 的回调函数中， 使用解构取出 key 和 value，每一次循环就以 key 为键、mappedGetter 函数为 value 存入 res 对象，这里会将 val 赋值成 namespace + val，如果有命名空间，此时的 val 应该是类似这样的: `cart/cartProducts` 。

在 mappedGetter 函数中，首先判断如果有 namespace 并且调用 getModuleByNamespace 函数没有匹配到对应模块就直接 return。

然后判断在非生产环境并且 `this.$store.getters` 没有对应的 val 就抛出异常并返回。接下来就是有对应模块的情况，直接返回 `this.$store.getters` 对应的 getter。

最后将 res 对象返回。

### mapActions

mapActions 辅助函数将组件的 methods 映射为 `store.dispatch` 调用。

来看一下具体实现：

```js
/**
 * Reduce the code which written in Vue.js for dispatch the action
 * @param {String} [namespace] - Module's namespace
 * @param {Object|Array} actions # Object's item can be a function which accept `dispatch` function as the first param, it can accept anthor params. You can dispatch action and do any other things in this function. specially, You need to pass anthor params from the mapped function.
 * @return {Object}
 */
export const mapActions = normalizeNamespace((namespace, actions) => {
  const res = {}
  normalizeMap(actions).forEach(({ key, val }) => {
    res[key] = function mappedAction(...args) {
      // get dispatch function from store
      let dispatch = this.$store.dispatch
      if (namespace) {
        const module = getModuleByNamespace(
          this.$store,
          'mapActions',
          namespace
        )
        if (!module) {
          return
        }
        dispatch = module.context.dispatch
      }
      return typeof val === 'function'
        ? val.apply(this, [dispatch].concat(args))
        : dispatch.apply(this.$store, [val].concat(args))
    }
  })
  return res
})
```

mapActions 处理过程与 mapMutations 函数一模一样，就不在赘述。

### createNamespacedHelpers

createNamespacedHelpers 创建基于某个命名空间辅助函数。

来看一下具体实现：

```js
/**
 * Rebinding namespace param for mapXXX function in special scoped, and return them by simple object
 * @param {String} namespace
 * @return {Object}
 */
export const createNamespacedHelpers = namespace => ({
  mapState: mapState.bind(null, namespace),
  mapGetters: mapGetters.bind(null, namespace),
  mapMutations: mapMutations.bind(null, namespace),
  mapActions: mapActions.bind(null, namespace)
})
```

createNamespacedHelpers 函数接受一个字符串作为参数，返回一个包含 mapState 、mapGetters 、mapActions 和 mapMutations 的对象。

以 mapState 为例，调用 mapState 函数的 bind 方法，将 null 作为第一个参数传入，不会改变 this 指向，namespace 作为第二个参数。

```js
import { createNamespacedHelpers } from 'vuex'

const { mapState, mapActions } = createNamespacedHelpers('some/nested/module')

export default {
  computed: {
    // 在 `some/nested/module` 中查找
    ...mapState({
      a: state => state.a,
      b: state => state.b
    })
  },
  methods: {
    // 在 `some/nested/module` 中查找
    ...mapActions(['foo', 'bar'])
  }
}
```

此时的 mapState 函数就是经过 bind 处理过的，会将 namespace 作为第一个参数传入。

相当于下面这样：

```js
...mapState('some/nested/module', {
  a: state => state.a,
  b: state => state.b
})
```

简化了重复写入命名空间。

到此 `helpers.js` 结束。

## 一些小问题

这是一个小伙伴问我的，下面是我的理解：

### mapState 和 mapGetters 有什么不同，各自适用什么场景 ?

我们先来明确一下概念：

- mapGetters 辅助函数将 store 中的 getter 映射到 computed；
- mapState 辅助函数将 store 中对应的属性映射到 computed；

归根到底，其实是 state 和 getters 的区别：state 是一个以 key、value 的形式储存状态的对象，而 getters 则是 key: fn 形式的对象，fn 就类似 *state => state.userInfo*：

```js
const getters = {
  userInfo: state => state.userInfo
}
```

当我们在组件或者页面中获取 userInfo，我们可以通过 mapGetters:

```js
export default {
  computed: {
  	...mapGetters(['userInfo'])
  }
}
```

也可以通过 mapState：

```js
export default {
  computed: {
    ...mapState({
      userInfo: : state => state.userInfo
    })
  }
}
```

相比较来说 mapGetters 的代码更为简洁。

总结一下：

mapGetters 其实是将重复的取值行为抽象到 mapGetters 中，而我们能够通过更少的代码得到相同的作用，但是如果这个取值只是出现一次，没有必要通过 mapGetters，我们就可以用 mapState 。

### 在项目中，一些与后端交互的代码，一般是放在 action 里面好些，还是放在 vue 文件处理好呢 ？

这个一般来说，我会把业务代码放到 vue 文件中，由于业务的特殊和多变性，代码往往是不可复用的。但是如果有一业务代码可以复用，你也可以尝试放到 action 中，记得确保复用的代码不会改动。

但是有一些关于用户信息、权限以及项目中有很多页面会用到的数据，我会通过 mapAction 去获取，然后需要获取对象数据的时候，通过 mapGetters 获取。
