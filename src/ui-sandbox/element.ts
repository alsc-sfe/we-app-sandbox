import { isUrl } from '../utils';
import { nodeName, nodeNameShadowDocument } from './const';

const rawElementAppendChild = Element.prototype.appendChild;
const rawElementAppend = Element.prototype.append;
const rawElementInsertBefore = Element.prototype.insertBefore;

// 如果同时有两个沙箱在工作，大家都重写了以下方法，这会导致冲突
export function mount() {
  Element.prototype.appendChild = function (element: Node) {
    // style(一般使用场景css in js) , link rel="stylesheet", script src/text
    // 拦截并注入到 shadowDocument.body中，
    // 记录在当前页面scope上，卸载时需要移除
    if (this.ownerDocument[nodeName] === nodeNameShadowDocument) {
      const tagName = element?.nodeName?.toLowerCase?.();
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

        const { sandbox } = this.ownerDocument;
        const { desc: resourceLoader, config } = sandbox.getResourceLoader?.() || {};
        resourceLoader?.mount?.(content, { sandbox, global: sandbox.global }, config);

        const comment = document.createComment(`[we app sandbox]Replaced ${tagName} ${isUrl(content) ? `with ${content}` : 'inline'}`);
        return rawElementAppendChild.call(this, comment);
      }
    }

    return rawElementAppendChild.apply(this, element);
  };
}

export function unmount() {
  Element.prototype.appendChild = rawElementAppendChild;
  Element.prototype.append = rawElementAppend;
  Element.prototype.insertBefore = rawElementInsertBefore;
}
