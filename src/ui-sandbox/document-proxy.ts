export default function proxy(shadowDocument: ShadowRoot) {
  return new Proxy(shadowDocument, {
    get(target, key) {
      if (!target[key]) {
        if (typeof document[key] === 'function') {
          // 拦截 createElement
          if (key === 'createElement') {
            return function (selector) {
              const el = document.createElement(selector);
              // 修正react在ShadowDOM中绑定事件代理时的对象
              Object.defineProperty(el, 'ownerDocument', { value: shadowDocument });

              return el;
            };
          }

          return document[key].bind(document);
        }

        return document[key];
      }

      return target[key];
    },
  });
}
