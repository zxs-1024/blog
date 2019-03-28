---
title: vue-router 的导航守卫实践与解析
date: '2019-03-17'
spoiler: vue-router 提供的导航守卫主要用来通过跳转或取消的方式守卫导航。
---

## 导航守卫

vue-router 提供的导航守卫主要用来通过跳转或取消的方式守卫导航。有多种机会植入路由导航过程中：全局的, 单个路由独享的, 或者组件级的。

导航守卫有以下几种：

- 全局前置守卫 beforeEach
- 全局解析守卫 beforeResolve
- 全局后置钩子 afterEach
- 路由前置守卫 beforeEnter
- 组件前置守卫 beforeRouteEnter
- 组件更新钩子 beforeRouteUpdate
- 组件后置钩子 beforeRouteLeave

导航守卫包括了全局、单个路由、每个组件，有很多功能值得我们去探索。

[导航守卫 | Vue Router][1]

### 项目实践

在项目中我们可以利用全局前置守卫 beforeEach 进行路由验证，，通过全局守卫 beforeEach 和 afterEach 控制进度条打开和关闭，通过路由守卫对单个路由进行处理，通过组件守卫在路由组件进行处理。

#### 登录验证

我们一般用 beforeEach 这个全局前置守卫来做路由跳转前的登录验证。

来看一下具体配置：

```js
const router = new VueRouter({
  routes: [
    {
      path: '/login',
      name: 'login',
      meta: { name: '登录' },
      component: () => import('./views/login.vue')
    },
    {
      path: '/welcome',
      name: 'welcome',
      meta: { name: '欢迎', auth: true },
      component: () => import('./views/welcome.vue')
    }
  ]
})
```

在上面的 routers 中我们配置了 2 个路由，login 和 welcome，welcome 需要登录认证，我们在 welcome 路由的 meta 中加入了 `auth: true` 作为需要认证的标识。

beforeEach 全局前置守卫的配置：

```js
router.beforeEach((to, from, next) => {
  if (to.meta.auth) {
    if (getToken()) {
      next()
    } else {
      next('/login')
    }
  } else {
    next()
  }
})
```

在 beforeEach 中，router 会按照创建顺序调用，如果 getToken 能够获取到 token，我们就让路由跳转到 to 所对应的 path，否则强制跳转到 login 路由，进行登录认证。

```js
import Cookies from 'js-cookie'

const TokenKey = 'TOKEN_KEY'

export function getToken() {
  return Cookies.get(TokenKey)
}
```

getToken 函数引用 js-cookie 库，获取 cookie 。

#### 进度条

我们采用 NProgress.js 轻量级的进度条组件，支持自定义配置。

[NProgress.js][2]

```js
import NProgress from 'nprogress'

NProgress.configure({ showSpinner: false })

// 全局前置守卫
router.beforeEach((to, from, next) => {
  NProgress.start()
  next()
})

// 全局后置钩子
router.afterEach(() => {
  NProgress.done()
})
```

我们通过在全局后置钩子 beforeEach、全局前置守卫 afterEach 的回调中调用 NProgress 暴露的 start、done 函数，来控制进度条的显示和隐藏。

#### 组件守卫

```js
const Foo = {
  template: `...`,
  created () {
    console.log('this is created')
	this.searchData()
  },
  mounted () {
    console.log('this is mounted')
  },
  updated () {
    console.log('this is updated')
  },
  destroyed () {
    console.log('this is destroyed')
  },
  beforeRouteUpdate (to, from, next) {
   next()
  }
}
```

带有动态参数的路径 /foo/:id，在 /foo/1 和 /foo/2 之间跳转的时候，由于会渲染同样的 Foo 组件，因此组件实例会被复用。此时组件内的生命周期 created、mounted、destroyed 均不会执行，只有 updated 钩子会执行，在 vue 文档中这样解释:

> 由于数据更改导致的虚拟 DOM 重新渲染和打补丁，在这之后会调用该钩子。

但是我们只想监听路由变化呢，那么就得用到 beforeRouteUpdate 组件导航守卫。

```js
const Foo = {
  template: `...`,
  beforeRouteUpdate (to, from, next) {
  this.searchData()
   next()
  }
}
```

### 源码解析

那么既然 router 的导航守卫这么神奇，那在 vue-router 中是怎么实现的呢？

#### [阅读 vuex 源码的思维导图][3]

![阅读 vuex 源码的思维导图][image-1]

[vuex 的文档][4]对辅助看源码有不小的帮助，不妨在看源码之前仔细地撸一遍文档。

#### VueRouter

在 vue-router 的 index.js 中默认导出了 VueRouter 类。

```js
export default class VueRouter {
  constructor (options: RouterOptions = {}) {
    ...
    this.beforeHooks = []
    this.resolveHooks = []
    this.afterHooks = []
  }

  // 全局前置守卫
  beforeEach (fn: Function): Function {
    return registerHook(this.beforeHooks, fn)
  }

  // 全局解析守卫
  beforeResolve (fn: Function): Function {
    return registerHook(this.resolveHooks, fn)
  }

  // 全局后置钩子
  afterEach (fn: Function): Function {
    return registerHook(this.afterHooks, fn)
  }
}
```

在 VueRouter 类中申明了 beforeHooks、resolveHooks、afterHooks 数组用来储存全局的导航守卫函数，还申明了 beforeEach、beforeResolve、afterEach 这 3 个全局的导航守卫函数。

在导航守卫函数中都调用了 registerHook 函数：

```js
function registerHook(list: Array<any>, fn: Function): Function {
  list.push(fn)
  return () => {
    const i = list.indexOf(fn)
    if (i > -1) list.splice(i, 1)
  }
}
```

registerHook 函数会将传入的 fn 守卫函数推入对应的守卫函数队列 list，并返回可以删除此 fn 导航守卫的函数。

#### History

我们先来看看 History 类，在 src/history/base.js 文件。这里主要介绍 2 个核心函数 transitionTo、confirmTransition。

##### 核心函数 transitionTo
 
transitionTo 是 router 进行跳转的核心函数，我们来看一下它是如何实现的。

```js
export class History {
  ...
  // 跳转核心处理
  transitionTo (location: RawLocation, onComplete ?: Function, onAbort ?: Function) {
    // 调用 match 函数生成 route 对象
    const route = this.router.match(location, this.current)
    this.confirmTransition(route, () => {
      // 更新当前 route
      this.updateRoute(route)
      // 路由更新后的回调
      // 就是 HashHistory类的 setupListeners
      // 做了滚动处理 hash 事件监听
      onComplete && onComplete(route)
      // 更新 url （在子类申明的方法）
      this.ensureURL()

      // fire ready cbs once
      if (!this.ready) {
        this.ready = true
        this.readyCbs.forEach(cb => { cb(route) })
      }
    }, err => {
      if (onAbort) {
        onAbort(err)
      }
      if (err && !this.ready) {
        this.ready = true
        this.readyErrorCbs.forEach(cb => { cb(err) })
      }
    })
  }
}
```

transitionTo 函数接收 3 个函数，location 跳转路由、onComplete 成功回调、onAbort 中止回调。

vue-router 的 3 种 history 模式，AbstractHistory、HashHistory、HTML5History 类中都是通过 extends 继承了 History 类的 transitionTo 函数。

在 transitionTo 函数中首先会调用 match 函数生成 route 对象：

```js
{
  fullPath: "/"
  hash: ""
  matched: [{…}]
  meta:
  __proto__: Object
  name: undefined
  params: {}
  path: "/"
  query: {}
}
```

得到一个路由对象 route，然后调用 this.confirmTransition 函数，传入 route、成功回调、失败回调。

在成功回调中会调用 updateRoute 函数：

```js
updateRoute (route: Route) {
  const prev = this.current
  this.current = route
  this.cb && this.cb(route)
  this.router.afterHooks.forEach(hook => {
    hook && hook(route, prev)
  })
}
```

updateRoute 函数会更新当前 route，并遍历执行通过全局后置钩子 afterEach 推入 afterHooks 队列的导全局后置钩子函数。

PS: afterEach 别没有在迭代函数调用，因此没有传入 next 函数。 

在失败回调中会调用中止函数 onAbort。

##### 确认跳转函数 confirmTransition

confirmTransition 顾名思义，是来确认当前路由是否能够进行跳转，那么在函数内部具体做了哪些事情？

```js
export class History {
  ...
  confirmTransition (route: Route, onComplete: Function, onAbort ?: Function) {
    const current = this.current
    // 封装中止函数，循环调用 errorCbs 任务队列
    const abort = err => {
      ...
    }
    // 路由相同则返回
    if (
      isSameRoute(route, current) &&
      // in the case the route map has been dynamically appended to
      route.matched.length === current.matched.length
    ) {
      this.ensureURL()
      return abort()
    }
    // 用 resolveQueue 来做做新旧对比 比较后返回需要更新、激活、卸载 3 种路由状态的数组
    const {
      updated,
      deactivated,
      activated
    } = resolveQueue(this.current.matched, route.matched)
    // 提取守卫的钩子函数 将任务队列合并
    const queue: Array<?NavigationGuard> = [].concat(
      // in-component leave guards
      // 获得组件内的 beforeRouteLeave 钩子函数
      extractLeaveGuards(deactivated),
      // global before hooks
      this.router.beforeHooks,
      // in-component update hooks
      // 获得组件内的 beforeRouteUpdate 钩子函数
      extractUpdateHooks(updated),
      // in-config enter guards
      activated.map(m => m.beforeEnter),
      // async components
      // 异步组件处理
      resolveAsyncComponents(activated)
    )
    this.pending = route
    // 申明一个迭代函数，用来处理每个 hook 的 next 回调
    const iterator = (hook: NavigationGuard, next) => {
    ...
    }
    // 执行合并后的任务队列
    runQueue(queue, iterator, () => {
    ...
    })
  }
}
```

函数内部首先申明 current 变量，保存当前路由信息，并封装了 abort 中止函数。

```js
// 封装中止函数，循环调用 errorCbs 任务队列
const abort = err => {
  if (isError(err)) {
    if (this.errorCbs.length) {
      this.errorCbs.forEach(cb => { cb(err) })
    } else {
      warn(false, 'uncaught error during route navigation:')
      console.error(err)
    }
  }
  onAbort && onAbort(err)
}
```

abort 函数接收 err 参数，如果传入了 err 会执行 this.errorCbs 推入的 error 任务，并且执行 onAbort 中止函数。

接着会判断当前路由与跳转路由是否相同，如果相同，返回并执行中止函数 abort。

```js
const {
  updated,
  deactivated,
  activated
} = resolveQueue(this.current.matched, route.matched)
```

这里会调用 resolveQueue 函数，将当前的 matched 与跳转的 matched 进行比较，matched 是在 src/util/route.js 中 createRoute 函数中增加，用数组的形式记录当前 route 以及它的上级 route。

resolveQueue 函数主要用来做新旧对比，通过遍历 matched 数组，比较后返回需要更新、激活、卸载 3 种路由状态的数组。

接下来会有一个关键的操作，将所有的导航守卫函数合并成一个 queue 的任务队列。

```js
// 提取守卫的钩子函数 将任务队列合并
const queue: Array<?NavigationGuard> = [].concat(
  // in-component leave guards
  // 获得组件内的 beforeRouteLeave 钩子函数
  extractLeaveGuards(deactivated),
  // global before hooks
  this.router.beforeHooks,
  // in-component update hooks
  // 获得组件内的 beforeRouteUpdate 钩子函数
  extractUpdateHooks(updated),
  // in-config enter guards
  activated.map(m => m.beforeEnter),
  // async components
  // 异步组件处理
  resolveAsyncComponents(activated)
)
```

合并的顺序分别是组件内的 beforeRouteLeave、全局的 beforeHooks、组件内的 beforeRouteUpdate、组件内的 beforeEnter 以及异步组件的导航守卫函数。

##### 迭代函数 iterator

合并 queue 导航守卫任务队列后，申明了 iterator 迭代函数，该函数会作为参数传入 runQueue 方法。

```js
// 申明一个迭代函数，用来处理每个 hook 的 next 回调
const iterator = (hook: NavigationGuard, next) => {
  if (this.pending !== route) {
    return abort()
  }
  try {
    // 这就是调用导航守卫函数的地方
    // 传入了 route, current，next
    hook(route, current, (to: any) => {
      // next false 终止导航
      if (to === false || isError(to)) {
        // next(false) -> abort navigation, ensure current URL
        this.ensureURL(true)
        abort(to)
      } else if (
        typeof to === 'string' ||
        (typeof to === 'object' && (
          typeof to.path === 'string' ||
          typeof to.name === 'string'
        ))
      ) {
        // 传入了 url 进行路由跳转
        // next('/') or next({ path: '/' }) -> redirect
        abort()
        if (typeof to === 'object' && to.replace) {
          this.replace(to)
        } else {
          this.push(to)
        }
      } else {
        // confirm transition and pass on the value
        // next step(index + 1)
        next(to)
      }
    })
  } catch (e) {
    abort(e)
  }
}
```


iterator 迭代函数接收 hook 函数、next 回调作为参数，在函数内部会用 try catch 包裹 hook 函数的调用，这里就是我们执行导航守卫函数的地方，传入了 route、current，以及 next 回调。

在 next 回调中， 会对传入的 to 参数进行判断，分别处理，最后的 next(to) 调用的是 runQueue 中的

```js
fn(queue[index], () => {
  step(index + 1)
})
```

这样会继续调用下一个导航守卫。

#### 递归调用任务队列  runQueue

```js
/* @flow */
// 从第一个开始，递归调用任务队列
export function runQueue (queue: Array<?NavigationGuard>, fn: Function, cb: Function) {
  const step = index => {
    if (index >= queue.length) {
      cb()
    } else {
      if (queue[index]) {
        fn(queue[index], () => {
          step(index + 1)
        })
      } else {
        step(index + 1)
      }
    }
  }
  step(0)
}
```

runQueue 函数很简单，就是递归依次执行 queue 任务队列中的导航守卫函数，如果执行完毕，调用 cb 函数。

```js
// 执行合并后的任务队列
runQueue(queue, iterator, () => {
  const postEnterCbs = []
  const isValid = () => this.current === route
  // wait until async components are resolved before
  // extracting in-component enter guards
  // 拿到组件 beforeRouteEnter 钩子函数，合并任务队列
  const enterGuards = extractEnterGuards(activated, postEnterCbs, isValid)
  const queue = enterGuards.concat(this.router.resolveHooks)
  runQueue(queue, iterator, () => {
    if (this.pending !== route) {
      return abort()
    }
    this.pending = null
    onComplete(route)
    if (this.router.app) {
      this.router.app.$nextTick(() => {
        postEnterCbs.forEach(cb => { cb() })
      })
    }
  })
})
```

这里是正真调用 runQueue 函数的地方，传入了 queue、iterator 迭代函数、cb 回调函数，当 queue 队列的函数都执行完毕，调用传入的 cb 回调函数。

在 cb 函数中，调用 extractEnterGuards 函数拿到组件 beforeRouteEnter 钩子函数数组 enterGuards，然后与 resolveHooks 全局解析守卫进行合并，得到新的 queue，再次调用 runQueue 函数，最后调用 onComplete 函数，完成路由的跳转。

### 总结

在这里稍微总结下导航守卫，在 vue-router 中通过数组的形式模拟导航守卫任务队列，在 transitionTo 跳转核心函数中调用确认函数 confirmTransition，在 confirmTransition 函数中会递归 queue 导航守卫任务队列，通过传入 next 函数的参数来判断是否继续执行导航守卫任务。

感觉 vue-router 中提供的各种导航钩子，让我们能够灵活地处理路由的进入、离开、更新。

#### 导航守卫的执行顺序

例如从 / Home 页面跳转到 /foo，导航守卫执行顺序大概是这样的。

```js
in-component Home beforeRouteLeave hook
in-global beforeEach hook
in-router Foo beforeEnter hook
in-component Foo beforeRouteEnter hook
in-global beforeResolve hook
in-global afterEach hook
```

在当前路由改变，但是该组件被复用时调用，举例来说，对于一个带有动态参数的路径 /foo/:id，在 /foo/1 和 /foo/2 之间跳转的时候，由于会渲染同样的 Foo 组件，因此组件实例会被复用。beforeRouteUpdate 钩子就会在这个情况下被调用。

```js
in-global beforeEach hook
in-component Foo beforeRouteUpdate hook
in-global beforeResolve hook
in-global afterEach hook
```

[1]:	https://router.vuejs.org/zh/guide/advanced/navigation-guards.html#%E5%AF%BC%E8%88%AA%E5%AE%88%E5%8D%AB
[2]:	https://github.com/rstacruz/nprogress/
[3]:	https://sailor-1256168624.cos.ap-chengdu.myqcloud.com/blog/vue-router.png
[4]:	https://router.vuejs.org/zh/guide/advanced/navigation-guards.html#%E5%AF%BC%E8%88%AA%E5%AE%88%E5%8D%AB

[image-1]:	https://sailor-1256168624.cos.ap-chengdu.myqcloud.com/blog/vue-router-mini.png