import { AxiosRequestConfig } from "axios";
import { Zodios } from "../zodios";
import { ZodiosEnpointDescriptions } from "../zodios.types";

function createRequestInterceptor() {
  return async (config: AxiosRequestConfig) => {
    config.withCredentials = true;
    // istanbul ignore next
    if (!config.headers) {
      config.headers = {};
    }
    if (config.method !== "get") {
      config.headers = {
        ...config.headers,
        "Content-Type": "application/json",
        Accept: "application/json",
      };
    } else {
      config.headers = {
        ...config.headers,
        Accept: "application/json",
      };
    }
    return config;
  };
}

/**
 * plugin that add application/json header to all requests
 * @param zodios
 */
export function pluginApi<
  Url extends string,
  Api extends ZodiosEnpointDescriptions
>() {
  return (zodios: Zodios<Url, Api>) => {
    zodios.axios.interceptors.request.use(createRequestInterceptor());
  };
}
