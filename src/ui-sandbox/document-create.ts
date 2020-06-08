export interface ShadowDocument extends ShadowRoot {
  createElement?: typeof document.createElement;
  createElementNS?: typeof document.createElementNS;
  createTextNode?: typeof document.createTextNode;
  defaultView?: Window;
  ownerDocument: null|Document;
  [p: string]: any;
}

export default function createDocument(container?: HTMLElement) {
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
  shadowDocument.ownerDocument = null;
  shadowDocument.documentElement = shadowDocument;
  shadowDocument.body = shadowDocument;

  return shadowDocument;
}
