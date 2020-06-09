import { ResourceLoader, ResourceWithType, SafeHookScope, ResourceType } from '@saasfe/we-app';

interface SandboxResourceLoaderOpts {
  [p: string]: any;
}

const resoureCache = {};

function makeResourceWithType(r: string|ResourceWithType): ResourceWithType {
  if (Array.isArray(r)) {
    return r;
  }
  if (typeof r === 'string') {
    if (r.indexOf('.js') > -1) {
      return [r, { with: { type: ResourceType.jsfile } }];
    }
    if (r.indexOf('.css') > -1) {
      return [r, { with: { type: ResourceType.cssfile } }];
    }
  }
}

const sandboxResourceLoader: ResourceLoader<SandboxResourceLoaderOpts> = {
  desc: {
    async mount(resources: ResourceWithType[], activeScope: SafeHookScope, opts: SandboxResourceLoaderOpts) {
      const { root, sandbox, getData, setData } = activeScope;
      await resources.reduce((p, r) => {
        const resource = makeResourceWithType(r);
        return p.then(() => {
          let pResource: Promise<any> = resoureCache[resource[0]];
          if (!pResource) {
            const doc = root.document;
            const resourceLoaded = getData?.('sandboxResourceLoaded') || [];
            switch (resource[1].with.type) {
              case ResourceType.jsfile:
                pResource = fetch(resource[0])
                  .then(res => res.text())
                  .then(jstext => sandbox.execScript(jstext));
                break;
              case ResourceType.jstext:
                pResource = sandbox.execScript(resource[0]) as Promise<any>;
                break;
              case ResourceType.cssfile:
                // eslint-disable-next-line
                const link = doc.createElement('link');
                link.rel = 'stylesheet';
                link.href = resource[0];
                doc.body.appendChild(link);
                pResource = Promise.resolve(link);
                resourceLoaded.push(link);
                break;
              case ResourceType.csstext:
                // eslint-disable-next-line
                const style = doc.createElement('style');
                style.textContent = resource[0];
                doc.body.appendChild(style);
                pResource = Promise.resolve(style);
                resourceLoaded.push(style);
                break;
              default:
            }
            setData?.('sandboxResourceLoaded', resourceLoaded);
          }
          resoureCache[resource[0]] = pResource;
          return pResource;
        });
      }, Promise.resolve());
    },
    async unmount(resources: ResourceWithType[], activeScope: SafeHookScope, opts: SandboxResourceLoaderOpts) {
      const { getData } = activeScope;
      const resourceLoaded = getData?.('sandboxResourceLoaded') || [];
      resourceLoaded.forEach((el: HTMLElement) => {
        el.parentNode.removeChild(el);
      });
    },
  },
  config: {},
};

export default sandboxResourceLoader;
