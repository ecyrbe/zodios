import {
  AnyZodiosFetcherProvider,
  ZodiosFetcher,
} from "./fetcher-providers/fetcher-provider.types";

export const hooks: {
  fetcher?: ZodiosFetcher<any>;
} = {};

export function setFetcherHook<Provider extends AnyZodiosFetcherProvider>(
  fetcher: ZodiosFetcher<Provider>
) {
  hooks.fetcher = fetcher;
}

export function clearFetcherHook() {
  hooks.fetcher = undefined;
}
