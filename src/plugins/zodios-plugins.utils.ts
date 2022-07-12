import { ZodiosEnpointDescriptions } from "../zodios.types";

export function findEndpoint(
  api: ZodiosEnpointDescriptions,
  method: string,
  path: string
) {
  return api.find((e) => e.method === method && e.path === path);
}
