import type { ZodiosPlugin } from "../zodios.types";

export function headerPlugin(key: string, value: string): ZodiosPlugin {
  return {
    request: async (_, config) => {
      return {
        ...config,
        headers: {
          ...config.headers,
          [key]: value,
        },
      };
    },
  };
}
