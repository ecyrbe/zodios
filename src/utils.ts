import { AxiosError } from "axios";
import type { ReadonlyDeep } from "./utils.types";
import type {
  AnyZodiosRequestOptions,
  ZodiosEndpointDefinition,
  ZodiosEndpointDefinitions,
} from "./zodios.types";

/**
 * omit properties from an object
 * @param obj - the object to omit properties from
 * @param keys - the keys to omit
 * @returns the object with the omitted properties
 */
export function omit<T, K extends keyof T>(
  obj: T | undefined,
  keys: K[]
): Omit<T, K> {
  const ret = { ...obj } as T;
  for (const key of keys) {
    delete ret[key];
  }
  return ret;
}

/**
 * pick properties from an object
 * @param obj - the object to pick properties from
 * @param keys - the keys to pick
 * @returns the object with the picked properties
 */
export function pick<T, K extends keyof T>(
  obj: T | undefined,
  keys: K[]
): Pick<T, K> {
  const ret = {} as Pick<T, K>;
  if (obj) {
    for (const key of keys) {
      ret[key] = obj[key];
    }
  }
  return ret;
}

/**
 * set first letter of a string to uppercase
 * @param str - the string to capitalize
 * @returns - the string with the first letter uppercased
 */
export function capitalize<T extends string>(str: T): Capitalize<T> {
  return (str.charAt(0).toUpperCase() + str.slice(1)) as Capitalize<T>;
}

const paramsRegExp = /:([a-zA-Z_][a-zA-Z0-9_]*)/g;

export function replacePathParams(
  config: ReadonlyDeep<AnyZodiosRequestOptions>
) {
  let result: string = config.url;
  const params = config.params;
  if (params) {
    result = result.replace(paramsRegExp, (match, key) =>
      key in params ? `${params[key]}` : match
    );
  }
  return result;
}

export function findEndpoint(
  api: ZodiosEndpointDefinitions,
  method: string,
  path: string
) {
  return api.find((e) => e.method === method && e.path === path);
}

export function findEndpointByAlias(
  api: ZodiosEndpointDefinitions,
  alias: string
) {
  return api.find((e) => e.alias === alias);
}

export function findEndpointErrors(
  endpoint: ZodiosEndpointDefinition,
  err: AxiosError
) {
  const matchingErrors = endpoint.errors?.filter(
    (error) => error.status === err.response!.status
  );
  if (matchingErrors && matchingErrors.length > 0) return matchingErrors;
  return endpoint.errors?.filter((error) => error.status === "default");
}

export function findEndpointErrorsByPath(
  api: ZodiosEndpointDefinitions,
  method: string,
  path: string,
  err: AxiosError
) {
  const endpoint = findEndpoint(api, method, path);
  return endpoint &&
    err.config &&
    err.config.url &&
    endpoint.method === err.config.method &&
    pathMatchesUrl(endpoint.path, err.config.url)
    ? findEndpointErrors(endpoint, err)
    : undefined;
}

export function findEndpointErrorsByAlias(
  api: ZodiosEndpointDefinitions,
  alias: string,
  err: AxiosError
) {
  const endpoint = findEndpointByAlias(api, alias);

  return endpoint &&
    err.config &&
    err.config.url &&
    endpoint.method === err.config.method &&
    pathMatchesUrl(endpoint.path, err.config.url)
    ? findEndpointErrors(endpoint, err)
    : undefined;
}

export function pathMatchesUrl(path: string, url: string) {
  return new RegExp(`^${path.replace(paramsRegExp, () => "([^/]*)")}$`).test(
    url
  );
}
