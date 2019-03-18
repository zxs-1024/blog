/* @flow */

import { install } from './install'
import { START } from './util/route'
import { assert } from './util/warn'
import { inBrowser } from './util/dom'
import { cleanPath } from './util/path'
import { createMatcher } from './create-matcher'
import { normalizeLocation } from './util/location'
import { supportsPushState } from './util/push-state'

import { HashHistory } from './history/hash'
import { HTML5History } from './history/html5'
import { AbstractHistory } from './history/abstract'

import type { Matcher } from './create-matcher'

export default class VueRouter {
  static install: () => void;
  static version: string;

  app: any;
  apps: Array<any>;
  ready: boolean;
  readyCbs: Array<Function>;
  options: RouterOptions;
  mode: string;
  history: HashHistory | HTML5History | AbstractHistory;
  matcher: Matcher;
  fallback: boolean;
  beforeHooks: Array<?NavigationGuard>;
  resolveHooks: Array<?NavigationGuard>;
  afterHooks: Array<?AfterNavigationHook>;
  constructor (options: RouterOptions = {}) {
    this.app = null
    this.apps = []
    this.options = options
    this.beforeHooks = []
    this.resolveHooks = []
    this.afterHooks = []
    /**
     *  createMatcher
     *    return {
     *      match, 匹配函数 通过传入的 routes 生产各种路由表
     *      addRoutes 动态添加更多的路由规则
     *    }
     */
    this.matcher = createMatcher(options.routes || [], this)

    // 默认 hash 模式
    let mode = options.mode || 'hash'
    // 使用 history 模式 如果设备不支持 强制使用 hash 模式
    this.fallback = mode === 'history' && !supportsPushState && options.fallback !== false
    if (this.fallback) {
      mode = 'hash'
    }
    // 不是浏览器环境环境 强制使用 abstract 模式
    // 使用场景: Node 服务器
    if (!inBrowser) {
      mode = 'abstract'
    }
    this.mode = mode

    // 根据 mode 实例化 history
    // options.base 是实例化 VueRouter 时的 __dirname
    switch (mode) {
      case 'history':
        this.history = new HTML5History(this, options.base)
        break
      case 'hash':
        // 这里把上面的 fallback 作为参数传入
        // HashHistory 中会做处理
        this.history = new HashHistory(this, options.base, this.fallback)
        break
      case 'abstract':
        this.history = new AbstractHistory(this, options.base)
        break
      default:
        if (process.env.NODE_ENV !== 'production') {
          // 断言
          assert(false, `invalid mode: ${mode}`)
        }
    }
  }

  match (
    raw: RawLocation,
    current?: Route,
    redirectedFrom?: Location
  ): Route {
    return this.matcher.match(raw, current, redirectedFrom)
  }

  // 获取当前路由信息
  get currentRoute (): ?Route {
    return this.history && this.history.current
  }

  init (app: any /* Vue component instance */) {
    process.env.NODE_ENV !== 'production' && assert(
      install.installed,
      `not installed. Make sure to call \`Vue.use(VueRouter)\` ` +
      `before creating root instance.`
    )
    this.apps.push(app)

    // main app already initialized.
    if (this.app) {
      return
    }

    this.app = app

    const history = this.history

    // 对 HTML5History HashHistory 2种实例做特殊处理
    if (history instanceof HTML5History) {
      history.transitionTo(history.getCurrentLocation())
    } else if (history instanceof HashHistory) {
      const setupHashListener = () => {
        history.setupListeners()
      }
      /**
       *  transitionTo 的 回调是在 route 更新后触发
       *  所以是在 route 更新后再添加事件监听
       *  防止 根目录情况下 连续触发 hashchange 事件
       *  issues #725
       */
      history.transitionTo(
        // HashHistory 类的 getHash 方法， 获取 hash 后的 url
        history.getCurrentLocation(),
        setupHashListener,
        setupHashListener
      )
    }

    // issues #1110 #1108
    // 主要是为了修复多个vue实例 route 状态共享的问题
    // 调用 History 类的 listen 方法 将传入的函数赋值给 this.cb
    // 通过 updateRoute 方法调用 更新 route 触发 vue 的 set
    history.listen(route => {
      this.apps.forEach((app) => {
        app._route = route
      })
    })
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

  // 一下都是调用 history 类的方法
  onReady (cb: Function, errorCb?: Function) {
    this.history.onReady(cb, errorCb)
  }

  onError (errorCb: Function) {
    this.history.onError(errorCb)
  }

  push (location: RawLocation, onComplete?: Function, onAbort?: Function) {
    this.history.push(location, onComplete, onAbort)
  }

  replace (location: RawLocation, onComplete?: Function, onAbort?: Function) {
    this.history.replace(location, onComplete, onAbort)
  }

  go (n: number) {
    this.history.go(n)
  }

  back () {
    this.go(-1)
  }

  forward () {
    this.go(1)
  }

  // 返回目标位置或是当前路由匹配的组件数组
  getMatchedComponents (to?: RawLocation | Route): Array<any> {
    // 有 to 就取 to.matched 没有 to.matched 就调用 this.resolve(to) 得到 route
    // 没有就是当前路由记录
    const route: any = to
      ? to.matched
        ? to
        : this.resolve(to).route
      : this.currentRoute
    if (!route) {
      return []
    }
    // 从 route.matched 路由记录表拿到对应的 component 以数组返回
    return [].concat.apply([], route.matched.map(m => {
      return Object.keys(m.components).map(key => {
        return m.components[key]
      })
    }))
  }

  resolve (
    to: RawLocation,
    current?: Route,
    append?: boolean
  ): {
      location: Location,
      route: Route,
      href: string,
      // for backwards compat
      normalizedTo: Location,
      resolved: Route
    } {
    const location = normalizeLocation(
      to,
      current || this.history.current,
      append,
      this
    )
    const route = this.match(location, current)
    const fullPath = route.redirectedFrom || route.fullPath
    const base = this.history.base
    const href = createHref(base, fullPath, this.mode)
    return {
      location,
      route,
      href,
      // for backwards compat
      normalizedTo: location,
      resolved: route
    }
  }

  // 引用 createMatcher return 的 matcher 方法
  // 动态添加更多的路由规则
  addRoutes (routes: Array<RouteConfig>) {
    this.matcher.addRoutes(routes)
    if (this.history.current !== START) {
      this.history.transitionTo(this.history.getCurrentLocation())
    }
  }
}

// 将回调 push 到对应的守卫钩子任务队列
function registerHook (list: Array<any>, fn: Function): Function {
  list.push(fn)
  return () => {
    const i = list.indexOf(fn)
    if (i > -1) list.splice(i, 1)
  }
}

// 不同 mode 的 href 处理
function createHref (base: string, fullPath: string, mode) {
  var path = mode === 'hash' ? '#' + fullPath : fullPath
  return base ? cleanPath(base + '/' + path) : path
}

// 插件暴露的 install 方法
VueRouter.install = install
VueRouter.version = '__VERSION__'

// 在 浏览器环境 和 有 window 挂载 Vue 实例情况下 自动使用插件
if (inBrowser && window.Vue) {
  window.Vue.use(VueRouter)
}
