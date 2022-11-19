import { AnyZodiosRequestOptions } from "../../zodios.types";
import { FetchProviderResponse, FetchProviderConfig } from "./fetch.types";
import { buildURL, isBlob, isFile, isFormData } from "./fetch.utils";
import { FetchProvider } from "./fetcher-provider.fetch";

export class FetchError extends Error {
  /**
   * constructore with same signature as AxiosError
   */
  constructor(
    message?: string,
    public code?: string,
    public config?: FetchProviderConfig,
    public request?: Request,
    public response?: FetchProviderResponse
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
    config
  )) as FetchProviderResponse<Data>;
  response.data = await getResponseData(response, config);
  if (
    (config.validateStatus && !config.validateStatus(response.status)) ||
    !response.ok
  ) {
    throw new FetchError(
      response.statusText,
      `${response.status}`,
      config,
      request,
      response
    );
  }
  return response;
};

function createFetchRequest(config: AnyZodiosRequestOptions<FetchProvider>) {
  const headers = new Headers(config.headers);
  if (isFormData(config.body) || isBlob(config.body) || isFile(config.body)) {
    if (headers.has("Content-Type")) {
      headers.delete("Content-Type");
    }
  } else if (typeof config.body === "object") {
    headers.set("Content-Type", "application/json");
    headers.set("Accept", "application/json");
    config.body = JSON.stringify(config.body);
  }

  if (config.auth) {
    const username = config.auth.username || "";
    const password = config.auth.password
      ? decodeURI(encodeURIComponent(config.auth.password))
      : "";
    headers.set("Authorization", `Basic ${btoa(username + ":" + password)}`);
  }

  if (config.timeout && !config.signal) {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), config.timeout);
    config.signal = controller.signal;
    config.signal.addEventListener("abort", () => clearTimeout(timeout));
  }

  const url = buildURL(config);
  return new Request(url, {
    ...config,
    method: config.method.toUpperCase(),
    headers,
  });
}

async function fetchRequest(request: Request, config: FetchProviderConfig) {
  try {
    return await fetch(request);
  } catch (error) {
    if (error instanceof Error) {
      throw new FetchError(error.message, "ERR_NETWORK", config, request);
    } else {
      throw new FetchError("Network Error", "ERR_NETWORK", config, request);
    }
  }
}

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
