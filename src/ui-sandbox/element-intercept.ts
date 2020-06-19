import { isFunction, isUrl } from '../utils';
import Sandbox from '..';
import { ResourceWithType, ResourceType } from '@saasfe/we-app/es/resource-loader';

export default function intercept(element: HTMLElement, sandbox: Sandbox, opts: any) {
  const tagName = element?.tagName?.toLowerCase?.();

  if (sandbox && (
    ['style', 'script'].indexOf(tagName) > -1 ||
    (tagName === 'link' && (element as HTMLLinkElement).rel === 'stylesheet')
  )) {
    let content: ResourceWithType;
    switch (tagName) {
      case 'style':
        content = [(element as HTMLStyleElement).textContent, { with: { type: ResourceType.csstext } }];
        break;
      case 'link':
        content = [(element as HTMLLinkElement).href, { with: { type: ResourceType.cssfile } }];
        break;
      case 'script':
        if ((element as HTMLScriptElement).src) {
          content = [(element as HTMLScriptElement).src, { with: { type: ResourceType.jsfile } }];
        } else {
          content = [(element as HTMLScriptElement).text, { with: { type: ResourceType.jstext } }];
        }
        break;
    }

    const { desc: resourceLoader, config } = sandbox.getResourceLoader();
    resourceLoader.mount([content], { ...opts?.activeScope, root: sandbox.getContext(), sandbox }, config).then(() => {
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
