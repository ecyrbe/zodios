import { AxiosRequestConfig } from "axios";
import { config } from "process";
import { ZodiosPlugin } from "../../packages/core/src/index";

export interface ApiKeyPluginConfig {
  getApiKey: () => Promise<string>;
}

export function pluginApiKey(provider: ApiKeyPluginConfig): ZodiosPlugin {
  return {
    request: async (_, config) => {
      return {
        ...config,
        headers: {
          ...config.headers,
          "api-key": await provider.getApiKey(),
        },
      };
    },
  };
}
