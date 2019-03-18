import View from './components/view'
import Link from './components/link'

export let _Vue

export function install (Vue) {
  // 避免重复安装
  if (install.installed && _Vue === Vue) return
  install.installed = true

  // 这里使用一个内部变量来保存 Vue 实例
  // 是为了为了避免 依赖 Vue
  _Vue = Vue

  // 简单工具函数，判断不为 undefined
  const isDef = v => v !== undefined

  const registerInstance = (vm, callVal) => {
    let i = vm.$options._parentVnode
    // registerRouteInstance 是在 RouterView 赋值的
    // 所以说 只有组件是 RouterView 才执行
    // 在满足条件的情况将 i 赋值为 i.data.registerRouteInstance 并调用
    if (isDef(i) && isDef(i = i.data) && isDef(i = i.registerRouteInstance)) {
      i(vm, callVal)
    }
  }

  // 全局混合策略 影响后面的vue实例 mixin 生命周期钩子将优先执行
  Vue.mixin({
    beforeCreate () {
      // 判断是否有 router 实例，
      // 有就是根组件 执行 init 方法
      if (isDef(this.$options.router)) {
        this._routerRoot = this
        this._router = this.$options.router
        this._router.init(this)
        // 使用 Vue.util 暴露的 defineReactive 建立响应式的 _route 对象
        // Vue.util 是在 initGlobalAPI 方法中暴露的
        // vue/src/core/global-api/index.js
        Vue.util.defineReactive(this, '_route', this._router.history.current)
      } else {
        // 没有就赋值为父级的 _routerRoot 或者 this
        this._routerRoot = (this.$parent && this.$parent._routerRoot) || this
      }
      registerInstance(this, this)
    },
    destroyed () {
      registerInstance(this)
    }
  })

  // 给原型添加 $router $route 代理到 this._routerRoot._router
  Object.defineProperty(Vue.prototype, '$router', {
    get () { return this._routerRoot._router }
  })

  Object.defineProperty(Vue.prototype, '$route', {
    get () { return this._routerRoot._route }
  })

  // 注册 router-view router-link 组件
  Vue.component('RouterView', View)
  Vue.component('RouterLink', Link)

  // 自定义合并策略
  // optionMergeStrategies 声明在vue/src/core/config.js 暂时没找到在哪里赋值的
  const strats = Vue.config.optionMergeStrategies
  // use the same hook merging strategy for route hooks
  strats.beforeRouteEnter = strats.beforeRouteLeave = strats.beforeRouteUpdate = strats.created
}
