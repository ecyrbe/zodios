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
import { axiosProvider, AxiosProvider } from "./axios-provider";

function ZodiosAxios(...args: any[]) {
  if (args.length !== 0) {
    let options: ZodiosOptions<AxiosProvider> = args[args.length - 1];
    if (!Array.isArray(options) && typeof options === "object") {
      args[args.length - 1] = { ...options, fetcherProvider: axiosProvider };
    } else {
      args.push({ fetcherProvider: axiosProvider });
    }
  }
  // @ts-ignore
  return new ZodiosCore(...args);
}

export type ZodiosAxiosConstructor = {
  new <
    Api extends ZodiosEndpointDefinitions,
    TypeProvider extends AnyZodiosTypeProvider = ZodTypeProvider
  >(
    api: Narrow<Api>,
    options?: ZodiosOptions<AxiosProvider, TypeProvider> &
      TypeOfFetcherOptions<AxiosProvider>
  ): ZodiosInstance<Api, AxiosProvider, TypeProvider>;
  new <
    Api extends ZodiosEndpointDefinitions,
    TypeProvider extends AnyZodiosTypeProvider = ZodTypeProvider
  >(
    baseUrl: string,
    api: Narrow<Api>,
    options?: ZodiosOptions<AxiosProvider, TypeProvider> &
      TypeOfFetcherOptions<AxiosProvider>
  ): ZodiosInstance<Api, AxiosProvider, TypeProvider>;
};

const Zodios = ZodiosAxios as unknown as ZodiosAxiosConstructor;

export { Zodios };
