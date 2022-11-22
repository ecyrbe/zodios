import type {
  AnyZodiosFetcherProvider,
  AnyZodiosRequestOptions,
  ZodiosRuntimeFetcherProvider,
} from "@zodios/core";
import { Merge } from "@zodios/core/lib/utils.types";
import { replacePathParams } from "../utils";
import { FetchProviderConfig, FetchProviderResponse } from "./fetch.types";
import { advancedFetch, FetchError } from "./fetch";

type FetchErrorStatus<TResponse, Status> = Merge<
  Omit<FetchError<TResponse>, "status" | "response">,
  {
    response: Merge<
      FetchError<TResponse>["response"],
      {
        status: Status extends "default" ? 0 & { error: "default" } : Status;
      }
    >;
  }
>;

type FetchProviderOptions = {
  fetchConfig?: FetchProviderConfig;
};

export interface FetchProvider extends AnyZodiosFetcherProvider {
  options: FetchProviderOptions;
  config: Omit<FetchProviderConfig, "body">;
  response: FetchProviderResponse;
  error: FetchErrorStatus<this["arg1"], this["arg2"]>;
}

export const fetchProvider: ZodiosRuntimeFetcherProvider<FetchProvider> &
  FetchProviderOptions = {
  init(
    options: {
      baseURL?: string;
    } & FetchProviderOptions
  ) {
    const { baseURL, fetchConfig } = options;
    this.fetchConfig = fetchConfig;
    if (baseURL) {
      this.baseURL = baseURL;
    }
  },
  async fetch(config: AnyZodiosRequestOptions<FetchProvider>) {
    const requestConfig = {
      ...this.fetchConfig,
      ...config,
      baseURL: this.baseURL,
      url: replacePathParams(config),
    };
    return advancedFetch(
      requestConfig as AnyZodiosRequestOptions<FetchProvider>
    );
  },
};
