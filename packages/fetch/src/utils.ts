import type { ReadonlyDeep } from "@zodios/core/lib/utils.types";

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
