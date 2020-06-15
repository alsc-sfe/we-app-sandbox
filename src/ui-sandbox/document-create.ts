import { nodeName, nodeNameShadowDocument } from './const';
import makeDocumentProxy from './document-proxy';
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

export default function createDocument(sandbox: Sandbox, opts: any, container?: HTMLElement) {
  let rootElement: HTMLElement = container;
  if (!rootElement) {
    rootElement = document.createElement('div');
    rootElement.setAttribute('role', 'shadow-root');
    document.body.appendChild(rootElement);
  }

  // 开启ShadowDOM
  const shadowDocument: ShadowDocument = rootElement.attachShadow({ mode: 'open' });
  const documentProxy = makeDocumentProxy(shadowDocument, sandbox, opts);
  // 针对shadowBody的hack，对shadowDocument进行引用修正
  shadowDocument.createElement = (tagName: any, options?: ElementCreationOptions) => {
    const node = document.createElement(tagName, options);
    // 修正react在ShadowDOM中绑定事件代理时的对象
    Object.defineProperty(node, 'ownerDocument', { value: documentProxy });
    return node;
  };
  // @ts-ignore
  shadowDocument.createElementNS = (...args) => document.createElementNS(...args);
  shadowDocument.createTextNode = (data: string) => document.createTextNode(data);
  // 修正dom-align中ownerDocument.defaultView.getComputedStyle
  shadowDocument.defaultView = shadowDocument.ownerDocument.defaultView;
  Object.defineProperty(shadowDocument, 'ownerDocument', { value: null });
  shadowDocument.sandbox = sandbox;
  shadowDocument[nodeName] = nodeNameShadowDocument;

  const shadowBody = shadowDocument.createElement('div');
  // 修正elementUI datePicker 定位问题
  Object.defineProperty(shadowBody, 'parentNode', { value: documentProxy });
  shadowBody.setAttribute('role', 'shadow-body');
  shadowDocument.appendChild(shadowBody);

  shadowDocument.documentElement = shadowBody;
  shadowDocument.body = shadowBody;

  return {
    shadowDocument: documentProxy,
    container: rootElement,
  };
}
