import JSSandbox from '@ice/sandbox';
import UISandbox from './ui-sandbox';
import { ResourceWithType, ResourceLoader } from '@saasfe/we-app/es/resource-loader';
import sandboxResourceLoader from './resource-loader';

export interface SandboxConfig {
  resourceLoader?: any;
  container?: HTMLElement;
  activeScope?: any;
}

export default class Sandbox {
  private global: Window;

  private resourceLoader: ResourceLoader<any> = sandboxResourceLoader;

  private jssandbox: JSSandbox;

  private uisandbox: UISandbox;

  constructor(config: SandboxConfig) {
    if (config?.resourceLoader) {
      this.resourceLoader = config.resourceLoader;
    }

    this.jssandbox = new JSSandbox({ multiMode: true });
    this.jssandbox.createProxySandbox();
    this.global = this.jssandbox.getSandbox();

    this.uisandbox = new UISandbox(this, { activeScope: config?.activeScope }, config?.container);
    Object.defineProperty(this.global, 'document', { value: this.uisandbox.getShadowDocument() });
  }

  setContext(context: any) {
    Object.keys(context).forEach((k) => {
      this.global[k] = context[k];
    });
  }

  getContext() {
    return this.global;
  }

  setResourceLoader(resourceLoader: ResourceLoader<any>) {
    this.resourceLoader = resourceLoader;
  }

  getResourceLoader() {
    return this.resourceLoader;
  }

  loadResource(resources: ResourceWithType[]) {
    const { desc: resourceLoader, config } = this.resourceLoader;
    return resourceLoader.mount(resources, { root: this.global, sandbox: this }, config);
  }

  execScript(jstext: string) {
    return new Promise((resolve) => {
      this.jssandbox.execScriptInSandbox(jstext);
      resolve();
    });
  }

  destroy() {
    this.uisandbox.destroy();
    this.jssandbox.clear();
  }
}
