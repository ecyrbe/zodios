import { AnyZodiosFetcherProvider } from "../fetcher-providers";
import { ZodiosError } from "../zodios-error";
import type { ZodiosPlugin } from "../zodios.types";

/**
 * form-url plugin used internally by Zodios.
 * @example
 * ```typescript
 *   const apiClient = new Zodios(
 *     "https://mywebsite.com",
 *     [{
 *       method: "post",
 *       path: "/login",
 *       alias: "login",
 *       description: "Submit a form",
 *       requestFormat: "form-url",
 *       parameters:[
 *         {
 *           name: "body",
 *           type: "Body",
 *           schema: z.object({
 *             userName: z.string(),
 *             password: z.string(),
 *           }),
 *         }
 *       ],
 *       response: z.object({
 *         id: z.number(),
 *       }),
 *     }],
 *   );
 *   const id = await apiClient.login({ userName: "user", password: "password" });
 * ```
 * @returns form-url plugin
 */
export function formURLPlugin<
  FetcherProvider extends AnyZodiosFetcherProvider
>(): ZodiosPlugin<FetcherProvider> {
  return {
    name: "form-url",
    request: async (_, config) => {
      if (typeof config.body !== "object" || Array.isArray(config.body)) {
        throw new ZodiosError(
          "Zodios: application/x-www-form-urlencoded body must be an object",
          config
        );
      }

      return {
        ...config,
        body: new URLSearchParams(config.body).toString(),
        headers: {
          ...config.headers,
          "Content-Type": "application/x-www-form-urlencoded",
        },
      };
    },
  };
}
