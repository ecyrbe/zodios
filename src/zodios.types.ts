import { AxiosInstance, AxiosRequestConfig } from "axios";
import type {
  FilterArray,
  MapSchemaParameters,
  PickDefined,
  NeverIfEmpty,
  UndefinedToOptional,
  GetParamsKeys,
  ParamsToObject,
  SetPropsOptionalIfChildrenAreOptional,
  ReadonlyDeep,
  Merge,
} from "./utils.types";
import { z } from "zod";

export type Method =
  | "get"
  | "post"
  | "put"
  | "delete"
  | "patch"
  | "head"
  | "options";

type MethodApiDescription<Api, M extends Method> = FilterArray<
  Api,
  { method: M }
>;

type EndpointApiDescription<Api, M extends Method, Path> = FilterArray<
  Api,
  { method: M; path: Path }
>;

export type Paths<Api, M extends Method> = MethodApiDescription<
  Api,
  M
>[number]["path"];

export type Response<Api, M extends Method, Path> = z.infer<
  EndpointApiDescription<Api, M, Path>[number]["response"]
>;

export type Body<Api, M extends Method, Path> = z.infer<
  FilterArray<
    EndpointApiDescription<Api, M, Path>[number]["parameters"],
    { type: "Body" }
  >[number]["schema"]
>;

export type QueryParams<Api, M extends Method, Path> = NeverIfEmpty<
  UndefinedToOptional<
    MapSchemaParameters<
      FilterArray<
        EndpointApiDescription<Api, M, Path>[number]["parameters"],
        { type: "Query" }
      >
    >
  >
>;

export type PathParams<Path extends string> = NeverIfEmpty<
  ParamsToObject<GetParamsKeys<Path>>
>;

export type HeaderParams<Api, M extends Method, Path> = NeverIfEmpty<
  UndefinedToOptional<
    MapSchemaParameters<
      FilterArray<
        EndpointApiDescription<Api, M, Path>[number]["parameters"],
        { type: "Header" }
      >
    >
  >
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
  { method: Method; path: string },
  AnyZodiosMethodOptions
>;

export type ZodiosMethodOptions<
  Api,
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
  Api,
  M extends Method,
  Path extends string
> = Merge<
  {
    method: M;
    path: Path;
    data?: Body<Api, M, Path>;
  },
  ZodiosMethodOptions<Api, M, Path>
>;

export type AxiosRetryRequestConfig = AxiosRequestConfig & {
  retried?: boolean;
};

/**
 * Token interface to allow zodios to inject a token into the request or renew it
 */
export interface TokenProvider {
  getToken: () => Promise<string>;
  renewToken?: () => Promise<void>;
}

/**
 * Zodios options
 */
export type ZodiosOptions = {
  /**
   * use the header api interceptor? Default: true
   */
  usePluginApi?: boolean;
  /**
   * Should zodios validate the response? Default: true
   */
  validateResponse?: boolean;
  /**
   * Override the default axios instance. Default: zodios will create it's own axios instance
   */
  axiosInstance?: AxiosInstance;
};

/**
 * Zodios enpoint definition that should be used to create a new instance of Zodios
 */
export type ZodiosEndpointDescription<R> = {
  method: Method;
  path: string;
  description?: string;
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
