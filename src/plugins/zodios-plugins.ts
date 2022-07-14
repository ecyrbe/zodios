import { AxiosResponse } from "axios";
import {
  AnyZodiosRequestOptions,
  Method,
  ZodiosEnpointDescriptions,
  ZodiosPlugin,
} from "../zodios.types";

export type PluginId = {
  key: string;
  value: number;
};

export class ZodiosPlugins {
  public readonly key: string;
  private plugins: Array<ZodiosPlugin | undefined> = [];

  constructor(method: Method | "any", path: string) {
    this.key = `${method}-${path}`;
  }

  /**
   * register a plugin
   * @param plugin - plugin to register
   * @returns unique id of the plugin
   */
  use(plugin: ZodiosPlugin): PluginId {
    this.plugins.push(plugin);
    return { key: this.key, value: this.plugins.length - 1 };
  }

  /**
   * unregister a plugin
   * @param plugin - plugin to unregister
   */
  eject(plugin: PluginId) {
    if (plugin.key !== this.key) {
      throw new Error(
        `Plugin with key '${plugin.key}' is not registered for endpoint '${this.key}'`
      );
    }
    this.plugins[plugin.value] = undefined;
  }

  /**
   * Intercept the request config by applying all plugins
   * before using it to send a request to the server
   * @param config - request config
   * @returns the modified config
   */
  async interceptRequest(
    api: ZodiosEnpointDescriptions,
    config: AnyZodiosRequestOptions
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
    api: ZodiosEnpointDescriptions,
    config: AnyZodiosRequestOptions,
    response: Promise<AxiosResponse>
  ) {
    let pluginResponse = response;
    for (const plugin of this.plugins.reverse()) {
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

  count() {
    return this.plugins.filter(Boolean).length;
  }
}
