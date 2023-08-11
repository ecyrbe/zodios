import axios, { AxiosError, AxiosInstance, AxiosResponse } from "axios";
import type {
  FilterArrayByValue,
  MapSchemaParameters,
  PickDefined,
  NeverIfEmpty,
  UndefinedToOptional,
  PathParamNames,
  SetPropsOptionalIfChildrenAreOptional,
  ReadonlyDeep,
  Merge,
  FilterArrayByKey,
  IfEquals,
  RequiredKeys,
  UndefinedIfNever,
} from "./utils.types";
import z from "zod";

type AxiosRequestConfig = Parameters<typeof axios.request>[0];

export type MutationMethod = "post" | "put" | "patch" | "delete";

export type Method = "get" | "head" | "options" | MutationMethod;

export type RequestFormat =
  | "json" // default
  | "form-data" // for file uploads
  | "form-url" // for hiding query params in the body
  | "binary" // for binary data / file uploads
  | "text"; // for text data

type EndpointDefinitionsByMethod<
  Api extends ZodiosEndpointDefinition[],
  M extends Method
> = FilterArrayByValue<Api, { method: M }>;

export type ZodiosEndpointDefinitionByPath<
  Api extends ZodiosEndpointDefinition[],
  M extends Method,
  Path extends ZodiosPathsByMethod<Api, M>
> = FilterArrayByValue<Api, { method: M; path: Path }>;

export type ZodiosEndpointDefinitionByAlias<
  Api extends ZodiosEndpointDefinition[],
  Alias extends string
> = FilterArrayByValue<Api, { alias: Alias }>;

export type ZodiosPathsByMethod<
  Api extends ZodiosEndpointDefinition[],
  M extends Method
> = EndpointDefinitionsByMethod<Api, M>[number]["path"];

export type Aliases<Api extends ZodiosEndpointDefinition[]> = FilterArrayByKey<
  Api,
  "alias"
>[number]["alias"];

export type ZodiosResponseForEndpoint<
  Endpoint extends ZodiosEndpointDefinition,
  Frontend extends boolean = true
> = Frontend extends true
  ? z.output<Endpoint["response"]>
  : z.input<Endpoint["response"]>;

export type ZodiosResponseByPath<
  Api extends ZodiosEndpointDefinition[],
  M extends Method,
  Path extends ZodiosPathsByMethod<Api, M>,
  Frontend extends boolean = true
> = Frontend extends true
  ? z.output<ZodiosEndpointDefinitionByPath<Api, M, Path>[number]["response"]>
  : z.input<ZodiosEndpointDefinitionByPath<Api, M, Path>[number]["response"]>;

export type ZodiosResponseByAlias<
  Api extends ZodiosEndpointDefinition[],
  Alias extends string,
  Frontend extends boolean = true
> = Frontend extends true
  ? z.output<ZodiosEndpointDefinitionByAlias<Api, Alias>[number]["response"]>
  : z.input<ZodiosEndpointDefinitionByAlias<Api, Alias>[number]["response"]>;

export type ZodiosDefaultErrorForEndpoint<
  Endpoint extends ZodiosEndpointDefinition
> = FilterArrayByValue<
  Endpoint["errors"],
  {
    status: "default";
  }
>[number]["schema"];

type ZodiosDefaultErrorByPath<
  Api extends ZodiosEndpointDefinition[],
  M extends Method,
  Path extends ZodiosPathsByMethod<Api, M>
> = FilterArrayByValue<
  ZodiosEndpointDefinitionByPath<Api, M, Path>[number]["errors"],
  {
    status: "default";
  }
>[number]["schema"];

type ZodiosDefaultErrorByAlias<
  Api extends ZodiosEndpointDefinition[],
  Alias extends string
> = FilterArrayByValue<
  ZodiosEndpointDefinitionByAlias<Api, Alias>[number]["errors"],
  {
    status: "default";
  }
>[number]["schema"];

type IfNever<E, A> = IfEquals<E, never, A, E>;

export type ZodiosErrorForEndpoint<
  Endpoint extends ZodiosEndpointDefinition,
  Status extends number,
  Frontend extends boolean = true
> = Frontend extends true
  ? z.output<
      IfNever<
        FilterArrayByValue<
          Endpoint["errors"],
          {
            status: Status;
          }
        >[number]["schema"],
        ZodiosDefaultErrorForEndpoint<Endpoint>
      >
    >
  : z.input<
      IfNever<
        FilterArrayByValue<
          Endpoint["errors"],
          {
            status: Status;
          }
        >[number]["schema"],
        ZodiosDefaultErrorForEndpoint<Endpoint>
      >
    >;

export type ZodiosErrorByPath<
  Api extends ZodiosEndpointDefinition[],
  M extends Method,
  Path extends ZodiosPathsByMethod<Api, M>,
  Status extends number,
  Frontend extends boolean = true
> = Frontend extends true
  ? z.output<
      IfNever<
        FilterArrayByValue<
          ZodiosEndpointDefinitionByPath<Api, M, Path>[number]["errors"],
          {
            status: Status;
          }
        >[number]["schema"],
        ZodiosDefaultErrorByPath<Api, M, Path>
      >
    >
  : z.input<
      IfNever<
        FilterArrayByValue<
          ZodiosEndpointDefinitionByPath<Api, M, Path>[number]["errors"],
          {
            status: Status;
          }
        >[number]["schema"],
        ZodiosDefaultErrorByPath<Api, M, Path>
      >
    >;

export type ErrorsToAxios<T, Acc extends unknown[] = []> = T extends [
  infer Head,
  ...infer Tail
]
  ? Head extends {
      status: infer Status;
      schema: infer Schema;
    }
    ? Schema extends z.ZodTypeAny
      ? ErrorsToAxios<
          Tail,
          [
            ...Acc,
            Merge<
              Omit<AxiosError, "status" | "response">,
              {
                response: Merge<
                  AxiosError<z.output<Schema>>["response"],
                  {
                    status: Status extends "default"
                      ? 0 & { error: Status }
                      : Status;
                  }
                >;
              }
            >
          ]
        >
      : Acc
    : Acc
  : Acc;

export type ZodiosMatchingErrorsByPath<
  Api extends ZodiosEndpointDefinition[],
  M extends Method,
  Path extends ZodiosPathsByMethod<Api, M>
> = ErrorsToAxios<
  ZodiosEndpointDefinitionByPath<Api, M, Path>[number]["errors"]
>[number];

export type ZodiosMatchingErrorsByAlias<
  Api extends ZodiosEndpointDefinition[],
  Alias extends string
> = ErrorsToAxios<
  ZodiosEndpointDefinitionByAlias<Api, Alias>[number]["errors"]
>[number];

export type ZodiosErrorByAlias<
  Api extends ZodiosEndpointDefinition[],
  Alias extends string,
  Status extends number,
  Frontend extends boolean = true
> = Frontend extends true
  ? z.output<
      IfNever<
        FilterArrayByValue<
          ZodiosEndpointDefinitionByAlias<Api, Alias>[number]["errors"],
          {
            status: Status;
          }
        >[number]["schema"],
        ZodiosDefaultErrorByAlias<Api, Alias>
      >
    >
  : z.input<
      IfNever<
        FilterArrayByValue<
          ZodiosEndpointDefinitionByAlias<Api, Alias>[number]["errors"],
          {
            status: Status;
          }
        >[number]["schema"],
        ZodiosDefaultErrorByAlias<Api, Alias>
      >
    >;

export type BodySchemaForEndpoint<Endpoint extends ZodiosEndpointDefinition> =
  FilterArrayByValue<
    Endpoint["parameters"],
    { type: "Body" }
  >[number]["schema"];

export type BodySchema<
  Api extends ZodiosEndpointDefinition[],
  M extends Method,
  Path extends ZodiosPathsByMethod<Api, M>
> = FilterArrayByValue<
  ZodiosEndpointDefinitionByPath<Api, M, Path>[number]["parameters"],
  { type: "Body" }
>[number]["schema"];

export type ZodiosBodyForEndpoint<
  Endpoint extends ZodiosEndpointDefinition,
  Frontend extends boolean = true
> = Frontend extends true
  ? z.input<BodySchemaForEndpoint<Endpoint>>
  : z.output<BodySchemaForEndpoint<Endpoint>>;

export type ZodiosBodyByPath<
  Api extends ZodiosEndpointDefinition[],
  M extends Method,
  Path extends ZodiosPathsByMethod<Api, M>,
  Frontend extends boolean = true
> = Frontend extends true
  ? z.input<BodySchema<Api, M, Path>>
  : z.output<BodySchema<Api, M, Path>>;

export type BodySchemaByAlias<
  Api extends ZodiosEndpointDefinition[],
  Alias extends string
> = FilterArrayByValue<
  ZodiosEndpointDefinitionByAlias<Api, Alias>[number]["parameters"],
  { type: "Body" }
>[number]["schema"];

export type ZodiosBodyByAlias<
  Api extends ZodiosEndpointDefinition[],
  Alias extends string,
  Frontend extends boolean = true
> = Frontend extends true
  ? z.input<BodySchemaByAlias<Api, Alias>>
  : z.output<BodySchemaByAlias<Api, Alias>>;

export type ZodiosQueryParamsForEndpoint<
  Endpoint extends ZodiosEndpointDefinition,
  Frontend extends boolean = true
> = NeverIfEmpty<
  UndefinedToOptional<
    MapSchemaParameters<
      FilterArrayByValue<Endpoint["parameters"], { type: "Query" }>,
      Frontend
    >
  >
>;

export type ZodiosQueryParamsByPath<
  Api extends ZodiosEndpointDefinition[],
  M extends Method,
  Path extends ZodiosPathsByMethod<Api, M>,
  Frontend extends boolean = true
> = NeverIfEmpty<
  UndefinedToOptional<
    MapSchemaParameters<
      FilterArrayByValue<
        ZodiosEndpointDefinitionByPath<Api, M, Path>[number]["parameters"],
        { type: "Query" }
      >,
      Frontend
    >
  >
>;

export type ZodiosQueryParamsByAlias<
  Api extends ZodiosEndpointDefinition[],
  Alias extends string,
  Frontend extends boolean = true
> = NeverIfEmpty<
  UndefinedToOptional<
    MapSchemaParameters<
      FilterArrayByValue<
        ZodiosEndpointDefinitionByAlias<Api, Alias>[number]["parameters"],
        { type: "Query" }
      >,
      Frontend
    >
  >
>;

/**
 * @deprecated - use ZodiosQueryParamsByPath instead
 */
export type ZodiosPathParams<Path extends string> = NeverIfEmpty<
  Record<PathParamNames<Path>, string | number>
>;

export type ZodiosPathParamsForEndpoint<
  Endpoint extends ZodiosEndpointDefinition,
  Frontend extends boolean = true,
  PathParameters = MapSchemaParameters<
    FilterArrayByValue<Endpoint["parameters"], { type: "Path" }>,
    Frontend
  >
> = NeverIfEmpty<
  {
    [K in PathParamNames<Endpoint["path"]>]: string | number;
  } & PathParameters
>;

/**
 * Get path params for a given endpoint by path
 */
export type ZodiosPathParamsByPath<
  Api extends ZodiosEndpointDefinition[],
  M extends Method,
  Path extends ZodiosPathsByMethod<Api, M>,
  Frontend extends boolean = true,
  PathParameters = MapSchemaParameters<
    FilterArrayByValue<
      ZodiosEndpointDefinitionByPath<Api, M, Path>[number]["parameters"],
      { type: "Path" }
    >,
    Frontend
  >,
  $PathParamNames extends string = PathParamNames<Path>
> = NeverIfEmpty<
  {
    [K in $PathParamNames]: string | number | boolean;
  } & PathParameters
>;

/**
 * Get path params for a given endpoint by alias
 */
export type ZodiosPathParamByAlias<
  Api extends ZodiosEndpointDefinition[],
  Alias extends string,
  Frontend extends boolean = true,
  EndpointDefinition extends ZodiosEndpointDefinition = ZodiosEndpointDefinitionByAlias<
    Api,
    Alias
  >[number],
  Path = EndpointDefinition["path"],
  PathParameters = MapSchemaParameters<
    FilterArrayByValue<EndpointDefinition["parameters"], { type: "Path" }>,
    Frontend
  >,
  $PathParamNames extends string = PathParamNames<Path>
> = NeverIfEmpty<
  {
    [K in $PathParamNames]: string | number | boolean;
  } & PathParameters
>;

export type ZodiosHeaderParamsForEndpoint<
  Endpoint extends ZodiosEndpointDefinition,
  Frontend extends boolean = true
> = NeverIfEmpty<
  UndefinedToOptional<
    MapSchemaParameters<
      FilterArrayByValue<Endpoint["parameters"], { type: "Header" }>,
      Frontend
    >
  >
>;

export type ZodiosHeaderParamsByPath<
  Api extends ZodiosEndpointDefinition[],
  M extends Method,
  Path extends ZodiosPathsByMethod<Api, M>,
  Frontend extends boolean = true
> = NeverIfEmpty<
  UndefinedToOptional<
    MapSchemaParameters<
      FilterArrayByValue<
        ZodiosEndpointDefinitionByPath<Api, M, Path>[number]["parameters"],
        { type: "Header" }
      >,
      Frontend
    >
  >
>;

export type ZodiosHeaderParamsByAlias<
  Api extends ZodiosEndpointDefinition[],
  Alias extends string,
  Frontend extends boolean = true
> = NeverIfEmpty<
  UndefinedToOptional<
    MapSchemaParameters<
      FilterArrayByValue<
        ZodiosEndpointDefinitionByAlias<Api, Alias>[number]["parameters"],
        { type: "Header" }
      >,
      Frontend
    >
  >
>;

export type ZodiosRequestOptionsByAlias<
  Api extends ZodiosEndpointDefinition[],
  Alias extends string
> = Merge<
  SetPropsOptionalIfChildrenAreOptional<
    PickDefined<{
      params: ZodiosPathParamByAlias<Api, Alias>;
      queries: ZodiosQueryParamsByAlias<Api, Alias>;
      headers: ZodiosHeaderParamsByAlias<Api, Alias>;
    }>
  >,
  Omit<AxiosRequestConfig, "params" | "baseURL" | "data" | "method" | "url">
>;

export type ZodiosMutationAliasRequest<Body, Config, Response> =
  RequiredKeys<Config> extends never
    ? (
        body: ReadonlyDeep<UndefinedIfNever<Body>>,
        configOptions?: ReadonlyDeep<Config>
      ) => Promise<Response>
    : (
        body: ReadonlyDeep<UndefinedIfNever<Body>>,
        configOptions: ReadonlyDeep<Config>
      ) => Promise<Response>;

export type ZodiosAliasRequest<Config, Response> =
  RequiredKeys<Config> extends never
    ? (configOptions?: ReadonlyDeep<Config>) => Promise<Response>
    : (configOptions: ReadonlyDeep<Config>) => Promise<Response>;

export type ZodiosAliases<Api extends ZodiosEndpointDefinition[]> = {
  [Alias in Aliases<Api>]: ZodiosEndpointDefinitionByAlias<
    Api,
    Alias
  >[number]["method"] extends MutationMethod
    ? ZodiosMutationAliasRequest<
        ZodiosBodyByAlias<Api, Alias>,
        ZodiosRequestOptionsByAlias<Api, Alias>,
        ZodiosResponseByAlias<Api, Alias>
      >
    : ZodiosAliasRequest<
        ZodiosRequestOptionsByAlias<Api, Alias>,
        ZodiosResponseByAlias<Api, Alias>
      >;
};

export type AnyZodiosMethodOptions = Merge<
  {
    params?: Record<string, unknown>;
    queries?: Record<string, unknown>;
    headers?: Record<string, string>;
  },
  Omit<AxiosRequestConfig, "params" | "headers" | "url" | "method">
>;

export type AnyZodiosRequestOptions = Merge<
  { method: Method; url: string },
  AnyZodiosMethodOptions
>;

/**
 * @deprecated - use ZodiosRequestOptionsByPath instead
 */
export type ZodiosMethodOptions<
  Api extends ZodiosEndpointDefinition[],
  M extends Method,
  Path extends ZodiosPathsByMethod<Api, M>
> = Merge<
  SetPropsOptionalIfChildrenAreOptional<
    PickDefined<{
      params: ZodiosPathParamsByPath<Api, M, Path>;
      queries: ZodiosQueryParamsByPath<Api, M, Path>;
      headers: ZodiosHeaderParamsByPath<Api, M, Path>;
    }>
  >,
  Omit<AxiosRequestConfig, "params" | "baseURL" | "data" | "method" | "url">
>;

/**
 * Get the request options for a given endpoint
 */
export type ZodiosRequestOptionsByPath<
  Api extends ZodiosEndpointDefinition[],
  M extends Method,
  Path extends ZodiosPathsByMethod<Api, M>
> = Merge<
  SetPropsOptionalIfChildrenAreOptional<
    PickDefined<{
      params: ZodiosPathParamsByPath<Api, M, Path>;
      queries: ZodiosQueryParamsByPath<Api, M, Path>;
      headers: ZodiosHeaderParamsByPath<Api, M, Path>;
    }>
  >,
  Omit<AxiosRequestConfig, "params" | "baseURL" | "data" | "method" | "url">
>;

export type ZodiosRequestOptions<
  Api extends ZodiosEndpointDefinition[],
  M extends Method,
  Path extends ZodiosPathsByMethod<Api, M>
> = Merge<
  {
    method: M;
    url: Path;
    data?: ZodiosBodyByPath<Api, M, Path>;
  },
  ZodiosRequestOptionsByPath<Api, M, Path>
>;

/**
 * Zodios options
 */
export type ZodiosOptions = {
  /**
   * Should zodios validate parameters and response? Default: true
   */
  validate?: boolean | "request" | "response" | "all" | "none";
  /**
   * Should zodios transform the request and response ? Default: true
   */
  transform?: boolean | "request" | "response";
  /**
   * Should zod schema default values be used on parameters? Default: false
   * you usually want your backend to handle default values
   */
  sendDefaults?: boolean;
  /**
   * Override the default axios instance. Default: zodios will create it's own axios instance
   */
  axiosInstance?: AxiosInstance;
  /**
   * default config for axios requests
   */
  axiosConfig?: AxiosRequestConfig;
};

export type ZodiosEndpointParameter<T = unknown> = {
  /**
   * name of the parameter
   */
  name: string;
  /**
   * optional description of the parameter
   */
  description?: string;
  /**
   * type of the parameter: Query, Body, Header, Path
   */
  type: "Query" | "Body" | "Header" | "Path";
  /**
   * zod schema of the parameter
   * you can use zod `transform` to transform the value of the parameter before sending it to the server
   */
  schema: z.ZodType<T>;
};

export type ZodiosEndpointParameters = ZodiosEndpointParameter[];

export type ZodiosEndpointError<T = unknown> = {
  /**
   * status code of the error
   * use 'default' to declare a default error
   */
  status: number | "default";
  /**
   * description of the error - used to generate the openapi error description
   */
  description?: string;
  /**
   * schema of the error
   */
  schema: z.ZodType<T>;
};

export type ZodiosEndpointErrors = ZodiosEndpointError[];

/**
 * Zodios enpoint definition that should be used to create a new instance of Zodios
 */
export interface ZodiosEndpointDefinition<R = unknown> {
  /**
   * http method : get, post, put, patch, delete
   */
  method: Method;
  /**
   * path of the endpoint
   * @example
   * ```text
   * /posts/:postId/comments/:commentId
   * ```
   */
  path: string;
  /**
   * optional alias to call the endpoint easily
   * @example
   * ```text
   * getPostComments
   * ```
   */
  alias?: string;
  /**
   * optional description of the endpoint
   */
  description?: string;
  /**
   * optional request format of the endpoint: json, form-data, form-url, binary, text
   */
  requestFormat?: RequestFormat;
  /**
   * optionally mark the endpoint as immutable to allow zodios to cache the response with react-query
   * use it to mark a 'post' endpoint as immutable
   */
  immutable?: boolean;
  /**
   * optional parameters of the endpoint
   */
  parameters?: Array<ZodiosEndpointParameter>;
  /**
   * response of the endpoint
   * you can use zod `transform` to transform the value of the response before returning it
   */
  response: z.ZodType<R>;
  /**
   * optional response status of the endpoint for sucess, default is 200
   * customize it if your endpoint returns a different status code and if you need openapi to generate the correct status code
   */
  status?: number;
  /**
   * optional response description of the endpoint
   */
  responseDescription?: string;
  /**
   * optional errors of the endpoint - only usefull when using @zodios/express
   */
  errors?: Array<ZodiosEndpointError>;
}

export type ZodiosEndpointDefinitions = ZodiosEndpointDefinition[];

/**
 * Zodios plugin that can be used to intercept zodios requests and responses
 */
export type ZodiosPlugin = {
  /**
   * Optional name of the plugin
   * naming a plugin allows to remove it or replace it later
   */
  name?: string;
  /**
   * request interceptor to modify or inspect the request before it is sent
   * @param api - the api description
   * @param request - the request config
   * @returns possibly a new request config
   */
  request?: (
    api: ZodiosEndpointDefinitions,
    config: ReadonlyDeep<AnyZodiosRequestOptions>
  ) => Promise<ReadonlyDeep<AnyZodiosRequestOptions>>;
  /**
   * response interceptor to modify or inspect the response before it is returned
   * @param api - the api description
   * @param config - the request config
   * @param response - the response
   * @returns possibly a new response
   */
  response?: (
    api: ZodiosEndpointDefinitions,
    config: ReadonlyDeep<AnyZodiosRequestOptions>,
    response: AxiosResponse
  ) => Promise<AxiosResponse>;
  /**
   * error interceptor for response errors
   * there is no error interceptor for request errors
   * @param api - the api description
   * @param config - the config for the request
   * @param error - the error that occured
   * @returns possibly a new response or a new error
   */
  error?: (
    api: ZodiosEndpointDefinitions,
    config: ReadonlyDeep<AnyZodiosRequestOptions>,
    error: Error
  ) => Promise<AxiosResponse>;
};
