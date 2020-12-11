## bind

> 创建一个函数 func，这个函数的 this 会被绑定在 thisArg。 并且任何附加在 _.bind 的参数会被传入到这个绑定函数上。 这个 _.bind.placeholder 的值，默认是以 _ 作为附加部分参数的占位符。 

```js
_.bind(func, thisArg, [partials])
```

```js
/**
  * Creates a function that invokes `func` with the `this` binding of `thisArg`
  * and `partials` prepended to the arguments it receives.
  *
  * The `_.bind.placeholder` value, which defaults to `_` in monolithic builds,
  * may be used as a placeholder for partially applied arguments.
  *
  * **Note:** Unlike native `Function#bind`, this method doesn't set the "length"
  * property of bound functions.
  *
  * @static
  * @memberOf _
  * @since 0.1.0
  * @category Function
  * @param {Function} func The function to bind.
  * @param {*} thisArg The `this` binding of `func`.
  * @param {...*} [partials] The arguments to be partially applied.
  * @returns {Function} Returns the new bound function.
  * @example
  *
  * function greet(greeting, punctuation) {
  *   return greeting + ' ' + this.user + punctuation;
  * }
  *
  * var object = { 'user': 'fred' };
  *
  * var bound = _.bind(greet, object, 'hi');
  * bound('!');
  * // => 'hi fred!'
  *
  * // Bound with placeholders.
  * var bound = _.bind(greet, object, _, '!');
  * bound('hi');
  * // => 'hi fred!'
  */
var bind = baseRest(function (func, thisArg, partials) {
  var bitmask = WRAP_BIND_FLAG;
  if (partials.length) {
    var holders = replaceHolders(partials, getHolder(bind));
    bitmask |= WRAP_PARTIAL_FLAG;
  }
  return createWrap(func, bitmask, thisArg, partials, holders);
});
```

位运算符:

```js
// 等同于 x = x | y
x |= y
```

```js
var WRAP_BIND_FLAG = 1;
```


## replaceHolders

> 

```js

```

```js

```


## getHolder

> 

```js

```

```js

```

## createWrap

> 

```js

```

```js

```