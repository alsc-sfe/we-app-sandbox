---
order: 1
title: demo1
---

PC模板

````jsx
import Sandbox from "@alife/we-app-sandbox";

const sandbox = new Sandbox(/* opts */);

const rawGetComputedStyle = window.getComputedStyle;
window.getComputedStyle = function(el) {
  console.log('rawGetComputedStyle', el);
  return rawGetComputedStyle.apply(window, [el]);
};

// vue 中datepicker会做定位计算
// t.parentNode 会访问到 shadowRoot，也就是 shadowDocument
// 而 window.document 不是 shadowDocument，而是 documentProxy
// 需要替换 window.document 的实现方式
// function u(t) {
//   var i = t.parentNode;
//   return i ? i === e.document ? e.document.body.scrollTop || e.document.body.scrollLeft ? e.document.body : e.document.documentElement : -1 !== ["scroll", "auto"].indexOf(o(i, "overflow")) || -1 !== ["scroll", "auto"].indexOf(o(i, "overflow-x")) || -1 !== ["scroll", "auto"].indexOf(o(i, "overflow-y")) ? i : u(t.parentNode) : t
// }

// 由于使用了iconfont，而iconfont在shadowDOM中字体无法加载，但是可以继承使用全局字体
// 所以需要重复引用一下elementUI的css
const link = document.createElement('link');
link.rel = 'stylesheet';
link.href = 'https://gw.alipayobjects.com/os/lib/element-ui/2.13.2/lib/theme-chalk/index.css';
document.body.appendChild(link);

// 加载资源
sandbox.loadResource([
  'https://gw.alipayobjects.com/os/lib/vue/2.6.11/dist/vue.js',
  'https://gw.alipayobjects.com/os/lib/element-ui/2.13.2/lib/theme-chalk/index.css',
  'https://gw.alipayobjects.com/os/lib/element-ui/2.13.2/lib/index.js',
  [
    `
    const el = document.createElement('div');
    document.body.appendChild(el);

    let html = '<h2>elementUI in Sandbox</h2>';
    html += '<div id="app">';
    html += '<el-button @click="visible = true">Button</el-button>';
    html += '<el-dialog :visible.sync="visible" title="Hello world"><p>Try Element</p></el-dialog>';
    html += '<el-date-picker type="date" placeholder="选择日期"></el-date-picker>';
    html += '</div>';
    el.innerHTML = html;
    
    new Vue({
      el: '#app',
      data: function() {
        return { visible: false }
      }
    })
    `,
    { with: { type: 'jstext' } }
  ],
]);
````
