import type {
  FilterArrayByValue,
  PickDefined,
  NeverIfEmpty,
  UndefinedToOptional,
  PathParamNames,
  TransitiveOptional,
  ReadonlyDeep,
  Merge,
  FilterArrayByKey,
  IfEquals,
  RequiredKeys,
} from "./utils.types";
import type {
  AnyZodiosTypeProvider,
  InferInputTypeFromSchema,
  InferOutputTypeFromSchema,
  ZodiosRuntimeTypeProvider,
  ZodTypeProvider,
} from "./type-providers";
import {
  AnyZodiosFetcherProvider,
  TypeOfFetcherConfig,
  TypeOfFetcherError,
  TypeOfFetcherResponse,
  ZodiosFetcherFactory,
} from "./fetcher-providers";

export const HTTP_QUERY_METHODS = ["get", "head"] as const;
export const HTTP_MUTATION_METHODS = [
  "post",
  "put",
  "patch",
  "delete",
] as const;
export const HTTP_METHODS = [
  ...HTTP_QUERY_METHODS,
  ...HTTP_MUTATION_METHODS,
] as const;

export type QueryMethod = typeof HTTP_QUERY_METHODS[number];
export type MutationMethod = typeof HTTP_MUTATION_METHODS[number];
export type Method = typeof HTTP_METHODS[number];

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
  Frontend extends boolean = true,
  TypeProvider extends AnyZodiosTypeProvider = ZodTypeProvider
> = Frontend extends true
  ? InferOutputTypeFromSchema<TypeProvider, Endpoint["response"]>
  : InferInputTypeFromSchema<TypeProvider, Endpoint["response"]>;

export type ZodiosResponseByPath<
  Api extends ZodiosEndpointDefinition[],
  M extends Method,
  Path extends ZodiosPathsByMethod<Api, M>,
  Frontend extends boolean = true,
  TypeProvider extends AnyZodiosTypeProvider = ZodTypeProvider
> = Frontend extends true
  ? InferOutputTypeFromSchema<
      TypeProvider,
      ZodiosEndpointDefinitionByPath<Api, M, Path>[number]["response"]
    >
  : InferInputTypeFromSchema<
      TypeProvider,
      ZodiosEndpointDefinitionByPath<Api, M, Path>[number]["response"]
    >;

export type ZodiosResponseByAlias<
  Api extends ZodiosEndpointDefinition[],
  Alias extends string,
  Frontend extends boolean = true,
  TypeProvider extends AnyZodiosTypeProvider = ZodTypeProvider
> = Frontend extends true
  ? InferOutputTypeFromSchema<
      TypeProvider,
      ZodiosEndpointDefinitionByAlias<Api, Alias>[number]["response"]
    >
  : InferInputTypeFromSchema<
      TypeProvider,
      ZodiosEndpointDefinitionByAlias<Api, Alias>[number]["response"]
    >;

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
  Frontend extends boolean = true,
  TypeProvider extends AnyZodiosTypeProvider = ZodTypeProvider
> = Frontend extends true
  ? InferOutputTypeFromSchema<
      TypeProvider,
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
  : InferInputTypeFromSchema<
      TypeProvider,
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
  Frontend extends boolean = true,
  TypeProvider extends AnyZodiosTypeProvider = ZodTypeProvider
> = Frontend extends true
  ? InferOutputTypeFromSchema<
      TypeProvider,
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
  : InferInputTypeFromSchema<
      TypeProvider,
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

export type ZodiosErrorsByPath<
  Api extends ZodiosEndpointDefinition[],
  M extends Method,
  Path extends ZodiosPathsByMethod<Api, M>,
  Frontend extends boolean = true,
  TypeProvider extends AnyZodiosTypeProvider = ZodTypeProvider
> = Frontend extends true
  ? InferOutputTypeFromSchema<
      TypeProvider,
      ZodiosEndpointDefinitionByPath<
        Api,
        M,
        Path
      >[number]["errors"][number]["schema"]
    >
  : InferInputTypeFromSchema<
      TypeProvider,
      ZodiosEndpointDefinitionByPath<
        Api,
        M,
        Path
      >[number]["errors"][number]["schema"]
    >;

export type ZodiosErrorsByAlias<
  Api extends ZodiosEndpointDefinition[],
  M extends Method,
  Path extends ZodiosPathsByMethod<Api, M>,
  Frontend extends boolean = true,
  TypeProvider extends AnyZodiosTypeProvider = ZodTypeProvider
> = Frontend extends true
  ? InferOutputTypeFromSchema<
      TypeProvider,
      ZodiosEndpointDefinitionByAlias<Api, Path>[number]["errors"]
    >
  : InferInputTypeFromSchema<
      TypeProvider,
      ZodiosEndpointDefinitionByAlias<Api, Path>[number]["errors"]
    >;

export type InferFetcherErrors<
  T,
  TypeProvider extends AnyZodiosTypeProvider,
  FetcherProvider extends AnyZodiosFetcherProvider,
  Acc extends unknown[] = []
> = T extends [infer Head, ...infer Tail]
  ? Head extends {
      status: infer Status;
      schema: infer Schema;
    }
    ? InferFetcherErrors<
        Tail,
        TypeProvider,
        FetcherProvider,
        [
          ...Acc,
          TypeOfFetcherError<
            FetcherProvider,
            InferOutputTypeFromSchema<TypeProvider, Schema>,
            Status
          >
        ]
      >
    : Acc
  : Acc;

export type ZodiosMatchingErrorsByPath<
  Api extends ZodiosEndpointDefinition[],
  M extends Method,
  Path extends ZodiosPathsByMethod<Api, M>,
  FetcherProvider extends AnyZodiosFetcherProvider,
  TypeProvider extends AnyZodiosTypeProvider = ZodTypeProvider
> = InferFetcherErrors<
  ZodiosEndpointDefinitionByPath<Api, M, Path>[number]["errors"],
  TypeProvider,
  FetcherProvider
>[number];

export type ZodiosMatchingErrorsByAlias<
  Api extends ZodiosEndpointDefinition[],
  Alias extends string,
  FetcherProvider extends AnyZodiosFetcherProvider,
  TypeProvider extends AnyZodiosTypeProvider = ZodTypeProvider
> = InferFetcherErrors<
  ZodiosEndpointDefinitionByAlias<Api, Alias>[number]["errors"],
  TypeProvider,
  FetcherProvider
>[number];

export type ZodiosErrorByAlias<
  Api extends ZodiosEndpointDefinition[],
  Alias extends string,
  Status extends number,
  Frontend extends boolean = true,
  TypeProvider extends AnyZodiosTypeProvider = ZodTypeProvider
> = Frontend extends true
  ? InferOutputTypeFromSchema<
      TypeProvider,
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
  : InferInputTypeFromSchema<
      TypeProvider,
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
  Frontend extends boolean = true,
  TypeProvider extends AnyZodiosTypeProvider = ZodTypeProvider
> = Frontend extends true
  ? InferInputTypeFromSchema<TypeProvider, BodySchemaForEndpoint<Endpoint>>
  : InferOutputTypeFromSchema<TypeProvider, BodySchemaForEndpoint<Endpoint>>;

export type ZodiosBodyByPath<
  Api extends ZodiosEndpointDefinition[],
  M extends Method,
  Path extends ZodiosPathsByMethod<Api, M>,
  Frontend extends boolean = true,
  TypeProvider extends AnyZodiosTypeProvider = ZodTypeProvider
> = Frontend extends true
  ? InferInputTypeFromSchema<TypeProvider, BodySchema<Api, M, Path>>
  : InferOutputTypeFromSchema<TypeProvider, BodySchema<Api, M, Path>>;

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
  Frontend extends boolean = true,
  TypeProvider extends AnyZodiosTypeProvider = ZodTypeProvider
> = Frontend extends true
  ? InferInputTypeFromSchema<TypeProvider, BodySchemaByAlias<Api, Alias>>
  : InferOutputTypeFromSchema<TypeProvider, BodySchemaByAlias<Api, Alias>>;

/**
 * Map a type an api description parameter to a zod infer type
 * @param T - array of api description parameters
 * @details -  this is using tail recursion type optimization from typescript 4.5
 */
export type MapSchemaParameters<
  T,
  Frontend extends boolean = true,
  TypeProvider extends AnyZodiosTypeProvider = ZodTypeProvider,
  Acc = {}
> = T extends [infer Head, ...infer Tail]
  ? Head extends {
      name: infer Name;
      schema: infer Schema;
    }
    ? Name extends string
      ? MapSchemaParameters<
          Tail,
          Frontend,
          TypeProvider,
          Merge<
            {
              [Key in Name]: Frontend extends true
                ? InferInputTypeFromSchema<TypeProvider, Schema>
                : InferOutputTypeFromSchema<TypeProvider, Schema>;
            },
            Acc
          >
        >
      : Acc
    : Acc
  : Acc;

export type ZodiosQueryParamsForEndpoint<
  Endpoint extends ZodiosEndpointDefinition,
  Frontend extends boolean = true,
  TypeProvider extends AnyZodiosTypeProvider = ZodTypeProvider
> = NeverIfEmpty<
  UndefinedToOptional<
    MapSchemaParameters<
      FilterArrayByValue<Endpoint["parameters"], { type: "Query" }>,
      Frontend,
      TypeProvider
    >
  >
>;

export type ZodiosQueryParamsByPath<
  Api extends ZodiosEndpointDefinition[],
  M extends Method,
  Path extends ZodiosPathsByMethod<Api, M>,
  Frontend extends boolean = true,
  TypeProvider extends AnyZodiosTypeProvider = ZodTypeProvider
> = NeverIfEmpty<
  UndefinedToOptional<
    MapSchemaParameters<
      FilterArrayByValue<
        ZodiosEndpointDefinitionByPath<Api, M, Path>[number]["parameters"],
        { type: "Query" }
      >,
      Frontend,
      TypeProvider
    >
  >
>;

export type ZodiosQueryParamsByAlias<
  Api extends ZodiosEndpointDefinition[],
  Alias extends string,
  Frontend extends boolean = true,
  TypeProvider extends AnyZodiosTypeProvider = ZodTypeProvider
> = NeverIfEmpty<
  UndefinedToOptional<
    MapSchemaParameters<
      FilterArrayByValue<
        ZodiosEndpointDefinitionByAlias<Api, Alias>[number]["parameters"],
        { type: "Query" }
      >,
      Frontend,
      TypeProvider
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
  TypeProvider extends AnyZodiosTypeProvider = ZodTypeProvider,
  PathParameters = MapSchemaParameters<
    FilterArrayByValue<Endpoint["parameters"], { type: "Path" }>,
    Frontend,
    TypeProvider
  >
> = NeverIfEmpty<{
  [K in PathParamNames<Endpoint["path"]>]: PathParameters extends {
    [Key in K]: any;
  }
    ? PathParameters[K]
    : string | number;
}>;

/**
 * Get path params for a given endpoint by path
 */
export type ZodiosPathParamsByPath<
  Api extends ZodiosEndpointDefinition[],
  M extends Method,
  Path extends ZodiosPathsByMethod<Api, M>,
  Frontend extends boolean = true,
  TypeProvider extends AnyZodiosTypeProvider = ZodTypeProvider,
  PathParameters = MapSchemaParameters<
    FilterArrayByValue<
      ZodiosEndpointDefinitionByPath<Api, M, Path>[number]["parameters"],
      { type: "Path" }
    >,
    Frontend,
    TypeProvider
  >
> = NeverIfEmpty<{
  [K in PathParamNames<Path>]: PathParameters extends { [Key in K]: any }
    ? PathParameters[K]
    : string | number;
}>;

/**
 * Get path params for a given endpoint by alias
 */
export type ZodiosPathParamByAlias<
  Api extends ZodiosEndpointDefinition[],
  Alias extends string,
  Frontend extends boolean = true,
  TypeProvider extends AnyZodiosTypeProvider = ZodTypeProvider,
  EndpointDefinition extends ZodiosEndpointDefinition = ZodiosEndpointDefinitionByAlias<
    Api,
    Alias
  >[number],
  Path = EndpointDefinition["path"],
  PathParameters = MapSchemaParameters<
    FilterArrayByValue<EndpointDefinition["parameters"], { type: "Path" }>,
    Frontend,
    TypeProvider
  >
> = NeverIfEmpty<{
  [K in PathParamNames<Path>]: PathParameters extends { [Key in K]: any }
    ? PathParameters[K]
    : string | number;
}>;

export type ZodiosHeaderParamsForEndpoint<
  Endpoint extends ZodiosEndpointDefinition,
  Frontend extends boolean = true,
  TypeProvider extends AnyZodiosTypeProvider = ZodTypeProvider
> = NeverIfEmpty<
  UndefinedToOptional<
    MapSchemaParameters<
      FilterArrayByValue<Endpoint["parameters"], { type: "Header" }>,
      Frontend,
      TypeProvider
    >
  >
>;

export type ZodiosHeaderParamsByPath<
  Api extends ZodiosEndpointDefinition[],
  M extends Method,
  Path extends ZodiosPathsByMethod<Api, M>,
  Frontend extends boolean = true,
  TypeProvider extends AnyZodiosTypeProvider = ZodTypeProvider
> = NeverIfEmpty<
  UndefinedToOptional<
    MapSchemaParameters<
      FilterArrayByValue<
        ZodiosEndpointDefinitionByPath<Api, M, Path>[number]["parameters"],
        { type: "Header" }
      >,
      Frontend,
      TypeProvider
    >
  >
>;

export type ZodiosHeaderParamsByAlias<
  Api extends ZodiosEndpointDefinition[],
  Alias extends string,
  Frontend extends boolean = true,
  TypeProvider extends AnyZodiosTypeProvider = ZodTypeProvider
> = NeverIfEmpty<
  UndefinedToOptional<
    MapSchemaParameters<
      FilterArrayByValue<
        ZodiosEndpointDefinitionByAlias<Api, Alias>[number]["parameters"],
        { type: "Header" }
      >,
      Frontend,
      TypeProvider
    >
  >
>;

export type ZodiosRequestOptionsByAlias<
  Api extends ZodiosEndpointDefinition[],
  Alias extends string,
  FetcherProvider extends AnyZodiosFetcherProvider,
  Frontend extends boolean = true,
  TypeProvider extends AnyZodiosTypeProvider = ZodTypeProvider
> = Merge<
  TypeOfFetcherConfig<FetcherProvider>,
  TransitiveOptional<
    PickDefined<{
      params: ZodiosPathParamByAlias<Api, Alias, Frontend, TypeProvider>;
      queries: ZodiosQueryParamsByAlias<Api, Alias, Frontend, TypeProvider>;
      headers: ZodiosHeaderParamsByAlias<Api, Alias, Frontend, TypeProvider>;
      body: ZodiosBodyByAlias<Api, Alias, Frontend, TypeProvider>;
    }>
  >
>;

export type ZodiosAliasRequest<Config, Response> =
  RequiredKeys<Config> extends never
    ? (configOptions?: ReadonlyDeep<Config>) => Promise<Response>
    : (configOptions: ReadonlyDeep<Config>) => Promise<Response>;

export type ZodiosAliases<
  Api extends ZodiosEndpointDefinition[],
  FetcherProvider extends AnyZodiosFetcherProvider,
  TypeProvider extends AnyZodiosTypeProvider
> = {
  [Alias in Aliases<Api>]: ZodiosAliasRequest<
    ZodiosRequestOptionsByAlias<
      Api,
      Alias,
      FetcherProvider,
      true,
      TypeProvider
    >,
    ZodiosResponseByAlias<Api, Alias, true, TypeProvider>
  >;
};

type OptionalRequestOptionsByPathParameters<
  Api extends ZodiosEndpointDefinition[],
  M extends Method,
  Path extends ZodiosPathsByMethod<Api, M>,
  FetcherProvider extends AnyZodiosFetcherProvider,
  TypeProvider extends AnyZodiosTypeProvider,
  Config = ZodiosRequestOptionsByPath<
    Api,
    M,
    Path,
    FetcherProvider,
    true,
    TypeProvider
  >
> = RequiredKeys<Config> extends never
  ? [config?: ReadonlyDeep<Config>]
  : [config: ReadonlyDeep<Config>];

export type ZodiosVerbs<
  Api extends ZodiosEndpointDefinition[],
  FetcherProvider extends AnyZodiosFetcherProvider,
  TypeProvider extends AnyZodiosTypeProvider
> = {
  [M in Method]: <Path extends ZodiosPathsByMethod<Api, M>>(
    path: Path,
    ...params: OptionalRequestOptionsByPathParameters<
      Api,
      M,
      Path,
      FetcherProvider,
      TypeProvider
    >
  ) => Promise<ZodiosResponseByPath<Api, M, Path, true, TypeProvider>>;
};

export type AnyZodiosMethodOptions<
  FetcherProvider extends AnyZodiosFetcherProvider
> = Merge<
  TypeOfFetcherConfig<FetcherProvider>,
  {
    params?: Record<string, unknown>;
    queries?: Record<string, unknown>;
    headers?: Record<string, string>;
    body?: unknown;
  }
>;

export type AnyZodiosRequestOptions<
  FetcherProvider extends AnyZodiosFetcherProvider
> = Merge<
  { method: Method; url: string },
  AnyZodiosMethodOptions<FetcherProvider>
>;

/**
 * Get the request options for a given endpoint
 */
export type ZodiosRequestOptionsByPath<
  Api extends ZodiosEndpointDefinition[],
  M extends Method,
  Path extends ZodiosPathsByMethod<Api, M>,
  FetcherProvider extends AnyZodiosFetcherProvider,
  Frontend extends boolean = true,
  TypeProvider extends AnyZodiosTypeProvider = ZodTypeProvider
> = Merge<
  TypeOfFetcherConfig<FetcherProvider>,
  TransitiveOptional<
    PickDefined<{
      params: ZodiosPathParamsByPath<Api, M, Path, Frontend, TypeProvider>;
      queries: ZodiosQueryParamsByPath<Api, M, Path, Frontend, TypeProvider>;
      headers: ZodiosHeaderParamsByPath<Api, M, Path, Frontend, TypeProvider>;
      body: ZodiosBodyByPath<Api, M, Path, Frontend, TypeProvider>;
    }>
  >
>;

export type ZodiosRequestOptions<
  Api extends ZodiosEndpointDefinitions,
  M extends Method,
  Path extends ZodiosPathsByMethod<Api, M>,
  FetcherProvider extends AnyZodiosFetcherProvider,
  Frontend extends boolean = true,
  TypeProvider extends AnyZodiosTypeProvider = ZodTypeProvider
> = Merge<
  {
    method: M;
    url: Path;
  },
  ZodiosRequestOptionsByPath<
    Api,
    M,
    Path,
    FetcherProvider,
    Frontend,
    TypeProvider
  >
>;

/**
 * Zodios options
 */
export interface ZodiosOptions<
  FetcherProvider extends AnyZodiosFetcherProvider,
  TypeProvider extends AnyZodiosTypeProvider = ZodTypeProvider
> {
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

  fetcherFactory?: ZodiosFetcherFactory<FetcherProvider>;

  /**
   * set a custom type provider. Default: ZodTypeProvider
   */
  typeProvider?: ZodiosRuntimeTypeProvider<TypeProvider>;
}

export interface ZodiosEndpointParameter {
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
  schema: unknown;
}

export type ZodiosEndpointParameters = ZodiosEndpointParameter[];

export interface ZodiosEndpointError {
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
  schema: unknown;
}

export type ZodiosEndpointErrors = ZodiosEndpointError[];

/**
 * Zodios enpoint definition that should be used to create a new instance of Zodios
 */
export interface ZodiosEndpointDefinition {
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
  response: unknown;
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
export interface ZodiosPlugin<
  FetcherProvider extends AnyZodiosFetcherProvider
> {
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
    endpoint: ZodiosEndpointDefinition,
    config: ReadonlyDeep<AnyZodiosRequestOptions<FetcherProvider>>
  ) => Promise<ReadonlyDeep<AnyZodiosRequestOptions<FetcherProvider>>>;
  /**
   * response interceptor to modify or inspect the response before it is returned
   * @param api - the api description
   * @param config - the request config
   * @param response - the response
   * @returns possibly a new response
   */
  response?: (
    endpoint: ZodiosEndpointDefinition,
    config: ReadonlyDeep<AnyZodiosRequestOptions<FetcherProvider>>,
    response: TypeOfFetcherResponse<FetcherProvider>
  ) => Promise<TypeOfFetcherResponse<FetcherProvider>>;
  /**
   * error interceptor for response errors
   * there is no error interceptor for request errors
   * @param api - the api description
   * @param config - the config for the request
   * @param error - the error that occured
   * @returns possibly a new response or a new error
   */
  error?: (
    endpoint: ZodiosEndpointDefinition,
    config: ReadonlyDeep<AnyZodiosRequestOptions<FetcherProvider>>,
    error: Error
  ) => Promise<TypeOfFetcherResponse<FetcherProvider>>;
}
