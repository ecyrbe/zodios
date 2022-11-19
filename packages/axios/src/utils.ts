import type { ReadonlyDeep } from "@zodios/core/lib/utils.types";

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

const paramsRegExp = /:([a-zA-Z_][a-zA-Z0-9_]*)/g;

export function replacePathParams(
  config: ReadonlyDeep<{ url: string; params?: Record<string, any> }>
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
