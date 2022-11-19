import { findEndpoint } from "../utils";
import { ZodiosError } from "../zodios-error";
import type { AnyZodiosTypeProvider } from "../type-providers";
import type { ZodiosOptions, ZodiosPlugin } from "../zodios.types";
import { AnyZodiosFetcherProvider } from "../fetcher-providers";

type Options<
  FetcherProvider extends AnyZodiosFetcherProvider,
  TypeProvider extends AnyZodiosTypeProvider
> = Required<
  Pick<
    ZodiosOptions<FetcherProvider, TypeProvider>,
    "validate" | "transform" | "sendDefaults" | "typeProvider"
  >
>;

function shouldResponse(option: string | boolean) {
  return [true, "response", "all"].includes(option);
}

function shouldRequest(option: string | boolean) {
  return [true, "request", "all"].includes(option);
}

/**
 * Zod validation plugin used internally by Zodios.
 * By default zodios always validates the response.
 * @returns zod-validation plugin
 */
export function zodValidationPlugin<
  FetcherProvider extends AnyZodiosFetcherProvider,
  TypeProvider extends AnyZodiosTypeProvider
>({
  validate,
  transform,
  sendDefaults,
  typeProvider,
}: Options<FetcherProvider, TypeProvider>): ZodiosPlugin<FetcherProvider> {
  return {
    name: "zod-validation",
    request: shouldRequest(validate)
      ? async (api, config) => {
          const endpoint = findEndpoint(api, config.method, config.url);
          if (!endpoint) {
            throw new Error(
              `No endpoint found for ${config.method} ${config.url}`
            );
          }
          const { parameters } = endpoint;
          if (!parameters) {
            return config;
          }
          const conf = {
            ...config,
            queries: {
              ...config.queries,
            },
            headers: {
              ...config.headers,
            },
            params: {
              ...config.params,
            },
            body: config.body,
          };
          const paramsOf = {
            Query: (name: string) => conf.queries?.[name],
            Body: (_: string) => conf.body,
            Header: (name: string) => conf.headers?.[name],
            Path: (name: string) => conf.params?.[name],
          };
          const setParamsOf = {
            Query: (name: string, value: any) => (conf.queries![name] = value),
            Body: (_: string, value: any) => (conf.body = value),
            Header: (name: string, value: any) => (conf.headers![name] = value),
            Path: (name: string, value: any) => (conf.params![name] = value),
          };
          const transformRequest = shouldRequest(transform);
          for (const parameter of parameters) {
            const { name, schema, type } = parameter;
            const value = paramsOf[type](name);
            if (sendDefaults || value !== undefined) {
              const parsed = await typeProvider.validateAsync(schema, value);
              if (!parsed.success) {
                throw new ZodiosError(
                  `Zodios: Invalid ${type} parameter '${name}'`,
                  config,
                  value,
                  parsed.error
                );
              }
              if (transformRequest) {
                setParamsOf[type](name, parsed.data);
              }
            }
          }
          return conf;
        }
      : undefined,
    response: shouldResponse(validate)
      ? async (api, config, response) => {
          const endpoint = findEndpoint(api, config.method, config.url);
          /* istanbul ignore next */
          if (!endpoint) {
            throw new Error(
              `No endpoint found for ${config.method} ${config.url}`
            );
          }
          if (
            typeof response.headers?.get === "function"
              ? (response.headers.get("content-type") as string)?.includes?.(
                  "application/json"
                )
              : response.headers?.["content-type"]?.includes?.(
                  "application/json"
                )
          ) {
            const parsed = await typeProvider.validateAsync(
              endpoint.response,
              response.data
            );
            if (!parsed.success) {
              throw new ZodiosError(
                `Zodios: Invalid response from endpoint '${endpoint.method} ${
                  endpoint.path
                }'\nstatus: ${response.status} ${
                  response.statusText
                }\ncause:\n${
                  parsed.error.message ?? JSON.stringify(parsed.error)
                }\nreceived:\n${JSON.stringify(response.data, null, 2)}`,
                config,
                response.data,
                parsed.error
              );
            }
            if (shouldResponse(transform)) {
              response.data = parsed.data;
            }
          }
          return response;
        }
      : undefined,
  };
}
