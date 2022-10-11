import { ZodiosEndpointDefinitions } from "../zodios.types";

export function findEndpoint(
  api: ZodiosEndpointDefinitions,
  method: string,
  path: string
) {
  return api.find((e) => e.method === method && e.path === path);
}
