---
order: 1
title: demo1
---

PC模板

````jsx
import Sandbox from "@alife/we-app-sandbox";
import { Button } from 'antd';

ReactDOM.render(
  <Button type="primary">Button by antd</Button>,
  mountNode,
);

const sandbox = new Sandbox(/* opts */);
// 需要配置基础环境，如需要加载的基础资源
// 指向当前导入的库
sandbox.setContext({
  React,
  ReactDOM,
  // antd,
  // AntDesignIcons,
});
// sandbox.setResourceLoader();
// sandbox.getResourceLoader();
// 加载资源
sandbox.loadResource([
  'https://gw.alipayobjects.com/os/lib/alife/cook-pc/3.27.3/dist/antd.min.css', 
  'https://gw.alipayobjects.com/os/lib/moment/2.24.0/min/moment.min.js',
  'https://gw.alipayobjects.com/os/lib/moment/2.24.0/locale/zh-cn.js',
  'https://gw.alipayobjects.com/os/lib/alife/cook-pc/3.27.3/dist/antd-with-locales.min.js',
  'https://gw.alipayobjects.com/os/lib/ant-design/icons/2.1.1/lib/umd.js',
  [
    `
    console.log('moment', moment().unix());
    const el = document.createElement('div');
    document.body.appendChild(el);
    const { Button } = window['@alife/cook-pc'];
    ReactDOM.render(React.createElement(Button, { type: 'primary' }, 'Button by cookpc'), el);
    `,
    { with: { type: 'jstext' } }
  ],
]);
// 加载执行业务代码
// sandbox.loadResource(['index.html']);
// 执行html代码
// sandbox.runHTML('<div class="container"></div>');
// 执行js代码
// sandbox.execScript('console.log(124)');
// 执行css代码
// sandbox.runCSS('.container { color: red }');
// 获取全局变量
// const global = sandbox.getContext();
// 如何与resourceLoader结合
// 如何与render结合
// render.mount(App, container, props) {
//   const { React, ReactDOM } = props.pageScope.root;
//   ReactDOM.render(React.createElement(App), container);
// }
````
