import { isRootSelector } from './util';
import { ShadowDocument } from './document-create';
import intercept from './element-intercept';
import Sandbox from '..';

export default function makeDocumentProxy(shadowDocument: ShadowDocument, sandbox: Sandbox, opts: any) {
  return new Proxy(shadowDocument, {
    get(target, key) {
      if (!target[key]) {
        if (typeof document[key] === 'function') {
          // 拦截 createElement，修正ownerDocument指向
          if (key === 'createElement') {
            return function (selector) {
              const el = document.createElement(selector);
              // 修正react在ShadowDOM中绑定事件代理时的对象
              Object.defineProperty(el, 'ownerDocument', { value: shadowDocument });

              return el;
            };
          }

          // 拦截元素查询方法，保证html、head、body能够正确返回
          if (key === 'querySelector') {
            return function (selector) {
              if (isRootSelector(selector)) {
                return target.body;
              }
              return target[key].call(target, selector);
            };
          }
          if (['querySelectorAll', 'getElementsByTagName'].indexOf(key as string) > -1) {
            return function (selector) {
              if (isRootSelector(selector)) {
                return [target.body];
              }
              return target[key].call(target, selector);
            };
          }

          // 拦截元素注入方法，拦截script，并在沙箱中运行
          // link[stylesheet]、style无需拦截，因为html、head、body已经被修正
          if (key === 'appendChild') {
            return function (element: HTMLElement) {
              const el = intercept(element, sandbox, opts);
              return target[key].call(target, el);
            };
          }

          return document[key].bind(document);
        }

        return document[key];
      }

      if (typeof target[key] === 'function') {
        return target[key].bind(target);
      }
      return target[key];
    },
  });
}
