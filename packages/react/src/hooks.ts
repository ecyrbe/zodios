import {
  useQuery,
  UseQueryOptions,
  UseQueryResult,
  useMutation,
  UseMutationOptions,
  UseMutationResult,
  useInfiniteQuery,
  UseInfiniteQueryOptions,
  useQueryClient,
  QueryFunctionContext,
  QueryKey,
  UseInfiniteQueryResult,
} from "@tanstack/react-query";
import { ZodiosError, HTTP_MUTATION_METHODS } from "@zodios/core";
import type {
  AnyZodiosFetcherProvider,
  AnyZodiosMethodOptions,
  AnyZodiosTypeProvider,
  Method,
  ZodiosInstance,
  ZodiosPathsByMethod,
  ZodiosResponseByPath,
  ZodiosResponseByAlias,
  ZodiosEndpointDefinitions,
  ZodiosEndpointDefinition,
  ZodiosEndpointDefinitionByAlias,
  ZodiosRequestOptionsByPath,
  ZodiosBodyByPath,
  ZodiosBodyByAlias,
  ZodiosQueryParamsByPath,
  ZodiosRequestOptionsByAlias,
  ZodTypeProvider,
} from "@zodios/core";
import type {
  IfEquals,
  PathParamNames,
  ReadonlyDeep,
  RequiredKeys,
} from "@zodios/core/lib/utils.types";
import type { Aliases, MutationMethod } from "@zodios/core/lib/zodios.types";
import { capitalize, pick, omit, hasObjectBody } from "./utils";

type UndefinedIfNever<T> = IfEquals<T, never, undefined, T>;
type Errors = Error | ZodiosError;

type MutationOptions<
  Api extends ZodiosEndpointDefinition[],
  M extends Method,
  Path extends ZodiosPathsByMethod<Api, M>,
  TypeProvider extends AnyZodiosTypeProvider
> = Omit<
  UseMutationOptions<
    Awaited<ZodiosResponseByPath<Api, M, Path, true, TypeProvider>>,
    Errors,
    UndefinedIfNever<ZodiosBodyByPath<Api, M, Path, true, TypeProvider>>
  >,
  "mutationFn" | "mutationKey"
>;

type MutationOptionsByAlias<
  Api extends ZodiosEndpointDefinition[],
  Alias extends string,
  TypeProvider extends AnyZodiosTypeProvider
> = Omit<
  UseMutationOptions<
    Awaited<ZodiosResponseByAlias<Api, Alias, true, TypeProvider>>,
    Errors,
    UndefinedIfNever<ZodiosBodyByAlias<Api, Alias, true, TypeProvider>>
  >,
  "mutationFn"
>;

export type QueryOptions<TQueryFnData, TData> = Omit<
  UseQueryOptions<TQueryFnData, Errors, TData>,
  "queryKey" | "queryFn"
>;

type ImmutableQueryOptions<TQueryFnData, TData> = Omit<
  UseQueryOptions<TQueryFnData, Errors, TData>,
  "queryKey" | "queryFn"
>;

type InfiniteQueryOptions<TQueryFnData, TData> = Omit<
  UseInfiniteQueryOptions<TQueryFnData, Errors, TData>,
  "queryKey" | "queryFn"
>;

export type ImmutableInfiniteQueryOptions<TQueryFnData, TData> = Omit<
  UseInfiniteQueryOptions<TQueryFnData, Errors, TData>,
  "queryKey" | "queryFn"
>;

export class ZodiosHooksImpl<
  Api extends ZodiosEndpointDefinitions,
  FetcherProvider extends AnyZodiosFetcherProvider,
  TypeProvider extends AnyZodiosTypeProvider = ZodTypeProvider
> {
  constructor(
    private readonly apiName: string,
    private readonly zodios: ZodiosInstance<Api, FetcherProvider, TypeProvider>
  ) {
    this.injectAliasEndpoints();
    this.injectMutationEndpoints();
  }

  private injectAliasEndpoints() {
    this.zodios.api.forEach((endpoint) => {
      if (endpoint.alias) {
        if (["post", "put", "patch", "delete"].includes(endpoint.method)) {
          if (endpoint.method === "post" && endpoint.immutable) {
            (this as any)[`use${capitalize(endpoint.alias)}`] = (
              config: any,
              mutationOptions: any
            ) =>
              this.useImmutableQuery(
                endpoint.path as any,
                config,
                mutationOptions
              );
          } else {
            (this as any)[`use${capitalize(endpoint.alias)}`] = (
              config: any,
              mutationOptions: any
            ) =>
              this.useMutation(
                endpoint.method,
                endpoint.path as any,
                config,
                mutationOptions
              );
          }
        } else {
          (this as any)[`use${capitalize(endpoint.alias)}`] = (
            config: any,
            queryOptions: any
          ) => this.useQuery(endpoint.path as any, config, queryOptions);
        }
      }
    });
  }

  private injectMutationEndpoints() {
    HTTP_MUTATION_METHODS.forEach((method) => {
      (this as any)[`use${capitalize(method)}`] = (
        path: any,
        config: any,
        mutationOptions: any
      ) => this.useMutation(method, path, config, mutationOptions);
    });
  }

  private getEndpointByPath(method: string, path: string) {
    return this.zodios.api.find(
      (endpoint) => endpoint.method === method && endpoint.path === path
    );
  }

  private getEndpointByAlias(alias: string) {
    return this.zodios.api.find((endpoint) => endpoint.alias === alias);
  }

  /**
   * compute the key for the provided endpoint
   * @param method - HTTP method of the endpoint
   * @param path - path for the endpoint
   * @param config - parameters of the api to the endpoint - when providing no parameters, will return the common key for the endpoint
   * @returns - Key
   */
  getKeyByPath<M extends Method, Path extends ZodiosPathsByMethod<Api, Method>>(
    method: M,
    path: Path extends ZodiosPathsByMethod<Api, M> ? Path : never,
    config?: ZodiosRequestOptionsByPath<
      Api,
      M,
      Path,
      FetcherProvider,
      true,
      TypeProvider
    >
  ) {
    const endpoint = this.getEndpointByPath(method, path);
    if (!endpoint)
      throw new Error(`No endpoint found for path '${method} ${path}'`);
    if (config) {
      const params = pick(
        config as AnyZodiosMethodOptions<FetcherProvider> | undefined,
        ["params", "queries", "body"]
      );
      return [{ api: this.apiName, path: endpoint.path }, params] as QueryKey;
    }
    return [{ api: this.apiName, path: endpoint.path }] as QueryKey;
  }

  /**
   * compute the key for the provided endpoint alias
   * @param alias - alias of the endpoint
   * @param config - parameters of the api to the endpoint
   * @returns - QueryKey
   */
  getKeyByAlias<Alias extends Aliases<Api>>(
    alias: Alias extends string ? Alias : never,
    config?: Alias extends string
      ? ZodiosRequestOptionsByAlias<
          Api,
          Alias,
          FetcherProvider,
          true,
          TypeProvider
        >
      : never
  ) {
    const endpoint = this.getEndpointByAlias(alias);
    if (!endpoint) throw new Error(`No endpoint found for alias '${alias}'`);
    if (config) {
      const params = pick(
        config as AnyZodiosMethodOptions<FetcherProvider> | undefined,
        ["params", "queries", "body"]
      );
      return [{ api: this.apiName, path: endpoint.path }, params] as QueryKey;
    }
    return [{ api: this.apiName, path: endpoint.path }] as QueryKey;
  }

  useQuery<
    Path extends ZodiosPathsByMethod<Api, "get">,
    TConfig extends ZodiosRequestOptionsByPath<
      Api,
      "get",
      Path,
      FetcherProvider,
      true,
      TypeProvider
    >,
    TQueryFnData = ZodiosResponseByPath<Api, "get", Path, true, TypeProvider>,
    TData = TQueryFnData
  >(
    path: Path,
    ...[config, queryOptions]: RequiredKeys<TConfig> extends never
      ? [
          config?: ReadonlyDeep<TConfig>,
          queryOptions?: QueryOptions<TQueryFnData, TData>
        ]
      : [
          config: ReadonlyDeep<TConfig>,
          queryOptions?: QueryOptions<TQueryFnData, TData>
        ]
  ): UseQueryResult<TData, Errors> & {
    invalidate: () => Promise<void>;
    key: QueryKey;
  } {
    const params = pick(
      config as AnyZodiosMethodOptions<FetcherProvider> | undefined,
      ["params", "queries", "body"]
    );
    const key = [{ api: this.apiName, path }, params] as QueryKey;
    // @ts-expect-error
    const query = () => this.zodios.get(path, config);
    const queryClient = useQueryClient();
    const invalidate = () => queryClient.invalidateQueries(key);
    return {
      invalidate,
      key,
      // @ts-expect-error
      ...useQuery(key, query, queryOptions),
    };
  }

  useImmutableQuery<
    Path extends ZodiosPathsByMethod<Api, "post">,
    TConfig extends ZodiosRequestOptionsByPath<
      Api,
      "post",
      Path,
      FetcherProvider,
      true,
      TypeProvider
    >,
    TQueryFnData = ZodiosResponseByPath<Api, "post", Path, true, TypeProvider>,
    TData = TQueryFnData
  >(
    path: Path,
    ...[config, queryOptions]: RequiredKeys<TConfig> extends never
      ? [
          config?: ReadonlyDeep<TConfig>,
          queryOptions?: ImmutableQueryOptions<TQueryFnData, TData>
        ]
      : [
          config: ReadonlyDeep<TConfig>,
          queryOptions?: ImmutableQueryOptions<TQueryFnData, TData>
        ]
  ): UseQueryResult<TData, Errors> & {
    invalidate: () => Promise<void>;
    key: QueryKey;
  } {
    const params = pick(
      config as AnyZodiosMethodOptions<FetcherProvider> | undefined,
      ["params", "queries", "body"]
    );
    const key = [{ api: this.apiName, path }, params] as QueryKey;
    const query = () => this.zodios.post(path, config as any);
    const queryClient = useQueryClient();
    const invalidate = () => queryClient.invalidateQueries(key);
    return {
      invalidate,
      key,
      ...useQuery(key, query as any, queryOptions),
    };
  }

  useInfiniteQuery<
    Path extends ZodiosPathsByMethod<Api, "get">,
    TConfig extends ZodiosRequestOptionsByPath<
      Api,
      "get",
      Path,
      FetcherProvider,
      true,
      TypeProvider
    >,
    TQueryFnData = ZodiosResponseByPath<Api, "get", Path, true, TypeProvider>,
    TData = TQueryFnData,
    TQueryParams = ZodiosQueryParamsByPath<
      Api,
      "get",
      Path,
      true,
      TypeProvider
    > extends never
      ? never
      : keyof ZodiosQueryParamsByPath<Api, "get", Path, true, TypeProvider>
  >(
    path: Path,
    ...[config, queryOptions]: RequiredKeys<TConfig> extends never
      ? [
          config?: ReadonlyDeep<TConfig>,
          queryOptions?: InfiniteQueryOptions<TQueryFnData, TData> & {
            getPageParamList: () => (TQueryParams | PathParamNames<Path>)[];
          }
        ]
      : [
          config: ReadonlyDeep<TConfig>,
          queryOptions?: InfiniteQueryOptions<TQueryFnData, TData> & {
            getPageParamList: () => (TQueryParams | PathParamNames<Path>)[];
          }
        ]
  ): UseInfiniteQueryResult<TData, Errors> & {
    invalidate: () => Promise<void>;
    key: QueryKey;
  } {
    const params = pick(
      config as AnyZodiosMethodOptions<FetcherProvider> | undefined,
      ["params", "queries", "body"]
    );
    // istanbul ignore next
    if (params.params && queryOptions) {
      // @ts-expect-error
      params.params = omit(
        params.params,
        queryOptions.getPageParamList() as string[]
      );
    }
    if (params.queries && queryOptions) {
      // @ts-expect-error
      params.queries = omit(
        params.queries,
        queryOptions.getPageParamList() as string[]
      );
    }
    // istanbul ignore next
    if (
      params.body &&
      typeof params.body === "object" &&
      !Array.isArray(params.body) &&
      queryOptions
    ) {
      // @ts-expect-error
      params.body = omit(
        params.body,
        queryOptions.getPageParamList() as string[]
      );
    }
    const key = [{ api: this.apiName, path }, params];
    const query = ({ pageParam = undefined }: QueryFunctionContext) =>
      this.zodios.get(path, {
        ...config,
        queries: {
          ...config?.queries,
          ...pageParam?.queries,
        },
        params: {
          ...config?.params,
          ...pageParam?.params,
        },
        body:
          // istanbul ignore next
          hasObjectBody(config)
            ? {
                ...config?.body,
                ...pageParam?.body,
              }
            : config?.body,
      } as unknown as ReadonlyDeep<TConfig>);
    const queryClient = useQueryClient();
    const invalidate = () => queryClient.invalidateQueries(key);
    return {
      invalidate,
      key,
      ...useInfiniteQuery(
        key,
        query as any,
        queryOptions as Omit<typeof queryOptions, "getPageParamList">
      ),
    };
  }

  useImmutableInfiniteQuery<
    Path extends ZodiosPathsByMethod<Api, "post">,
    TConfig extends ZodiosRequestOptionsByPath<
      Api,
      "post",
      Path,
      FetcherProvider,
      true,
      TypeProvider
    >,
    TQueryFnData = ZodiosResponseByPath<Api, "post", Path, true, TypeProvider>,
    TData = TQueryFnData,
    TQueryParams = ZodiosQueryParamsByPath<
      Api,
      "post",
      Path,
      true,
      TypeProvider
    > extends never
      ? never
      : keyof ZodiosQueryParamsByPath<Api, "post", Path, true, TypeProvider>
  >(
    path: Path,
    ...[config, queryOptions]: RequiredKeys<TConfig> extends never
      ? [
          config?: ReadonlyDeep<TConfig>,
          queryOptions?: ImmutableInfiniteQueryOptions<TQueryFnData, TData> & {
            getPageParamList: () => (
              | keyof ZodiosBodyByPath<Api, "post", Path, true, TypeProvider>
              | PathParamNames<Path>
              | TQueryParams
            )[];
          }
        ]
      : [
          config: ReadonlyDeep<TConfig>,
          queryOptions?: ImmutableInfiniteQueryOptions<TQueryFnData, TData> & {
            getPageParamList: () => (
              | keyof ZodiosBodyByPath<Api, "post", Path, true, TypeProvider>
              | PathParamNames<Path>
              | TQueryParams
            )[];
          }
        ]
  ): UseInfiniteQueryResult<TData, Errors> & {
    invalidate: () => Promise<void>;
    key: QueryKey;
  } {
    const params = pick(
      config as AnyZodiosMethodOptions<FetcherProvider> | undefined,
      ["params", "queries", "body"]
    );
    // istanbul ignore next
    if (params.params && queryOptions) {
      // @ts-expect-error
      params.params = omit(
        params.params,
        queryOptions.getPageParamList() as string[]
      );
    }
    // istanbul ignore next
    if (params.queries && queryOptions) {
      // @ts-expect-error
      params.queries = omit(
        params.queries,
        queryOptions.getPageParamList() as string[]
      );
    }
    // istanbul ignore next
    if (
      params.body &&
      typeof params.body === "object" &&
      !Array.isArray(params.body) &&
      queryOptions
    ) {
      // @ts-expect-error
      params.body = omit(
        params.body,
        queryOptions.getPageParamList() as string[]
      );
    }
    const key = [{ api: this.apiName, path }, params];
    const query = ({ pageParam = undefined }: QueryFunctionContext) =>
      this.zodios.post(path, {
        ...config,
        queries: {
          ...config?.queries,
          ...pageParam?.queries,
        },
        params: {
          ...config?.params,
          ...pageParam?.params,
        },
        body:
          // istanbul ignore next
          hasObjectBody(config)
            ? {
                ...config?.body,
                ...pageParam?.body,
              }
            : config?.body,
      } as unknown as ReadonlyDeep<TConfig>);
    const queryClient = useQueryClient();
    const invalidate = () => queryClient.invalidateQueries(key);
    return {
      invalidate,
      key,
      ...useInfiniteQuery(
        key,
        // @ts-expect-error
        query,
        queryOptions as Omit<typeof queryOptions, "getPageParamList">
      ),
    };
  }

  useMutation<
    M extends Method,
    Path extends ZodiosPathsByMethod<Api, M>,
    TConfig extends Omit<
      ZodiosRequestOptionsByPath<
        Api,
        M,
        Path,
        FetcherProvider,
        true,
        TypeProvider
      >,
      "body"
    >,
    MutationVariables = UndefinedIfNever<
      ZodiosBodyByPath<Api, M, Path, true, TypeProvider>
    >
  >(
    method: M,
    path: Path,
    ...[config, mutationOptions]: RequiredKeys<TConfig> extends never
      ? [
          config?: ReadonlyDeep<TConfig>,
          mutationOptions?: MutationOptions<Api, M, Path, TypeProvider>
        ]
      : [
          config: ReadonlyDeep<TConfig>,
          mutationOptions?: MutationOptions<Api, M, Path, TypeProvider>
        ]
  ): UseMutationResult<
    ZodiosResponseByPath<Api, M, Path, true, TypeProvider>,
    Errors,
    MutationVariables
  > {
    const mutation = (body: MutationVariables) => {
      return this.zodios.request({
        ...config,
        method,
        url: path,
        body,
      } as any);
    };
    // @ts-expect-error
    return useMutation(mutation, mutationOptions);
  }

  useGet<
    Path extends ZodiosPathsByMethod<Api, "get">,
    TConfig extends ZodiosRequestOptionsByPath<
      Api,
      "get",
      Path,
      FetcherProvider,
      true,
      TypeProvider
    >,
    TQueryFnData = ZodiosResponseByPath<Api, "get", Path, true, TypeProvider>,
    TData = TQueryFnData
  >(
    path: Path,
    ...rest: RequiredKeys<TConfig> extends never
      ? [
          config?: ReadonlyDeep<TConfig>,
          queryOptions?: QueryOptions<TQueryFnData, TData>
        ]
      : [
          config: ReadonlyDeep<TConfig>,
          queryOptions?: QueryOptions<TQueryFnData, TData>
        ]
  ): UseQueryResult<TData, Errors> & {
    invalidate: () => Promise<void>;
    key: QueryKey;
  } {
    return this.useQuery(path, ...(rest as any[]));
  }
}

export type ZodiosMutationAliasHook<Body, Config, MutationOptions, Response> =
  RequiredKeys<Config> extends never
    ? (
        configOptions?: ReadonlyDeep<Config>,
        mutationOptions?: MutationOptions
      ) => UseMutationResult<Response, Errors, UndefinedIfNever<Body>, unknown>
    : (
        configOptions: ReadonlyDeep<Config>,
        mutationOptions?: MutationOptions
      ) => UseMutationResult<Response, Errors, UndefinedIfNever<Body>, unknown>;

export type ZodiosHooksAliases<
  Api extends ZodiosEndpointDefinitions,
  FetcherProvider extends AnyZodiosFetcherProvider,
  TypeProvider extends AnyZodiosTypeProvider
> = {
  [Alias in Aliases<Api> as `use${Capitalize<Alias>}`]: ZodiosEndpointDefinitionByAlias<
    Api,
    Alias
  >[number]["method"] extends infer AliasMethod
    ? AliasMethod extends MutationMethod
      ? {
          immutable: ZodiosEndpointDefinitionByAlias<
            Api,
            Alias
          >[number]["immutable"];
          method: AliasMethod;
        } extends { immutable: true; method: "post" }
        ? // immutable query
          <
            TConfig extends ZodiosRequestOptionsByAlias<
              Api,
              Alias,
              FetcherProvider,
              true,
              TypeProvider
            >,
            TQueryFnData = ZodiosResponseByAlias<
              Api,
              Alias,
              true,
              TypeProvider
            >,
            TData = ZodiosResponseByAlias<Api, Alias, true, TypeProvider>
          >(
            ...[config, queryOptions]: RequiredKeys<TConfig> extends never
              ? [
                  config?: ReadonlyDeep<TConfig>,
                  queryOptions?: ImmutableQueryOptions<TQueryFnData, TData>
                ]
              : [
                  config: ReadonlyDeep<TConfig>,
                  queryOptions?: ImmutableQueryOptions<TQueryFnData, TData>
                ]
          ) => UseQueryResult<TData, Errors> & {
            invalidate: () => Promise<void>;
            key: QueryKey;
          }
        : // useMutation
          ZodiosMutationAliasHook<
            ZodiosBodyByAlias<Api, Alias, true, TypeProvider>,
            Omit<
              ZodiosRequestOptionsByAlias<
                Api,
                Alias,
                FetcherProvider,
                true,
                TypeProvider
              >,
              "body"
            >,
            MutationOptionsByAlias<Api, Alias, TypeProvider>,
            ZodiosResponseByAlias<Api, Alias, true, TypeProvider>
          >
      : // useQuery
        <
          Config extends ZodiosRequestOptionsByAlias<
            Api,
            Alias,
            FetcherProvider,
            true,
            TypeProvider
          >,
          TQueryFnData = ZodiosResponseByAlias<Api, Alias, true, TypeProvider>,
          TData = ZodiosResponseByAlias<Api, Alias, true, TypeProvider>
        >(
          ...rest: RequiredKeys<Config> extends never
            ? [
                configOptions?: ReadonlyDeep<Config>,
                queryOptions?: QueryOptions<TQueryFnData, TData>
              ]
            : [
                configOptions: ReadonlyDeep<Config>,
                queryOptions?: QueryOptions<TQueryFnData, TData>
              ]
        ) => UseQueryResult<TData, Errors> & {
          invalidate: () => Promise<void>;
          key: QueryKey;
        }
    : never;
};

export type ZodiosHooksMutations<
  Api extends ZodiosEndpointDefinitions,
  FetcherProvider extends AnyZodiosFetcherProvider,
  TypeProvider extends AnyZodiosTypeProvider
> = {
  [M in MutationMethod as `use${Capitalize<M>}`]: <
    Path extends ZodiosPathsByMethod<Api, M>,
    TConfig extends Omit<
      ZodiosRequestOptionsByPath<
        Api,
        M,
        Path,
        FetcherProvider,
        true,
        TypeProvider
      >,
      "body"
    >,
    MutationVariables = UndefinedIfNever<
      ZodiosBodyByPath<Api, M, Path, true, TypeProvider>
    >
  >(
    path: Path,
    ...rest: RequiredKeys<TConfig> extends never
      ? [
          config?: ReadonlyDeep<TConfig>,
          mutationOptions?: MutationOptions<Api, M, Path, TypeProvider>
        ]
      : [
          config: ReadonlyDeep<TConfig>,
          mutationOptions?: MutationOptions<Api, M, Path, TypeProvider>
        ]
  ) => UseMutationResult<
    ZodiosResponseByPath<Api, M, Path, true, TypeProvider>,
    Errors,
    MutationVariables
  >;
};

export type ZodiosHooksInstance<
  Api extends ZodiosEndpointDefinitions,
  FetcherProvider extends AnyZodiosFetcherProvider,
  TypeProvider extends AnyZodiosTypeProvider
> = ZodiosHooksImpl<Api, FetcherProvider, TypeProvider> &
  ZodiosHooksAliases<Api, FetcherProvider, TypeProvider> &
  ZodiosHooksMutations<Api, FetcherProvider, TypeProvider>;

export type ZodiosHooks = {
  new <
    Api extends ZodiosEndpointDefinitions,
    FetcherProvider extends AnyZodiosFetcherProvider,
    TypeProvider extends AnyZodiosTypeProvider
  >(
    name: string,
    zodios: ZodiosInstance<Api, FetcherProvider, TypeProvider>
  ): ZodiosHooksInstance<Api, FetcherProvider, TypeProvider>;
};

export const ZodiosHooks = ZodiosHooksImpl as ZodiosHooks;
