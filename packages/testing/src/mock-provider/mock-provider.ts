import type {
  AnyZodiosFetcherProvider,
  AnyZodiosRequestOptions,
  ZodiosFetcher,
  ZodiosFetcherFactory,
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

class Fetcher implements ZodiosFetcher<MockProvider> {
  constructor(public baseURL: string | undefined) {}
  async fetch(config: AnyZodiosRequestOptions<MockProvider>) {
    for (const [{ method, url }, callback] of registeredMocks) {
      if (method === config.method && url === config.url) {
        const result = {
          headers: {},
          status: 200,
          statusText: "OK",
          ...(await callback(config)),
        };
        if (
          (config.validateStatus && !config.validateStatus(result.status)) ||
          result.status > 299
        ) {
          const err = new Error(
            `Request failed with status code ${result.status}`
          ) as Error & { code: string; config: any; response: any };
          err.code = `ERR_STATUS_${result.status}`;
          err.config = config;
          err.response = result;
          throw err;
        }
        return result;
      }
    }
    throw new Error(`No mocks found for ${config.url}`);
  }
}

export const mockFactory: ZodiosFetcherFactory<MockProvider> = (options) =>
  new Fetcher(options?.baseURL);

export type MockResponse<Data = unknown> = {
  readonly headers?: Record<string, string>;
  readonly status?: number;
  readonly statusText?: string;
  readonly data: Data;
};

export type MaybePromise<T> = T | Promise<T>;

interface ZodiosMockBase {
  install(): void;
  uninstall(): void;
  reset(): void;
  mockRequest(
    method: string,
    path: string,
    callback: (
      config: AnyZodiosRequestOptions<MockProvider>
    ) => MaybePromise<MockResponse>
  ): void;
  mockResponse(method: string, path: string, response: MockResponse): void;
}

const registeredMocks = new Map<
  { method: string; url: string },
  (config: AnyZodiosRequestOptions<MockProvider>) => MaybePromise<MockResponse>
>();

export const zodiosMocks: ZodiosMockBase = {
  install() {
    setFetcherHook(mockFactory());
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
    ) => MaybePromise<MockResponse>
  ) {
    registeredMocks.set({ method, url: path }, callback);
  },
  mockResponse(method: string, path: string, response: MockResponse) {
    registeredMocks.set(
      {
        method,
        url: path,
      },
      () => response
    );
  },
};
