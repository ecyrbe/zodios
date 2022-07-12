import axios, { AxiosInstance, AxiosRequestConfig } from "axios";
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
  ZodiosPlugin,
} from "./zodios.types";
import { omit } from "./utils";
import { getFormDataStream } from "./utils.node";
import {
  PluginId,
  ZodiosPlugins,
  zodValidationPlugin,
  formDataPlugin,
  formURLPlugin,
} from "./plugins";

const paramsRegExp = /:([a-zA-Z_][a-zA-Z0-9_]*)/g;

/**
 * zodios api client based on axios
 */
export class ZodiosClass<Api extends ZodiosEnpointDescriptions> {
  private axiosInstance: AxiosInstance;
  public readonly options: ZodiosOptions;
  public readonly api: Api;
  private endpointPlugins: Record<string, ZodiosPlugins>;

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
    this.endpointPlugins = {};
    this.initPlugins();
    if (this.options.validateResponse) {
      this.use(zodValidationPlugin());
    }
  }

  private initPlugins() {
    this.endpointPlugins["any-any"] = new ZodiosPlugins("any", "any");

    this.api.forEach((endpoint) => {
      const plugins = new ZodiosPlugins(endpoint.method, endpoint.path);
      switch (endpoint.requestFormat) {
        case "form-url":
          plugins.use(formURLPlugin());
          break;
        case "form-data":
          plugins.use(formDataPlugin());
        case "data":
          break;
        case "text":
          break;
      }
      this.endpointPlugins[`${endpoint.method}-${endpoint.path}`] = plugins;
    });
  }

  private getAnyEndpointPlugins() {
    return this.endpointPlugins["any-any"];
  }

  private findAliasEndpointPlugins(alias: string) {
    const endpoint = this.api.find((endpoint) => endpoint.alias === alias);
    if (endpoint) {
      return this.endpointPlugins[`${endpoint.method}-${endpoint.path}`];
    }
    return undefined;
  }

  private findEnpointPlugins(method: Method, path: string) {
    return this.endpointPlugins[`${method}-${path}`];
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
   * use a plugin to customize the client
   * @param plugin - the plugin to use
   */
  use(plugin: ZodiosPlugin): PluginId;
  use<Alias extends keyof ZodiosAliases<Api>>(
    alias: Alias,
    plugin: ZodiosPlugin
  ): PluginId;
  use<M extends Method, Path extends Paths<Api, M>>(
    method: M,
    path: Path,
    plugin: ZodiosPlugin
  ): PluginId;
  use(...args: unknown[]) {
    if (typeof args[0] === "object") {
      const plugins = this.getAnyEndpointPlugins();
      return plugins.use(args[0] as ZodiosPlugin);
    } else if (typeof args[0] === "string" && typeof args[1] === "object") {
      const plugins = this.findAliasEndpointPlugins(args[0]);
      if (!plugins)
        throw new Error(
          `Zodios: no alias '${args[0]}' found to register plugin`
        );
      return plugins.use(args[1] as ZodiosPlugin);
    } else if (
      typeof args[0] === "string" &&
      typeof args[1] === "string" &&
      typeof args[2] === "object"
    ) {
      const plugins = this.findEnpointPlugins(args[0] as Method, args[1]);
      if (!plugins)
        throw new Error(
          `Zodios: no endpoint '${args[0]} ${args[1]}' found to register plugin`
        );
      return plugins.use(args[2] as ZodiosPlugin);
    }
    throw new Error("Zodios: invalid plugin registration");
  }

  eject(plugin: PluginId): void {
    this.endpointPlugins[plugin.key]?.eject(plugin);
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

  /**
   * make a request to the api
   * @param config - the config to setup zodios options and parameters
   * @returns response validated with zod schema provided in the api description
   */
  async request<M extends Method, Path extends Paths<Api, M>>(
    config: ZodiosRequestOptions<Api, M, Path>
  ): Promise<Response<Api, M, Path>> {
    let conf = config as unknown as AnyZodiosRequestOptions;
    const anyPlugin = this.getAnyEndpointPlugins();
    conf = await anyPlugin.interceptRequest(this.api, conf);
    const endpointPlugin = this.findEnpointPlugins(config.method, config.url);
    conf = await endpointPlugin?.interceptRequest(this.api, conf);

    const requestConfig: AxiosRequestConfig = {
      ...omit(conf, ["params", "queries"]),
      url: this.replacePathParams(conf),
      params: conf.queries,
    };
    let response = this.axiosInstance.request(requestConfig);
    response =
      endpointPlugin?.interceptResponse(this.api, conf, response) ?? response;
    response = anyPlugin.interceptResponse(this.api, conf, response);
    return (await response).data;
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
