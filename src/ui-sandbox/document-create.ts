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
    document.body.appendChild(rootElement);
  }

  // 开启ShadowDOM
  const shadowDocument: ShadowDocument = rootElement.attachShadow({ mode: 'open' });
  // 针对shadowBody的hack，对shadowDocument进行引用修正
  shadowDocument.createElement = (tagName: any, options?: ElementCreationOptions) => document.createElement(tagName, options);
  // @ts-ignore
  shadowDocument.createElementNS = (...args) => document.createElementNS(...args);
  shadowDocument.createTextNode = (data: string) => document.createTextNode(data);
  // 修正dom-align中ownerDocument.defaultView.getComputedStyle
  shadowDocument.defaultView = shadowDocument.ownerDocument.defaultView;
  Object.defineProperty(shadowDocument, 'ownerDocument', {
    value: null,
  });
  shadowDocument.sandbox = sandbox;
  shadowDocument[nodeName] = nodeNameShadowDocument;

  const documentElement = document.createElement('div');
  documentElement.setAttribute('role', 'shadow-body');
  Object.defineProperty(documentElement, 'ownerDocument', { value: shadowDocument });
  shadowDocument.appendChild(documentElement);
  shadowDocument.documentElement = documentElement;
  shadowDocument.body = documentElement;

  const observer = new MutationObserver((mutationList) => {
    mutationList.forEach((mutation) => {
      mutation.addedNodes.forEach((node) => {
        Object.defineProperty(node, 'ownerDocument', { value: shadowDocument });
      });
    });
  });
  observer.observe(shadowDocument, { subtree: true, childList: true });

  const documentProxy = makeDocumentProxy(shadowDocument, sandbox, opts);

  return {
    shadowDocument: documentProxy,
    container: rootElement,
  };
}
