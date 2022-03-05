import axios, { AxiosInstance, AxiosRequestConfig } from "axios";
import { Zodios } from "../zodios";
import {
  AxiosRetryRequestConfig,
  TokenProvider,
  ZodiosEnpointDescriptions,
} from "../zodios.types";

function createRequestInterceptor(provider: TokenProvider) {
  return async (config: AxiosRequestConfig) => {
    const token = await provider.getToken();
    if (token) {
      config.headers = {
        ...config.headers,
        Authorization: `Bearer ${token}`,
      };
    }
    return config;
  };
}

function createResponseInterceptor(
  instance: AxiosInstance,
  provider: TokenProvider
) {
  return async (error: Error) => {
    if (axios.isAxiosError(error) && provider.renewToken) {
      const retryConfig = error.config as AxiosRetryRequestConfig;
      if (error.response?.status === 401 && !retryConfig.retried) {
        retryConfig.retried = true;
        provider.renewToken();
        return instance.request(retryConfig);
      }
    }
    throw error;
  };
}

export function pluginToken<Api extends ZodiosEnpointDescriptions>(
  provider: TokenProvider
) {
  return (zodios: Zodios<Api>) => {
    zodios.axios.interceptors.request.use(createRequestInterceptor(provider));
    if (provider?.renewToken) {
      zodios.axios.interceptors.response.use(
        undefined,
        createResponseInterceptor(zodios.axios, provider)
      );
    }
  };
}
