import type {
  ZodiosEndpointDefinition,
  ZodiosEndpointError,
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

export function findEndpoint(
  api: ZodiosEndpointDefinition[] | readonly ZodiosEndpointDefinition[],
  method: string,
  path: string
) {
  return api.find((e) => e.method === method && e.path === path);
}

export function findEndpointByAlias(
  api: ZodiosEndpointDefinition[] | readonly ZodiosEndpointDefinition[],
  alias: string
) {
  return api.find((e) => e.alias === alias);
}

export function findEndpointErrors(
  endpoint: ZodiosEndpointDefinition,
  err: any
) {
  const matchingErrors = endpoint.errors?.filter(
    (error) => error.status === err.response!.status
  );
  if (matchingErrors && matchingErrors.length > 0) return matchingErrors;
  return endpoint.errors?.filter((error) => error.status === "default");
}

export function findEndpointErrorsByPath(
  api: ZodiosEndpointDefinition[] | readonly ZodiosEndpointDefinition[],
  method: string,
  path: string,
  err: any
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
  api: ZodiosEndpointDefinition[] | readonly ZodiosEndpointDefinition[],
  alias: string,
  err: any
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
