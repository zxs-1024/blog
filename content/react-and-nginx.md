# react history mode 在 nginx 的部署

react-router官方推荐，需要服务器支持，因为是 SPA 项目，url 切换时需要服务器始终返回 `index.html`。

当前项目打包后的文件在 `/var/www/bing-collect` 文件夹下。

部署后的地址为 [https://www.zhanghao-zhoushan.cn/bing-collect/](https://www.zhanghao-zhoushan.cn/bing-collect/)

## 部署在根目录

### 设置 homepage

设置 `package.json` 的 homepage 为 `.` 。

```json
{
  "homepage": ".",
}

```

运行 `yarn build` 命令后构建的 `index.html` 关于静态资源的引用是这样的：

```html
<!DOCTYPE html>
<html lang="en">
  <head>
    <link href="./static/css/2.f55349bb.chunk.css" rel="stylesheet" />
    <link href="./static/css/main.1858b658.chunk.css" rel="stylesheet" />
  </head>

  <body>
    <script src="./static/js/2.50eabd7b.chunk.js"></script>
    <script src="./static/js/main.9f06de0b.chunk.js"></script>
  </body>
</html>
```

这里会以相对路径的形式引用静态资源。

### nginx 配置

设置访问页面时始终返回 `index.html` 。

```conf
location / {
  root /var/www/bing-collect;
  try_files $uri /index.html;
}
```

## 部署在子目录

如果需要部署在子目录，例如 `http://localhost/bing-collect` 类似的路径。

### 设置 basename

需要设置 basename 为 `/bing-collect` 。

```tsx
import * as React from 'react';
import { BrowserRouter as Router, Route } from 'react-router-dom';

const App: React.FC = () => {
  return (
    <Router basename="/bing-collect">
      <Route exact path="/" component={Container} />
    </Router>
  );
};
```

### 设置 homepage

设置 `package.json` 的 homepage 为 `/bing-collect` 。

```json
{
  "homepage": "/bing-collect",
}
```

运行 `yarn build` 命令后构建的 `index.html` 关于静态资源的引用是这样的：

```html
<!DOCTYPE html>
<html lang="en">
  <head>
    <link
      href="/bing-collect/static/css/2.f55349bb.chunk.css"
      rel="stylesheet"
    />
    <link
      href="/bing-collect/static/css/main.1858b658.chunk.css"
      rel="stylesheet"
    />
  </head>

  <body>
    <script src="/bing-collect/static/js/2.50eabd7b.chunk.js"></script>
    <script src="/bing-collect/static/js/main.9f06de0b.chunk.js"></script>
  </body>
</html>
```

这里会以绝对路径的形式引用静态资源。

### nginx 配置

访问 `bing-collect` 子目录时，重定向到 `index.html` 。

```conf
# 重定向到 index.html
location /bing-collect/ {
  root  /var/www/;
  try_files $uri $uri/ /bing-collect/index.html /var/www/bing-collect/index.html;
}
```

## nginx 的一些知识点

### 常用命令

开机自启启动关闭在启动

修改 nginx.conf 后

```bash
# 测试 nginx.conf 配置
nginx -t
# 保存重新读取配置
nginx -s reload
```

### nginx 配置

```conf
# 重定向到 index.html
location /bing-collect/ {
  root  /var/www/;
  try_files $uri $uri/ /bing-collect/index.html /var/www/bing-collect/index.html;
}

# 代理接口
location ~ /api/ {
  proxy_pass  http://127.0.0.1:9527;
}
```
