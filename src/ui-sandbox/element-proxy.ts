import { nodeName, nodeNameShadowDocument } from './const';
import intercept from './element-intercept';

const rawElementAppendChild = Element.prototype.appendChild;
const rawElementInsertBefore = Element.prototype.insertBefore;

Element.prototype.appendChild = function (element: Node) {
  // style(一般使用场景css in js) , link rel="stylesheet", script src/text
  // 拦截并注入到 shadowDocument.body中，
  // 记录在当前页面scope上，卸载时需要移除
  let sandbox: any;
  if (this.ownerDocument[nodeName] === nodeNameShadowDocument) {
    sandbox = this.ownerDocument.sandbox;
  }
  // @ts-ignore
  intercept(element, sandbox);

  return rawElementAppendChild.apply(this, element);
};

Element.prototype.insertBefore = function (element: Node, refElement: Node) {
  // style(一般使用场景css in js) , link rel="stylesheet", script src/text
  // 拦截并注入到 shadowDocument.body中，
  // 记录在当前页面scope上，卸载时需要移除
  let sandbox: any;
  if (this.ownerDocument[nodeName] === nodeNameShadowDocument) {
    sandbox = this.ownerDocument.sandbox;
  }
  // @ts-ignore
  intercept(element, sandbox);

  return rawElementInsertBefore.call(this, element, refElement);
};
