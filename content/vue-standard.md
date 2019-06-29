---
title: vue 项目规范
date: '2019-06-29'
spoiler:  关于 Vue 项目的一些规范整理
---

## Vue 项目规范整理

### 风格指南

- [Vue.js 风格指南](https://cn.vuejs.org/v2/style-guide/index.html)
- [Vant 风格指南](https://youzan.github.io/vant/#/zh-CN/style-guide)
- [Vue.js 组件编码规范](https://github.com/pablohpsilva/vuejs-component-style-guide/blob/master/README-CN.md)

### VSCode 插件

- Vetur
- vueHelper

#### settings.json

```json
{
  "editor.fontSize": 16,
  "editor.fontFamily": "DankMono, OperatorMono, Fira Code",
  "editor.fontWeight": "600",
  "workbench.colorTheme": "Atom One Dark",
  "workbench.iconTheme": "material-icon-theme",
  // Tab等于的空格数
  "editor.tabSize": 2,
  // 是否显示分号
  "prettier.semi": false,
  // 是否单引号
  "prettier.singleQuote": true,
  // 控制折行的方式
  "editor.wordWrap": "wordWrapColumn",
  // 控制编辑器的折行列
  "editor.wordWrapColumn": 500,
  // 配置语言的文件关联
  "files.associations": {
    "*.vue": "vue"
  },
  // vetur格式化方式
  "vetur.format.defaultFormatter.html": "js-beautify-html",
  "vetur.format.defaultFormatter.js": "vscode-typescript",
  // 函数参数括号前的空格
  "javascript.format.insertSpaceBeforeFunctionParenthesis": true,
  "vetur.format.defaultFormatterOptions": {
    "js-beautify-html": {
      // 对属性进行换行
      "wrap_attributes": "auto"
    },
  },
  // 配置排除的文件和文件夹
  "files.exclude": {
    "**/.git": true,
    "**/.DS_Store": true,
    "**/*.log.*": true,
    "**/dist": false,
    "**/tmp": true,
    "**/cache": true,
    "**/node_modules": false,
    "**/bower_components": true,
    "**/public": false,
    "**/.classpath": true,
    "**/.project": true,
    "**/.settings": true,
    "**/.factorypath": true
  },
  // 是否展开Emmet缩写
  "emmet.triggerExpansionOnTab": true,
  "explorer.confirmDelete": false,
  "git.enableSmartCommit": true,
  "explorer.confirmDragAndDrop": false,
  "leetcode.endpoint": "leetcode-cn",
  "leetcode.defaultLanguage": "javascript",
  "terminal.integrated.rendererType": "canvas",
  "extensions.autoUpdate": true,
  "breadcrumbs.enabled": true,
  "[jsonc]": {
    "editor.defaultFormatter": "vscode.json-language-features"
  },
  "[javascript]": {
    "editor.defaultFormatter": "vscode.typescript-language-features"
  },
}
```

### use snippets

配置 vue snippets

1. `option + cmd + p` 打开命令面板
2. 输入 snippets 选择 Configure User Snippets
3. 搜索 vue，选择 vue.json

```json
{
  "Print to console": {
    "prefix": "vue",
    "body": [
      "<template>",
      "  <div class=\"class_name\">\n",
      "  </div>",
      "</template>\n",
      "<script>",
      "import OtherComponent from '@/components/OtherComponent'\n",
      "export default {",
      "  name: 'Component',",
      "  components: {",
      "    OtherComponent",
      "  },",
      "  filters: {},",
      "  mixins: {},",
      "  props: {},",
      "  data () {",
      "    return {\n",
      "    }",
      "  },",
      "  computed: {},",
      "  watch: {},\n",
      "  created () {",
      "  },\n",
      "  mounted () {",
      "  },\n",
      "  methods: {",
      "  }",
      "}",
      "</script>\n",
      "<style lang=\"less\" scoped></style>",
      "$2"
    ],
    "description": "Log output to console"
  }
}
```
