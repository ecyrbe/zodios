import axios, { AxiosInstance, AxiosRequestConfig } from "axios";
import { z } from "zod";
import {
  AnyApiClientRequestOptions,
  AnyEndpointDescription,
  ApiClientRequestOptions,
  AxiosRetryRequestConfig,
  Body,
  Method,
  Paths,
  Response,
  TokenProvider,
} from "./zodios.types";
import { ReadonlyDeep } from "./utils.types";
import { omit } from "./utils";

const paramsRegExp = /:([a-zA-Z_][a-zA-Z0-9_]*)/g;

/**
 * zodios api client based on axios
 */
export class Zodios<Api extends ReadonlyDeep<AnyEndpointDescription<any>[]>> {
  axiosInstance: AxiosInstance;

  /**
   * constructor
   * @param baseURL - the base url to use
   * @param provider - the token provider to use
   * @param api - the description of all the api endpoints
   */
  constructor(
    baseURL: string,
    private api: Api,
    private provider?: TokenProvider
  ) {
    this.axiosInstance = axios.create({
      baseURL,
    });

    if (this.provider) {
      this.axiosInstance.interceptors.request.use(
        this.createRequestInterceptor()
      );
      if (this.provider?.renewToken) {
        this.axiosInstance.interceptors.response.use(
          undefined,
          this.createResponseInterceptor()
        );
      }
    }
  }

  /**
   * get the underlying axios instance
   */
  get axios() {
    return this.axiosInstance;
  }

  private createRequestInterceptor() {
    return async (config: AxiosRequestConfig) => {
      config.withCredentials = true;
      if (!config.headers) {
        config.headers = {};
      }
      const token = await this.provider?.getToken();
      if (token && config.method !== "get") {
        config.headers = {
          ...config.headers,
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
          Accept: "application/json",
        };
      } else if (token) {
        config.headers = {
          ...config.headers,
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
        };
      }
      return config;
    };
  }

  private createResponseInterceptor() {
    return async (error: Error) => {
      if (axios.isAxiosError(error) && this.provider?.renewToken) {
        const retryConfig = error.config as AxiosRetryRequestConfig;
        if (error.response?.status === 401 && !retryConfig.retried) {
          retryConfig.retried = true;
          this.provider.renewToken();
          return this.axiosInstance.request(retryConfig);
        }
      }
      throw error;
    };
  }

  private findEndpoint<M extends Method, Path extends Paths<Api, M>>(
    method: M,
    url: Path
  ) {
    return (this.api as unknown as AnyEndpointDescription<unknown>[]).find(
      (e) => e.method === method && e.path === url
    );
  }

  private validateResponse<Path extends Paths<Api, "get">>(
    endpoint: AnyEndpointDescription<unknown>,
    response: unknown
  ) {
    const validation = endpoint.response.safeParse(response);
    if (!validation.success) {
      console.error(
        `Invalid response for ${endpoint.method} ${endpoint.path}: ${validation.error.message}`
      );
      throw validation.error;
    }
    return validation.data as z.infer<Response<Api, "get", Path>>;
  }

  private replacePathParams<M extends Method, Path extends Paths<Api, M>>(
    url: Path,
    anyConfig?: AnyApiClientRequestOptions
  ) {
    let result: string = url;
    const params = anyConfig?.params;
    if (params) {
      result = result.replace(paramsRegExp, (_match, id) => `${params[id]}`);
    }
    return result;
  }

  /**
   * make a request to the api
   * @param method - the method to use
   * @param url - the url to api domain
   * @param data - the data to send
   * @param config - the config to setup axios options and parameters
   * @returns response validated with zod schema provided in the api description
   */
  async request<M extends Method, Path extends Paths<Api, M>>(
    method: M,
    url: Path,
    data?: Body<Api, M, Path>,
    config?: ApiClientRequestOptions<Api, M, Path>
  ): Promise<Response<Api, M, Path>> {
    const endpoint = this.findEndpoint(method, url);
    if (!endpoint) {
      throw new Error(`No endpoint found for ${method} ${url}`);
    }
    const requestConfig: AxiosRequestConfig = {
      ...omit(config as AnyApiClientRequestOptions, ["params", "queries"]),
      method,
      url: this.replacePathParams(url, config as AnyApiClientRequestOptions),
      params: (config as AnyApiClientRequestOptions)?.queries,
      data,
    };
    const response = await this.axiosInstance.request(requestConfig);
    return this.validateResponse(endpoint, response.data);
  }

  /**
   * make a get request to the api
   * @param url - the url to api domain
   * @param config - the config to setup axios options and parameters
   * @returns response validated with zod schema provided in the api description
   */
  async get<Path extends Paths<Api, "get">>(
    url: Path,
    config?: ApiClientRequestOptions<Api, "get", Path>
  ): Promise<Response<Api, "get", Path>> {
    return this.request("get", url, undefined, config);
  }

  /**
   * make a post request to the api
   * @param url - the url to api domain
   * @param data - the data to send
   * @param config - the config to setup axios options and parameters
   * @returns response validated with zod schema provided in the api description
   */
  async post<Path extends Paths<Api, "post">>(
    url: Path,
    data?: Body<Api, "post", Path>,
    config?: ApiClientRequestOptions<Api, "post", Path>
  ): Promise<Response<Api, "post", Path>> {
    return this.request("post", url, data, config);
  }

  /**
   * make a put request to the api
   * @param url - the url to api domain
   * @param data - the data to send
   * @param config - the config to setup axios options and parameters
   * @returns response validated with zod schema provided in the api description
   */
  async put<Path extends Paths<Api, "put">>(
    url: Path,
    data?: Body<Api, "put", Path>,
    config?: ApiClientRequestOptions<Api, "put", Path>
  ): Promise<Response<Api, "put", Path>> {
    return this.request("put", url, data, config);
  }

  /**
   * make a patch request to the api
   * @param url - the url to api domain
   * @param data - the data to send
   * @param config - the config to setup axios options and parameters
   * @returns response validated with zod schema provided in the api description
   */
  async patch<Path extends Paths<Api, "patch">>(
    url: Path,
    data?: Body<Api, "patch", Path>,
    config?: ApiClientRequestOptions<Api, "patch", Path>
  ): Promise<Response<Api, "patch", Path>> {
    return this.request("patch", url, data, config);
  }

  /**
   * make a delete request to the api
   * @param url - the url to api domain
   * @param config - the config to setup axios options and parameters
   * @returns response validated with zod schema provided in the api description
   */
  async delete<Path extends Paths<Api, "delete">>(
    url: Path,
    config?: ApiClientRequestOptions<Api, "delete", Path>
  ): Promise<Response<Api, "delete", Path>> {
    return this.request("delete", url, undefined, config);
  }
}
