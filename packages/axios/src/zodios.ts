import type {
  ZodiosEndpointDefinition,
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
    const Api extends readonly ZodiosEndpointDefinition[] | ZodiosEndpointDefinition[],
    TypeProvider extends AnyZodiosTypeProvider = ZodTypeProvider
  >(
    api: Api,
    options?: Omit<
      ZodiosOptions<AxiosProvider, TypeProvider>,
      "fetcherFactory"
    > &
      TypeOfFetcherOptions<AxiosProvider>
  ): ZodiosInstance<Api, AxiosProvider, TypeProvider>;
  new <
    const Api extends readonly ZodiosEndpointDefinition[] | ZodiosEndpointDefinition[],
    TypeProvider extends AnyZodiosTypeProvider = ZodTypeProvider
  >(
    baseUrl: string,
    api: Api,
    options?: Omit<
      ZodiosOptions<AxiosProvider, TypeProvider>,
      "fetcherFactory"
    > &
      TypeOfFetcherOptions<AxiosProvider>
  ): ZodiosInstance<Api, AxiosProvider, TypeProvider>;
}

const Zodios = ZodiosAxios as Zodios;

export { Zodios };
