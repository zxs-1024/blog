## Vuex 是什么？

`Vuex` 是一个专为 `Vue.js` 应用程序开发的状态管理模式。它采用集中式存储管理应用的所有组件的状态，并以相应的规则保证状态以一种可预测的方式发生变化。

> [阅读 vuex 源码的思维导图:](https://sailor-1256168624.cos.ap-chengdu.myqcloud.com/blog/vuex.png)

![阅读 vuex 源码的思维导图](https://sailor-1256168624.cos.ap-chengdu.myqcloud.com/blog/vuex-mini.png)

[vuex 的文档](https://vuex.vuejs.org/zh/) 对辅助看源码有不小的帮助，不妨在看源码之前仔细地撸一遍文档。

## 带着问题去看源码

- 1. global event bus 有何缺陷
- 2. \$store 如何注入到所有子组件
- 3. mapState 实现
- 4. mapGetter 如何映射
- 5. Mutation 同步 && Action 异步
- 6. dispatch 方法实现
- 7. module 分割实现 && 局部状态 namespaced
- 8. 如何调用 vue-devtools
- 9. 内置 logger 插件实现
- 10. hotUpdate
- 11. 时间穿梭功能实现

## 目录

```js
├── src
│   ├── helpers.js                  // 辅助函数
│   ├── index.esm.js
│   ├── index.js                    // 入口
│   ├── mixin.js                    // 混入 vuexInit
│   ├── module                      // class module
│   │   ├── module-collection.js
│   │   └── module.js
│   ├── plugins                     // 插件
│   │   ├── devtool.js
│   │   └── logger.js
│   ├── store.js                    // store install
│   └── util.js                     // 工具函数
```

## 入口文件

vuex 的入口文件在 `src/index.js`

```js
import { Store, install } from './store';
import {
  mapState,
  mapMutations,
  mapGetters,
  mapActions,
  createNamespacedHelpers
} from './helpers';

export default {
  Store,
  install,
  version: '__VERSION__',
  mapState,
  mapMutations,
  mapGetters,
  mapActions,
  createNamespacedHelpers
};
```

引入了 `Store` 、`install` 和一些辅助工具函数，将引入的变量组装成一个对象向外暴露。当我们在项目中引入 `import Vuex from 'vuex'` 的之后， `Vuex` 就是这个组装后默认导出的对象了。

当然我们也可以通过解构的方式。

```js
import { Store, install } from 'vuex'`
```

## install 方法

来看一下 `install` 方法，在 `src/store.js` 。

```js
export function install(_Vue) {
  if (Vue && _Vue === Vue) {
    if (process.env.NODE_ENV !== 'production') {
      console.error(
        '[vuex] already installed. Vue.use(Vuex) should be called only once.'
      );
    }
    return;
  }
  Vue = _Vue;
  // vuexInit
  applyMixin(Vue);
}
```

install 函数首先判断变量 `Vue` (`store.js` 顶部申明的变量) 是否与传入 `_Vue` 全等，如果全等并且在非生产环境，抛出异常。

随后将传入的 `_Vue` 赋值给 `Vue`，这里主要是为了避免重复安装。

然后调用引入的 `applyMixin` 方法，并将 `Vue` 作为参数传入。

`applyMixin` 在 `src/mixin.js` 作为默认方法导出：

```js
export default function(Vue) {
  const version = Number(Vue.version.split('.')[0]);
  if (version >= 2) {
    Vue.mixin({ beforeCreate: vuexInit });
  } else {
    // override init and inject vuex init procedure
    // for 1.x backwards compatibility.
    const _init = Vue.prototype._init;
    Vue.prototype._init = function(options = {}) {
      options.init = options.init ? [vuexInit].concat(options.init) : vuexInit;
      _init.call(this, options);
    };
  }

  /**
   * Vuex init hook, injected into each instances init hooks list.
   */

  function vuexInit() {
    const options = this.$options;
    if (options.store) {
      this.$store =
        typeof options.store === 'function' ? options.store() : options.store;
    } else if (options.parent && options.parent.$store) {
      this.$store = options.parent.$store;
    }
  }
}
```

取出传入 `Vue` 的 静态属性 `version` 做不同处理。

2.0 采用 `mixin` 将 `vuexInit` 合并到 `beforeCreate` 生命周期钩子。

1.0 重写 `_init` 方法 将 `vuexInit` 合并到 `_init` 方法中。

在 `vuexInit` 方法中，首先判断如果有 `options.store` 说明是 `root` 节点，并且判断 `store` 是 `function` 就执行将函数返回值赋值给 `this.$store` ，否则 `options.store` 直接赋值。
然后判断有父节点，并且父节点有 `$store`, 就将父节点的 `$store` 赋值给 `this.$store` ，这样就保证只有一个全局的 `$store` 变量。
