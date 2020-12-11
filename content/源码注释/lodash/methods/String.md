## camelCase

> 转换字符串为驼峰写法

```js
_.camelCase([string=''])
```

```js
/**
 * Converts `string` to [camel case](https://en.wikipedia.org/wiki/CamelCase).
 *
 * @since 3.0.0
 * @category String
 * @param {string} [string=''] The string to convert.
 * @returns {string} Returns the camel cased string.
 * @see lowerCase, kebabCase, snakeCase, startCase, upperCase, upperFirst
 * @example
 *
 * camelCase('Foo Bar')
 * // => 'fooBar'
 *
 * camelCase('--foo-bar--')
 * // => 'fooBar'
 *
 * camelCase('__FOO_BAR__')
 * // => 'fooBar'
 */
const camelCase = (string) => (
  words(`${string}`.replace(/['\u2019]/g, '')).reduce((result, word, index) => {
    word = word.toLowerCase()
    return result + (index ? capitalize(word) : word)
  }, '')
)
```

`camelCase` 函数接收一个 `string` 字符串，在函数内部可以分为 2 段 `Code`：

```js
words(`${string}`.replace(/['\u2019]/g, ''))
```

`words` 函数负责将 `string` 拆分为数组，`${string}`.replace(/['\u2019]/g, '')` 是将单引号替换成空字符串。

### words

```js
/**
 * Splits `string` into an array of its words.
 *
 * @since 3.0.0
 * @category String
 * @param {string} [string=''] The string to inspect.
 * @param {RegExp|string} [pattern] The pattern to match words.
 * @returns {Array} Returns the words of `string`.
 * @example
 *
 * words('fred, barney, & pebbles')
 * // => ['fred', 'barney', 'pebbles']
 *
 * words('fred, barney, & pebbles', /[^, ]+/g)
 * // => ['fred', 'barney', '&', 'pebbles']
 */
function words(string, pattern) {
  if (pattern === undefined) {
    const result = hasUnicodeWord(string) ? unicodeWords(string) : asciiWords(string)
    return result || []
  }
  return string.match(pattern) || []
}
```

`words` 函数内部会判断 `pattern` 是否为 `undefined`，这里会调用 `hasUnicodeWord` 函数，匹配是否有 `Unicode`，就调用 `unicodeWords` 转化 `string`：

```js
const hasUnicodeWord = RegExp.prototype.test.bind(
  /[a-z][A-Z]|[A-Z]{2,}[a-z]|[0-9][a-zA-Z]|[a-zA-Z][0-9]|[^a-zA-Z0-9 ]/
)
```

否则就调用 `asciiWords` 函数转化 `string`：

```js
const asciiWords = RegExp.prototype.exec.bind(
  /[^\x00-\x2f\x3a-\x40\x5b-\x60\x7b-\x7f]+/g
)
```

返回调用 `macth` 函数，返回匹配 `pattern` 后的结果，默认为 `[]`。

当 `words` 返回数组后，调用 `reduce` 函数进行迭代，传入初始值 `''`。

```js
words(...).reduce((result, word, index) => {
  word = word.toLowerCase()
  return result + (index ? capitalize(word) : word)
}, '')
```

调用 `toLowerCase` 将 `word` 字符串转换为小写，`capitalize`  函数会将 `word` 转化为第一个字符串大写，剩余小写，第一个 `index` 为 0，采用 `word` 小写，`result` 累加，最后返回累加后的驼峰写法的字符串。

## capitalize

> 转换字符串首字母为大写，剩下为小写。

```js
_.capitalize([string=''])
```

```js

/**
 * Converts the first character of `string` to upper case and the remaining
 * to lower case.
 *
 * @since 3.0.0
 * @category String
 * @param {string} [string=''] The string to capitalize.
 * @returns {string} Returns the capitalized string.
 * @example
 *
 * capitalize('FRED')
 * // => 'Fred'
 */
const capitalize = (string) =>  upperFirst(string.toLowerCase())
```

`capitalize` 函数会返回 `upperFirst` 的调用返回，调用 `upperFirst` 函数时，会调用 `toLowerCase` 将参数转成小写。



## upperFirst

```js
/**
 * Converts the first character of `string` to upper case.
 *
 * @since 4.0.0
 * @category String
 * @param {string} [string=''] The string to convert.
 * @returns {string} Returns the converted string.
 * @see camelCase, kebabCase, lowerCase, snakeCase, startCase, upperCase
 * @example
 *
 * upperFirst('fred')
 * // => 'Fred'
 *
 * upperFirst('FRED')
 * // => 'FRED'
 */
const upperFirst = createCaseFirst('toUpperCase')
```

## deburr

> 转换 latin-1 supplementary letters#Character_table) 为基本拉丁字母，并删除变音符。

```js
_.deburr([string=''])
```

```js
/**
 * Deburrs `string` by converting
 * [Latin-1 Supplement](https://en.wikipedia.org/wiki/Latin-1_Supplement_(Unicode_block)#Character_table)
 * and [Latin Extended-A](https://en.wikipedia.org/wiki/Latin_Extended-A)
 * letters to basic Latin letters and removing
 * [combining diacritical marks](https://en.wikipedia.org/wiki/Combining_Diacritical_Marks).
 *
 * @since 3.0.0
 * @category String
 * @param {string} [string=''] The string to deburr.
 * @returns {string} Returns the deburred string.
 * @example
 *
 * deburr('déjà vu')
 * // => 'deja vu'
 */
function deburr(string) {
  return string && string.replace(reLatin, deburrLetter).replace(reComboMark, '')
}
```

`deburr` 函数首先会调用 `replace` 方法将匹配 `reLatin` 的拉丁语 `Unicode` 字母映射到基本拉丁字母。

```js
const reLatin = /[\xc0-\xd6\xd8-\xf6\xf8-\xff\u0100-\u017f]/g
```

`reLatin` 用于匹配拉丁语 `Unicode` 字母，`deburredLetters` 用于将拉丁语 `Unicode` 字母映射到基本拉丁字母，
就是将匹配到的拉丁舞转换成 `Unicode`，然后根据字母映射表转为基本字母，然后调用 `reComboMark`。

`reComboMark` 正则用于匹配变音符号，替换成空字符串。

```js
const reComboMark = RegExp(rsCombo, 'g')
string.replace(reComboMark, '')
```

将 `变音符号` 替换成空字符串。

## endsWith

> 检查给定的字符是否是字符串的结尾。

```js
_.endsWith([string=''], [target], [position=string.length])
```

```js
/**
 * Checks if `string` ends with the given target string.
 *
 * @since 3.0.0
 * @category String
 * @param {string} [string=''] The string to inspect.
 * @param {string} [target] The string to search for.
 * @param {number} [position=string.length] The position to search up to.
 * @returns {boolean} Returns `true` if `string` ends with `target`,
 *  else `false`.
 * @see includes, startsWith
 * @example
 *
 * endsWith('abc', 'c')
 * // => true
 *
 * endsWith('abc', 'b')
 * // => false
 *
 * endsWith('abc', 'b', 2)
 * // => true
 */
function endsWith(string, target, position) {
  const { length } = string
  position = position === undefined ? length : +position
  if (position < 0 || position != position) {
    position = 0
  }
  else if (position > length) {
    position = length
  }
  const end = position
  position -= target.length
  return position >= 0 && string.slice(position, end) == target
}
```

`endsWith` 函数接收 3 个参数，`string` 检索字符串、`target` 要搜索的字符串、`position` 搜索位置。

取出 `string` 的 `length`，判断是否传入 `position` ，默认为 `length`。

接着会对 `position` 做小于 0 和大于 `length` 的处理，申明 `end` 为结束位置，`position` 为 `position` 减等于 `target` 长度，这里拿到了字符串起始和结束下标。

然后 `&&` 添加判断，`position >= 0` 并且调用 `slice` 取出 `string` 与 `target` 比较相等，返回 `Boolean`。

## escape

> 转义字符 "&", "<", ">", '"', "'", 以及 "`" 为HTML实体字符。 

```js
_.escape([string=''])
```

```js
/**
 * Converts the characters "&", "<", ">", '"', and "'" in `string` to their
 * corresponding HTML entities.
 *
 * **Note:** No other characters are escaped. To escape additional
 * characters use a third-party library like [_he_](https://mths.be/he).
 *
 * Though the ">" character is escaped for symmetry, characters like
 * ">" and "/" don't need escaping in HTML and have no special meaning
 * unless they're part of a tag or unquoted attribute value. See
 * [Mathias Bynens's article](https://mathiasbynens.be/notes/ambiguous-ampersands)
 * (under "semi-related fun fact") for more details.
 *
 * When working with HTML you should always
 * [quote attribute values](http://wonko.com/post/html-escaping) to reduce
 * XSS vectors.
 *
 * @since 0.1.0
 * @category String
 * @param {string} [string=''] The string to escape.
 * @returns {string} Returns the escaped string.
 * @see escapeRegExp, unescape
 * @example
 *
 * escape('fred, barney, & pebbles')
 * // => 'fred, barney, &amp pebbles'
 */
function escape(string) {
  return (string && reHasUnescapedHtml.test(string))
    ? string.replace(reUnescapedHtml, (chr) => htmlEscapes[chr])
    : string
}
```

`escape` 返回一个 3 元表达式，如果有 `string` 并且调用 `reHasUnescapedHtml` 匹配 `HTML` 字符串。

```js
/** Used to match HTML entities and HTML characters. */
const reHasUnescapedHtml = RegExp(reUnescapedHtml.source)
```
如果匹配成功调用 `replace` 方法，并传入回调函数，将匹配 `reUnescapedHtml` 到的 `HTML` 字符串字母映射到转义字符表。

```js
/** Used to map characters to HTML entities. */
const htmlEscapes = {
  '&': '&amp',
  '<': '&lt',
  '>': '&gt',
  '"': '&quot',
  "'": '&#39'
}

const reUnescapedHtml = /[&<>"']/g
```

最后将处理完成的 `string` 返回。

## escapeRegExp

> 转义RegExp 中特殊的字符 "^", "$", "\", ".", "*", "+", "?", "(", ")", "[", "]", "{", "}", 以及 "|"。

```js
_.escapeRegExp([string=''])
```

```js
/**
 * Escapes the `RegExp` special characters "^", "$", "\", ".", "*", "+",
 * "?", "(", ")", "[", "]", "{", "}", and "|" in `string`.
 *
 * @since 3.0.0
 * @category String
 * @param {string} [string=''] The string to escape.
 * @returns {string} Returns the escaped string.
 * @see escape, escapeRegExp, unescape
 * @example
 *
 * escapeRegExp('[lodash](https://lodash.com/)')
 * // => '\[lodash\]\(https://lodash\.com/\)'
 */
function escapeRegExp(string) {
  return (string && reHasRegExpChar.test(string))
    ? string.replace(reRegExpChar, '\\$&')
    : string
}
```

`escapeRegExp` 返回一个 3 元表达式，如果 `reHasRegExpChar` 匹配到特殊字符。

```js
/**
 * Used to match `RegExp`
 * [syntax characters](http://ecma-international.org/ecma-262/7.0/#sec-patterns).
 */
const reRegExpChar = /[\\^$.*+?()[\]{}|]/g
const reHasRegExpChar = RegExp(reRegExpChar.source)
```

调用 `replace` 函数 `reRegExpChar` 匹配的字符串前面加上 `\`，最后将 `string` 返回。

## kebabCase

> 转换字符串为 kebab case。

```js
_.kebabCase([string=''])
```

```js
/**
 * Converts `string` to
 * [kebab case](https://en.wikipedia.org/wiki/Letter_case#Special_case_styles).
 *
 * @since 3.0.0
 * @category String
 * @param {string} [string=''] The string to convert.
 * @returns {string} Returns the kebab cased string.
 * @see camelCase, lowerCase, snakeCase, startCase, upperCase, upperFirst
 * @example
 *
 * kebabCase('Foo Bar')
 * // => 'foo-bar'
 *
 * kebabCase('fooBar')
 * // => 'foo-bar'
 *
 * kebabCase('__FOO_BAR__')
 * // => 'foo-bar'
 */
const kebabCase = (string) => (
  words(`${string}`.replace(/['\u2019]/g, '')).reduce((result, word, index) => (
    result + (index ? '-' : '') + word.toLowerCase()
  ), '')
)
```

`kebabCase` 函数与 `camelCase` 函数相似，调用 `words` 后连缀调用 `reduce` 函数，在回调函数中会将 `word` 转化为小写，并且用 `-` 拼接。

## lowerCase

> 以空格分开单词并转换为小写。

```js
_.lowerCase([string=''])
```

```js
const reQuotes = /['\u2019]/g

/**
 * Converts `string`, as space separated words, to lower case.
 *
 * @since 4.0.0
 * @category String
 * @param {string} [string=''] The string to convert.
 * @returns {string} Returns the lower cased string.
 * @see camelCase, kebabCase, snakeCase, startCase, upperCase, upperFirst
 * @example
 *
 * lowerCase('--Foo-Bar--')
 * // => 'foo bar'
 *
 * lowerCase('fooBar')
 * // => 'foo bar'
 *
 * lowerCase('__FOO_BAR__')
 * // => 'foo bar'
 */
const lowerCase = (string) => (
  words(`${string}`.replace(reQuotes, '')).reduce((result, word, index) => (
    result + (index ? ' ' : '') + word.toLowerCase()
  ), '')
)
```

`kebabCase` 函数与 `camelCase` 函数相似，调用 `words` 后连缀调用 `reduce` 函数，在回调函数中会将 `word` 转化为小写，并且用空格拼接。


## lowerFirst

> 转换首字母为小写。

```js
_.lowerFirst([string=''])
```

```js
/**
 * Converts the first character of `string` to lower case.
 *
 * @since 4.0.0
 * @category String
 * @param {string} [string=''] The string to convert.
 * @returns {string} Returns the converted string.
 * @example
 *
 * lowerFirst('Fred')
 * // => 'fred'
 *
 * lowerFirst('FRED')
 * // => 'fRED'
 */
const lowerFirst = createCaseFirst('toLowerCase')
```

`lowerFirst` 函数是调用 `createCaseFirst` 函数，传入 `toLowerCase` 返回的函数。

## createCaseFirst

```js
/**
 * Creates a function like `lowerFirst`.
 *
 * @private
 * @param {string} methodName The name of the `String` case method to use.
 * @returns {Function} Returns the new case function.
 */
function createCaseFirst(methodName) {
  return (string) => {
    const strSymbols = hasUnicode(string)
      ? stringToArray(string)
      : undefined

    const chr = strSymbols
      ? strSymbols[0]
      : string[0]

    const trailing = strSymbols
      ? castSlice(strSymbols, 1).join('')
      : string.slice(1)

    return chr[methodName]() + trailing
  }
}
```

`createCaseFirst` 返回一个 `function`。

申明 `strSymbols` 标识是否 `Unicode` 字符串，有就调用 `stringToArray` 转化为字符串，没有就赋值为 `undefined`。

申明 `chr` 从 `strSymbols` 取出第一个，申明 `trailing` 变量保存删除第一个字符串的 `string`，
最后调用传入的 `methodName` 方法也就是 `toLowerCase` 函数并且拼接字符串后返回。

## pad

> 如果字符串长度小于 length 则从左到右填充字符。 如果没法平均分配，则截断超出的长度。

```js
_.pad([string=''], [length=0], [chars=' '])
```

```js
/**
 * Pads `string` on the left and right sides if it's shorter than `length`.
 * Padding characters are truncated if they can't be evenly divided by `length`.
 *
 * @since 3.0.0
 * @category String
 * @param {string} [string=''] The string to pad.
 * @param {number} [length=0] The padding length.
 * @param {string} [chars=' '] The string used as padding.
 * @returns {string} Returns the padded string.
 * @example
 *
 * pad('abc', 8)
 * // => '  abc   '
 *
 * pad('abc', 8, '_-')
 * // => '_-abc_-_'
 *
 * pad('abc', 2)
 * // => 'abc'
 */
function pad(string, length, chars) {
  const strLength = length ? stringSize(string) : 0
  if (!length || strLength >= length) {
    return string
  }
  const mid = (length - strLength) / 2
  return (
    createPadding(Math.floor(mid), chars) +
    string +
    createPadding(Math.ceil(mid), chars)
  )
}
```

`pad` 函数接收 3 个参数，`string` 填充字符串、`length` 填充长度、`chars` 用作填充的字符串。

申明 `strLength` 变量保存 `string` 的长度，做非空判断，如果没有 `length` 或者 `strLength >= length`，返回 `string`。

申明 `mid` 单边需要填充的长度，调用 `createPadding` 函数返回填充字符串，将字符串拼接后返回。

## createPadding

```js
/**
 * Creates the padding for `string` based on `length`. The `chars` string
 * is truncated if the number of characters exceeds `length`.
 *
 * @private
 * @param {number} length The padding length.
 * @param {string} [chars=' '] The string used as padding.
 * @returns {string} Returns the padding for `string`.
 */
function createPadding(length, chars) {
  chars = chars === undefined ? ' ' : baseToString(chars)

  const charsLength = chars.length
  if (charsLength < 2) {
    return charsLength ? repeat(chars, length) : chars
  }
  const result = repeat(chars, Math.ceil(length / stringSize(chars)))
  return hasUnicode(chars)
    ? castSlice(stringToArray(result), 0, length).join('')
    : result.slice(0, length)
}
```

`createPadding` 接收 2 个参数，`length` 填充长度、`chars` 填充字符串。

`chars` 如果等于 `undefined`，赋值为 0，否则调用 `baseToString` 转化为字符串。

申明 `charsLength` 获取 `chars` 长度，如果小于 2，只有 0 或者 1 了，调用 `repeat` 否则返回默认值空字符串。
接着申明 `result` 得到 `repeat` 后的重复字符串，如果是 `Unicode`，调用 `castSlice`，否则调用 `slice` 截取字符串后返回。

## padEnd

> 如果字符串长度小于 length 则在右侧填充字符。 如果超出长度则截断超出的部分。

```js
_.padEnd([string=''], [length=0], [chars=' '])
```

```js
/**
 * Pads `string` on the right side if it's shorter than `length`. Padding
 * characters are truncated if they exceed `length`.
 *
 * @since 4.0.0
 * @category String
 * @param {string} [string=''] The string to pad.
 * @param {number} [length=0] The padding length.
 * @param {string} [chars=' '] The string used as padding.
 * @returns {string} Returns the padded string.
 * @example
 *
 * padEnd('abc', 6)
 * // => 'abc   '
 *
 * padEnd('abc', 6, '_-')
 * // => 'abc_-_'
 *
 * padEnd('abc', 2)
 * // => 'abc'
 */
function padEnd(string, length, chars) {
  const strLength = length ? stringSize(string) : 0
  return (length && strLength < length)
    ? (string + createPadding(length - strLength, chars))
    : string
}
```

`padEnd` 函数与 `pad` 相似，不用做平均填充，直接填充到右侧，返回一个 3 元表达式，如果 `strLength` 大于 `length` 拼接 `string` 和调用 `createPadding` 后返回的拼接字符串，然后返回。

## padStart

> 如果字符串长度小于 length 则在左侧填充字符。 如果超出长度则截断超出的部分。

```js
_.padStart([string=''], [length=0], [chars=' '])
```

```js
/**
 * Pads `string` on the left side if it's shorter than `length`. Padding
 * characters are truncated if they exceed `length`.
 *
 * @since 4.0.0
 * @category String
 * @param {string} [string=''] The string to pad.
 * @param {number} [length=0] The padding length.
 * @param {string} [chars=' '] The string used as padding.
 * @returns {string} Returns the padded string.
 * @example
 *
 * padStart('abc', 6)
 * // => '   abc'
 *
 * padStart('abc', 6, '_-')
 * // => '_-_abc'
 *
 * padStart('abc', 2)
 * // => 'abc'
 */
function padStart(string, length, chars) {
  const strLength = length ? stringSize(string) : 0
  return (length && strLength < length)
    ? (createPadding(length - strLength, chars) + string)
    : string
}
```

`padStart` 与 `padEnd` 函数相似，只是拼接字符串在前面。

## parseInt

> 以指定的基数转换字符串为整数。 如果基数是 undefined 或者 0，则基数默认是10，如果字符串是16进制，则基数为16

```js
_.parseInt(string, [radix=10])
```

```js
/**
 * Converts `string` to an integer of the specified radix. If `radix` is
 * `undefined` or `0`, a `radix` of `10` is used unless `string` is a
 * hexadecimal, in which case a `radix` of `16` is used.
 *
 * **Note:** This method aligns with the
 * [ES5 implementation](https://es5.github.io/#x15.1.2.2) of `parseInt`.
 *
 * @since 1.1.0
 * @category String
 * @param {string} string The string to convert.
 * @param {number} [radix=10] The radix to interpret `string` by.
 * @returns {number} Returns the converted integer.
 * @example
 *
 * parseInt('08')
 * // => 8
 */
function parseInt(string, radix) {
  if (radix == null) {
    radix = 0
  } else if (radix) {
    radix = +radix
  }
  return nativeParseInt(`${string}`.replace(reTrimStart, ''), radix || 0)
}
```

`parseInt` 函数首先会判断 `radix`，默认为 0，否则就使用 `+` 尝试隐式转化为数字，最后会调用 `nativeParseInt` 函数：

```js
/* Built-in method references for those with the same name as other `lodash` methods. */
const nativeParseInt = root.parseInt
```

`nativeParseInt` 是全局对象 `parseInt` 函数。

这里会调用 `replace` 函数，将空格替换成空字符串，传入 `radix` 或者 0。

```js
/** Used to match leading and trailing whitespace. */
const reTrimStart = /^\s+/
```

## repeat

> 重复 N 次字符串

```js
_.repeat([string=''], [n=1])
```

```js
/**
 * Repeats the given string `n` times.
 *
 * @since 3.0.0
 * @category String
 * @param {string} [string=''] The string to repeat.
 * @param {number} [n=1] The number of times to repeat the string.
 * @returns {string} Returns the repeated string.
 * @example
 *
 * repeat('*', 3)
 * // => '***'
 *
 * repeat('abc', 2)
 * // => 'abcabc'
 *
 * repeat('abc', 0)
 * // => ''
 */
function repeat(string, n) {
  let result = ''
  if (!string || n < 1 || n > Number.MAX_SAFE_INTEGER) {
    return result
  }
  // Leverage the exponentiation by squaring algorithm for a faster repeat.
  // See https://en.wikipedia.org/wiki/Exponentiation_by_squaring for more details.
  do {
    if (n % 2) {
      result += string
    }
    n = Math.floor(n / 2)
    if (n) {
      string += string
    }
  } while (n)

  return result
}
```

`repeat` 函数首先申明 `result` 空字符串，对 `n` 做些限制，`string` 为 `false`、小于 1、大于最大安全数返回 `result`。

这里采用了 `do...while` 循环，如果 `n % 2` 为真，也就是不能被 2 整除，将字符串拼接，
接着将 `n` 赋值为 `n / 2`，并且 `Math.floor` 向下取整，
如果 `n` 为真，再次进行拼接，依次循环，知道 `n` 为 0，这样可以实现更好的性能，最后将 `result` 返回。

## replace

> 替换字符串中匹配的内容为给定的内容 

```js
_.replace([string=''], pattern, replacement)
```

```js
/**
 * Replaces matches for `pattern` in `string` with `replacement`.
 *
 * **Note:** This method is based on
 * [`String#replace`](https://mdn.io/String/replace).
 *
 * @since 4.0.0
 * @category String
 * @param {string} [string=''] The string to modify.
 * @param {RegExp|string} pattern The pattern to replace.
 * @param {Function|string} replacement The match replacement.
 * @returns {string} Returns the modified string.
 * @see truncate, trim
 * @example
 *
 * replace('Hi Fred', 'Fred', 'Barney')
 * // => 'Hi Barney'
 */
function replace(...args) {
  const string = `${args[0]}`
  return args.length < 3 ? string : string.replace(args[1], args[2])
}
```

`replace` 函数会申明 `string` 赋值为 `args` 的第 0 个，然后返回一个 3 元表达式，如果 `args.length < 3` 直接返回 `string`，否则调用 `replace` 进行字符串替换。

## split

> _.split([string=''], separator, [limit])


```js
_.split([string=''], separator, [limit])
```

```js
/**
 * Splits `string` by `separator`.
 *
 * **Note:** This method is based on
 * [`String#split`](https://mdn.io/String/split).
 *
 * @since 4.0.0
 * @category String
 * @param {string} [string=''] The string to split.
 * @param {RegExp|string} separator The separator pattern to split by.
 * @param {number} [limit] The length to truncate results to.
 * @returns {Array} Returns the string segments.
 * @example
 *
 * split('a-b-c', '-', 2)
 * // => ['a', 'b']
 */
function split(string, separator, limit) {
  limit = limit === undefined ? MAX_ARRAY_LENGTH : limit >>> 0
  if (!limit) {
    return []
  }
  if (string && (
        typeof separator == 'string' ||
        (separator != null && !isRegExp(separator))
      )) {
    if (!separator && hasUnicode(string)) {
      return castSlice(stringToArray(string), 0, limit)
    }
  }
  return string.split(separator, limit)
}
```

首先对 `limit` 进行处理，如果为 `undefined`，赋值为 `MAX_ARRAY_LENGTH`，否则用右移运算符 `>>> 0` 进行取整，如果 `limit` 取非为真，返回空数组。

```js
/** Used as references for the maximum length and index of an array. */
const MAX_ARRAY_LENGTH = 4294967295
```

接着会判断如果是 `separator` 是字符串或者 `separator` 不等于 `null` 并且不是正则，
进行第二个 `if` 判断，如果没有 `separator` 并且 `string` 是 `Unicode` 字符串，调用 `castSlice` 进行切割。

如果上面的 `code` 没有 `return`，返回调用原生的 `split` 处理结果。

## snakeCase 

> 转换字符串为 snake case

```js
_.snakeCase([string=''])
```

```js
/**
 * Converts `string` to
 * [snake case](https://en.wikipedia.org/wiki/Snake_case).
 *
 * @since 3.0.0
 * @category String
 * @param {string} [string=''] The string to convert.
 * @returns {string} Returns the snake cased string.
 * @see camelCase, lowerCase, kebabCase, startCase, upperCase, upperFirst
 * @example
 *
 * snakeCase('Foo Bar')
 * // => 'foo_bar'
 *
 * snakeCase('fooBar')
 * // => 'foo_bar'
 *
 * snakeCase('--FOO-BAR--')
 * // => 'foo_bar'
 *
 * snakeCase('foo2bar')
 * // => 'foo_2_bar'
 */
const snakeCase = (string) => (
  words(`${string}`.replace(/['\u2019]/g, '')).reduce((result, word, index) => (
    result + (index ? '_' : '') + word.toLowerCase()
  ), '')
)
```

`snakeCase` 函数与 `kebabCase` 函数相似，只是用了 `_` 连接 `word`。

## startCase

> 转换字符串为 start case

```js
_.startCase([string=''])
```

```js
/**
 * Converts `string` to
 * [start case](https://en.wikipedia.org/wiki/Letter_case#Stylistic_or_specialised_usage).
 *
 * @since 3.1.0
 * @category String
 * @param {string} [string=''] The string to convert.
 * @returns {string} Returns the start cased string.
 * @see camelCase, lowerCase, kebabCase, snakeCase, upperCase, upperFirst
 * @example
 *
 * startCase('--foo-bar--')
 * // => 'Foo Bar'
 *
 * startCase('fooBar')
 * // => 'Foo Bar'
 *
 * startCase('__FOO_BAR__')
 * // => 'FOO BAR'
 */
const startCase = (string) => (
  words(`${string}`.replace(/['\u2019]/g, '')).reduce((result, word, index) => (
    result + (index ? ' ' : '') + upperFirst(word)
  ), '')
)
```

`startCase` 函数与 `camelCase` 函数相似，采用空字符串拼接，并且调用 `upperFirst` 函数转换 `word`。


## upperFirst

```js
/**
 * Converts the first character of `string` to upper case.
 *
 * @since 4.0.0
 * @category String
 * @param {string} [string=''] The string to convert.
 * @returns {string} Returns the converted string.
 * @see camelCase, kebabCase, lowerCase, snakeCase, startCase, upperCase
 * @example
 *
 * upperFirst('fred')
 * // => 'Fred'
 *
 * upperFirst('FRED')
 * // => 'FRED'
 */
const upperFirst = createCaseFirst('toUpperCase')
```

`upperFirst` 与 `lowerFirst` 函数相似，只是传入了 `toUpperCase` 字符串，调用了字符串 `toUpperCase` 方法，第一个字符转换为大写字母。

## startsWith

> 检查字符串是否以 target 开头。

```js
_.startsWith([string=''], [target], [position=0])
```

```js
/**
 * Checks if `string` starts with the given target string.
 *
 * @since 3.0.0
 * @category String
 * @param {string} [string=''] The string to inspect.
 * @param {string} [target] The string to search for.
 * @param {number} [position=0] The position to search from.
 * @returns {boolean} Returns `true` if `string` starts with `target`,
 *  else `false`.
 * @see endsWith, includes
 * @example
 *
 * startsWith('abc', 'a')
 * // => true
 *
 * startsWith('abc', 'b')
 * // => false
 *
 * startsWith('abc', 'b', 1)
 * // => true
 */
function startsWith(string, target, position) {
  const { length } = string
  position = position == null ? 0 : position
  if (position < 0) {
    position = 0
  }
  else if (position > length) {
    position = length
  }
  target = `${target}`
  return string.slice(position, position + target.length) == target
}
```

`endsWith` 与 `endsWith` 函数相似，只是调用 `slice` 函数时，取出 `position` 位置是左开始。

## toLower

> 转换整体的字符串为小写

```js
_.toLower([string=''])
```

```js
/**
  * Converts `string`, as a whole, to lower case just like
  * [String#toLowerCase](https://mdn.io/toLowerCase).
  *
  * @static
  * @memberOf _
  * @since 4.0.0
  * @category String
  * @param {string} [string=''] The string to convert.
  * @returns {string} Returns the lower cased string.
  * @example
  *
  * _.toLower('--Foo-Bar--');
  * // => '--foo-bar--'
  *
  * _.toLower('fooBar');
  * // => 'foobar'
  *
  * _.toLower('__FOO_BAR__');
  * // => '__foo_bar__'
  */
function toLower(value) {
  return toString(value).toLowerCase();
}
```

`toLower` 函数会将 `value` 处理成字符串，并调用原生 `toLowerCase` 函数。

## toUpper

> 转换整体的字符串为大写

```js
_.toUpper([string=''])
```

```js
/**
  * Converts `string`, as a whole, to upper case just like
  * [String#toUpperCase](https://mdn.io/toUpperCase).
  *
  * @static
  * @memberOf _
  * @since 4.0.0
  * @category String
  * @param {string} [string=''] The string to convert.
  * @returns {string} Returns the upper cased string.
  * @example
  *
  * _.toUpper('--foo-bar--');
  * // => '--FOO-BAR--'
  *
  * _.toUpper('fooBar');
  * // => 'FOOBAR'
  *
  * _.toUpper('__foo_bar__');
  * // => '__FOO_BAR__'
  */
function toUpper(value) {
  return toString(value).toUpperCase();
}
```

`toUpper` 函数会将 `value` 处理成字符串，并调用原生 `toUpperCase` 函数。

## trim

> 从字符串中移除前面和后面的空白或指定的字符。

```js
_.trim([string=''], [chars=whitespace])
```

```js
/**
 * Removes leading and trailing whitespace or specified characters from `string`.
 *
 * @since 3.0.0
 * @category String
 * @param {string} [string=''] The string to trim.
 * @param {string} [chars=whitespace] The characters to trim.
 * @returns {string} Returns the trimmed string.
 * @see trimEnd, trimStart
 * @example
 *
 * trim('  abc  ')
 * // => 'abc'
 *
 * trim('-_-abc-_-', '_-')
 * // => 'abc'
 */
function trim(string, chars) {
  if (string && chars === undefined) {
    return string.trim()
  }
  if (!string || !chars) {
    return string
  }
  const strSymbols = stringToArray(string)
  const chrSymbols = stringToArray(chars)
  const start = charsStartIndex(strSymbols, chrSymbols)
  const end = charsEndIndex(strSymbols, chrSymbols) + 1

  return castSlice(strSymbols, start, end).join('')
}
```

`trim` 函数首先判断如果 `string` 为真，并且 `chars` 为 `undefined`，返回 `string.trim()` ，接着是 `string` 和 `chars` 为 `false` 的情况，返回 `string`。

这里会调用 `stringToArray` 函数将 `string`、`chars` 处理成数组， 然后调用 `charsStartIndex` 函数得到 `start`、`end`。

最后调用 `castSlice` 进行数组切割，最后调用 `join('')` 合并成字符串返回。

## trimEnd

> 移除字符串后面的空白或指定的字符。

```js
_.trimEnd([string=''], [chars=whitespace])
```

```js
/**
 * Removes trailing whitespace or specified characters from `string`.
 *
 * @since 4.0.0
 * @category String
 * @param {string} [string=''] The string to trim.
 * @param {string} [chars=whitespace] The characters to trim.
 * @returns {string} Returns the trimmed string.
 * @see trim, trimStart
 * @example
 *
 * trimEnd('  abc  ')
 * // => '  abc'
 *
 * trimEnd('-_-abc-_-', '_-')
 * // => '-_-abc'
 */
function trimEnd(string, chars) {
  if (string && chars === undefined) {
    return string[methodName]()
  }
  if (!string || !chars) {
    return string
  }
  const strSymbols = stringToArray(string)
  const end = charsEndIndex(strSymbols, stringToArray(chars)) + 1
  return castSlice(strSymbols, 0, end).join('')
}
```

`trimEnd` 函数首先判断如果 `string` 为真，并且 `chars` 为 `undefined`，返回 `string[methodName]()`，`methodName` 是判断当前 `string` 是是否有 `trimRight` 方法，如果没有就是 `trimEnd`。

```js
const methodName = ''.trimRight ? 'trimRight': 'trimEnd'
```

接着是 `string` 和 `chars` 为 `false` 的情况，返回 `string`。

调用 `stringToArray` 将 `string` 处理成数组，调用 `charsEndIndex` 函数获取 `end`，最后调用 `castSlice` 函数切割数组，调用 `join('')` 组合成 `string` 返回。

## trimStart

> 移除字符串中前面的空白 或 指定的字符。

```js
_.trimStart([string=''], [chars=whitespace])
```

```js
const methodName =  ''.trimLeft ? 'trimLeft' : 'trimStart'

/**
 * Removes leading whitespace or specified characters from `string`.
 *
 * @since 4.0.0
 * @category String
 * @param {string} [string=''] The string to trim.
 * @param {string} [chars=whitespace] The characters to trim.
 * @returns {string} Returns the trimmed string.
 * @see trim, trimEnd
 * @example
 *
 * trimStart('  abc  ')
 * // => 'abc  '
 *
 * trimStart('-_-abc-_-', '_-')
 * // => 'abc-_-'
 */
function trimStart(string, chars) {
  if (string && chars === undefined) {
    return string[methodName]()
  }
  if (!string || !chars) {
    return string
  }
  const strSymbols = stringToArray(string)
  const start = charsStartIndex(strSymbols, stringToArray(chars))
  return castSlice(strSymbols, start).join('')
}
```

`trimStart` 函数与 `trimEnd` 函数相似，只是调用了 `charsStartIndex` 获取 `start`，调用 `castSlice` 截取数组后合并成 `string`。

## truncate

> 截断字符串，如果字符串超出了限定的最大值。 被截断的字符串后面会以 omission 代替，omission 默认是 "..."。

```js
_.truncate([string=''], [options={}])
```

```js
/** Used as default options for `truncate`. */
const DEFAULT_TRUNC_LENGTH = 30
const DEFAULT_TRUNC_OMISSION = '...'

/** Used to match `RegExp` flags from their coerced string values. */
const reFlags = /\w*$/

/**
 * Truncates `string` if it's longer than the given maximum string length.
 * The last characters of the truncated string are replaced with the omission
 * string which defaults to "...".
 *
 * @since 4.0.0
 * @category String
 * @param {string} [string=''] The string to truncate.
 * @param {Object} [options={}] The options object.
 * @param {number} [options.length=30] The maximum string length.
 * @param {string} [options.omission='...'] The string to indicate text is omitted.
 * @param {RegExp|string} [options.separator] The separator pattern to truncate to.
 * @returns {string} Returns the truncated string.
 * @see replace
 * @example
 *
 * truncate('hi-diddly-ho there, neighborino')
 * // => 'hi-diddly-ho there, neighbo...'
 *
 * truncate('hi-diddly-ho there, neighborino', {
 *   'length': 24,
 *   'separator': ' '
 * })
 * // => 'hi-diddly-ho there,...'
 *
 * truncate('hi-diddly-ho there, neighborino', {
 *   'length': 24,
 *   'separator': /,? +/
 * })
 * // => 'hi-diddly-ho there...'
 *
 * truncate('hi-diddly-ho there, neighborino', {
 *   'omission': ' [...]'
 * })
 * // => 'hi-diddly-ho there, neig [...]'
 */
function truncate(string, options) {
  let separator
  let length = DEFAULT_TRUNC_LENGTH
  let omission = DEFAULT_TRUNC_OMISSION

  if (isObject(options)) {
    separator = 'separator' in options ? options.separator : separator
    length = 'length' in options ? options.length : length
    omission = 'omission' in options ? baseToString(options.omission) : omission
  }
  let strSymbols
  let strLength = string.length
  if (hasUnicode(string)) {
    strSymbols = stringToArray(string)
    strLength = strSymbols.length
  }
  if (length >= strLength) {
    return string
  }
  let end = length - stringSize(omission)
  if (end < 1) {
    return omission
  }
  let result = strSymbols
    ? castSlice(strSymbols, 0, end).join('')
    : string.slice(0, end)

  if (separator === undefined) {
    return result + omission
  }
  if (strSymbols) {
    end += (result.length - end)
  }
  if (isRegExp(separator)) {
    if (string.slice(end).search(separator)) {
      let match
      let newEnd
      const substring = result

      if (!separator.global) {
        separator = RegExp(separator.source, `${reFlags.exec(separator) || ''}g`)
      }
      separator.lastIndex = 0
      while ((match = separator.exec(substring))) {
        newEnd = match.index
      }
      result = result.slice(0, newEnd === undefined ? end : newEnd)
    }
  } else if (string.indexOf(baseToString(separator), end) != end) {
    const index = result.lastIndexOf(separator)
    if (index > -1) {
      result = result.slice(0, index)
    }
  }
  return result + omission
}
```

`truncate` 接收 2 个参数，`string` 截断字符串、`options` 配置对象。

申明 `separator` 变量，`length` 变量为常量 `DEFAULT_TRUNC_LENGTH` 30，`omission` 为默认省略号 `...`。

```js
/** Used as default options for `truncate`. */
const DEFAULT_TRUNC_LENGTH = 30
const DEFAULT_TRUNC_OMISSION = '...'
```

调用 `isObject` 判断 `options` 是否是对象，如果是进行 `options` 配置，对 `separator`、`length`、`omission` 进行重置赋值。

```js
let strSymbols
let strLength = string.length
if (hasUnicode(string)) {
  strSymbols = stringToArray(string)
  strLength = strSymbols.length
}
```

申明 `strSymbols` 变量、`strLength` 为 `string` 长度，调用 `hasUnicode` 判断 `string` 为 `unicode`，将 `strSymbols` 转成数组， `strLength` 为 `strSymbols` 长度，然后做了一些边界处理。

```js
if (isRegExp(separator)) {
  if (string.slice(end).search(separator)) {
    let match
    let newEnd
    const substring = result

    if (!separator.global) {
      separator = RegExp(separator.source, `${reFlags.exec(separator) || ''}g`)
    }
    separator.lastIndex = 0
    while ((match = separator.exec(substring))) {
      newEnd = match.index
    }
    result = result.slice(0, newEnd === undefined ? end : newEnd)
  }
}
```

如果 `separator` 是正则，并且调用 `search` 函数匹配 `string.slice(end)`，在 `while` 循环中会调用 `exec` 返回匹配，并且将 `match.index` 赋值给 `newEnd`，最后调用 `slice` 对 `result` 进行截取。

```js
else if (string.indexOf(baseToString(separator), end) != end) {
  const index = result.lastIndexOf(separator)
  if (index > -1) {
    result = result.slice(0, index)
  }
}
```

如果不是正则，并且调用 `indexOf` 获取 `separator` 下标不等于 `end`，调用 `slice` 进行切割。

最后将 `result` 与 `omission` 拼接后返回。


## unescape

> 反向版 _.escape。 这个方法转换 HTML 实体 &amp;, &lt;, &gt;, &quot;, &#39;, 以及 &#96; 为对应的字符。 

```js
_.unescape([string=''])
```

```js
/** Used to map HTML entities to characters. */
const htmlUnescapes = {
  '&amp;': '&',
  '&lt;': '<',
  '&gt;': '>',
  '&quot;': '"',
  '&#39;': "'"
}

/** Used to match HTML entities and HTML characters. */
const reEscapedHtml = /&(?:amp|lt|gt|quot|#39);/g
const reHasEscapedHtml = RegExp(reEscapedHtml.source)

/**
 * The inverse of `escape`this method converts the HTML entities
 * `&amp;`, `&lt;`, `&gt;`, `&quot;` and `&#39;` in `string` to
 * their corresponding characters.
 *
 * **Note:** No other HTML entities are unescaped. To unescape additional
 * HTML entities use a third-party library like [_he_](https://mths.be/he).
 *
 * @since 0.6.0
 * @category String
 * @param {string} [string=''] The string to unescape.
 * @returns {string} Returns the unescaped string.
 * @see escape, escapeRegExp
 * @example
 *
 * unescape('fred, barney, &amp; pebbles')
 * // => 'fred, barney, & pebbles'
 */
function unescape(string) {
  return (string && reHasEscapedHtml.test(string))
    ? string.replace(reEscapedHtml, (entity) => htmlUnescapes[entity])
    : string
}
```

`unescape` 函数返回一个 3 元表达式，首先会调用 `reHasEscapedHtml` 检测 `string` 中是否有 `HTML` 转义字符串，如果有的话就调用 `replace` 函数将将匹配 `reEscapedHtml` 到的 `HTML` 转义字符映射到 `HTML` 字符串。

## upperCase

> 转换字符串为空格分割的大写单词

```js
_.upperCase([string=''])
```

```js
/**
 * Converts `string`, as space separated words, to upper case.
 *
 * @since 4.0.0
 * @category String
 * @param {string} [string=''] The string to convert.
 * @returns {string} Returns the upper cased string.
 * @see camelCase, kebabCase, lowerCase, snakeCase, startCase, upperFirst
 * @example
 *
 * upperCase('--foo-bar')
 * // => 'FOO BAR'
 *
 * upperCase('fooBar')
 * // => 'FOO BAR'
 *
 * upperCase('__foo_bar__')
 * // => 'FOO BAR'
 */
const upperCase = (string) => (
  words(`${string}`.replace(/['\u2019]/g, '')).reduce((result, word, index) => (
    result + (index ? ' ' : '') + word.toUpperCase()
  ), '')
)
```

`upperCase` 函数与 `kebabCase` 函数相似，只是用空格作为分隔符，并且调用 `toUpperCase` 将 `word` 转化为大写。

## upperFirst

```js
/**
 * Converts the first character of `string` to upper case.
 *
 * @since 4.0.0
 * @category String
 * @param {string} [string=''] The string to convert.
 * @returns {string} Returns the converted string.
 * @see camelCase, kebabCase, lowerCase, snakeCase, startCase, upperCase
 * @example
 *
 * upperFirst('fred')
 * // => 'Fred'
 *
 * upperFirst('FRED')
 * // => 'FRED'
 */
const upperFirst = createCaseFirst('toUpperCase')
```

与 `lowerFirst` 函数相似，`upperFirst` 函数是调用 `createCaseFirst` 函数，传入 `toUpperCase` 返回的函数，将第一个字母转成大写。

## words

> 拆分字符串中的词为数组

```js
_.words([string=''], [pattern])
```

```js
/**
 * Splits `string` into an array of its words.
 *
 * @since 3.0.0
 * @category String
 * @param {string} [string=''] The string to inspect.
 * @param {RegExp|string} [pattern] The pattern to match words.
 * @returns {Array} Returns the words of `string`.
 * @example
 *
 * words('fred, barney, & pebbles')
 * // => ['fred', 'barney', 'pebbles']
 *
 * words('fred, barney, & pebbles', /[^, ]+/g)
 * // => ['fred', 'barney', '&', 'pebbles']
 */
function words(string, pattern) {
  if (pattern === undefined) {
    const result = hasUnicodeWord(string) ? unicodeWords(string) : asciiWords(string)
    return result || []
  }
  return string.match(pattern) || []
}
```

`words` 函数首先会判断 `pattern` 是否为 `undefined`，然后调用 `hasUnicodeWord` 判断如果有 `Unicode`，就调用 `unicodeWords` 处理 `string`，否则就用 `asciiWords`，然后将 `result` 或者 `[]` 返回。

```js
const asciiWords = RegExp.prototype.exec.bind(
  /[^\x00-\x2f\x3a-\x40\x5b-\x60\x7b-\x7f]+/g
)
const hasUnicodeWord = RegExp.prototype.test.bind(
  /[a-z][A-Z]|[A-Z]{2,}[a-z]|[0-9][a-zA-Z]|[a-zA-Z][0-9]|[^a-zA-Z0-9 ]/
)
```

如果有传入 `pattern` ，直接调用 `pattern` 返回。
