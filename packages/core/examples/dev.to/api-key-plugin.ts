import { ZodiosPlugin } from "../../src/index";

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
