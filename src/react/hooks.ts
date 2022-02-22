import { useContext } from "react";
import { useQuery, UseQueryOptions } from "react-query";
import { ZodiosContext } from "./provider";
import { Zodios } from "../zodios";
import {
  ZodiosEnpointDescriptions,
  AnyZodiosMethodOptions,
  Paths,
  ZodiosMethodOptions,
} from "../zodios.types";
import { pick } from "../utils";

/**
 * React hook to call an api "get" endpoint.
 * It's a thin wrapper for react-query and useContext.
 * It should not be used without wrapping it in another hook @see example
 * else you will not have nice autocompletions in your IDE.
 * It should be used in combination with the ZodiosProvider
 * @param apiName - the name of the api used in Zodios Provider
 * @param path - the path to api endpoint
 * @param config - the config to setup axios options and parameters
 * @param queryOptions - the query options to setup react-query options
 * @returns the response validated with zod
 *
 * @example ```typescript
 *   type Api = ApiOf<typeof myZodiosClient>;
 *   function useJsonPlaceholder<Path extends Paths<Api, "get">>(
 *     path: Path,
 *     config?: ZodiosRequestOptions<Api, "get", Path>
 *   ) {
 *     return useZodios("https://jsonplaceholder.typicode.com", path, config);
 *   }
 * ```
 */
export function useZodios<
  URL extends string,
  Api extends ZodiosEnpointDescriptions,
  Path extends Paths<Api, "get">
>(
  baseUrl: URL,
  path: Path,
  config?: ZodiosMethodOptions<Api, "get", Path>,
  queryOptions?: Omit<UseQueryOptions, "queryKey" | "queryFn">
) {
  const zodios = useContext(ZodiosContext)[baseUrl] as Zodios<URL, Api>;
  const params = pick(config as AnyZodiosMethodOptions | undefined, [
    "params",
    "queries",
  ]);
  const keys = [baseUrl, path, params];
  const query = () => zodios.get(path, config);
  type QueryOptions =
    | Omit<
        UseQueryOptions<Awaited<ReturnType<typeof query>>>,
        "queryKey" | "queryFn"
      >
    | undefined;
  return useQuery(keys, query, queryOptions as QueryOptions);
}
