import {
  AnyZodiosFetcherProvider,
  ZodiosRuntimeFetcherProvider,
} from "../fetcher-provider.types";
import { omit, replacePathParams } from "../../utils";
import { FetchProviderConfig, FetchProviderResponse } from "./fetch.types";
import { advancedFetch, FetchError } from "./fetch";
import { AnyZodiosRequestOptions } from "../../zodios.types";
import { Merge } from "../../utils.types";

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
  config: FetchProviderConfig;
  response: FetchProviderResponse;
  error: FetchErrorStatus<this["arg1"], this["arg2"]>;
}

export const fetchProvider: ZodiosRuntimeFetcherProvider<FetchProvider> &
  FetchProviderOptions = {
  create(
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
