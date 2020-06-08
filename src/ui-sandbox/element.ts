import { isUrl } from '../utils';

const rawElementQuerySelector = Element.prototype.querySelector;
const rawElementQuerySelectorAll = Element.prototype.querySelectorAll;
const rawElementGetElementsByTagName = Element.prototype.getElementsByTagName;
const rawElementAppendChild = Element.prototype.appendChild;
const rawElementAppend = Element.prototype.append;
const rawElementInsertBefore = Element.prototype.insertBefore;

function isRootSelector(selector) {
  return typeof selector === 'string' &&
    ['html', 'head', 'body'].indexOf(selector.toLowerCase()) > -1;
}

// 如果同时有两个沙箱在工作，大家都重写了一下方法
export function mount(scope) {
  const { global, getResourceLoader } = scope;

  Element.prototype.querySelector = function (selector) {
    if (isRootSelector(selector)) {
      return global.document.body;
    }
    return rawElementQuerySelector.call(this, selector);
  };

  Element.prototype.querySelectorAll = function (selector) {
    if (isRootSelector(selector)) {
      return [global.document.body];
    }
    return rawElementQuerySelectorAll.call(this, selector);
  };

  Element.prototype.getElementsByTagName = function (selector) {
    if (isRootSelector(selector)) {
      return [global.document.body];
    }
    return rawElementGetElementsByTagName.call(this, selector);
  };

  Element.prototype.appendChild = function (child: Node) {
    // style(一般使用场景css in js) , link rel="stylesheet", script src/text
    // 拦截并注入到 shadowDocument.body中，
    // 记录在当前页面scope上，卸载时需要移除
    const tagName = child?.tagName?.toLowerCase?.();
    if (['style', 'script'].indexOf(tagName) > -1 || (tagName === 'link' && child.rel === 'stylesheet')) {
      let content: string;
      switch (tagName) {
        case 'style':
          content = (child as HTMLStyleElement).textContent;
          break;
        case 'link':
          content = (child as HTMLLinkElement).href;
          break;
        case 'script':
          content = (child as HTMLScriptElement).src || (child as HTMLScriptElement).text;
          break;
      }

      const { desc: resourceLoader, config } = getResourceLoader?.() || {};
      resourceLoader?.mount?.(content, scope, config);

      const comment = document.createComment(`[we app sandbox]Replaced ${tagName} ${isUrl(content) ? `with ${content}` : 'inline'}`);
      return rawElementAppendChild.call(this, comment);
    }

    return rawElementAppendChild.apply(this, child);
  };
}

export function unmount() {
  Element.prototype.querySelector = rawElementQuerySelector;
}
