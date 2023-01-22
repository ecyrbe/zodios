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
import { axiosFactory, AxiosProvider } from "./axios-provider";

function isZodiosOptions(
  lastArg: unknown
): lastArg is ZodiosOptions<AxiosProvider> {
  return !Array.isArray(lastArg) && typeof lastArg === "object";
}

const ZodiosAxios = new Proxy(ZodiosCore, {
  construct(target, args) {
    if (args.length !== 0) {
      let lastArg = args[args.length - 1];
      if (isZodiosOptions(lastArg)) {
        lastArg.fetcherFactory = axiosFactory;
      } else {
        args.push({ fetcherFactory: axiosFactory });
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
      ZodiosOptions<AxiosProvider, TypeProvider>,
      "fetcherFactory"
    > &
      TypeOfFetcherOptions<AxiosProvider>
  ): ZodiosInstance<Api, AxiosProvider, TypeProvider>;
  new <
    Api extends ZodiosEndpointDefinitions,
    TypeProvider extends AnyZodiosTypeProvider = ZodTypeProvider
  >(
    baseUrl: string,
    api: Narrow<Api>,
    options?: Omit<
      ZodiosOptions<AxiosProvider, TypeProvider>,
      "fetcherFactory"
    > &
      TypeOfFetcherOptions<AxiosProvider>
  ): ZodiosInstance<Api, AxiosProvider, TypeProvider>;
}

const Zodios = ZodiosAxios as Zodios;

export { Zodios };
