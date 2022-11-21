import {
  AnyZodiosFetcherProvider,
  ZodiosRuntimeFetcherProvider,
} from "./fetcher-provider.types";

export const defaults: {
  fetcherProvider?: ZodiosRuntimeFetcherProvider<AnyZodiosFetcherProvider>;
} = {};
