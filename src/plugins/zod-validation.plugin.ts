import { ZodiosError } from "../zodios-error";
import type { ZodiosPlugin } from "../zodios.types";
import { findEndpoint } from "./zodios-plugins.utils";

const plugin: ZodiosPlugin = {
  name: "zod-validation",
  response: async (api, config, response) => {
    const endpoint = findEndpoint(api, config.method, config.url);
    /* istanbul ignore next */
    if (!endpoint) {
      throw new Error(`No endpoint found for ${config.method} ${config.url}`);
    }
    const parsed = endpoint.response.safeParse(response.data);
    if (!parsed.success) {
      throw new ZodiosError(
        "Zodios: invalid response",
        config,
        response.data,
        parsed.error
      );
    }
    response.data = parsed.data;
    return response;
  },
};

/**
 * Zod validation plugin used internally by Zodios.
 * By default zodios always validates the response.
 * @returns zod-validation plugin
 */
export function zodValidationPlugin(): ZodiosPlugin {
  return plugin;
}
