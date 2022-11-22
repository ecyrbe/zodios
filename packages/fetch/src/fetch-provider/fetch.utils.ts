import qs from "qs";
import { AnyZodiosRequestOptions } from "@zodios/core";
import { FetchProvider } from "./fetcher-provider.fetch";

/**
 * more resilient alternative to instanceof when the object is not native and compiled to es5
 * @param kind - string representation of the object kind
 * @returns - a function that checks if the object is of the given kind
 */
// istanbul ignore next
export const isKindOf =
  (kind: string) =>
  (data: any): boolean => {
    const pattern = `[object ${kind}]`;
    return (
      data &&
      (toString.call(data) === pattern ||
        (typeof data.toString === "function" && data.toString() === pattern))
    );
  };

// istanbul ignore next
export const isFormData = isKindOf("FormData");
// istanbul ignore next
export const isBlob = isKindOf("Blob");
// istanbul ignore next
export const isFile = isKindOf("File");
// istanbul ignore next
export const isSearchParams = isKindOf("URLSearchParams");

// istanbul ignore next
function getFullURL(config: AnyZodiosRequestOptions<FetchProvider>) {
  if (config.url?.startsWith("http") || !config.baseURL) {
    return config.url;
  }
  const baseURL = config.baseURL.replace(/\/$/, "");
  if (!config.url) {
    return baseURL;
  }
  const path = config.url.replace(/^\//, "");
  return `${baseURL}/${path}`;
}

export function buildURL(config: AnyZodiosRequestOptions<FetchProvider>) {
  let fullURL = getFullURL(config) || "/";
  const serializedParams = qs.stringify(config.queries, {
    arrayFormat: "brackets",
    encodeValuesOnly: true,
  });
  if (serializedParams) {
    fullURL += fullURL.indexOf("?") === -1 ? "?" : "&";
  }
  return `${fullURL}${serializedParams}`;
}
