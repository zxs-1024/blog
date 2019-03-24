---
title: vue-router 的导航守卫实践与解析
date: '2019-03-17'
spoiler: vue-router 提供的导航守卫主要用来通过跳转或取消的方式守卫导航。
---

## 导航守卫

vue-router 提供的导航守卫主要用来通过跳转或取消的方式守卫导航。

在我们项目当中，主要是用作路由跳转的验证，比如说，当前用户是否登录、登录 Token 是否过期，也可以用来控制项目的进度条。

[导航守卫 | Vue Router](https://router.vuejs.org/zh/guide/advanced/navigation-guards.html#%E5%AF%BC%E8%88%AA%E5%AE%88%E5%8D%AB)

### 项目实践

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

在上面的路由中我们配置了 2 个路由，login 和 welcome，welcome 需要登录认证，我们在 welcome 路由的 meta 中加入了 `auth: true` 作为需要认证的标识。

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

#### 进度条

我们采用 NProgress.js 轻量级的进度条组件，支持自定义配置。

[NProgress.js](https://github.com/rstacruz/nprogress/)

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

我们通过在全局后置钩子和全局前置守卫的回调中调用 NProgress 暴露的函数，控制进度条的显示和隐藏。

### 源码解析

那么既然 router 的导航守卫这么神奇，那在 vue-router 中是怎么实现的呢？我们来研究下源码。

在 vue-router 的 index.js 中默认导出了 VueRouter 类。

```js
export default class VueRouter {
  constructor (options: RouterOptions = {}) {
    ...
    this.beforeHooks = []
    this.resolveHooks = []
    this.afterHooks = []
  }

  // 全局前置守卫 一般用作拦截登录
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

在 VueRouter 类中申明了 beforeHooks、resolveHooks、afterHooks 用来储存钩子回调函数，并且对外暴露了 beforeEach、
beforeResolve、afterEach 这三个导航守卫函数。

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

registerHook 函数会将 fn 守卫函数推入传入的守卫守卫队列 list，并且返回删除 fn 的函数。

在 src/history/base.js 中的 History 类中，主要介绍 2 个核心函数 transitionTo、confirmTransition。

```js
export class History {
  ...
  // 跳转核心处理
  transitionTo (location: RawLocation, onComplete ?: Function, onAbort ?: Function) {
    // 得到 match 处理后的 route
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

transitionTo 是跳转的核心函数，在 AbstractHistory、HashHistory、HTML5History 类中都是通过继承 History 类的 transitionTo 函数，进行路由跳转。

transitionTo 函数接收 3 个函数，location 跳转路由、onComplete 成功回调、onAbort 中止回调。在函数内部调用 confirmTransition 函数，并且将路由信息、成功回调、中止回调作为参数传入。

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

    // 将当前的 matched 与 跳转的 matched 比较
    // matched 是在 createRoute 中增加
    // 用来数组记录当前 route 以及它的上级 route
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

```js
runQueue(queue, iterator, () => {
  const postEnterCbs = []
  const isValid = () => this.current === route
  // wait until async components are resolved before
  // extracting in-component enter guards
  // 拿到组件 beforeRouteEnter 钩子函数 合并任务队列
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