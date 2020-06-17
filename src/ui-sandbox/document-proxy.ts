import { isRootSelector, getTargetValue } from './util';
import { ShadowDocument } from './document-create';
import intercept from './element-intercept';
import Sandbox from '..';

export default function makeDocumentProxy(shadowDocument: ShadowDocument, sandbox: Sandbox, opts: any) {
  return new Proxy(shadowDocument, {
    get(target, key) {
      if (!target[key]) {
        if (typeof document[key] === 'function') {
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

          if (key === 'addEventListener') {
            console.log('document.addEventListener');
          }

          // 避免存在静态属性的方法在经过bind之后丢失静态属性
          return getTargetValue(document, document[key]);
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
