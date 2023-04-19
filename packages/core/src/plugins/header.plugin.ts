import { AnyZodiosFetcherProvider } from "../fetcher-providers";
import type { ZodiosPlugin } from "../zodios.types";

export function headerPlugin<FetcherProvider extends AnyZodiosFetcherProvider>(
  key: string,
  value: string
): ZodiosPlugin<FetcherProvider> {
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
