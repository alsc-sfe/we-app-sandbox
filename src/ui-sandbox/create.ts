interface RootDocument extends ShadowRoot {
  createElement?: typeof document.createElement;
  createElementNS?: typeof document.createElementNS;
  createTextNode?: typeof document.createTextNode;
  defaultView?: Window;
  [p: string]: any;
}

export default function create(container?: HTMLElement) {
  let rootElement: HTMLElement = container;
  if (!rootElement) {
    rootElement = document.createElement('div');
    document.body.appendChild(rootElement);
  }

  // 开启ShadowDOM
  const shadowDocument: RootDocument = rootElement.attachShadow({ mode: 'open' });
  // 针对shadowBody的hack，对shadowDocument进行引用修正
  shadowDocument.createElement = (tagName: any, options?: ElementCreationOptions) => document.createElement(tagName, options);
  // @ts-ignore
  shadowDocument.createElementNS = (...args) => document.createElementNS(...args);
  shadowDocument.createTextNode = (data: string) => document.createTextNode(data);
  // 修正dom-align中ownerDocument.defaultView.getComputedStyle
  shadowDocument.defaultView = shadowDocument.ownerDocument.defaultView;

  const shadowBody = document.createElement('div');
  // 修正react在ShadowDOM中绑定事件代理时的对象
  Object.defineProperty(shadowBody, 'ownerDocument', { value: shadowDocument });
  shadowDocument.appendChild(shadowBody);

  shadowDocument.body = shadowBody;

  return shadowDocument;
}
