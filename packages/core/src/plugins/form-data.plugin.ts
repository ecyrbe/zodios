import { getFormDataStream } from "./form-data.utils";
import { ZodiosError } from "../zodios-error";
import type { ZodiosPlugin } from "../zodios.types";
import { AnyZodiosFetcherProvider } from "../fetcher-providers";

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
 *     }],
 *   );
 *   const id = await apiClient.upload({ file: document.querySelector('#file').files[0] });
 * ```
 * @returns form-data plugin
 */
export function formDataPlugin<
  FetcherProvider extends AnyZodiosFetcherProvider
>(): ZodiosPlugin<FetcherProvider> {
  return {
    name: "form-data",
    request: async (_, config) => {
      if (
        !config.body ||
        typeof config.body !== "object" ||
        Array.isArray(config.body)
      ) {
        throw new ZodiosError(
          "Zodios: multipart/form-data body must be an object",
          config
        );
      }
      const result = getFormDataStream(config.body as any);
      return {
        ...config,
        body: result.data,
        headers: {
          ...config.headers,
          ...result.headers,
        },
      };
    },
  };
}
