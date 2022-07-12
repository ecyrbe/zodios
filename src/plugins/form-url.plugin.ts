import { getFormDataStream } from "../utils.node";
import { ZodiosError } from "../zodios-error";
import type { ZodiosPlugin } from "../zodios.types";

export function formURLPlugin(): ZodiosPlugin {
  return {
    request: async (api, config) => {
      if (typeof config.data !== "object" || Array.isArray(config.data)) {
        throw new ZodiosError(
          "Zodios: application/x-www-form-urlencoded body must be an object",
          config
        );
      }

      return {
        ...config,
        data: new URLSearchParams(config.data).toString(),
        headers: {
          ...config.headers,
          "Content-Type": "application/x-www-form-urlencoded",
        },
      };
    },
  };
}
