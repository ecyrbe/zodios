import { AxiosRequestConfig } from "axios";
import { Zodios, ZodiosEnpointDescriptions } from "../../src/index";

export interface ApiKeyPluginConfig {
  getApiKey: () => Promise<string>;
}

function createRequestInterceptor(provider: ApiKeyPluginConfig) {
  return async (config: AxiosRequestConfig) => {
    config.headers = {
      ...config.headers,
      "api-key": await provider.getApiKey(),
    };
    return config;
  };
}

export function pluginApiKey<
  Url extends string,
  Api extends ZodiosEnpointDescriptions
>(provider: ApiKeyPluginConfig) {
  return (zodios: Zodios<Url, Api>) => {
    zodios.axios.interceptors.request.use(createRequestInterceptor(provider));
  };
}
