## 工具函数

工具函数在 `src/util.js`。

### find

```js
/**
 * Get the first item that pass the test
 * by second argument function
 *
 * @param {Array} list
 * @param {Function} f
 * @return {*}
 */
export function find(list, f) {
  return list.filter(f)[0];
}
```

`find` 接收 `list` 数组，`f` 回调函数，调用 `filter` 返回匹配 `f` 函数的第一个。

### deepCopy

`deepCopy` 函数：

```js
/**
 * Deep copy the given object considering circular structure.
 * This function caches all nested objects and its copies.
 * If it detects circular structure, use cached copy to avoid infinite loop.
 *
 * @param {*} obj
 * @param {Array<Object>} cache
 * @return {*}
 */
export function deepCopy(obj, cache = []) {
  // just return if obj is immutable value
  if (obj === null || typeof obj !== 'object') {
    return obj;
  }

  // if obj is hit, it is in circular structure
  const hit = find(cache, c => c.original === obj);
  if (hit) {
    return hit.copy;
  }

  const copy = Array.isArray(obj) ? [] : {};
  // put the copy into cache at first
  // because we want to refer it in recursive deepCopy
  cache.push({
    original: obj,
    copy
  });

  Object.keys(obj).forEach(key => {
    copy[key] = deepCopy(obj[key], cache);
  });

  return copy;
}
```

`deepCopy` 接收一个 `obj` 和 `cache` 数组作为参数，初次调用时 `cache` 为空数组。

首先判断 `obj` 全等于 `null` 或者 `obj` 的类型不等于 `object` 就返回 `obj`，接下来调用 `find`，将 `cache` 和 回调传入，会使用 `filter` 去过滤匹配的对象，`c.original` 全等于当前循环的 `obj` 对象 ，这里判断的是一个引用地址，`find` 函数会返回匹配 `f` 函数的第一个。

如果有 `hit` 就说明是环形结构，直接返回 `hit.copy`。

```js
const obj = {
  a: 1
};
obj.b = obj;
```

所谓环形环形结构，就是对象之间相互引用。

接下来申明 `copy` 变量，如果 `obj` 是数组 `copy` 等于空数组，否则就是空对象，

保存 `cache`:

```js
cache.push({
  original: obj,
  copy
});
```

以 `original` 为 `key`, `obj` 为 `value`，将已经上面申明的 `copy` 变量包装成对象 `push` 到 `cache` 数组中。

循环 `obj keys`，递归调用 `deepCopy` 将 `obj[key]` 和缓存的 `cache` 作为参数传入。

最后将深拷贝的 `copy` 对象返回。

### forEachValue

```js
/**
 * forEach for object
 */
export function forEachValue(obj, fn) {
  Object.keys(obj).forEach(key => fn(obj[key], key));
}
```

`forEachValue` 接收 `obj` 和 `fn` 作为参数，
使用 `Object.keys()` 将 `obj` 转化成数组，使用 `forEach` 循环调用，
在 `forEach` 的回调函数中，会将 `obj[key]` `key` 作为参数传入 `fn`，循环调用 `fn` 函数。

### isObject

```js
export function isObject(obj) {
  return obj !== null && typeof obj === 'object';
}
```

`isObject` 接收 `obj` 作为参数，返回 `obj` 不等于 `null` 并且 `obj` 的类型是 `object`，判断传入的对象是否是纯对象，返回 `Boolean`。

### isPromise

```js
export function isPromise(val) {
  return val && typeof val.then === 'function';
}
```

`isPromise` 接收 `val` 作为参数，返回有 `val` 并且 `val` 的 `then` 是一个 `function`，只是简单判断一个有没有 `then` 方法。

### assert

```js
export function assert(condition, msg) {
  if (!condition) throw new Error(`[vuex] ${msg}`);
}
```

`assert` 接收 `condition` 和 `msg` 作为参数，如果 `condition` 取非为真，就调用 `throw new Error` 抛出异常。
