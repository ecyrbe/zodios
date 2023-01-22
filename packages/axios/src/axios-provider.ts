import axios, { AxiosError, AxiosInstance, AxiosResponse } from "axios";
import {
  AnyZodiosRequestOptions,
  AnyZodiosFetcherProvider,
  ZodiosFetcherFactory,
  ZodiosFetcher,
} from "@zodios/core";
import { Merge } from "@zodios/core/lib/utils.types";
import { omit, replacePathParams } from "./utils";

type AxiosErrorStatus<Response, Status> = Merge<
  Omit<AxiosError, "status" | "response">,
  {
    response: Merge<
      AxiosError<Response>["response"],
      {
        status: Status extends "default" ? 0 & { error: "default" } : Status;
      }
    >;
  }
>;

type AxiosRequestConfig = Parameters<typeof axios.request>[0];
type AxiosCreateConfig = Parameters<typeof axios.create>[0];

type AxiosProviderOptions = {
  axiosInstance?: AxiosInstance;
  axiosConfig?: AxiosCreateConfig;
};

export interface AxiosProvider extends AnyZodiosFetcherProvider {
  options: AxiosProviderOptions;
  config: Omit<AxiosRequestConfig, "params" | "headers" | "method" | "url">;
  response: AxiosResponse;

  // provider for TypeOfError
  error: AxiosErrorStatus<this["arg1"], this["arg2"]>;
}

class Fetcher implements ZodiosFetcher<AxiosProvider> {
  instance: AxiosInstance;
  constructor(
    baseURL: string | undefined,
    config: AxiosCreateConfig | undefined,
    instance: AxiosInstance | undefined
  ) {
    this.instance = instance || axios.create(config);
    if (baseURL) this.instance.defaults.baseURL = baseURL;
  }

  fetch(config: AnyZodiosRequestOptions<AxiosProvider>) {
    return this.instance.request({
      ...omit(config, ["params", "queries", "body"]),
      url: replacePathParams(config),
      params: config.queries,
      data: config.body,
    });
  }
}

export const axiosFactory: ZodiosFetcherFactory<AxiosProvider> = (options) => {
  return new Fetcher(
    options?.baseURL,
    options?.axiosConfig,
    options?.axiosInstance
  );
};
