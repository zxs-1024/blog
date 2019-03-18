/**
 * Get the first item that pass the test
 * by second argument function
 *
 * @param {Array} list
 * @param {Function} f
 * @return {*}
 */
export function find (list, f) {
  return list.filter(f)[0]
}

/**
 * Deep copy the given object considering circular structure.
 * This function caches all nested objects and its copies.
 * If it detects circular structure, use cached copy to avoid infinite loop.
 *
 * @param {*} obj
 * @param {Array<Object>} cache
 * @return {*}
 */
export function deepCopy (obj, cache = []) {
  // just return if obj is immutable value
  // 首先判断不是 `obj` 全等于 `null` 或者 `obj` 的类型不等于 `object` 就返回 `obj`
  if (obj === null || typeof obj !== 'object') {
    return obj
  }

  // if obj is hit, it is in circular structure
  // 接下来调用 `find`，将 `cache` 和 回调传入
  const hit = find(cache, c => c.original === obj)
  // 如果有 `hit` 就说明是环形结构
  // 所谓环形环形结构，就是对象之间相互引用
  // const obj = {
  //   a: 1
  // }
  // obj.b = obj
  // 就是直接返回 `hit.copy`
  if (hit) {
    return hit.copy
  }

  // 申明 copy 变量，如果 obj 是数组 那就是空数组，否则就是空对象
  const copy = Array.isArray(obj) ? [] : {}
  // put the copy into cache at first
  // because we want to refer it in recursive deepCopy
  // `original` 为 `key`, `obj` 为 `value`,已经上面申明的 `copy` 变量包装成对象 `push` 到 `cache` 数组中
  // 在下一次循环中，调用 find 方法，会使用 filter 去过滤匹配的对象，c.original 全等于当前循环的 `obj` ，说明引用的是一个地址，是环形结构

  cache.push({
    original: obj,
    copy
  })

  // 循环 obj key，递归调用 deepCopy 将 obj[key]，和缓存的 `cache` 作为参数传入
  Object.keys(obj).forEach(key => {
    copy[key] = deepCopy(obj[key], cache)
  })

  return copy
}

/**
 * forEach for object
 */
// object 转成数组 循环调用 fn
export function forEachValue (obj, fn) {
  Object.keys(obj).forEach(key => fn(obj[key], key))
}

export function isObject (obj) {
  return obj !== null && typeof obj === 'object'
}

export function isPromise (val) {
  return val && typeof val.then === 'function'
}

export function assert (condition, msg) {
  if (!condition) throw new Error(`[vuex] ${msg}`)
}
