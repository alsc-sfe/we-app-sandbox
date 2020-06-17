export function isRootSelector(selector) {
  return typeof selector === 'string' &&
    ['html', 'head', 'body'].indexOf(selector.toLowerCase()) > -1;
}

// from qiankun/src/utils.ts
export function isConstructable(fn: () => void | FunctionConstructor) {
  const constructableFunctionRegex = /^function\b\s[A-Z].*/;
  const classRegex = /^class\b/;

  // 有 prototype 并且 prototype 上有定义一系列非 constructor 属性，则可以认为是一个构造函数
  return (
    (fn.prototype && fn.prototype.constructor === fn && Object.getOwnPropertyNames(fn.prototype).length > 1) ||
    constructableFunctionRegex.test(fn.toString()) ||
    classRegex.test(fn.toString())
  );
}

/**
 * in safari
 * typeof document.all === 'undefined' // true
 * typeof document.all === 'function' // true
 * We need to discriminate safari for better performance
 */
const naughtySafari = typeof document.all === 'function' && typeof document.all === 'undefined';
export const isCallable = naughtySafari
  ? (fn: any) => typeof fn === 'function' && typeof fn !== 'undefined'
  : (fn: any) => typeof fn === 'function';

export function isBoundedFunction(fn: CallableFunction) {
  /*
   indexOf is faster than startsWith
   see https://jsperf.com/string-startswith/72
   */
  // eslint-disable-next-line
  return fn.name.indexOf('bound ') === 0 && !fn.hasOwnProperty('prototype');
}

// from src/sandbox/common.ts
const boundValueSymbol = Symbol('bound value');

export function getTargetValue(target: any, value: any): any {
  /*
    仅绑定 isCallable && !isBoundedFunction && !isConstructable 的函数对象，如 window.console、window.atob 这类。目前没有完美的检测方式，这里通过 prototype 中是否还有可枚举的拓展方法的方式来判断
    @warning 这里不要随意替换成别的判断方式，因为可能触发一些 edge case（比如在 lodash.isFunction 在 iframe 上下文中可能由于调用了 top window 对象触发的安全异常）
   */
  if (isCallable(value) && !isBoundedFunction(value) && !isConstructable(value)) {
    if (value[boundValueSymbol]) {
      return value[boundValueSymbol];
    }

    const boundValue = value.bind(target);
    // some callable function has custom fields, we need to copy the enumerable props to boundValue. such as moment function.
    Object.keys(value).forEach(key => {
      boundValue[key] = value[key];
    });
    Object.defineProperty(value, boundValueSymbol, { enumerable: false, value: boundValue });
    return boundValue;
  }

  return value;
}
