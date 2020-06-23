import { isRootSelector, getTargetValue } from './util';
import { ShadowDocument } from './uisandbox';
import intercept from './element-intercept';
import { SymbolIsShadowDocument } from './const';
import Sandbox from '..';

export default class ShadowDocumentProxy {
  private shadowDocument: ShadowDocument;

  private rawDocumentEventListener: { [eventName: string]: [EventListener, EventListenerOptions][] } = {};

  private documentEventListener: { [eventName: string]: [EventListener, EventListenerOptions][] } = {};

  constructor(rootElement: HTMLElement, sandbox: Sandbox, opts: any) {
    this.shadowDocument = this.createShadowDocument(rootElement, sandbox, opts);
    this.createShadowDocumentElement(this.shadowDocument);
  }

  getShadowDocument() {
    return this.shadowDocument;
  }

  destroy() {
    // 移除document上的事件监听
    Object.keys(this.rawDocumentEventListener).forEach((eventName) => {
      const listeners = this.rawDocumentEventListener[eventName];
      listeners.forEach(([listener, opts]) => {
        document.removeEventListener(eventName, listener, opts);
      });
    });

    this.rawDocumentEventListener = {};
    this.documentEventListener = {};
  }

  private createShadowDocument(rootElement: HTMLElement, sandbox: Sandbox, opts: any) {
    // 开启ShadowDOM
    const shadowRoot: ShadowDocument = rootElement.attachShadow({ mode: 'open' });

    const style = document.createElement('style');
    style.textContent = `
      :host, div[role=shadow-body] {
        all: initial;
        display: block;
      }
    `;
    shadowRoot.appendChild(style);

    const shadowDocument = this.makeDocumentProxy(shadowRoot, sandbox, opts);
    // 针对shadowBody的hack，对shadowDocument进行引用修正
    shadowDocument.createElement = (tagName: any, options?: ElementCreationOptions) => {
      const node = document.createElement(tagName, options);
      // 修正react在ShadowDOM中绑定事件代理时的对象
      Object.defineProperty(node, 'ownerDocument', { value: shadowDocument });
      return node;
    };
    // 修正dom-align中ownerDocument.defaultView.getComputedStyle
    shadowDocument.defaultView = sandbox.getContext();
    Object.defineProperty(shadowDocument, 'ownerDocument', { value: null });
    shadowDocument.sandbox = sandbox;
    shadowDocument[SymbolIsShadowDocument] = true;
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
            // 当前仅关联mousedown和mouseup，而click事件会出现多次绑定，问题待查
            if (['mousedown', 'mouseup'].indexOf(name) > -1) {
              const listener: EventListener = that.createDocumentEventListener(target, name, callback, options);
              getTargetValue(target, target[key])(name, listener, options);
              // 避免document重复绑定事件回调
              getTargetValue(document, document[key])(name, callback, options);
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

  private createDocumentEventListener(shadowDocument: ShadowDocument,
    eventName: string, callback: EventListener, opts: EventListenerOptions) {
    this.rawDocumentEventListener[eventName] = this.rawDocumentEventListener[eventName] ||
      ([] as [EventListener, EventListenerOptions][]);
    this.documentEventListener[eventName] = this.documentEventListener[eventName] ||
      ([] as [EventListener, EventListenerOptions][]);

    const rawListeners = this.rawDocumentEventListener[eventName];
    const listeners = this.documentEventListener[eventName];

    // 事件回调已存在，则返回该回调
    const index = rawListeners.findIndex(([listener, options]) => {
      // eslint-disable-next-line @typescript-eslint/no-use-before-define
      return callback === listener && compareEventListenerOptions(options, opts);
    });
    if (index > -1) {
      return listeners[index][0];
    }

    // 记录原始事件回调
    rawListeners.push([callback, opts]);

    const listener = function (evt: Event) {
      // 如果shadowDocument的回调执行了，则document的回调不再执行
      if (evt.currentTarget === shadowDocument) {
        evt.stopPropagation();
      }
      callback(evt);
    };

    // 记录修正后的事件回调
    listeners.push([listener, opts]);

    return listener;
  }
}

function lineupEventListenerOptions(opts: EventListenerOptions) {
  const o = typeof opts === 'boolean' ? { capture: opts } : opts;
  const o1 = {};
  Object.keys(o).sort().forEach((k) => {
    o1[k] = o[k];
  });
  return o;
}

function compareEventListenerOptions(opts1: EventListenerOptions = {}, opts2: EventListenerOptions = {}) {
  const o1 = lineupEventListenerOptions(opts1);
  const o2 = lineupEventListenerOptions(opts2);
  return JSON.stringify(o1) === JSON.stringify(o2);
}
