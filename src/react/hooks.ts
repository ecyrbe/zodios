import {
  useQuery,
  UseQueryOptions,
  useMutation,
  UseMutationOptions,
  MutationFunction,
} from "react-query";
import { Zodios } from "../zodios";
import {
  ZodiosEnpointDescriptions,
  AnyZodiosMethodOptions,
  Paths,
  ZodiosMethodOptions,
  Method,
  ZodiosRequestOptions,
  Response,
  Body,
} from "../zodios.types";
import { pick } from "../utils";

export class ZodiosHooks<Api extends ZodiosEnpointDescriptions> {
  constructor(
    private readonly apiName: string,
    private readonly zodios: Zodios<Api>
  ) {}

  useQuery<Path extends Paths<Api, "get">>(
    path: Path,
    config?: ZodiosMethodOptions<Api, "get", Path>,
    queryOptions?: Omit<UseQueryOptions, "queryKey" | "queryFn">
  ) {
    const params = pick(config as AnyZodiosMethodOptions | undefined, [
      "params",
      "queries",
    ]);
    const keys = [this.apiName, path, params];
    const query = () => this.zodios.get(path, config);
    type QueryOptions =
      | Omit<
          UseQueryOptions<Awaited<ReturnType<typeof query>>>,
          "queryKey" | "queryFn"
        >
      | undefined;
    return useQuery(keys, query, queryOptions as QueryOptions);
  }

  useMutation<M extends Method, Path extends Paths<Api, M>>(
    method: M,
    path: Path,
    mutationOptions?: UseMutationOptions
  ) {
    type MutationVariables = {
      data: Body<Api, M, Path>;
      config?: ZodiosMethodOptions<Api, M, Path>;
    };

    const mutation: MutationFunction<
      Response<Api, M, Path>,
      MutationVariables
    > = ({ data, config }: MutationVariables) => {
      return this.zodios.request({
        ...config,
        method,
        url: path,
        data,
      } as unknown as ZodiosRequestOptions<Api, "post", Path>);
    };
    type MutationOptions = Omit<
      UseMutationOptions<
        Awaited<Response<Api, M, Path>>,
        unknown,
        MutationVariables
      >,
      "mutationFn"
    >;
    return useMutation(mutation, mutationOptions as MutationOptions);
  }

  useGet<Path extends Paths<Api, "get">>(
    path: Path,
    config?: ZodiosMethodOptions<Api, "get", Path>,
    queryOptions?: Omit<UseQueryOptions, "queryKey" | "queryFn">
  ) {
    return this.useQuery(path, config, queryOptions);
  }

  usePost<Path extends Paths<Api, "post">>(
    path: Path,
    mutationOptions?: UseMutationOptions
  ) {
    return this.useMutation("post", path, mutationOptions);
  }

  usePut<Path extends Paths<Api, "put">>(
    path: Path,
    mutationOptions?: UseMutationOptions
  ) {
    return this.useMutation("put", path, mutationOptions);
  }

  usePatch<Path extends Paths<Api, "patch">>(
    path: Path,
    mutationOptions?: UseMutationOptions
  ) {
    return this.useMutation("patch", path, mutationOptions);
  }

  useDelete<Path extends Paths<Api, "delete">>(
    path: Path,
    mutationOptions?: UseMutationOptions
  ) {
    return this.useMutation("delete", path, mutationOptions);
  }
}
