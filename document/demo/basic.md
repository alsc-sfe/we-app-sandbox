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
    console.log(moment().unix());
    const el = document.createElement('div');
    el.innerHTML = '<div data-show="true" class="ant-alert ant-alert-warning ant-alert-banner"><i aria-label="icon: exclamation-circle" class="anticon anticon-exclamation-circle ant-alert-icon"><svg viewBox="64 64 896 896" focusable="false" class="" data-icon="exclamation-circle" width="1em" height="1em" fill="currentColor" aria-hidden="true"><path d="M512 64C264.6 64 64 264.6 64 512s200.6 448 448 448 448-200.6 448-448S759.4 64 512 64zm-32 232c0-4.4 3.6-8 8-8h48c4.4 0 8 3.6 8 8v272c0 4.4-3.6 8-8 8h-48c-4.4 0-8-3.6-8-8V296zm32 440a48.01 48.01 0 0 1 0-96 48.01 48.01 0 0 1 0 96z"></path></svg></i><span class="ant-alert-message"><div class="alert-message-right alert-message"><span>一些文本</span><span class=""><a class="alert-ok-text"></a></span></div></span><span class="ant-alert-description"></span></div>';
    document.body.appendChild(el);
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
