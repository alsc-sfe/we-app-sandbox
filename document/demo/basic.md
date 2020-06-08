---
order: 1
title: demo1
---

PC模板

````jsx
import Sandbox from "@alife/we-app-sandbox";

const sandbox = new Sandbox(/* opts */);
// 需要配置基础环境，如需要加载的基础资源
// 指向当前导入的库
sandbox.setContext({
  React,
  ReactDOM,
  antd,
  AntDesignIcons,
});
sandbox.setResourceLoader();
sandbox.getResourceLoader();
// 加载资源
sandbox.loadResource(['antd.css', 'antd.js']);
// 加载执行业务代码
sandbox.loadResource(['index.html']);
// 执行html代码
sandbox.runHTML('<div class="container"></div>');
// 执行js代码
sandbox.runJS('console.log(124)');
// 执行css代码
sandbox.runCSS('.container { color: red }');
// 获取全局变量
const global = sandbox.getContext();
// 如何与resourceLoader结合
// 如何与render结合
render.mount(App, container, props) {
  const { global } = props;
  const { React, ReactDOM } = global;
  ReactDOM.render(React.createElement(App), container);
}
````
