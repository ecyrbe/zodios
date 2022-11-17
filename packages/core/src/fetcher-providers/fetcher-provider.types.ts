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
  options: any;
  config: any;
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

export type ZodiosRuntimeFetcherProvider<
  FetcherProvider extends AnyZodiosFetcherProvider
> = {
  readonly _provider?: FetcherProvider;
  baseURL?: string;
  create(options: any): void;
  fetch(params: any): Promise<any>;
};
