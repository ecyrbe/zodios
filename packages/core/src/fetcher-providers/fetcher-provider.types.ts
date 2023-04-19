import { Merge, ReadonlyDeep } from "../utils.types";
import { AnyZodiosRequestOptions } from "../zodios.types";

/**
 * A type provider for Fetcher
 * allows to define request, response and error types for a fetcher
 */
export interface AnyZodiosFetcherProvider {
  /**
   * inputs types to call fetcher
   */
  arg1: unknown;
  arg2: unknown;

  /**
   * config types to call fetcher
   */
  options: unknown;
  config: unknown;
  response: any;
  error: any;
}

export type TypeOfFetcherConfig<
  FetcherProvider extends AnyZodiosFetcherProvider
> = FetcherProvider["config"];

export type TypeOfFetcherError<
  FetcherProvider extends AnyZodiosFetcherProvider,
  Response,
  Status
> = (FetcherProvider & {
  arg1: Response;
  arg2: Status;
})["error"];

export type TypeOfFetcherResponse<
  FetcherProvider extends AnyZodiosFetcherProvider
> = FetcherProvider["response"];

export type TypeOfFetcherOptions<
  FetcherProvider extends AnyZodiosFetcherProvider
> = FetcherProvider["options"];

export interface ZodiosFetcher<
  FetcherProvider extends AnyZodiosFetcherProvider
> {
  baseURL?: string;
  fetch(
    config: ReadonlyDeep<AnyZodiosRequestOptions<FetcherProvider>>
  ): Promise<TypeOfFetcherResponse<FetcherProvider>>;
}

export type ZodiosFetcherFactoryOptions<
  FetcherProvider extends AnyZodiosFetcherProvider
> = Merge<
  {
    baseURL?: string;
  },
  TypeOfFetcherOptions<FetcherProvider>
>;

export type ZodiosFetcherFactory<
  FetcherProvider extends AnyZodiosFetcherProvider
> = (
  options?: ZodiosFetcherFactoryOptions<FetcherProvider>
) => ZodiosFetcher<FetcherProvider>;
