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

function queriesToSearchString(
  queries?: Record<string, any>
): string | undefined {
  if (queries) {
    const searchParams = new URLSearchParams();
    Object.entries(queries).forEach(([key, value]) => {
      if (Array.isArray(value)) {
        value.forEach((v) =>
          searchParams.append(`${key}[]`, JSON.stringify(v))
        );
      } else if (typeof value === "string") {
        searchParams.append(key, value);
      } else {
        // istanbul ignore next
        searchParams.append(key, JSON.stringify(value));
      }
    });
    return searchParams.toString();
  }
  return "";
}

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
  const serializedParams = queriesToSearchString(config.queries);
  if (serializedParams) {
    fullURL += fullURL.indexOf("?") === -1 ? "?" : "&";
  }
  return `${fullURL}${serializedParams}`;
}

function isDefinedSignal(
  signal: AbortSignal | undefined | null
): signal is AbortSignal {
  return Boolean(signal);
}

/**
 * combine multiple abort signals into one
 * @param signals - the signals to listen to
 * @returns - the combined signal
 */
export function combineSignals(
  ...signals: (AbortSignal | undefined | null)[]
): AbortSignal | undefined {
  const definedSignals: AbortSignal[] = signals.filter(isDefinedSignal);
  if (definedSignals.length < 2) {
    return definedSignals[0];
  }
  const controller = new AbortController();

  function onAbort() {
    controller.abort();
    definedSignals.forEach((signal) => {
      signal.removeEventListener("abort", onAbort);
    });
  }

  definedSignals.forEach((signal) => {
    if (signal.aborted) {
      onAbort();
    } else {
      signal.addEventListener("abort", onAbort);
    }
  });
  return controller.signal;
}
