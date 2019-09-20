## class ModuleCollection

在上面初始参数的赋值中 `this._modules` 就是 `ModuleCollection` 类的实例。

```js
this._modules = new ModuleCollection(options);
```

如果没有嵌套模块，`this._modules` 是这样一个结构。

```js
{
  'root': {
    'runtime': false,
    '_children': {},
    '_rawModule': {
      'state': {
        'count': 0
      },
      'getters': {},
      'actions': {},
      'mutations': {}
    },
    'state': {
      'count': 0
    }
  }
}
```

来看看 `ModuleCollection：`

```js
class ModuleCollection {
  constructor(rawRootModule) {
    // register root module (Vuex.Store options)
    this.register([], rawRootModule, false);
  }

  get(path) {
    return path.reduce((module, key) => {
      return module.getChild(key);
    }, this.root);
  }

  // 根据 path 处理命名空间
  getNamespace(path) {
    let module = this.root;
    return path.reduce((namespace, key) => {
      module = module.getChild(key);
      return namespace + (module.namespaced ? key + '/' : '');
    }, '');
  }

  update(rawRootModule) {
    update([], this.root, rawRootModule);
  }

  register(path, rawModule, runtime = true) {
    if (process.env.NODE_ENV !== 'production') {
      assertRawModule(path, rawModule);
    }

    // 默认注册 root
    // 包装了下传过来的 rawModule
    const newModule = new Module(rawModule, runtime);
    // 判断 path.length 0 说明是 root 保存到 this.root 上
    // 下次递归注册进入 else 调用 Module 类的 getChild addChild
    // 建立 module 的父子关系
    if (path.length === 0) {
      this.root = newModule;
    } else {
      const parent = this.get(path.slice(0, -1));
      parent.addChild(path[path.length - 1], newModule);
    }

    // register nested modules
    // 有 modules 递归注册嵌套模块
    if (rawModule.modules) {
      forEachValue(rawModule.modules, (rawChildModule, key) => {
        this.register(path.concat(key), rawChildModule, runtime);
      });
    }
  }

  unregister(path) {
    const parent = this.get(path.slice(0, -1));
    const key = path[path.length - 1];
    if (!parent.getChild(key).runtime) return;

    parent.removeChild(key);
  }
}
```

在 `ModuleCollection` 类的 `constructor` 中首先会执行类的 `register` 方法，将空数组、`rawRootModule`(也就是实例化的时候传入的 `options`)、`false` 最为最初参数传入。

`register` 方法会递归调用，实现嵌套模块的收集
首先会在非生产环境调用 `assertRawModule` 函数，对 `module` 进行一些断言判断，判断 `rawModule` 对象是否有 `getters` `mutations` `mutations` 为 `key` 值，然后根据预置的类型进行断言。

随后就是实例化 `Module` 新建一个 `newModule`，判断 `path.length`，0 说明是 `root`， 将 `newModule` 保存到 `this.root` 上，然后判断 `rawModule.modules` 是否有嵌套 `modules`。

有就调用 `forEachValue` 将 `modules`转换成数组，并且循环调用传入的回调函数，回调函数里又递归调用了 `this.register`，将 `path` 合并子模块的 `key`, 循环的子模块、`runtime` 作为参数传入。

第二次进入 `register` 会进入 `else` 判断，调用 `Module` 类的 `getChild` `addChild`, 建立 `module` 的父子关系，如果仍然嵌套模块继续递归调用 `this.register`。

`forEachValue`：

```js
// object 转成数组 循环调用 fn
export function forEachValue(obj, fn) {
  Object.keys(obj).forEach(key => fn(obj[key], key));
}
```

### assertRawModule

上面说过，`assertRawModule` 负责对 `module` 进行一些断言判断，判断 `rawModule` 对象是否有 `getters`、`mutations`、`mutations` 为 `key` 值，然后根据预置的类型进行断言。

```js
const functionAssert = {
  assert: value => typeof value === 'function',
  expected: 'function'
};

const objectAssert = {
  assert: value =>
    typeof value === 'function' ||
    (typeof value === 'object' && typeof value.handler === 'function'),
  expected: 'function or object with "handler" function'
};

const assertTypes = {
  getters: functionAssert,
  mutations: functionAssert,
  actions: objectAssert
};

function assertRawModule(path, rawModule) {
  Object.keys(assertTypes).forEach(key => {
    if (!rawModule[key]) return;

    const assertOptions = assertTypes[key];

    forEachValue(rawModule[key], (value, type) => {
      assert(
        assertOptions.assert(value),
        makeAssertionMessage(path, key, type, value, assertOptions.expected)
      );
    });
  });
}

function makeAssertionMessage(path, key, type, value, expected) {
  let buf = `${key} should be ${expected} but "${key}.${type}"`;
  if (path.length > 0) {
    buf += ` in module "${path.join('.')}"`;
  }
  buf += ` is ${JSON.stringify(value)}.`;
  return buf;
}
```

`assertRawModule` 循环 `assertTypes` 对象，循环的 `key` 为 `getters` `mutations` `actions`，判断传入模块是否有这些属性。

```js
const assertOptions = assertTypes[key];
```

接着从 `assertTypes` 取出对应属性的 `value`

循环 `rawModule[key]` 对象，如果 `key` 此时就是 `getters`，那就是遍历当前模块有所的 `getter` 函数，回调函数是一个断言函数，`assertOptions` 的 `assert` 会返回对属性类型的判断，作为 `Boolean` 传入，`makeAssertionMessage` 函数只是对断言函数判断的异常的描述。

## class Module

来看看 `Module` 类的代码:

```js
export default class Module {
  constructor(rawModule, runtime) {
    this.runtime = runtime;
    // Store some children item
    this._children = Object.create(null);
    // Store the origin module object which passed by programmer
    this._rawModule = rawModule;
    const rawState = rawModule.state;
    // Store the origin module's state
    this.state = (typeof rawState === 'function' ? rawState() : rawState) || {};
  }

  get namespaced() {
    return !!this._rawModule.namespaced;
  }

  addChild(key, module) {
    this._children[key] = module;
  }

  removeChild(key) {
    delete this._children[key];
  }

  getChild(key) {
    return this._children[key];
  }

  update(rawModule) {
    this._rawModule.namespaced = rawModule.namespaced;
    if (rawModule.actions) {
      this._rawModule.actions = rawModule.actions;
    }
    if (rawModule.mutations) {
      this._rawModule.mutations = rawModule.mutations;
    }
    if (rawModule.getters) {
      this._rawModule.getters = rawModule.getters;
    }
  }

  forEachChild(fn) {
    forEachValue(this._children, fn);
  }

  forEachGetter(fn) {
    if (this._rawModule.getters) {
      forEachValue(this._rawModule.getters, fn);
    }
  }

  forEachAction(fn) {
    if (this._rawModule.actions) {
      forEachValue(this._rawModule.actions, fn);
    }
  }

  forEachMutation(fn) {
    if (this._rawModule.mutations) {
      forEachValue(this._rawModule.mutations, fn);
    }
  }
}
```

`Module` 类的 `constructor` 中会将传入的 `rawModule` `runtime` 保存，申明 `this._children`，主要是存放该模块的子模块，将 `rawModule.state` 取出保存到 `this.state` 上。

`Module` 类提供了很多方法：

`namespaced` 通过双非取值返回一个 `布尔值` ，作为是否有命名空间的判断。

`addChild` 在 `ModuleCollection` 的 `register` 方法中调用，将子模块存入到父模块的 `this._children`

`removeChild` 删除子模块

`getChild` 获取子模块

`update` 在 `ModuleCollection` 的 `update` 的调用，负责整个模块的更新

后面的几个方法都是调用 `forEachValue`,将对应对应的模块，以及传入的 `fn` 传入。

### getNamespace

根据 `path` 处理命名空间：

```js
getNamespace (path) {
  let module = this.root
  return path.reduce((namespace, key) => {
    module = module.getChild(key)
    return namespace + (module.namespaced ? key + '/' : '')
  }, '')
}
```
