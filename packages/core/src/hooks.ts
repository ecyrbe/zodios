import {
  AnyZodiosFetcherProvider,
  ZodiosRuntimeFetcherProvider,
} from "./fetcher-providers/fetcher-provider.types";

export const hooks: {
  fetcherProvider?: ZodiosRuntimeFetcherProvider<AnyZodiosFetcherProvider>;
} = {};

export function setFetcherHook(
  provider: ZodiosRuntimeFetcherProvider<AnyZodiosFetcherProvider>
) {
  hooks.fetcherProvider = provider;
}

export function clearFetcherHook() {
  hooks.fetcherProvider = undefined;
}
