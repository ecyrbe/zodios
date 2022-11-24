import {
  AnyZodiosFetcherProvider,
  ZodiosRuntimeFetcherProvider,
} from "./fetcher-providers/fetcher-provider.types";

export const hooks: {
  fetcherProvider?: ZodiosRuntimeFetcherProvider<AnyZodiosFetcherProvider>;
} = {};
