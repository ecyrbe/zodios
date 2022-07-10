import axios, { AxiosInstance, AxiosRequestConfig } from "axios";
import { z } from "zod";
import { ZodiosError } from "./zodios-error";
import {
  AnyZodiosRequestOptions,
  ZodiosEndpointDescription,
  ZodiosRequestOptions,
  Body,
  Method,
  Paths,
  Response,
  ZodiosOptions,
  ZodiosEnpointDescriptions,
  ZodiosMethodOptions,
  ZodiosAliases,
} from "./zodios.types";
import { omit } from "./utils";
import { getFormDataStream } from "./utils.node";

const paramsRegExp = /:([a-zA-Z_][a-zA-Z0-9_]*)/g;

/**
 * zodios api client based on axios
 */
export class ZodiosClass<Api extends ZodiosEnpointDescriptions> {
  private axiosInstance: AxiosInstance;
  public readonly options: ZodiosOptions;
  public readonly api: Api;

  /**
   * constructor
   * @param baseURL - the base url to use - if omited will use the browser domain
   * @param api - the description of all the api endpoints
   * @param options - the options to setup the client API
   * @example
   *   const apiClient = new Zodios("https://jsonplaceholder.typicode.com", [
   *     {
   *       method: "get",
   *       path: "/users",
   *       description: "Get all users",
   *       parameters: [
   *         {
   *           name: "q",
   *           type: "Query",
   *           schema: z.string(),
   *         },
   *         {
   *           name: "page",
   *           type: "Query",
   *           schema: z.string().optional(),
   *         },
   *       ],
   *       response: z.array(z.object({ id: z.number(), name: z.string() })),
   *     }
   *   ]);
   */
  constructor(api: Api, options?: ZodiosOptions);
  constructor(baseUrl: string, api: Api, options?: ZodiosOptions);
  constructor(...args: unknown[]) {
    if (!args[0]) {
      if (Array.isArray(args[1])) {
        throw new Error("Zodios: missing base url");
      }
      throw new Error("Zodios: missing api description");
    }
    let baseURL: string | undefined;
    if (typeof args[0] === "string") {
      [baseURL, ...args] = args;
    }
    this.api = args[0] as Api;

    if (!Array.isArray(this.api)) {
      throw new Error("Zodios: api must be an array");
    }

    this.options = {
      validateResponse: true,
      ...(args[1] as ZodiosOptions),
    };

    if (this.options.axiosInstance) {
      this.axiosInstance = this.options.axiosInstance;
    } else {
      this.axiosInstance = axios.create({
        ...this.options.axiosConfig,
      });
    }
    if (baseURL) this.axiosInstance.defaults.baseURL = baseURL;

    this.injectAliasEndpoints();
  }

  /**
   * get the base url of the api
   */
  get baseURL() {
    return this.axiosInstance.defaults.baseURL;
  }

  /**
   * get the underlying axios instance
   */
  get axios() {
    return this.axiosInstance;
  }

  /**
   * use a plugin to cusomize the client
   * @param plugin - the plugin to use
   */
  use(plugin: ZodiosPlugin<Api>) {
    plugin(this as unknown as ZodiosInstance<Api>);
  }

  private injectAliasEndpoints() {
    this.api.forEach((endpoint) => {
      if (endpoint.alias) {
        if (["post", "put", "patch", "delete"].includes(endpoint.method)) {
          (this as any)[endpoint.alias] = (data: any, config: any) =>
            this.request({
              ...config,
              method: endpoint.method,
              url: endpoint.path,
              data,
            });
        } else {
          (this as any)[endpoint.alias] = (config: any) =>
            this.request({
              ...config,
              method: endpoint.method,
              url: endpoint.path,
            });
        }
      }
    });
  }

  private findEndpoint<M extends Method, Path extends Paths<Api, M>>(
    method: M,
    path: Path
  ) {
    return (this.api as unknown as ZodiosEndpointDescription<unknown>[]).find(
      (e) => e.method === method && e.path === path
    );
  }

  private validateResponse<M extends Method, Path extends Paths<Api, M>>(
    endpoint: ZodiosEndpointDescription<unknown>,
    response: unknown,
    config: ZodiosRequestOptions<Api, M, Path>
  ) {
    const parsed = endpoint.response.safeParse(response);
    if (!parsed.success) {
      throw new ZodiosError(
        "Zodios: invalid response",
        config,
        response,
        parsed.error
      );
    }
    return parsed.data as z.infer<Response<Api, "get", Path>>;
  }

  private replacePathParams(config: AnyZodiosRequestOptions) {
    let result: string = config.url;
    const params = config.params;
    if (params) {
      result = result.replace(paramsRegExp, (match, key) =>
        key in params ? `${params[key]}` : match
      );
    }
    return result;
  }

  private async transformData<M extends Method, Path extends Paths<Api, M>>(
    endpoint: ZodiosEndpointDescription<unknown>,
    config: ZodiosRequestOptions<Api, M, Path>
  ) {
    if (config.data && endpoint.requestFormat) {
      switch (endpoint.requestFormat) {
        case "form-url":
          if (typeof config.data !== "object" || Array.isArray(config.data)) {
            throw new ZodiosError(
              "Zodios: application/x-www-form-urlencoded body must be an object",
              config
            );
          }

          return {
            data: new URLSearchParams(config.data).toString(),
            headers: { "Content-Type": "application/x-www-form-urlencoded" },
          };
        case "form-data":
          if (typeof config.data !== "object" || Array.isArray(config.data)) {
            throw new ZodiosError(
              "Zodios: multipart/form-data body must be an object",
              config
            );
          }
          return getFormDataStream(config.data);
        case "data":
          return {
            data: config.data,
            headers: { "Content-Type": "application/octet-stream" },
          };
        case "text":
          return {
            data: config.data,
            headers: { "Content-Type": "text/plain" },
          };
      }
    }
    return { data: config.data };
  }

  /**
   * make a request to the api
   * @param config - the config to setup zodios options and parameters
   * @returns response validated with zod schema provided in the api description
   */
  async request<M extends Method, Path extends Paths<Api, M>>(
    config: ZodiosRequestOptions<Api, M, Path>
  ): Promise<Response<Api, M, Path>> {
    const conf = config as unknown as AnyZodiosRequestOptions;
    const endpoint = this.findEndpoint(config.method, config.url);
    // istanbul ignore next
    if (!endpoint) {
      throw new Error(`No endpoint found for ${config.method} ${config.url}`);
    }
    const transformed = await this.transformData(endpoint, config);
    const requestConfig: AxiosRequestConfig = {
      ...omit(conf, ["params", "queries"]),
      data: transformed.data,
      headers: { ...conf.headers, ...transformed.headers },
      url: this.replacePathParams(conf),
      params: conf.queries,
    };
    const response = await this.axiosInstance.request(requestConfig);
    if (this.options.validateResponse) {
      return this.validateResponse(endpoint, response.data, config);
    }
    return response.data;
  }

  /**
   * make a get request to the api
   * @param path - the path to api endpoint
   * @param config - the config to setup axios options and parameters
   * @returns response validated with zod schema provided in the api description
   */
  async get<Path extends Paths<Api, "get">>(
    path: Path,
    config?: ZodiosMethodOptions<Api, "get", Path>
  ): Promise<Response<Api, "get", Path>> {
    return this.request({
      ...config,
      method: "get",
      url: path,
    } as unknown as ZodiosRequestOptions<Api, "get", Path>);
  }

  /**
   * make a post request to the api
   * @param path - the path to api endpoint
   * @param data - the data to send
   * @param config - the config to setup axios options and parameters
   * @returns response validated with zod schema provided in the api description
   */
  async post<Path extends Paths<Api, "post">>(
    path: Path,
    data?: Body<Api, "post", Path>,
    config?: ZodiosMethodOptions<Api, "post", Path>
  ): Promise<Response<Api, "post", Path>> {
    return this.request({
      ...config,
      method: "post",
      url: path,
      data,
    } as unknown as ZodiosRequestOptions<Api, "post", Path>);
  }

  /**
   * make a put request to the api
   * @param path - the path to api endpoint
   * @param data - the data to send
   * @param config - the config to setup axios options and parameters
   * @returns response validated with zod schema provided in the api description
   */
  async put<Path extends Paths<Api, "put">>(
    path: Path,
    data?: Body<Api, "put", Path>,
    config?: ZodiosMethodOptions<Api, "put", Path>
  ): Promise<Response<Api, "put", Path>> {
    return this.request({
      ...config,
      method: "put",
      url: path,
      data,
    } as unknown as ZodiosRequestOptions<Api, "put", Path>);
  }

  /**
   * make a patch request to the api
   * @param path - the path to api endpoint
   * @param data - the data to send
   * @param config - the config to setup axios options and parameters
   * @returns response validated with zod schema provided in the api description
   */
  async patch<Path extends Paths<Api, "patch">>(
    path: Path,
    data?: Body<Api, "patch", Path>,
    config?: ZodiosMethodOptions<Api, "patch", Path>
  ): Promise<Response<Api, "patch", Path>> {
    return this.request({
      ...config,
      method: "patch",
      url: path,
      data,
    } as unknown as ZodiosRequestOptions<Api, "patch", Path>);
  }

  /**
   * make a delete request to the api
   * @param path - the path to api endpoint
   * @param config - the config to setup axios options and parameters
   * @returns response validated with zod schema provided in the api description
   */
  async delete<Path extends Paths<Api, "delete">>(
    path: Path,
    data?: Body<Api, "patch", Path>,
    config?: ZodiosMethodOptions<Api, "delete", Path>
  ): Promise<Response<Api, "delete", Path>> {
    return this.request({
      ...config,
      method: "delete",
      url: path,
      data,
    } as unknown as ZodiosRequestOptions<Api, "delete", Path>);
  }
}

export type ZodiosInstance<Api extends ZodiosEnpointDescriptions> =
  ZodiosClass<Api> & ZodiosAliases<Api>;

export type ZodiosConstructor = {
  new <Api extends ZodiosEnpointDescriptions>(
    api: Api,
    options?: ZodiosOptions
  ): ZodiosInstance<Api>;
  new <Api extends ZodiosEnpointDescriptions>(
    baseUrl: string,
    api: Api,
    options?: ZodiosOptions
  ): ZodiosInstance<Api>;
};

export const Zodios = ZodiosClass as ZodiosConstructor;

/**
 * Get the Api description type from zodios
 * @param Z - zodios type
 */
export type ApiOf<Z> = Z extends ZodiosInstance<infer Api> ? Api : never;
/**
 * Get the Url string type from zodios
 * @param Z - zodios type
 */

/**
 * Zodios Plugin type
 * @Param URL - the url of the api
 * @Param Api - the api description type
 */
export type ZodiosPlugin<Api extends ZodiosEnpointDescriptions> = (
  zodios: ZodiosInstance<Api>
) => void;
