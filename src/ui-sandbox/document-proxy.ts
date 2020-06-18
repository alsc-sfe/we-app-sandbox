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

      if (key === 'addEventListener') {
        // 在document上绑定事件监听，需要做两级监听
        // 因为如elementui的datepicker，默认会绑定到shadowDocument上
        // 在document除shadowDocument的其他区域点击，会导致datepicker无法关闭
        return function (name: string, callback: EventListener, options: EventListenerOptions) {
          // 针对elementUI修正事件
          // https://github.com/ElemeFE/element/blob/dc8bdc021e/src/utils/clickoutside.js#L10
          if (['mousedown', 'mouseup'].indexOf(name) > -1) {
            const listener: EventListener = function (evt: Event) {
              // 如果shadowDocument的回调执行了，则document的回调不再执行
              evt.stopPropagation();
              callback(evt);
            };
            getTargetValue(target, target[key])(name, listener, options);
            // Todo: 沙箱销毁时需要移除监听
            getTargetValue(document, document[key])(name, listener, options);
            return;
          }
          getTargetValue(target, target[key])(name, callback, options);
        };
      }

      if (!target[key]) {
        return getTargetValue(document, document[key]);
      }

      return getTargetValue(target, target[key]);
    },
  });
}
