
## package.json

基于 `npm` 托管的项目通常都会有 `package.json` 文件。

`lodash` 的关于项目构建的脚本：

```js
"scripts": {
  "build": "npm run build:main && npm run build:fp",
  "build:fp": "node lib/fp/build-dist.js",
  "build:fp-modules": "node lib/fp/build-modules.js",
  "build:main": "node lib/main/build-dist.js",
  "build:main-modules": "node lib/main/build-modules.js",
  ...
}
```

我们来看 `build`，命令，执行 `build` 命令后会再次执行 `npm run build:main` 和 `npm run build:fp` 命令，而在 `build:fp`、`build:fp` 等命令中会调用 `node` 执行对应 `js` 文件。


## build:main

`build:main` 命令对应的是 `lib/main/build-dist.js` 文件:

```js
'use strict';

const async = require('async');
const path = require('path');

const file = require('../common/file');
const util = require('../common/util');

const basePath = path.join(__dirname, '..', '..');
const distPath = path.join(basePath, 'dist');
const filename = 'lodash.js';

const baseLodash = path.join(basePath, filename);
const distLodash = path.join(distPath, filename);

/*----------------------------------------------------------------------------*/

/**
 * Creates browser builds of Lodash at the `target` path.
 *
 * @private
 * @param {string} target The output directory path.
 */
function build() {
  async.series([
    file.copy(baseLodash, distLodash),
    file.min(distLodash)
  ], util.pitch);
}

build();
```

`build-dist.js` 首先会引用辅助 `npm` 包：

```js
// 处理异步 JavaScript
const async = require('async');
// 获取模块路径
const path = require('path');

// 封装的公共 file 方法
const file = require('../common/file');
// 封装的公共 util 方法
const util = require('../common/util');

// 基本路径
const basePath = path.join(__dirname, '..', '..');
// dist 路径
const distPath = path.join(basePath, 'dist');
// 文件名
const filename = 'lodash.js';

// lodash/lodash.js
const baseLodash = path.join(basePath, filename);
// lodash/dist/lodash.js
const distLodash = path.join(distPath, filename);
```

接着会申明 `build` 函数，并调用：

```js
// baseLodash lodash/lodash.js
// distLodash lodash/dist/lodash.js
function build() {
  async.series([
    file.copy(baseLodash, distLodash),
    file.min(distLodash)
  ], util.pitch);
}

build();
```

在 `build` 函数中，调用了 [async.series](https://caolan.github.io/async/docs.html#series) 函数，该函数会串行执行函数(包括异步函数)，并且传入 `util.pitch` 回调函数。

`file.copy` 函数：

```js
// srcPath lodash/lodash.js
// destPath lodash/dist/lodash.js
function copy(srcPath, destPath) {
  return _.partial(fs.copy, srcPath, destPath);
}
```

`copy` 函数会调用 `partial` 函数进行参数的预设，`partial` 会返回一个函数，
该函数会调用 [fs.copy](https://github.com/jprichardson/node-fs-extra) 进行文件的复制，就是将 `lodash/lodash.js` 复制为 `lodash/dist/lodash.js`。

`file.min` 函数：

```js
// srcPath lodash/dist/lodash.js
const minify = require('../common/minify.js');

function min(srcPath, destPath) {
  return _.partial(minify, srcPath, destPath);
}
```

`file.min` 函数用来创建部分 `min` 函数，此时传入了 `srcPath` 也就是 `lodash/dist/lodash.js`。

`minify` 函数:

```js
function minify(srcPath, destPath, callback, options) {
  if (_.isFunction(destPath)) {
    if (_.isObject(callback)) {
      options = callback;
    }
    callback = destPath;
    destPath = undefined;
  }
  if (!destPath) {
    destPath = srcPath.replace(/(?=\.js$)/, '.min');
  }
  const output = uglify.minify(srcPath, _.defaults(options || {}, uglifyOptions));
  fs.writeFile(destPath, output.code, 'utf-8', callback);
}
```

在 `minify` 函数中，主要调用了 `uglify.minify` 对 `lodash/dist/lodash.js` 进行压缩，在 `lodash/dist` 文件夹中生成 `lodash.min.js` 文件。

`util.pitch` 函数:

```js
function pitch(error) {
  if (error != null) {
    throw error;
  }
}
```

`pitch` 函数是 `async.series` 的 `error` 回调。

总的来说 `build:main` 命令主要是用来将 `lodash/lodash.js` 拷贝到 `lodash/dist/lodash.js`，接着对 `lodash/dist/lodash.js` 进行压缩生成 `lodash.min.js`，如果就调用 `util.pitch` 函数进行抛出异常信息。

## build:fp

`build:fp` 命令对应的是 `lib/fp/build-dist.js` 文件:

```js
'use strict';

const _ = require('lodash');
const async = require('async');
const path = require('path');
const webpack = require('webpack');

const file = require('../common/file');
const util = require('../common/util');

const basePath = path.join(__dirname, '..', '..');
const distPath = path.join(basePath, 'dist');
const fpPath = path.join(basePath, 'fp');
const filename = 'lodash.fp.js';

const fpConfig = {
  'entry': path.join(fpPath, '_convertBrowser.js'),
  'output': {
    'path': distPath,
    'filename': filename,
    'library': 'fp',
    'libraryTarget': 'umd'
  },
  'plugins': [
    new webpack.optimize.OccurenceOrderPlugin,
    new webpack.optimize.DedupePlugin
  ]
};

const mappingConfig = {
  'entry': path.join(fpPath, '_mapping.js'),
  'output': {
    'path': distPath,
    'filename': 'mapping.fp.js',
    'library': 'mapping',
    'libraryTarget': 'umd'
  }
};

/*----------------------------------------------------------------------------*/

/**
 * Creates browser builds of the FP converter and mappings at the `target` path.
 *
 * @private
 * @param {string} target The output directory path.
 */
function build() {
  async.series([
    _.partial(webpack, mappingConfig),
    _.partial(webpack, fpConfig),
    file.min(path.join(distPath, filename))
  ], util.pitch);
}

build();
```

`lib/fp/build-dist.js` 与 `lib/main/build-dist.js` 基本相似，首先是引用辅助 `npm` 包：

```js
// 引用 lodash
const _ = require('lodash');
// 处理异步 JavaScript
const async = require('async');
// 获取模块路径
const path = require('path');
const webpack = require('webpack');

// 封装的公共 file 方法
const file = require('../common/file');
// 封装的公共 util 方法
const util = require('../common/util');

// 基本路径
const basePath = path.join(__dirname, '..', '..');
// dist 路径
const distPath = path.join(basePath, 'dist');
// fp 路径
const fpPath = path.join(basePath, 'fp');
// 文件名
const filename = 'lodash.fp.js';
```

接着申明 2 个 `webpack` 配置：

```js
const fpConfig = {
  'entry': path.join(fpPath, '_convertBrowser.js'),
  'output': {
    'path': distPath,
    'filename': filename,
    'library': 'fp',
    'libraryTarget': 'umd'
  },
  'plugins': [
    // Order the modules and chunks by occurrence. This saves space, because often referenced modules and chunks get smaller ids.
    new webpack.optimize.OccurenceOrderPlugin,
    // Deduplicates modules and adds runtime code.
    new webpack.optimize.DedupePlugin
  ]
};

const mappingConfig = {
  'entry': path.join(fpPath, '_mapping.js'),
  'output': {
    'path': distPath,
    'filename': 'mapping.fp.js',
    'library': 'mapping',
    'libraryTarget': 'umd'
  }
};
```

然后申明 `build` 函数，并调用：

```js
function build() {
  async.series([
    _.partial(webpack, mappingConfig),
    _.partial(webpack, fpConfig),
    file.min(path.join(distPath, filename))
  ], util.pitch);
}

build();
```

在 `build` 函数内，调用 `async.series` 函数，传入 2 个调用 `partial` 函数进行参数预设后的 `webpack` 函数，`async.series` 函数会串行执行 `webpack` 函数，接着调用 `file.min` 函数，在 `lodash/dist` 文件夹中生成 `lodash.fp.js` 文件。
