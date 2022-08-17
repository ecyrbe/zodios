import {
  AxiosError,
  AxiosInstance,
  AxiosRequestConfig,
  AxiosResponse,
} from "axios";
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
  MergeUnion,
  FilterArrayByKey,
  MaybeReadonly,
} from "./utils.types";
import { z } from "zod";

export type MutationMethod = "post" | "put" | "patch" | "delete";

export type Method = "get" | "head" | "options" | MutationMethod;

export type RequestFormat =
  | "json" // default
  | "form-data" // for file uploads
  | "form-url" // for hiding query params in the body
  | "binary" // for binary data / file uploads
  | "text"; // for text data

type MethodApiDescription<
  Api extends unknown[],
  M extends Method
> = FilterArrayByValue<Api, { method: M }>;

export type EndpointApiDescription<
  Api extends unknown[],
  M extends Method,
  Path
> = FilterArrayByValue<Api, { method: M; path: Path }>;

export type AliasEndpointApiDescription<
  Api extends unknown[],
  Alias extends string
> = FilterArrayByValue<Api, { alias: Alias }>;

export type Paths<
  Api extends unknown[],
  M extends Method
> = MethodApiDescription<Api, M>[number]["path"];

export type Aliases<Api extends unknown[]> = FilterArrayByKey<
  Api,
  "alias"
>[number]["alias"];

export type Response<Api extends unknown[], M extends Method, Path> = z.infer<
  EndpointApiDescription<Api, M, Path>[number]["response"]
>;

export type ResponseByAlias<
  Api extends unknown[],
  Alias extends string
> = z.infer<AliasEndpointApiDescription<Api, Alias>[number]["response"]>;

export type Body<Api extends unknown[], M extends Method, Path> = z.input<
  FilterArrayByValue<
    EndpointApiDescription<Api, M, Path>[number]["parameters"],
    { type: "Body" }
  >[number]["schema"]
>;

export type BodyByAlias<Api extends unknown[], Alias extends string> = z.input<
  FilterArrayByValue<
    AliasEndpointApiDescription<Api, Alias>[number]["parameters"],
    { type: "Body" }
  >[number]["schema"]
>;

export type QueryParams<
  Api extends unknown[],
  M extends Method,
  Path
> = NeverIfEmpty<
  UndefinedToOptional<
    MapSchemaParameters<
      FilterArrayByValue<
        EndpointApiDescription<Api, M, Path>[number]["parameters"],
        { type: "Query" }
      >
    >
  >
>;

export type QueryParamsByAlias<
  Api extends unknown[],
  Alias extends string
> = NeverIfEmpty<
  UndefinedToOptional<
    MapSchemaParameters<
      FilterArrayByValue<
        AliasEndpointApiDescription<Api, Alias>[number]["parameters"],
        { type: "Query" }
      >
    >
  >
>;

export type PathParams<Path extends string> = NeverIfEmpty<
  Record<PathParamNames<Path>, string | number>
>;

export type PathParamByAlias<
  Api extends unknown[],
  Alias extends string
> = NeverIfEmpty<
  Record<
    PathParamNames<AliasEndpointApiDescription<Api, Alias>[number]["path"]>,
    string | number
  >
>;

export type HeaderParams<
  Api extends unknown[],
  M extends Method,
  Path
> = NeverIfEmpty<
  UndefinedToOptional<
    MapSchemaParameters<
      FilterArrayByValue<
        EndpointApiDescription<Api, M, Path>[number]["parameters"],
        { type: "Header" }
      >
    >
  >
>;

export type HeaderParamsByAlias<
  Api extends unknown[],
  Alias extends string
> = NeverIfEmpty<
  UndefinedToOptional<
    MapSchemaParameters<
      FilterArrayByValue<
        AliasEndpointApiDescription<Api, Alias>[number]["parameters"],
        { type: "Header" }
      >
    >
  >
>;

export type ZodiosConfigByAlias<
  Api extends unknown[],
  Alias extends string
> = Merge<
  SetPropsOptionalIfChildrenAreOptional<
    PickDefined<{
      params: PathParamByAlias<Api, Alias>;
      queries: QueryParamsByAlias<Api, Alias>;
      headers: HeaderParamsByAlias<Api, Alias>;
    }>
  >,
  Omit<
    AxiosRequestConfig,
    "params" | "headers" | "baseURL" | "data" | "method" | "url"
  >
>;

export type ZodiosAliases<Api extends unknown[]> = MergeUnion<
  Aliases<Api> extends infer Aliases
    ? Aliases extends string
      ? {
          [Alias in Aliases]: AliasEndpointApiDescription<
            Api,
            Alias
          >[number]["method"] extends MutationMethod
            ? (
                data?: BodyByAlias<Api, Alias>,
                configOptions?: ZodiosConfigByAlias<Api, Alias>
              ) => Promise<ResponseByAlias<Api, Alias>>
            : (
                configOptions?: ZodiosConfigByAlias<Api, Alias>
              ) => Promise<ResponseByAlias<Api, Alias>>;
        }
      : never
    : never
>;

export type AnyZodiosMethodOptions = Merge<
  {
    params?: Record<string, unknown>;
    queries?: Record<string, unknown>;
    headers?: Record<string, string>;
  },
  Omit<AxiosRequestConfig, "params" | "headers" | "baseURL" | "url" | "method">
>;

export type AnyZodiosRequestOptions = Merge<
  { method: Method; url: string },
  AnyZodiosMethodOptions
>;

export type ZodiosMethodOptions<
  Api extends unknown[],
  M extends Method,
  Path extends string
> = Merge<
  SetPropsOptionalIfChildrenAreOptional<
    PickDefined<{
      params: PathParams<Path>;
      queries: QueryParams<Api, M, Path>;
      headers: HeaderParams<Api, M, Path>;
    }>
  >,
  Omit<
    AxiosRequestConfig,
    "params" | "headers" | "baseURL" | "data" | "method" | "url"
  >
>;

export type ZodiosRequestOptions<
  Api extends unknown[],
  M extends Method,
  Path extends string
> = Merge<
  {
    method: M;
    url: Path;
    data?: Body<Api, M, Path>;
  },
  ZodiosMethodOptions<Api, M, Path>
>;

export type AxiosRetryRequestConfig = AxiosRequestConfig & {
  retried?: boolean;
};

/**
 * Zodios options
 */
export type ZodiosOptions = {
  /**
   * Should zodios validate the response? Default: true
   * @deprecated use `validate` instead
   */
  validateResponse?: boolean;
  /**
   * Should zodios validate parameters and response? Default: true
   */
  validate?: boolean;
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
   * type of the parameter: Query, Body, Header
   */
  type: "Query" | "Body" | "Header";
  /**
   * zod schema of the parameter
   * you can use zod `transform` to transform the value of the parameter before sending it to the server
   */
  schema: z.ZodType<T>;
};

/**
 * Zodios enpoint definition that should be used to create a new instance of Zodios
 */
export type ZodiosEndpointDescription<R = unknown> = {
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
   * optional parameters of the endpoint
   */
  parameters?: Array<ZodiosEndpointParameter>;
  /**
   * response of the endpoint
   * you can use zod `transform` to transform the value of the response before returning it
   */
  response: z.ZodType<R>;
};

export type ZodiosEnpointDescriptions = ZodiosEndpointDescription[];

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
    api: ZodiosEnpointDescriptions,
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
    api: ZodiosEnpointDescriptions,
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
    api: ZodiosEnpointDescriptions,
    config: ReadonlyDeep<AnyZodiosRequestOptions>,
    error: Error
  ) => Promise<AxiosResponse>;
};
