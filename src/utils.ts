import { AxiosError } from "axios";
import { ReadonlyDeep } from "./utils.types";
import {
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

export function findEndpointError(
  endpoint: ZodiosEndpointDefinition,
  err: AxiosError
) {
  return (
    endpoint.errors?.find((error) => error.status === err.response!.status) ??
    endpoint.errors?.find((error) => error.status === "default")
  );
}

export function findEndpointErrorByPath(
  api: ZodiosEndpointDefinitions,
  method: string,
  path: string,
  err: AxiosError
) {
  const endpoint = findEndpoint(api, method, path);
  return endpoint ? findEndpointError(endpoint, err) : undefined;
}

export function findEndpointErrorByAlias(
  api: ZodiosEndpointDefinitions,
  alias: string,
  err: AxiosError
) {
  const endpoint = findEndpointByAlias(api, alias);
  return endpoint ? findEndpointError(endpoint, err) : undefined;
}
