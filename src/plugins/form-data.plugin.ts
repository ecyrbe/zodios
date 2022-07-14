import { getFormDataStream } from "../utils.node";
import { ZodiosError } from "../zodios-error";
import type { ZodiosPlugin } from "../zodios.types";

const plugin: ZodiosPlugin = {
  name: "form-data",
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

/**
 * form-data plugin used internally by Zodios.
 * @example
 * ```typescript
 *   const apiClient = new Zodios(
 *     "https://mywebsite.com",
 *     [{
 *       method: "post",
 *       path: "/upload",
 *       alias: "upload",
 *       description: "Upload a file",
 *       requestFormat: "form-data",
 *       parameters:[
 *         {
 *           name: "body",
 *           type: "Body",
 *           schema: z.object({
 *             file: z.instanceof(File),
 *           }),
 *         }
 *       ],
 *       response: z.object({
 *         id: z.number(),
 *       }),
 *     }] as const,
 *   );
 *   const id = await apiClient.upload({ file: document.querySelector('#file').files[0] });
 * ```
 * @returns form-data plugin
 */
export function formDataPlugin(): ZodiosPlugin {
  return plugin;
}
