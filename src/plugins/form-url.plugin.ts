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
      data: new URLSearchParams(config.data as any).toString(),
      headers: {
        ...config.headers,
        "Content-Type": "application/x-www-form-urlencoded",
      },
    };
  },
};

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
export function formURLPlugin(): ZodiosPlugin {
  return plugin;
}
