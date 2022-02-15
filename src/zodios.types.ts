import { AxiosRequestConfig } from "axios";
import type {
  FilterArray,
  MapSchemaParameters,
  MergeUnion,
  PickDefined,
  NeverIfEmpty,
  UndefinedToOptional,
  GetParamsKeys,
  ParamsToObject,
  SetPropsOptionalIfChildrenAreOptional,
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
    MergeUnion<
      MapSchemaParameters<
        FilterArray<
          EndpointApiDescription<Api, M, Path>[number]["parameters"],
          { type: "Query" }
        >
      >
    >
  >
>;

export type PathParams<Path extends string> = NeverIfEmpty<
  ParamsToObject<GetParamsKeys<Path>>
>;

export type HeaderParams<Api, M extends Method, Path> = NeverIfEmpty<
  UndefinedToOptional<
    MergeUnion<
      MapSchemaParameters<
        FilterArray<
          EndpointApiDescription<Api, M, Path>[number]["parameters"],
          { type: "Header" }
        >
      >
    >
  >
>;

export type AnyZodiosRequestOptions = {
  params?: Record<string, unknown>;
  queries?: Record<string, unknown>;
  headers?: Record<string, string>;
} & Omit<
  AxiosRequestConfig,
  "params" | "headers" | "baseURL" | "data" | "method"
>;

export type ZodiosRequestOptions<
  Api,
  M extends Method,
  Path extends string
> = SetPropsOptionalIfChildrenAreOptional<
  PickDefined<{
    params: PathParams<Path>;
    queries: QueryParams<Api, M, Path>;
    headers: HeaderParams<Api, M, Path>;
  }>
> &
  Omit<
    AxiosRequestConfig,
    "params" | "headers" | "baseURL" | "data" | "method"
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
 * Zodios enpoint definition that should be used to create a new instance of Zodios
 */
export type ZodiosEndpointDescription<R> = {
  method: Method;
  path: string;
  description?: string;
  parameters?: Array<{
    name: string;
    type: "Query" | "Body" | "Header";
    schema: z.ZodType<unknown>;
  }>;
  response: z.ZodType<R>;
};
