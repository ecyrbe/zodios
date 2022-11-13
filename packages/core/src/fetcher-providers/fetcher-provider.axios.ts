import axios, {
  AxiosRequestConfig,
  AxiosError,
  AxiosInstance,
  AxiosResponse,
} from "axios";
import {
  AnyZodiosFetcherProvider,
  ZodiosRuntimeFetcherProvider,
} from "./fetcher-provider.types";
import { Merge } from "../utils.types";
import { omit, replacePathParams } from "../utils";
import { AnyZodiosRequestOptions } from "../zodios.types";

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

export interface AxiosProvider extends AnyZodiosFetcherProvider {
  config: Omit<AxiosRequestConfig, "params" | "headers" | "method" | "url">;
  response: AxiosResponse;

  // provider for TypeOfError
  error: AxiosErrorStatus<this["arg1"], this["arg2"]>;
}

export const axiosProvider = (options: {
  baseURL?: string;
  axiosInstance?: AxiosInstance;
  axiosConfig?: AxiosRequestConfig;
}): ZodiosRuntimeFetcherProvider<AxiosProvider> => {
  const { axiosInstance, axiosConfig, baseURL } = options;
  const instance = axiosInstance || axios.create(axiosConfig);
  if (baseURL) instance.defaults.baseURL = baseURL;

  return {
    fetch: async (config) => {
      const requestConfig: AxiosRequestConfig = {
        ...omit(config as AnyZodiosRequestOptions, ["params", "queries"]),
        url: replacePathParams(config),
        params: config.queries,
      };
      return instance.request(requestConfig);
    },
  };
};
