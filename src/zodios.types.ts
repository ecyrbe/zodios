import { AxiosRequestConfig } from "axios";
import type {
  FilterArray,
  MapSchemaParameters,
  MergeUnion,
  PickDefined,
  NotEmpty,
  UndefinedToOptional,
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

export type QueryParams<Api, M extends Method, Path> = NotEmpty<
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

export type PathParams<Api, M extends Method, Path> = NotEmpty<
  UndefinedToOptional<
    MergeUnion<
      MapSchemaParameters<
        FilterArray<
          EndpointApiDescription<Api, M, Path>[number]["parameters"],
          { type: "Path" }
        >
      >
    >
  >
>;

export type HeaderParams<Api, M extends Method, Path> = NotEmpty<
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

export type AnyApiClientRequestOptions = {
  params?: Record<string, unknown>;
  queries?: Record<string, unknown>;
  headers?: Record<string, string>;
} & Omit<
  AxiosRequestConfig,
  "params" | "headers" | "baseURL" | "data" | "method"
>;

export type ApiClientRequestOptions<Api, M extends Method, Path> = PickDefined<{
  params: PathParams<Api, M, Path>;
  queries: QueryParams<Api, M, Path>;
  headers: HeaderParams<Api, M, Path>;
}> &
  Omit<
    AxiosRequestConfig,
    "params" | "headers" | "baseURL" | "data" | "method"
  >;

export type AxiosRetryRequestConfig = AxiosRequestConfig & {
  retried?: boolean;
};
