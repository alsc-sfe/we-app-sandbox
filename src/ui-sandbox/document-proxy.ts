import { isRootSelector, getTargetValue } from './util';
import { ShadowDocument } from './document-create';
import intercept from './element-intercept';
import Sandbox from '..';

export default function makeDocumentProxy(shadowDocument: ShadowDocument, sandbox: Sandbox, opts: any) {
  return new Proxy(shadowDocument, {
    get(target, key) {
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

      if (!target[key]) {
        return getTargetValue(document, document[key]);
      }

      return getTargetValue(target, target[key]);
    },
  });
}
