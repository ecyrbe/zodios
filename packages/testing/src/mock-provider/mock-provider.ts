import type {
  AnyZodiosFetcherProvider,
  AnyZodiosRequestOptions,
  ZodiosRuntimeFetcherProvider,
} from "@zodios/core";
import { setFetcherHook, clearFetcherHook } from "@zodios/core";

export interface MockProvider extends AnyZodiosFetcherProvider {
  options: {};
  config: {
    baseURL?: string;
    body?: unknown;
    auth?: { username: string; password: string };
    validateStatus?: (status: number) => boolean;
    timeout?: number;
    responseType?: "arraybuffer" | "blob" | "json" | "text" | "stream";
  };
  response: unknown;
  error: unknown;
}

export const mockProvider: ZodiosRuntimeFetcherProvider<MockProvider> = {
  init() {},
  async fetch(config: AnyZodiosRequestOptions<MockProvider>) {
    const requestConfig = {
      ...config,
      baseURL: this.baseURL,
    };
    for (const [{ method, url }, callback] of registeredMocks) {
      if (method === requestConfig.method && url === requestConfig.url) {
        const result = (await callback(
          requestConfig
        )) as Required<MockResponse>;
        if (
          (config.validateStatus && !config.validateStatus(result.status)) ||
          result.status > 299
        ) {
          const err = new Error(
            `Request failed with status code ${result.status}`
          ) as Error & { code: string; config: any; response: any };
          err.code = `ERR_STATUS_${result.status}`;
          err.config = requestConfig;
          err.response = result;
          throw err;
        }
        return result;
      }
    }
    throw new Error(`No mocks found for ${requestConfig.url}`);
  },
};

export type MockResponse<Data = unknown> = {
  readonly headers?: Record<string, string>;
  readonly status?: number;
  readonly statusText?: string;
  readonly data?: Data;
};

interface ZodiosMockBase {
  install(): void;
  uninstall(): void;
  reset(): void;
  mockRequest(
    method: string,
    path: string,
    callback: (
      config: AnyZodiosRequestOptions<MockProvider>
    ) => Promise<MockResponse>
  ): void;
  mockResponse(method: string, path: string, response: MockResponse): void;
}

const registeredMocks = new Map<
  { method: string; url: string },
  (config: AnyZodiosRequestOptions<MockProvider>) => Promise<MockResponse>
>();

export const zodiosMocks: ZodiosMockBase = {
  install() {
    setFetcherHook(mockProvider);
  },
  uninstall() {
    registeredMocks.clear();
    clearFetcherHook();
  },
  reset() {
    registeredMocks.clear();
  },
  mockRequest(
    method: string,
    path: string,
    callback: (
      config: AnyZodiosRequestOptions<MockProvider>
    ) => Promise<MockResponse>
  ) {
    registeredMocks.set({ method, url: path }, callback);
  },
  mockResponse(method: string, path: string, response: MockResponse) {
    registeredMocks.set(
      {
        method,
        url: path,
      },
      () =>
        Promise.resolve({
          headers: {},
          data: {},
          status: 200,
          statusText: "OK",
          ...response,
        })
    );
  },
};
