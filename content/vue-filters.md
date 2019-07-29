---
title: vue filter 源码浅析
date: '2019-07-01'
spoiler: 在 Vue.js 中允许你自定义过滤器，我们可以用 filter 来格式化一些常见的文本。
---

## Vue filter 源码浅析

### filter 注册 && 使用

在 Vue.js 中允许你自定义过滤器，我们可以用 filter 来格式化一些常见的文本，在项目中我们会这样使用 filter :

```html
<!-- 在双花括号中 -->
{{ message | format }}

<!-- 在 v-bind 中 -->
<div v-bind:id="message | format"></div>
```

> 注册 filter 有 2 种方式，全局 filter、组件 filter

全局 filter 在实例化 Vue 之前定义：

```js
Vue.filter('format', function(name) {
  return Hello, ${name} !
})
```

这样注册的 filter 可以在每个组件中调用，而不用在组件内再次注册。

在组件内我们会这样注册：

```js
filters: {
  format: function (name) {
   return Hello, ${name} !
  }
}
```

组件内注册的 filter 只能在当前组件中调用。

如果想获取对应的 filter，可以调用 filter 函数传入对象 filter name，会返回已注册的过滤器:

```js
var myFilter = Vue.filter('format')
```

### filter 初始化

filter 初始化是在 Vue 构造函数实例化的时候：

```js
function Vue(options) {
  if (process.env.NODE_ENV !== 'production' && !(this instanceof Vue)) {
    warn('Vue is a constructor and should be called with the new keyword')
  }
  this._init(options)
}

initMixin(Vue)
stateMixin(Vue)
eventsMixin(Vue)
lifecycleMixin(Vue)
renderMixin(Vue)
```

关于 filter 的代码在 renderMixin 函数，在 `src/core/instance/render.js` 在文件中：

```js
export function renderMixin (Vue: Class<Component>) {
  // install runtime convenience helpers
  installRenderHelpers(Vue.prototype)

  Vue.prototype.$nextTick = function (fn: Function) {
    return nextTick(fn, this)
  }

  Vue.prototype._render = function (): VNode {
    ...
    return vnode
  }
}
```

renderMixin 函数首先会调用 installRenderHelpers 并且传入 Vue.prototype，然后给 Vue 添加 `$nextTick`、`_render` 方法，而在 installRenderHelpers 函数中会给 Vue.prototype 增加很多辅助函数。

installRenderHelpers 函数在 `src/core/instance/render-helpers/index.js` 文件中：

```js
export function installRenderHelpers(target: any) {
  target._o = markOnce
  target._n = toNumber
  target._s = toString
  target._l = renderList
  target._t = renderSlot
  target._q = looseEqual
  target._i = looseIndexOf
  target._m = renderStatic
  target._f = resolveFilter
  target._k = checkKeyCodes
  target._b = bindObjectProps
  target._v = createTextVNode
  target._e = createEmptyVNode
  target._u = resolveScopedSlots
  target._g = bindObjectListeners
}
```

关于 filter 就是 `target._f = resolveFilter`，resolveFilter 就是解析 filter 的辅助函数，我们来看一下 resolveFilter，在 `src/core/instance/render-helpers/resolve-filter.js` 文件中：

```js
/**
 * Runtime helper for resolving filters
 */
export function resolveFilter(id: string): Function {
  return resolveAsset(this.$options, 'filters', id, true) || identity
}
```

resolveFilter 函数接收一个参数 id，在内部调用了 resolveAsset 函数，并传入 `this.$options` 选项、filters 字符串、id filter 的 key、true。

```js
/**
 * Return same value
 */
export const identity = (_: any) => _
```

identity 是一个返回原值的函数。

resolveAsset 函数主要用来处理或者获取 Vue 实例内部的 directives、 components 、filters，函数在 `src/core/util/options.js` 文件中：

```js
/**
 * Resolve an asset.
 * This function is used because child instances need access
 * to assets defined in its ancestor chain.
 */
export function resolveAsset(
  options: Object,
  type: string,
  id: string,
  warnMissing?: boolean
): any {
  /* istanbul ignore if */
  if (typeof id !== 'string') {
    return
  }
  const assets = options[type]
  // check local registration variations first
  if (hasOwn(assets, id)) return assets[id]
  const camelizedId = camelize(id)
  if (hasOwn(assets, camelizedId)) return assets[camelizedId]
  const PascalCaseId = capitalize(camelizedId)
  if (hasOwn(assets, PascalCaseId)) return assets[PascalCaseId]
  // fallback to prototype chain
  const res = assets[id] || assets[camelizedId] || assets[PascalCaseId]
  if (process.env.NODE_ENV !== 'production' && warnMissing && !res) {
    warn('Failed to resolve ' + type.slice(0, -1) + ': ' + id, options)
  }
  return res
}
```

resolveAsset 首先会以 type 也就是选项为 key 从 options 取出 assets 对象，此时 type 就是 filter。

首先调用 hasOwn 函数判断 assets 是否有对应的 key，也就是检测 id 是否已经注册，如果已经注册，将对象 filter 返回。

接着会尝试以驼峰、中划线形式取出 filter，最后将取出的 filter => res 返回。

## filter 调用

接下来我们来看看这个 filter 函数是如何在 Vue 实例中调用的，我们知道在 installRenderHelpers 函数中，我们将 resolveFilter 函数赋值给了 Vue.prototype 的 `_f`:

```js
export function installRenderHelpers (target: any) {
  ...
  target._f = resolveFilter
  ...
}
```

我们将 resolveFilter 挂载到了 Vue.prototype 上，在什么情况会调用这个 `_f` 函数？

vue 在对模板进行编译的时候，通过 parse 函数将模板字符解析成抽象语法树 AST，并调用 _render 把实例渲染成一个 VNode。

在 parse 函数中的 parseHTML 函数，是真正调用 resolveFilter 函数的地方。

PS: parse 函数位于 `vue/src/compiler/parser/index.js` 文件。

## 解析 filter

vue 通过 parseFilters 函数来解析 filter，函数在 `src/compiler/parser/filter-parser.js` 文件中：

```js
function parseFilters(exp) {
  var inSingle = false // 当前字符是否在 ' 单引号中的标识
  var inDouble = false // 当前字符是否在 " 双引号中的标识
  var inTemplateString = false // 当前字符是否在 ` es6 模板的标识
  var inRegex = false // 当前字符是否在 / 正则中的标识
  var curly = 0 // 匹配到 { +1 匹配到 } -1
  var square = 0 // 匹配到 [ +1 匹配到 ] -1
  var paren = 0 // 匹配到 ( +1 匹配到 ) -1
  var lastFilterIndex = 0
  var c, prev, i, expression, filters

  for (i = 0; i < exp.length; i++) {
    // 保存上次循环的 c，初始为 undefined
    prev = c
    // 调用 charCodeAt 方法返回 Unicode 编码，课通过 String.fromCharCode() 反转
    c = exp.charCodeAt(i)
    if (inSingle) {
      // 当前 c 是 ' ，并且 prev 不是 \ ，单引号部分结束
      if (c === 0x27 && prev !== 0x5c) {
        inSingle = false
      }
    } else if (inDouble) {
      // 当前 c 是 " ，并且 prev 不是 \ ，双引号部分结束
      if (c === 0x22 && prev !== 0x5c) {
        inDouble = false
      }
    } else if (inTemplateString) {
      // 当前 c 是 ` ，并且 prev 不是 \ ，es6 模板部分结束
      if (c === 0x60 && prev !== 0x5c) {
        inTemplateString = false
      }
    } else if (inRegex) {
      // 当前 c 是 / ，并且 prev 不是 \ ，正则部分结束
      if (c === 0x2f && prev !== 0x5c) {
        inRegex = false
      }
    } else if (
      c === 0x7c && // pipe | 为管道符
      exp.charCodeAt(i + 1) !== 0x7c &&
      exp.charCodeAt(i - 1) !== 0x7c && // 前后都不为管道符，排除 ||
      !curly &&
      !square &&
      !paren // {} [] () 都没有结束
    ) {
      if (expression === undefined) {
        // first filter, end of expression
        // 第一次解析 filter，提取 | 前面部分 expression
        lastFilterIndex = i + 1
        expression = exp.slice(0, i).trim()
      } else {
        pushFilter()
      }
    } else {
      switch (c) {
        case 0x22:
          inDouble = true
          break // "
        case 0x27:
          inSingle = true
          break // '
        case 0x60:
          inTemplateString = true
          break // `
        case 0x28:
          paren++
          break // (
        case 0x29:
          paren--
          break // )
        case 0x5b:
          square++
          break // [
        case 0x5d:
          square--
          break // ]
        case 0x7b:
          curly++
          break // {
        case 0x7d:
          curly--
          break // }
      }
      if (c === 0x2f) {
        // /
        var j = i - 1
        var p = void 0
        // find first non-whitespace prev char
        // 找到第一个不是空字符串的 p，中断循环
        for (; j >= 0; j--) {
          p = exp.charAt(j)
          if (p !== ' ') {
            break
          }
        }
        // var validDivisionCharRE = /[\w).+\-_$\]]/;
        // p 不为空，并且不是字母 数组 + - _ $ ] 之一，说明是正则
        if (!p || !validDivisionCharRE.test(p)) {
          inRegex = true
        }
      }
    }
  }

  if (expression === undefined) {
    expression = exp.slice(0, i).trim()
  } else if (lastFilterIndex !== 0) {
    pushFilter()
  }

  function pushFilter() {
    // 将 exp.slice(lastFilterIndex, i).trim()，也就是 filter name 插入 filters 数组
    ;(filters || (filters = [])).push(exp.slice(lastFilterIndex, i).trim())
    lastFilterIndex = i + 1
  }

  if (filters) {
    // 遍历 filters 数组，循环处理 expression
    for (i = 0; i < filters.length; i++) {
      expression = wrapFilter(expression, filters[i])
    }
  }

  return expression
}
```

parseFilters 内部会循环处理 exp 字符串，会将 filters 处理成数组，这也是我们可以使用串联 filter 的原因，
通过循环调用，然后将 filter 函数调用值返回。

wrapFilter 函数会接收 expression、filters 进行处理，在 `src/compiler/parser/filter-parser.js` 文件：

```js
function wrapFilter(exp: string, filter: string): string {
  const i = filter.indexOf('(')
  if (i < 0) {
    // _f: resolveFilter
    return `_f("${filter}")(${exp})`
  } else {
    const name = filter.slice(0, i)
    const args = filter.slice(i + 1)
    return `_f("${name}")(${exp}${args !== ')' ? ',' + args : args}`
  }
}
```

wrapFilter 函数会调用 \_f 也就是 resolveFilter 函数，如果 i < 0，说明没有 `(` ，代表没有传参，返回 es6 模板字符串 `_f("${filter}")(${exp})`。

如果 i > 0，代表传入了参数，会对 filter 根据 `(` 所在位置进行切分，取出 filter 和 args 参数部分，并且进行字符串模板的拼接。

举个简单的例子：

```html
<div>{{ 'Hello' | say('Sailor') }}</div>
```

此时这个 filter 会进入 else 分支，这里会对 say('Sailor') 字符串进行切割，name = say，args = 'Sailor')，`_f('say')('Hello','Sailor')`。

```js
if (filters) {
  // 遍历 filters 数组，循环处理 expression
  for (i = 0; i < filters.length; i++) {
    expression = wrapFilter(expression, filters[i])
  }
}
```

但是在 vue 中我们允许使用串联的 filter，在 parseFilters 函数中我们会循环处理 `expression`，并且将之前处理的 `expression` 作为参数传入，也就是说我们有可能是这样。

```html
<div>{{ 'Hello' | say('Sailor') | sing('Sky') }}</div>
```

此时进入 else 分支，会返回 `_f('sing')(_f('say')('Hello','Sailor'),'Sky')` 字符串。

调用 parseFilters 的函数有 getBindingAttr、processAttrs、parseText 这 3 个函数。

### getBindingAttr

getBindingAttr 函数主要用来解析元素的 attr 属性值：

```js
export function getBindingAttr(
  el: ASTElement,
  name: string,
  getStatic?: boolean
): ?string {
  const dynamicValue =
    getAndRemoveAttr(el, ':' + name) || getAndRemoveAttr(el, 'v-bind:' + name)
  if (dynamicValue != null) {
    return parseFilters(dynamicValue)
  } else if (getStatic !== false) {
    const staticValue = getAndRemoveAttr(el, name)
    if (staticValue != null) {
      return JSON.stringify(staticValue)
    }
  }
}
```

getBindingAttr 函数会从 el 也就是抽象语法树 AST 中取出 attrs ，如果有 : 、v-bind 绑定指令， 返回调用 parseFilters 函数处理后的值，如果传入的参数 getStatic 不为 false，尝试调用 getAndRemoveAttr 返回 staticValue 静态值，如果 staticValue 不为 null，返回转成字符串的 staticValue。

### processAttrs

processAttrs 函数用来处理 attr 的属性:

```js
function processAttrs (el) {
  const list = el.attrsList
  let i, l, name, rawName, value, modifiers, isProp
  for (i = 0, l = list.length; i < l; i++) {
    ...
      if (bindRE.test(name)) { // v-bind
        name = name.replace(bindRE, '')
        value = parseFilters(value)
    }
    ...
  }
}
```

processAttrs 会循环处理 attrsList，返回经过 parseFilters 处理的 value。

### parseText

parseText 函数则是用来处理标签内的表达式了：

```js
export function parseText (
  text: string,
  delimiters?: [string, string]
): TextParseResult | void {
  const tagRE = delimiters ? buildRegex(delimiters) : defaultTagRE
  if (!tagRE.test(text)) {
    return
  }
  const tokens = []
  const rawTokens = []
  let lastIndex = tagRE.lastIndex = 0
  let match, index, tokenValue
  while ((match = tagRE.exec(text))) {
    index = match.index
    // push text token
    if (index > lastIndex) {
      rawTokens.push(tokenValue = text.slice(lastIndex, index))
      tokens.push(JSON.stringify(tokenValue))
    }
    // tag token
    const exp = parseFilters(match[1].trim())
    tokens.push(_s(${exp}))
    rawTokens.push({ '@binding': exp })
    lastIndex = index + match[0].length
  }
  if (lastIndex < text.length) {
    rawTokens.push(tokenValue = text.slice(lastIndex))
    tokens.push(JSON.stringify(tokenValue))
  }
  return {
    expression: tokens.join('+'),
    tokens: rawTokens
  }
}
```

parseText 函数内部会申明 2 个数组储存匹配到的文本和表达式，
然后进行 while 循环，将匹配到的文本和表达式插入申明的数组，
包括调用 parseFilters 得到到 exp，最后将 expression、tokens 包装成对象后返回。

## filter 初始化

Vue 初始化后，会调用 initGlobalAPI 为 Vue 添加静态方法，initGlobalAPI 函数在 src/core/global-api/index.js 文件中：

```js
function initGlobalAPI(Vue) {
  // config
  var configDef = {}
  configDef.get = function() {
    return config
  }
  if (process.env.NODE_ENV !== 'production') {
    configDef.set = function() {
      warn(
        'Do not replace the Vue.config object, set individual fields instead.'
      )
    }
  }
  Object.defineProperty(Vue, 'config', configDef)

  // exposed util methods.
  // NOTE: these are not considered part of the public API - avoid relying on
  // them unless you are aware of the risk.
  Vue.util = {
    warn: warn,
    extend: extend,
    mergeOptions: mergeOptions,
    defineReactive: defineReactive
  }

  Vue.set = set
  Vue.delete = del
  Vue.nextTick = nextTick

  Vue.options = Object.create(null)
  ASSET_TYPES.forEach(function(type) {
    Vue.options[type + 's'] = Object.create(null)
  })

  // this is used to identify the "base" constructor to extend all plain-object
  // components with in Weex's multi-instance scenarios.
  Vue.options._base = Vue

  extend(Vue.options.components, builtInComponents)

  initUse(Vue)
  initMixin$1(Vue)
  initExtend(Vue)
  initAssetRegisters(Vue)
}
```

可以看到在 initGlobalAPI 中添加了 config 配置对象、util 工具函数、set、delete、nextTick 方法，initUse 添加插件 use 方法、initMixin、initExtend 添加 mixin 、extend，initAssetRegisters 注册初始化方法。

其中涉及到了 filter 的是：

```js
ASSET_TYPES.forEach(function(type) {
  Vue.options[type + 's'] = Object.create(null)
})
```

循环 ASSET_TYPES 数组，初始化 components 、directives 、filters 为空对象。

```js
export const ASSET_TYPES = ['component', 'directive', 'filter']
```

ASSET_TYPES 数组是一个常量，保存了 Vue 实例中的 3 个属性。

接着来看看 initAssetRegisters 函数，在 src/core/global-api/assets.js 文件：

```js
function initAssetRegisters(Vue) {
  /**
   * Create asset registration methods.
   */
  ASSET_TYPES.forEach(function(type) {
    Vue[type] = function(id, definition) {
      if (!definition) {
        return this.options[type + 's'][id]
      } else {
        /* istanbul ignore if */
        if (process.env.NODE_ENV !== 'production' && type === 'component') {
          validateComponentName(id)
        }
        if (type === 'component' && isPlainObject(definition)) {
          definition.name = definition.name || id
          definition = this.options._base.extend(definition)
        }
        if (type === 'directive' && typeof definition === 'function') {
          definition = { bind: definition, update: definition }
        }
        this.options[type + 's'][id] = definition
        return definition
      }
    }
  })
}
```

我们接下看只看 filter 部分，在 initAssetRegisters 函数中会给 Vue 添加 filter 函数，函数接收 id 过滤器名 、definition 过滤器处理函数 2 个参数，如果没有 definition 会返回 `this.options[type + 's'][id]` 获取对应的 filter，如果有 definition ，会以 id 为 key、 definition 为值，赋值到 options.filters 对象上，进行 filter 的注册，最后将 definition 返回。

此时 Vue 的 filter 是 `function`，`function` 会根据传入的参数返回 filter 函数或者是注册 filter。

### filter 访问 this 不是 Vue ?

一般我们在全局中会这样调用 filter 函数：

```js
Vue.filter('format', function(name) {
  return Hello, ${name} !
})
```

这个 filter 是在没有创建 Vue 实例之前定义的，在代码中我们也没有看到任何对方法做 this 绑定的动作，而在组件的中的 filter ，也没有发现有改变 filter 函数 this 指向的代码，因此注册的 filter 都不能通过 this 访问到 Vue 实例。

#### 尤大大的解释

在 vue 的 [Issues #5998](https://github.com/vuejs/vue/issues/5998) 中可以看到尤大大的解释，过滤器应该是纯函数，建议使用 computed 或者 methods 格式化文本，所以 vue 的源码中也没有改变 filter 函数上下文的代码。

## 参考文档

[Unicode 字符参考](https://zh.wikibooks.org/wiki/Unicode/%E5%AD%97%E7%AC%A6%E5%8F%82%E8%80%83/0000-0FFF)
