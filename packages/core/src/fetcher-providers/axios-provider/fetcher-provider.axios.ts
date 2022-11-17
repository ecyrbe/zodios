import axios, {
  AxiosRequestConfig,
  AxiosError,
  AxiosInstance,
  AxiosResponse,
} from "axios";
import {
  AnyZodiosFetcherProvider,
  ZodiosRuntimeFetcherProvider,
} from "../fetcher-provider.types";
import { Merge } from "../../utils.types";
import { omit, replacePathParams } from "../../utils";
import { AnyZodiosRequestOptions } from "../../zodios.types";

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

type AxiosProviderOptions = {
  axiosInstance?: AxiosInstance;
  axiosConfig?: AxiosRequestConfig;
};

export interface AxiosProvider extends AnyZodiosFetcherProvider {
  options: AxiosProviderOptions;
  config: Omit<AxiosRequestConfig, "params" | "headers" | "method" | "url">;
  response: AxiosResponse;

  // provider for TypeOfError
  error: AxiosErrorStatus<this["arg1"], this["arg2"]>;
}

export const axiosProvider: ZodiosRuntimeFetcherProvider<AxiosProvider> & {
  instance: AxiosInstance;
} = {
  instance: undefined as any,
  create(
    options: {
      baseURL?: string;
    } & AxiosProviderOptions
  ) {
    const { axiosInstance, axiosConfig, baseURL } = options;
    this.instance = axiosInstance || axios.create(axiosConfig);
    if (baseURL) {
      this.instance.defaults.baseURL = baseURL;
      this.baseURL = baseURL;
    }
  },
  fetch(config: AnyZodiosRequestOptions<AxiosProvider>) {
    const requestConfig: AxiosRequestConfig = {
      ...omit(config, ["params", "queries"]),
      url: replacePathParams(config),
      params: config.queries,
    };
    return this.instance.request(requestConfig);
  },
};
