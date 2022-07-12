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
  Api extends readonly unknown[],
  M extends Method
> = FilterArrayByValue<Api, { method: M }>;

export type EndpointApiDescription<
  Api extends readonly unknown[],
  M extends Method,
  Path
> = FilterArrayByValue<Api, { method: M; path: Path }>;

export type AliasEndpointApiDescription<
  Api extends readonly unknown[],
  Alias extends string
> = FilterArrayByValue<Api, { alias: Alias }>;

export type Paths<
  Api extends readonly unknown[],
  M extends Method
> = MethodApiDescription<Api, M>[number]["path"];

export type Aliases<Api extends readonly unknown[]> = FilterArrayByKey<
  Api,
  "alias"
>[number]["alias"];

export type Response<
  Api extends readonly unknown[],
  M extends Method,
  Path
> = z.infer<EndpointApiDescription<Api, M, Path>[number]["response"]>;

export type ResponseByAlias<
  Api extends readonly unknown[],
  Alias extends string
> = z.infer<AliasEndpointApiDescription<Api, Alias>[number]["response"]>;

export type Body<
  Api extends readonly unknown[],
  M extends Method,
  Path
> = z.infer<
  FilterArrayByValue<
    EndpointApiDescription<Api, M, Path>[number]["parameters"],
    { type: "Body" }
  >[number]["schema"]
>;

export type BodyByAlias<
  Api extends readonly unknown[],
  Alias extends string
> = z.infer<
  FilterArrayByValue<
    AliasEndpointApiDescription<Api, Alias>[number]["parameters"],
    { type: "Body" }
  >[number]["schema"]
>;

export type QueryParams<
  Api extends readonly unknown[],
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
  Api extends readonly unknown[],
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
  Api extends readonly unknown[],
  Alias extends string
> = NeverIfEmpty<
  Record<
    PathParamNames<AliasEndpointApiDescription<Api, Alias>[number]["path"]>,
    string | number
  >
>;

export type HeaderParams<
  Api extends readonly unknown[],
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
  Api extends readonly unknown[],
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
  Api extends readonly unknown[],
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

export type ZodiosAliases<Api extends readonly unknown[]> = MergeUnion<
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
  Api extends readonly unknown[],
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
  Api extends readonly unknown[],
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
   */
  validateResponse?: boolean;
  /**
   * Override the default axios instance. Default: zodios will create it's own axios instance
   */
  axiosInstance?: AxiosInstance;
  /**
   * default config for axios requests
   */
  axiosConfig?: AxiosRequestConfig;
};

/**
 * Zodios enpoint definition that should be used to create a new instance of Zodios
 */
export type ZodiosEndpointDescription<R> = {
  method: Method;
  path: string;
  alias?: string;
  description?: string;
  requestFormat?: RequestFormat;
  parameters?: Array<{
    name: string;
    description?: string;
    type: "Query" | "Body" | "Header";
    schema: z.ZodType<unknown>;
  }>;
  response: z.ZodType<R>;
};

export type ZodiosEnpointDescriptions = ReadonlyDeep<
  ZodiosEndpointDescription<any>[]
>;

export type ZodiosPlugin = {
  request?: (
    api: ZodiosEnpointDescriptions,
    config: AnyZodiosRequestOptions
  ) => Promise<AnyZodiosRequestOptions>;
  response?: (
    api: ZodiosEnpointDescriptions,
    config: AnyZodiosRequestOptions,
    response: AxiosResponse
  ) => Promise<AxiosResponse>;
  error?: (
    api: ZodiosEnpointDescriptions,
    config: AnyZodiosRequestOptions,
    error: Error
  ) => Promise<AxiosResponse>;
};
