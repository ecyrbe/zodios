import { getFormDataStream } from "../utils.node";
import { ZodiosError } from "../zodios-error";
import type { ZodiosPlugin } from "../zodios.types";

export function formDataPlugin(): ZodiosPlugin {
  return {
    request: async (_, config) => {
      if (typeof config.data !== "object" || Array.isArray(config.data)) {
        throw new ZodiosError(
          "Zodios: multipart/form-data body must be an object",
          config
        );
      }
      const result = getFormDataStream(config.data);
      return {
        ...config,
        data: result.data,
        headers: {
          ...config.headers,
          ...result.headers,
        },
      };
    },
  };
}
