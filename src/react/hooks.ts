import { useContext } from "react";
import { useQuery, UseQueryOptions } from "react-query";
import { ZodiosContext } from "./provider";
import { Zodios, ZodiosEnpointDescriptions } from "../index";
import { Paths, ZodiosRequestOptions } from "../zodios.types";

/**
 * React hook to call an api "get" endpoint.
 * It's a thin wrapper for react-query and useContext.
 * It should not be used without wrapping it in another hook @see example
 * else you will not have nice autocompletions in your IDE.
 * It should be used in combination with the ZodiosProvider
 * @param apiName - the name of the api used in Zodios Provider
 * @param url - the url to call
 * @param config - the config to setup axios options and parameters
 * @param queryOptions - the query options to setup react-query options
 * @returns the response validated with zod
 *
 * @example ```typescript
 *   function useJsonPlaceholder<Path extends Paths<Api, "get">>(
 *     url: Path,
 *     config?: ZodiosRequestOptions<Api, "get", Path>
 *   ) {
 *     return useZodios("https://jsonplaceholder.typicode.com", url, config);
 *   }
 * ```
 */
export function useZodios<
  URL extends string,
  Api extends ZodiosEnpointDescriptions,
  Path extends Paths<Api, "get">
>(
  baseUrl: URL,
  url: Path,
  config?: ZodiosRequestOptions<Api, "get", Path>,
  queryOptions?: Omit<UseQueryOptions, "queryKey" | "queryFn">
) {
  const zodios = useContext(ZodiosContext)[baseUrl] as Zodios<URL, Api>;
  const query = () => zodios.get(url, config);
  return useQuery(
    [baseUrl, url, config],
    query,
    queryOptions as Omit<
      UseQueryOptions<Awaited<ReturnType<typeof query>>>,
      "queryKey" | "queryFn"
    >
  );
}
