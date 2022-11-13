import {
  AnyZodiosFetcherProvider,
  TypeOfFetcherResponse,
} from "../fetcher-providers";
import { ReadonlyDeep } from "../utils.types";
import {
  AnyZodiosRequestOptions,
  Method,
  ZodiosEndpointDefinitions,
  ZodiosPlugin,
} from "../zodios.types";

export type PluginId = {
  key: string;
  value: number;
};

/**
 * A list of plugins that can be used by the Zodios client.
 */
export class ZodiosPlugins<FetcherProvider extends AnyZodiosFetcherProvider> {
  public readonly key: string;
  private plugins: Array<ZodiosPlugin<FetcherProvider> | undefined> = [];

  /**
   * Constructor
   * @param method - http method of the endpoint where the plugins are registered
   * @param path - path of the endpoint where the plugins are registered
   */
  constructor(method: Method | "any", path: string) {
    this.key = `${method}-${path}`;
  }

  /**
   * Get the index of a plugin by name
   * @param name - name of the plugin
   * @returns the index of the plugin if found, -1 otherwise
   */
  indexOf(name: string) {
    return this.plugins.findIndex((p) => p?.name === name);
  }

  /**
   * register a plugin
   * if the plugin has a name it will be replaced if it already exists
   * @param plugin - plugin to register
   * @returns unique id of the plugin
   */
  use(plugin: ZodiosPlugin<FetcherProvider>): PluginId {
    if (plugin.name) {
      const id = this.indexOf(plugin.name);
      if (id !== -1) {
        this.plugins[id] = plugin;
        return { key: this.key, value: id };
      }
    }
    this.plugins.push(plugin);
    return { key: this.key, value: this.plugins.length - 1 };
  }

  /**
   * unregister a plugin
   * @param plugin - plugin to unregister
   */
  eject(plugin: PluginId | string) {
    if (typeof plugin === "string") {
      const id = this.indexOf(plugin);
      if (id === -1) {
        throw new Error(`Plugin with name '${plugin}' not found`);
      }
      this.plugins[id] = undefined;
    } else {
      if (plugin.key !== this.key) {
        throw new Error(
          `Plugin with key '${plugin.key}' is not registered for endpoint '${this.key}'`
        );
      }
      this.plugins[plugin.value] = undefined;
    }
  }

  /**
   * Intercept the request config by applying all plugins
   * before using it to send a request to the server
   * @param config - request config
   * @returns the modified config
   */
  async interceptRequest(
    api: ZodiosEndpointDefinitions,
    config: ReadonlyDeep<AnyZodiosRequestOptions>
  ) {
    let pluginConfig = config;
    for (const plugin of this.plugins) {
      if (plugin?.request) {
        pluginConfig = await plugin.request(api, pluginConfig);
      }
    }
    return pluginConfig;
  }

  /**
   * Intercept the response from server by applying all plugins
   * @param api - endpoint descriptions
   * @param config - request config
   * @param response - response from the server
   * @returns the modified response
   */
  async interceptResponse(
    api: ZodiosEndpointDefinitions,
    config: ReadonlyDeep<AnyZodiosRequestOptions>,
    response: Promise<TypeOfFetcherResponse<FetcherProvider>>
  ) {
    let pluginResponse = response;
    for (let index = this.plugins.length - 1; index >= 0; index--) {
      const plugin = this.plugins[index];
      if (plugin) {
        pluginResponse = pluginResponse.then(
          plugin?.response
            ? (res) => plugin.response!(api, config, res)
            : undefined,
          plugin?.error ? (err) => plugin.error!(api, config, err) : undefined
        );
      }
    }
    return pluginResponse;
  }

  /**
   * Get the number of plugins registered
   * @returns the number of plugins registered
   */
  count() {
    return this.plugins.reduce(
      (count, plugin) => (plugin ? count + 1 : count),
      0
    );
  }
}
