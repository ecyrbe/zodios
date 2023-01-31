import { AnyZodiosFetcherProvider } from "../fetcher-providers";
import { ZodiosPlugin } from "../zodios.types";

export type PluginId = number;

export const PluginPriorities = {
  low: "low",
  normal: "normal",
  high: "high",
} as const;

export const PLUGIN_PRIORITIES_REQUEST = [
  PluginPriorities.high,
  PluginPriorities.normal,
  PluginPriorities.low,
] as const;

export const PLUGIN_PRIORITIES_RESPONSE = [
  PluginPriorities.low,
  PluginPriorities.normal,
  PluginPriorities.high,
] as const;

export type PluginPriority = keyof typeof PluginPriorities;

export type ZodiosPluginFilters = {
  method?: string | RegExp | ((method: string) => boolean);
  path?: string | RegExp | ((path: string) => boolean);
  alias?: string | RegExp | ((alias: string) => boolean);
};

export type ZodiosPluginRegistration<
  FetcherProvider extends AnyZodiosFetcherProvider
> = {
  priority: PluginPriority;
  filter: ZodiosPluginFilters;
  plugin?: ZodiosPlugin<FetcherProvider>;
};

export type RequiredZodiosPluginRegistration<
  FetcherProvider extends AnyZodiosFetcherProvider
> = {
  priority: PluginPriority;
  filter: ZodiosPluginFilters;
  plugin: Required<ZodiosPlugin<FetcherProvider>>;
};
