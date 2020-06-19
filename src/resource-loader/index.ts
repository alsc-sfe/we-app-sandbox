import { ResourceLoader, ResourceWithType, ResourceType } from '@saasfe/we-app/es/resource-loader';
import { SafeHookScope } from '@saasfe/we-app/es/hooks/type';
import { SymbolByResourceLoader } from '../utils/const';

interface SandboxResourceLoaderOpts {
  [p: string]: any;
}

const resoureCache = {};

function fetchText(url: string) {
  if (resoureCache[url]) {
    return Promise.resolve(resoureCache[url]);
  }
  const p = fetch(url).then(res => res.text());
  resoureCache[url] = p;
  return p;
}

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
          let pResource: Promise<any>;

          if (!pResource) {
            const doc = root.document;
            const resourceLoaded = getData?.('sandboxResourceLoaded') || [];

            switch (resource[1].with.type) {
              case ResourceType.jsfile:
                pResource = fetchText(resource[0])
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
                link[SymbolByResourceLoader] = true;
                doc.body.appendChild(link);
                pResource = Promise.resolve(link);
                resourceLoaded.push(link);
                break;
              case ResourceType.csstext:
                // eslint-disable-next-line
                const style = doc.createElement('style');
                style.textContent = resource[0];
                style[SymbolByResourceLoader] = true;
                doc.body.appendChild(style);
                pResource = Promise.resolve(style);
                resourceLoaded.push(style);
                break;
              default:
            }

            setData?.('sandboxResourceLoaded', resourceLoaded);
          }

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
