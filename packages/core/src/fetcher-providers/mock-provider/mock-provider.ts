import type {
  AnyZodiosFetcherProvider,
  AnyZodiosRequestOptions,
  ZodiosRuntimeFetcherProvider,
} from "../../index";
import { defaults } from "../default-provider";

interface MockProvider extends AnyZodiosFetcherProvider {
  options: {};
  config: {
    baseURL?: string;
    body?: any;
    auth?: { username: string; password: string };
    validateStatus?: (status: number) => boolean;
    timeout?: number;
    responseType?: "arraybuffer" | "blob" | "json" | "text" | "stream";
  };
  response: any;
  error: any;
}

const mockProvider: ZodiosRuntimeFetcherProvider<MockProvider> = {
  init() {},
  async fetch(config: AnyZodiosRequestOptions<MockProvider>) {
    const requestConfig = {
      ...config,
      baseURL: this.baseURL,
    };
    for (const [{ method, url }, callback] of zodiosMocks.mocks) {
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

type MockResponse = {
  readonly headers?: Record<string, string>;
  readonly status?: number;
  readonly statusText?: string;
  readonly data?: any;
};

export const zodiosMocks = {
  mocks: new Map<
    { method: string; url: string },
    (config: AnyZodiosRequestOptions<MockProvider>) => Promise<MockResponse>
  >(),
  install() {
    defaults.fetcherProvider = mockProvider;
  },
  uninstall() {
    this.mocks.clear();
    defaults.fetcherProvider = undefined;
  },
  reset() {
    this.mocks.clear();
  },
  mockRequest(
    method: string,
    path: string,
    callback: (
      config: AnyZodiosRequestOptions<MockProvider>
    ) => Promise<MockResponse>
  ) {
    this.mocks.set({ method, url: path }, callback);
  },
  mockResponse(method: string, path: string, response: MockResponse) {
    this.mocks.set(
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
