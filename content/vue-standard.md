---
title: vue 项目规范
date: '2019-06-29'
spoiler:  关于 Vue 项目的一些规范整理
---

## Vue 项目规范整理

### 风格指南

[Vue.js 风格指南](https://cn.vuejs.org/v2/style-guide/index.html)
[Vant 风格指南](https://youzan.github.io/vant/#/zh-CN/style-guide)
[Vue.js 组件编码规范](https://github.com/pablohpsilva/vuejs-component-style-guide/blob/master/README-CN.md)

### VSCode 插件

- Vetur
- vueHelper

#### setting.json

```json
{
  "editor.tabSize": 2,
  "editor.wordWrap": "off",
  "files.associations": {
    "*.vue": "vue"
  },
  "files.exclude": {
    "**/.git": true,
    "**/.DS_Store": true,
    "**/*.log.*": true,
    "**/dist": true,
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
  "vetur.format.defaultFormatter.html": "js-beautify-html",
  "vetur.format.defaultFormatter.js": "vscode-typescript",
  "javascript.format.insertSpaceBeforeFunctionParenthesis": true,
  "vetur.format.defaultFormatterOptions": {
    "js-beautify-html": {
      "wrap_attributes": "auto"
    },
    "prettier": {
      "stylelintIntegration": true,
      "eslintIntegration": true,
      "semi": false,
      "singleQuote": true,
      "tabWidth": 2
    }
  }
}
```

### use snippets

配置 vue snippets

option + cmd + p => snippets

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
