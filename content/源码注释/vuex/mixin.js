export default function (Vue) {
  const version = Number(Vue.version.split('.')[0])
  // 2.0 采用 mixin 注入 $store 将 vuexInit 放入 beforeCreate 生命周期钩子
  if (version >= 2) {
    Vue.mixin({ beforeCreate: vuexInit })
  } else {
    // override init and inject vuex init procedure
    // for 1.x backwards compatibility.
    // 1.0 重写 _init 方法 将 vuexInit 合并到 vue init 方法中
    const _init = Vue.prototype._init
    Vue.prototype._init = function (options = {}) {
      options.init = options.init
        ? [vuexInit].concat(options.init)
        : vuexInit
      _init.call(this, options)
    }
  }

  /**
   * Vuex init hook, injected into each instances init hooks list.
   */

  function vuexInit () {
    const options = this.$options
    // store injection
    // 有 options.store 说明是 root 节点
    // 判断 store 如果是 function 将函数返回值赋值到 this.$store
    // 否则将 options.store 直接赋值赋值
    if (options.store) {
      this.$store = typeof options.store === 'function'
        ? options.store()
        : options.store
      // 如果没有就从父组件中获取 $store
      // 保证只有一个全局的 $store
    } else if (options.parent && options.parent.$store) {
      this.$store = options.parent.$store
    }
  }
}
