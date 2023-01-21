import type {
  AnyZodiosFetcherProvider,
  AnyZodiosRequestOptions,
  ZodiosFetcher,
  ZodiosFetcherFactory,
  ZodiosFetcherFactoryOptions,
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

class Fetcher implements ZodiosFetcher<FetchProvider> {
  constructor(
    public baseURL: string | undefined,
    public config: FetchProviderConfig | undefined
  ) {}
  async fetch(config: AnyZodiosRequestOptions<FetchProvider>) {
    const requestConfig = {
      baseURL: this.baseURL,
      ...this.config,
      ...config,
      url: replacePathParams(config),
    };
    return advancedFetch(
      requestConfig as AnyZodiosRequestOptions<FetchProvider>
    );
  }
}

export const fetchFactory: ZodiosFetcherFactory<FetchProvider> = (options) => {
  return new Fetcher(options?.baseURL, options?.fetchConfig);
};
