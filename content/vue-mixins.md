# vue mixins 让组件显得不再臃肿

vue 提供了 mixins 这个 API，可以让我们将组件中的可复用功能抽取出来，放入 mixin 中，然后在组件中引入 mixin，可以让组件显得不再臃肿，提高了代码的可复用性。

如何理解 mixins 呢 ？我们可以将 mixins 理解成一个数组，数组中有单或多个 mixin，mixin 的本质就是一个 JS 对象，它可以有 data、created、methods 等等 vue 实例中拥有的所有属性，甚至可以在 mixins 中再次嵌套 mixins，It's amazing !

举个简单的栗子:

```html
<div id="app">
  <h1>{{ message }}</h1>
</div>
```

```js
const myMixin = {
  data() {
    return {
      message: 'this is mixin message'
    }
  },
  created() {
    console.log('mixin created')
  }
}

const vm = new Vue({
  el: '#app',
  mixins: [myMixin],

  data() {
    return {
      message: 'this is vue instance message'
    }
  },
  created() {
    console.log(this.message)
    // => Root Vue Instance
    console.log('vue instance created')
    // => created myMixin
    // => created Root Vue Instance
  }
})
```

mixins 与 Vue Instance 合并时，会将 created 等钩子函数合并成数组，mixins 的钩子优先调用，当 data、methods 对象键值冲突时，以组件优先。

PS: 如果对 mixins 的概念还不太清的小伙伴，可以去 [vue 官方文档](https://cn.vuejs.org/v2/guide/mixins.html) 看一下 vue mixins 的基本概念和用法。

## mixins 实现

那 mixins 是如何实现的呢 ？当 vue 在实例化的时候，会调用 mergeOptions 函数进行 options 的合并，函数申明在 vue/src/core/util/options.js 文件。

```js
export function mergeOptions(
  parent: Object,
  child: Object,
  vm?: Component
): Object {
  ...
  // 如果有 child.extends 递归调用 mergeOptions 实现属性拷贝
  const extendsFrom = child.extends
  if (extendsFrom) {
    parent = mergeOptions(parent, extendsFrom, vm)
  }
  // 如果有 child.mixins 递归调用 mergeOptions 实现属性拷贝
  if (child.mixins) {
    for (let i = 0, l = child.mixins.length; i < l; i++) {
      parent = mergeOptions(parent, child.mixins[i], vm)
    }
  }
  // 申明 options 空对象，用来保存属性拷贝结果
  const options = {}
  let key
  // 遍历 parent 对象，调用 mergeField 进行属性拷贝
  for (key in parent) {
    mergeField(key)
  }
  // 遍历 parent 对象，调用 mergeField 进行属性拷贝
  for (key in child) {
    if (!hasOwn(parent, key)) {
      mergeField(key)
    }
  }
  // 属性拷贝实现方法
  function mergeField(key) {
    // 穿透赋值，默认为 defaultStrat
    const strat = strats[key] || defaultStrat
    options[key] = strat(parent[key], child[key], vm, key)
  }
  return options
}
```

为了保持代码简洁，已经将 mergeOptions 函数不重要的代码删除，剩余部分我们慢慢来看。

```js
const extendsFrom = child.extends
if (extendsFrom) {
  parent = mergeOptions(parent, extendsFrom, vm)
}
```

首先申明 extendsFrom 变量保存 child.extends，如果 extendsFrom 为真，递归调用 mergeOptions 进行属性拷贝，并且将 merge 结果保存到 parent 变量。

```js
if (child.mixins) {
  for (let i = 0, l = child.mixins.length; i < l; i++) {
    parent = mergeOptions(parent, child.mixins[i], vm)
  }
}
```

如果 child.mixins 为真，循环 mixins 数组，递归调用 mergeOptions 实现属性拷贝，仍旧将 merge 结果保存到 parent 变量。

接下来是关于 parent、child 的属性赋值：

```js
const options = {}
let key

for (key in parent) {
  mergeField(key)
}

for (key in child) {
  if (!hasOwn(parent, key)) {
    mergeField(key)
  }
}
```

申明 options 空对象，用来保存属性拷贝的结果，也作为递归调用 mergeOptions 的返回值。

这里首先会调用 for...in 对 parent 进行循环，在循环中不断调用 mergeField 函数。

接着调用 for...in 对 child 进行循环，这里有点不太一样，会调用 hasOwn 判断 parent 上是否有这个 key，如果没有再调用 mergeField 函数，这样避免了重复调用。

那么这个 mergeField 函数到底是用来做什么的呢？

```js
function mergeField(key) {
  // 穿透赋值，默认为 defaultStrat
  const strat = strats[key] || defaultStrat
  options[key] = strat(parent[key], child[key], vm, key)
}
```

mergeField 函数接收一个 key，首先会申明 strat 变量，如果 strats[key] 为真，就将 strats[key] 赋值给 strat。

```js
const strats = config.optionMergeStrategies
...
optionMergeStrategies: Object.create(null),
...
```

strats 其实就是 Object.create(null)，Object.create 用来创建一个新对象，strats 默认是调用 Object.create(null) 生成的空对象。

顺便说一句，vue 也向外暴露了 Vue.config.optionMergeStrategies，可以实现自定义选项合并策略。

如果 strats[key] 为假，这里会用 || 做穿透赋值，将 defaultStrat 默认函数赋值给 strat。

```js
const defaultStrat = function(parentVal: any, childVal: any): any {
  return childVal === undefined ? parentVal : childVal
}
```

defaultStrat 函数返回一个三元表达式，如果 childVal 为 undefined，返回 parentVal，否则返回 childVal，这里主要以 childVal 优先，这也是为什么有 component > mixins > extends 这样的优先级。

mergeField 函数最后会将调用 strat 的结果赋值给 options[key]。

mergeOptions 函数最后会 merge 所有 options、 mixins、 extends，并将 options 对象返回，然后再去实例化 vue。

## 钩子函数的合并

我们来看看钩子函数是怎么进行合并的。

```js
function mergeHook(
  parentVal: ?Array<Function>,
  childVal: ?Function | ?Array<Function>
): ?Array<Function> {
  return childVal
    ? parentVal
      ? parentVal.concat(childVal)
      : Array.isArray(childVal)
      ? childVal
      : [childVal]
    : parentVal
}

LIFECYCLE_HOOKS.forEach(hook => {
  strats[hook] = mergeHook
})
```

循环 LIFECYCLE_HOOKS 数组，不断调用 mergeHook 函数，将返回值赋值给 strats[hook]。

```js
export const LIFECYCLE_HOOKS = [
  'beforeCreate',
  'created',
  'beforeMount',
  'mounted',
  'beforeUpdate',
  'updated',
  'beforeDestroy',
  'destroyed',
  'activated',
  'deactivated',
  'errorCaptured'
]
```

LIFECYCLE_HOOKS 就是申明的 vue 所有的钩子函数字符串。

mergeHook 函数会返回 3 层嵌套的三元表达式。

```js
return childVal
  ? parentVal
    ? parentVal.concat(childVal)
    : Array.isArray(childVal)
    ? childVal
    : [childVal]
  : parentVal
```

第一层，如果 childVal 为真，返回第二层三元表达式，如果为假，返回 parentVal。

第二层，如果 parentVal 为真，返回 parentVal 和 childVal 合并后的数组，如果 parentVal 为假，返回第三层三元表达式。

第三层，如果 childVal 是数组，返回 childVal，否则将 childVal 包装成数组返回。

```js
new Vue({
  created: [
    function() {
      console.log('冲冲冲！')
    },
    function() {
      console.log('鸭鸭鸭！')
    }
  ]
})
// => 冲冲冲！
// => 鸭鸭鸭！
```

## 项目实践

使用 vue 的小伙伴们，当然也少不了在项目中使用 element-ui。比如使用 Table 表格的时候，免不了申明 tableData、total、pageSize 一些 Table 表格、Pagination 分页需要的参数。

我们可以将重复的 data、methods 写在一个 tableMixin 中。

```js
export default {
  data() {
    return {
      total: 0,
      pageNo: 1,
      pageSize: 10,
      tableData: [],
      loading: false
    }
  },

  created() {
    this.searchData()
  },

  methods: {
    // 预申明，防止报错
    searchData() {},

    handleSizeChange(size) {
      this.pageSize = size
      this.searchData()
    },

    handleCurrentChange(page) {
      this.pageNo = page
      this.searchData()
    },

    handleSearchData() {
      this.pageNo = 1
      this.searchData()
    }
  }
}
```

当我们需要使用时直接引入即可：

```js
import tableMixin from './tableMixin'

export default {
  ...
  mixins: [tableMixin],
  methods: {
    searchData() {
      ...
    }
  }
}
```

我们在组件内会重新申明 searchData 方法。类似这种 methods 对象形式的 key，如果 key 相同，组件内的 key 会覆盖 tableMixin 中的 key。

当然我们也可以在 mixins 中嵌套 mixins，申明 axiosMixin:

```js
import tableMixin from './tableMixin'

export default {
  mixins: [tableMixin],

  methods: {
    handleFetch(url) {
      const { pageNo, pageSize } = this
      this.loading = true

      this.axios({
        method: 'post',
        url,
        data: {
          ...this.params,
          pageNo,
          pageSize
        }
      })
        .then(({ data = [] }) => {
          this.tableData = data
          this.loading = false
        })
        .catch(error => {
          this.loading = false
        })
    }
  }
}
```

引入 axiosMixin：

```js
import axiosMixin from './axiosMixin'

export default {
  ...
  mixins: [axiosMixin],
  created() {
    this.handleFetch('/user/12345')
  }
}
```

在 axios 中，我们可以预先处理 axios 的 success、error 的后续调用，是不是少写了很多代码。

## extend

顺便讲一下 extend，与 mixins 相似，只能传入一个 options 对象，并且 mixins 的优先级比较高，会覆盖 extend 同名 key 值。

```js
// 如果有 child.extends 递归调用 mergeOptions 实现属性拷贝
const extendsFrom = child.extends
if (extendsFrom) {
  parent = mergeOptions(parent, extendsFrom, vm)
}
// 如果有 child.mixins 递归调用 mergeOptions 实现属性拷贝
if (child.mixins) {
  for (let i = 0, l = child.mixins.length; i < l; i++) {
    parent = mergeOptions(parent, child.mixins[i], vm)
  }
}
```

在 mergeOptions 函数中，会先对 extends 进行属性拷贝，然后再对 mixin 进行拷贝，在调用 mergeField 函数的时候会优先取 child 的 key。

虽然 extends 的同名 key 会被 mixins 的覆盖，但是 extends 是优先执行的。

## 总结

注意一下 vue 中 mixins 的优先级，component > mixins > extends。

我们暂且将 mixins 称作是组件模块化，灵活运用组件模块化，可以将组件内的重复代码提取出来，实现代码复用，也使我们的代码更加清晰，效率也大大提高。

当然，mixins 还有更加神奇的操作等你去探索。
