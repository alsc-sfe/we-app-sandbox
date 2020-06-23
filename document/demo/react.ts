import Sandbox from '@saasfe/we-app-sandbox';
import './style.less';

let sandbox;

export function createSandbox() {
  sandbox = new Sandbox();

  // 需要配置基础环境，如需要加载的基础资源
  // 指向当前导入的库
  sandbox.setContext({
    React: window.React,
    ReactDOM: window.ReactDOM,
  });
  // sandbox.setResourceLoader();
  // sandbox.getResourceLoader();
  // 加载资源
  sandbox.loadResource([
    // 'https://gw.alipayobjects.com/os/lib/react/16.8.6/umd/react.development.js',
    // 'https://gw.alipayobjects.com/os/lib/react-dom/16.8.6/umd/react-dom.development.js',
    'https://gw.alipayobjects.com/os/lib/alife/cook-pc/3.27.3/dist/antd.min.css',
    'https://gw.alipayobjects.com/os/lib/moment/2.26.0/moment.js',
    'https://gw.alipayobjects.com/os/lib/moment/2.26.0/locale/zh-cn.js',
    'https://gw.alipayobjects.com/os/lib/alife/cook-pc/3.27.3/dist/antd-with-locales.min.js',
    'https://gw.alipayobjects.com/os/lib/ant-design/icons/2.1.1/lib/umd.js',
    [
      `
      .container {
        padding: 20px;
        background: #f5f5f5;
      }
      `,
      { with: { type: 'csstext' } }
    ],
    [
      `
      console.log('moment', moment().unix(), moment.isMoment);

      const style = document.createElement('style');
      style.textContent = 'div{color: blue}';
      document.appendChild(style);

      const container = document.createElement('div');
      container.className = 'container';
      document.body.appendChild(container);

      const el = document.createElement('h2');
      el.innerText = 'antd in Sandbox';
      container.appendChild(el);

      const { Button, Modal, DatePicker } = window['@alife/cook-pc'];

      const el1 = document.createElement('div');
      el1.setAttribute('role', 'el1');
      container.appendChild(el1);

      const { useState, useCallback } = React;
      function ModalTest() {
        const [visible, setVisible] = useState(false);

        const close = useCallback(() => {
          setVisible(false);
        }, []);

        const onClickButton = useCallback((...args) => {
          console.log('button click', args);
          alert('button clicked');
        }, []);

        const onClickShowModal = useCallback(() => {
          setVisible(true);
        }, []);

        const onClickShowModalInfo = useCallback(() => {
          Modal.info({
            title: 'This is a notification message',
            content: 'some messages...some messages...',
            onOk() {},
          });
        }, []);

        return React.createElement('div', null, [
          React.createElement(Button, { type: 'primary', onClick: onClickButton, key: 1 }, 'Button by cookpc'),
          ' ',
          React.createElement(Button, { onClick: onClickShowModal, key: 2 }, 'show Modal'),
          ' ',
          React.createElement(Button, { onClick: onClickShowModalInfo, key: 3 }, 'show Modal.info'),
          ' ',
          React.createElement(DatePicker, { key: 4 }),
          React.createElement(Modal, {
            key: 5,
            title: "Basic Modal",
            visible,
            okText: '主按钮',
            cancelText: '次按钮',
            onOk: close,
            onCancel: close
          }, 'Some contents...'),
        ]);
      }

      ReactDOM.render(React.createElement(ModalTest), el1);
      `,
      { with: { type: 'jstext' } }
    ],
  ]);

  // 执行js代码
  // sandbox.execScript('console.log(124)');

  // 获取全局变量
  // const global = sandbox.getContext();

  // 如何与resourceLoader结合
  // sandbox.getResourceLoader();

  // 如何与render结合
  // render.mount(App, container, props) {
  //   const { React, ReactDOM } = props.pageScope.root;
  //   ReactDOM.render(React.createElement(App), container);
  // }
}

export function destroySandbox() {
  sandbox?.destroy?.();
}
