import { ZodiosEnpointDescriptions } from "./zodios.types";

/**
 * Helper to split your api definitions into multiple files
 * By just providing autocompletions for the endpoint descriptions
 * @param api - api definitions
 * @returns the api definitions
 */
export function asApi<T extends ZodiosEnpointDescriptions>(api: T): T {
  return api;
}
