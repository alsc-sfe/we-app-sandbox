import { isFunction, isUrl } from '../utils';

export default function intercept(element: HTMLElement, sandbox: any) {
  const tagName = element.tagName.toLowerCase();

  if (sandbox && (
    ['style', 'script'].indexOf(tagName) > -1 ||
    (tagName === 'link' && (element as HTMLLinkElement).rel === 'stylesheet')
  )) {
    let content: [string, { with: { type: string } }];
    switch (tagName) {
      case 'style':
        content = [(element as HTMLStyleElement).textContent, { with: { type: 'csstext' } }];
        break;
      case 'link':
        content = [(element as HTMLLinkElement).href, { with: { type: 'cssfile' } }];
        break;
      case 'script':
        if ((element as HTMLScriptElement).src) {
          content = [(element as HTMLScriptElement).src, { with: { type: 'jsfile' } }];
        } else {
          content = [(element as HTMLScriptElement).text, { with: { type: 'jstext' } }];
        }
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

    const comment = document.createComment(`[we app sandbox]Replaced ${tagName} ${isUrl(content[0]) ? `with ${content}` : 'inline'}`);
    return comment;
  }

  return element;
}
