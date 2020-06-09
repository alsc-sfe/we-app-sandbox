import { isRootSelector } from './util';
import { ShadowDocument } from './document-create';
import { isUrl, isFunction } from '../utils';

export default function makeDocumentProxy(shadowDocument: ShadowDocument, sandbox: any) {
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
            return function (element: Element) {
              const tagName = element.tagName.toLowerCase();

              if (['style', 'script'].indexOf(tagName) > -1 ||
                (tagName === 'link' && (element as HTMLLinkElement).rel === 'stylesheet')) {
                let content: string;
                switch (tagName) {
                  case 'style':
                    content = (element as HTMLStyleElement).textContent;
                    break;
                  case 'link':
                    content = (element as HTMLLinkElement).href;
                    break;
                  case 'script':
                    content = (element as HTMLScriptElement).src || (element as HTMLScriptElement).text;
                    break;
                }

                const { desc: resourceLoader, config } = sandbox.getResourceLoader();
                resourceLoader.mount(content, { global: sandbox.global, sandbox }, config).then(() => {
                  const loadEvent = new CustomEvent('load');
                  if (isFunction(element.onload)) {
                    element.onload(loadEvent);
                  } else {
                    element.dispatchEvent(loadEvent);
                  }
                }, () => {
                  const errorEvent = new CustomEvent('error');
                  if (isFunction(element.onerror)) {
                    element.onerror(errorEvent);
                  } else {
                    element.dispatchEvent(errorEvent);
                  }
                });

                const comment = document.createComment(`[we app sandbox]Replaced ${tagName} ${isUrl(content) ? `with ${content}` : 'inline'}`);
                return target[key].call(target, comment);
              }

              return target[key].call(target, element);
            };
          }

          return document[key].bind(document);
        }

        return document[key];
      }

      return target[key];
    },
  });
}
