import { isRootSelector, getTargetValue } from './util';
import { ShadowDocument } from './uisandbox';
import intercept from './element-intercept';
import { nodeName, nodeNameShadowDocument } from './const';
import Sandbox from '..';

export default class ShadowDocumentProxy {
  private shadowDocument: ShadowDocument;

  private documentEventListener: { [eventName: string]: EventListener[] } = {};

  private documentEventListenerOpts: { [eventName: string]: EventListenerOptions[]} = {};

  constructor(rootElement: HTMLElement, sandbox: Sandbox, opts: any) {
    this.shadowDocument = this.createShadowDocument(rootElement, sandbox, opts);
    this.createShadowDocumentElement(this.shadowDocument);
  }

  getShadowDocument() {
    return this.shadowDocument;
  }

  destroy() {
    // 移除document上的事件监听
    Object.keys(this.documentEventListener).forEach((eventName) => {
      const listeners = this.documentEventListener[eventName];
      const listenersOpts = this.documentEventListenerOpts[eventName];
      listeners.forEach((listener, index) => {
        const opts = listenersOpts[index];
        document.removeEventListener(eventName, listener, opts);
      });
    });
  }

  private createShadowDocument(rootElement: HTMLElement, sandbox: Sandbox, opts: any) {
    // 开启ShadowDOM
    const shadowRoot: ShadowDocument = rootElement.attachShadow({ mode: 'open' });
    const shadowDocument = this.makeDocumentProxy(shadowRoot, sandbox, opts);
    // 针对shadowBody的hack，对shadowDocument进行引用修正
    shadowDocument.createElement = (tagName: any, options?: ElementCreationOptions) => {
      const node = document.createElement(tagName, options);
      // 修正react在ShadowDOM中绑定事件代理时的对象
      Object.defineProperty(node, 'ownerDocument', { value: shadowDocument });
      return node;
    };
    // 修正dom-align中ownerDocument.defaultView.getComputedStyle
    shadowDocument.defaultView = shadowDocument.ownerDocument.defaultView;
    Object.defineProperty(shadowDocument, 'ownerDocument', { value: null });
    shadowDocument.sandbox = sandbox;
    shadowDocument[nodeName] = nodeNameShadowDocument;
    return shadowDocument;
  }

  private createShadowDocumentElement(shadowDocument: ShadowDocument) {
    const shadowBody = shadowDocument.createElement('div');
    // 修正elementUI datePicker 定位问题
    Object.defineProperty(shadowBody, 'parentNode', { value: shadowDocument });
    shadowBody.setAttribute('role', 'shadow-body');
    shadowDocument.appendChild(shadowBody);

    shadowDocument.documentElement = shadowBody;
    shadowDocument.body = shadowBody;

    return shadowDocument;
  }

  private makeDocumentProxy(shadowDocument: ShadowDocument, sandbox: Sandbox, opts: any) {
    // eslint-disable-next-line
    const that = this;

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
              that.captureDocumentEvent(name, listener, options);
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

  private captureDocumentEvent(eventName: string, listener: EventListener, opts: EventListenerOptions) {
    this.documentEventListener[eventName] = this.documentEventListener[eventName] ||
      ([] as EventListener[]);
    this.documentEventListenerOpts[eventName] = this.documentEventListenerOpts[eventName] ||
      ([] as EventListenerOptions[]);
    const listeners = this.documentEventListener[eventName];
    const listenersOpts = this.documentEventListenerOpts[eventName];
    if (listeners.indexOf(listener) > -1) {
      return;
    }
    listeners.push(listener);
    listenersOpts.push(opts);
  }
}
