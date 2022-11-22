import { Narrow } from "@zodios/core/lib/utils.types";
import type {
  ZodiosEndpointDefinitions,
  ZodiosOptions,
  AnyZodiosTypeProvider,
  TypeOfFetcherOptions,
  ZodiosInstance,
  ZodTypeProvider,
} from "@zodios/core";
import { ZodiosCore } from "@zodios/core";
import { fetchProvider, FetchProvider } from "./fetch-provider";

function ZodiosFetch(...args: any[]) {
  if (args.length !== 0) {
    let options: ZodiosOptions<FetchProvider> = args[args.length - 1];
    if (!Array.isArray(options) && typeof options === "object") {
      args[args.length - 1] = { ...options, fetcherProvider: fetchProvider };
    } else {
      args.push({ fetcherProvider: fetchProvider });
    }
  }
  // @ts-ignore
  return new ZodiosCore(...args);
}

export interface Zodios {
  new <
    Api extends ZodiosEndpointDefinitions,
    TypeProvider extends AnyZodiosTypeProvider = ZodTypeProvider
  >(
    api: Narrow<Api>,
    options?: Omit<
      ZodiosOptions<FetchProvider, TypeProvider>,
      "fetcherProvider"
    > &
      TypeOfFetcherOptions<FetchProvider>
  ): ZodiosInstance<Api, FetchProvider, TypeProvider>;
  new <
    Api extends ZodiosEndpointDefinitions,
    TypeProvider extends AnyZodiosTypeProvider = ZodTypeProvider
  >(
    baseUrl: string,
    api: Narrow<Api>,
    options?: Omit<
      ZodiosOptions<FetchProvider, TypeProvider>,
      "fetcherProvider"
    > &
      TypeOfFetcherOptions<FetchProvider>
  ): ZodiosInstance<Api, FetchProvider, TypeProvider>;
}

const Zodios = ZodiosFetch as unknown as Zodios;

export { Zodios };
