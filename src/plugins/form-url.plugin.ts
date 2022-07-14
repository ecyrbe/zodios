import { getFormDataStream } from "../utils.node";
import { ZodiosError } from "../zodios-error";
import type { ZodiosPlugin } from "../zodios.types";

const plugin: ZodiosPlugin = {
  name: "form-url",
  request: async (_, config) => {
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

export function formURLPlugin(): ZodiosPlugin {
  return plugin;
}
