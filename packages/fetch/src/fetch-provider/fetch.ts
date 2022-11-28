import { AnyZodiosRequestOptions } from "@zodios/core";
import { FetchProviderResponse, FetchProviderConfig } from "./fetch.types";
import {
  buildURL,
  combineSignals,
  isBlob,
  isFile,
  isFormData,
} from "./fetch.utils";
import { FetchProvider } from "./fetcher-provider.fetch";

export class FetchError<Data> extends Error {
  /**
   * constructore with same signature as AxiosError
   */
  constructor(
    message?: string,
    public code?: string,
    public config?: FetchProviderConfig,
    public request?: Request,
    public response?: FetchProviderResponse<Data>
  ) {
    super(message);
  }
}

/**
 * fetch provider
 * @param config - fetch config
 * @returns
 */
export const advancedFetch = async <Data = unknown>(
  config: AnyZodiosRequestOptions<FetchProvider>
) => {
  const request = createFetchRequest(config);
  const response = (await fetchRequest(
    request,
    config as FetchProviderConfig
  )) as FetchProviderResponse<Data>;
  response.data = await getResponseData(
    response,
    config as FetchProviderConfig
  );
  if (
    (config.validateStatus && !config.validateStatus(response.status)) ||
    !response.ok
  ) {
    throw new FetchError(
      response.statusText,
      `${response.status}`,
      config as FetchProviderConfig,
      request,
      response
    );
  }
  return response;
};

// istanbul ignore next
function getAbortTimeout(ms: number): AbortSignal {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), ms);
  controller.signal.addEventListener("abort", () => {
    clearTimeout(id);
  });
  return controller.signal;
}

function createFetchRequest(config: AnyZodiosRequestOptions<FetchProvider>) {
  const headers = new Headers(config.headers);
  if (isFormData(config.body) || isBlob(config.body) || isFile(config.body)) {
    // istanbul ignore next
    if (headers.has("Content-Type")) {
      headers.delete("Content-Type");
    }
  } else if (typeof config.body === "object") {
    headers.set("Content-Type", "application/json");
    headers.set("Accept", "application/json");
    config.body = JSON.stringify(config.body);
  }

  // istanbul ignore next
  if (config.auth) {
    const username = config.auth.username || "";
    const password = config.auth.password
      ? decodeURI(encodeURIComponent(config.auth.password))
      : "";
    headers.set("Authorization", `Basic ${btoa(username + ":" + password)}`);
  }

  // istanbul ignore next
  if (config.timeout) {
    if (!globalThis.AbortController) {
      console.warn("Timeout is not supported in this environment");
    } else if (globalThis.AbortSignal && "timeout" in globalThis.AbortSignal) {
      config.signal = combineSignals(
        config.signal,
        AbortSignal.timeout(config.timeout)
      );
    } else {
      config.signal = combineSignals(
        config.signal,
        getAbortTimeout(config.timeout)
      );
    }
  }

  const url = buildURL(config);
  return new Request(url, {
    ...(config as FetchProviderConfig),
    method: config.method.toUpperCase(),
    headers,
  });
}

// istanbul ignore next
function isErrorLike(error: unknown): error is Error {
  return (
    error instanceof Error ||
    (!!error && typeof error === "object" && "message" in error)
  );
}

async function fetchRequest(request: Request, config: FetchProviderConfig) {
  try {
    return await fetch(request);
  } catch (error) {
    // istanbul ignore next
    if (isErrorLike(error)) {
      throw new FetchError(error.message, "ERR_NETWORK", config, request);
    } else {
      throw new FetchError("Network Error", "ERR_NETWORK", config, request);
    }
  }
}

// istanbul ignore next
async function getResponseData(
  response: Response,
  config: FetchProviderConfig
) {
  switch (config.responseType) {
    case "arraybuffer":
      return response.arrayBuffer();
    case "blob":
      return response.blob();
    case "stream":
      return response.body;
    case "text":
      return response.text();
    case "json":
      return response.json();
    default: {
      if (response.headers.get("content-type")?.includes("application/json")) {
        return response.json();
      }
      return response.text();
    }
  }
}
