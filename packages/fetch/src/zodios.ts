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
import { fetchFactory, FetchProvider } from "./fetch-provider";

function isZodiosOptions(
  lastArg: unknown
): lastArg is ZodiosOptions<FetchProvider> {
  return !Array.isArray(lastArg) && typeof lastArg === "object";
}

const ZodiosFetch = new Proxy(ZodiosCore, {
  construct: (target, args) => {
    if (args.length !== 0) {
      let lastArg = args[args.length - 1];
      if (isZodiosOptions(lastArg)) {
        lastArg.fetcherFactory = fetchFactory;
      } else {
        args.push({ fetcherFactory: fetchFactory });
      }
    }
    // @ts-ignore
    return new target(...args);
  },
});

export interface Zodios {
  new <
    Api extends ZodiosEndpointDefinitions,
    TypeProvider extends AnyZodiosTypeProvider = ZodTypeProvider
  >(
    api: Narrow<Api>,
    options?: Omit<
      ZodiosOptions<FetchProvider, TypeProvider>,
      "fetcherFactory"
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
      "fetcherFactory"
    > &
      TypeOfFetcherOptions<FetchProvider>
  ): ZodiosInstance<Api, FetchProvider, TypeProvider>;
}

const Zodios = ZodiosFetch as Zodios;

export { Zodios };
