import axios, { AxiosInstance, AxiosRequestConfig } from "axios";
import { z } from "zod";
import { pluginApi } from "./plugins/api";
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
} from "./zodios.types";
import { omit } from "./utils";

const paramsRegExp = /:([a-zA-Z_][a-zA-Z0-9_]*)/g;

/**
 * zodios api client based on axios
 */
export class Zodios<URL extends string, Api extends ZodiosEnpointDescriptions> {
  axiosInstance: AxiosInstance;
  options: ZodiosOptions;

  /**
   * constructor
   * @param baseURL - the base url to use
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
  constructor(baseURL: URL, private api: Api, options?: ZodiosOptions) {
    this.options = {
      validateResponse: true,
      usePluginApi: true,
      ...options,
    };

    if (this.options.axiosInstance) {
      this.axiosInstance = this.options.axiosInstance;
      this.axiosInstance.defaults.baseURL = baseURL;
    } else {
      this.axiosInstance = axios.create({
        baseURL,
      });
    }

    if (this.options.usePluginApi) {
      this.use(pluginApi());
    }
  }

  get baseURL() {
    return this.axiosInstance.defaults.baseURL!;
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
  use(plugin: (zodios: Zodios<URL, Api>) => void) {
    plugin(this);
  }

  private findEndpoint<M extends Method, Path extends Paths<Api, M>>(
    method: M,
    url: Path
  ) {
    return (this.api as unknown as ZodiosEndpointDescription<unknown>[]).find(
      (e) => e.method === method && e.path === url
    );
  }

  private validateResponse<Path extends Paths<Api, "get">>(
    endpoint: ZodiosEndpointDescription<unknown>,
    response: unknown
  ) {
    const validation = endpoint.response.safeParse(response);
    if (!validation.success) {
      console.error(
        `Invalid response for '${endpoint.method} ${endpoint.path}' : ${validation.error.message}`
      );
      throw validation.error;
    }
    return validation.data as z.infer<Response<Api, "get", Path>>;
  }

  private replacePathParams<M extends Method, Path extends Paths<Api, M>>(
    url: Path,
    anyConfig?: AnyZodiosRequestOptions
  ) {
    let result: string = url;
    const params = anyConfig?.params;
    if (params) {
      result = result.replace(paramsRegExp, (match, key) =>
        key in params ? `${params[key]}` : match
      );
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
    config?: ZodiosRequestOptions<Api, M, Path>
  ): Promise<Response<Api, M, Path>> {
    const endpoint = this.findEndpoint(method, url);
    // istanbul ignore next
    if (!endpoint) {
      throw new Error(`No endpoint found for ${method} ${url}`);
    }
    const requestConfig: AxiosRequestConfig = {
      ...omit(config as AnyZodiosRequestOptions, ["params", "queries"]),
      method,
      url: this.replacePathParams(url, config as AnyZodiosRequestOptions),
      params: (config as AnyZodiosRequestOptions)?.queries,
      data,
    };
    const response = await this.axiosInstance.request(requestConfig);
    if (this.options.validateResponse) {
      return this.validateResponse(endpoint, response.data);
    }
    return response.data;
  }

  /**
   * make a get request to the api
   * @param url - the url to api domain
   * @param config - the config to setup axios options and parameters
   * @returns response validated with zod schema provided in the api description
   */
  async get<Path extends Paths<Api, "get">>(
    url: Path,
    config?: ZodiosRequestOptions<Api, "get", Path>
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
    config?: ZodiosRequestOptions<Api, "post", Path>
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
    config?: ZodiosRequestOptions<Api, "put", Path>
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
    config?: ZodiosRequestOptions<Api, "patch", Path>
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
    config?: ZodiosRequestOptions<Api, "delete", Path>
  ): Promise<Response<Api, "delete", Path>> {
    return this.request("delete", url, undefined, config);
  }
}

export type ApiOf<Z> = Z extends Zodios<infer Url, infer Api> ? Api : never;
export type UrlOf<Z> = Z extends Zodios<infer Url, infer Api> ? Url : never;
