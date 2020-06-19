import { SymbolIsShadowDocument } from './const';
import intercept from './element-intercept';
import { SymbolByResourceLoader } from '../utils/const';

const rawElementAppendChild = Element.prototype.appendChild;
const rawElementInsertBefore = Element.prototype.insertBefore;

Element.prototype.appendChild = function (element: Node) {
  // style(一般使用场景css in js) , link rel="stylesheet", script src/text
  // 拦截并注入到 shadowDocument.body中，
  // 记录在当前页面scope上，卸载时需要移除
  let sandbox: any;
  if (element && !element[SymbolByResourceLoader] && this.ownerDocument[SymbolIsShadowDocument]) {
    sandbox = this.ownerDocument.sandbox;
  }

  let el = element;
  // @ts-ignore
  el = intercept(element, sandbox);

  return rawElementAppendChild.call(this, el);
};

Element.prototype.insertBefore = function (element: Node, refElement: Node) {
  // style(一般使用场景css in js) , link rel="stylesheet", script src/text
  // 拦截并注入到 shadowDocument.body中，
  // 记录在当前页面scope上，卸载时需要移除
  let sandbox: any;
  if (element && !element[SymbolByResourceLoader] && this.ownerDocument[SymbolIsShadowDocument]) {
    sandbox = this.ownerDocument.sandbox;
  }

  let el = element;
  // @ts-ignore
  el = intercept(element, sandbox);

  return rawElementInsertBefore.call(this, el, refElement);
};
