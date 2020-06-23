import ShadowDocumentProxy from './document-proxy';
import Sandbox from '..';

export interface ShadowDocument extends ShadowRoot {
  createElement?: typeof document.createElement;
  createElementNS?: typeof document.createElementNS;
  createTextNode?: typeof document.createTextNode;
  defaultView?: Window;
  ownerDocument: null|Document;
  documentElement?: typeof document.documentElement;
  body?: typeof document.body;
  sandbox?: any;
  // @ts-ignore
  [p: string|symbol]: any;
}

export default class UISandbox {
  private rootElement: HTMLElement;

  private shadowDocumentProxy: ShadowDocumentProxy;

  constructor(sandbox: Sandbox, opts: any, container?: HTMLElement) {
    this.rootElement = this.createRootElement(container);

    this.shadowDocumentProxy = new ShadowDocumentProxy(this.rootElement, sandbox, opts);
  }

  getShadowDocument() {
    return this.shadowDocumentProxy.getShadowDocument();
  }

  destroy() {
    this.shadowDocumentProxy.destroy();

    if (this.rootElement?.parentNode) {
      this.rootElement.style.display = 'none';
      this.rootElement.parentNode.removeChild(this.rootElement);
    }

    this.rootElement = null;
  }

  private createRootElement(container?: HTMLElement) {
    let rootElement: HTMLElement = container;
    if (!rootElement) {
      rootElement = document.createElement('div');
      rootElement.setAttribute('role', 'shadow-root');
      document.body.appendChild(rootElement);
    }
    return rootElement;
  }
}
