import { ZodiosError } from "../zodios-error";
import type { ZodiosOptions, ZodiosPlugin } from "../zodios.types";
import { findEndpoint } from "./zodios-plugins.utils";

/**
 * Zod validation plugin used internally by Zodios.
 * By default zodios always validates the response.
 * @returns zod-validation plugin
 */
export function zodValidationPlugin(
  validate?: ZodiosOptions["validate"]
): ZodiosPlugin {
  return {
    name: "zod-validation",
    request:
      validate === true || validate === "all" || validate === "request"
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
            };
            const paramsOf = {
              Query: (name: string) => conf.queries?.[name],
              Body: (_: string) => conf.data,
              Header: (name: string) => conf.headers?.[name],
              Path: (name: string) => conf.params?.[name],
            };
            const setParamsOf = {
              Query: (name: string, value: any) =>
                (conf.queries![name] = value),
              Body: (_: string, value: any) => (conf.data = value),
              Header: (name: string, value: any) =>
                (conf.headers![name] = value),
              Path: (name: string, value: any) => (conf.params![name] = value),
            };
            for (const parameter of parameters) {
              const { name, schema, type } = parameter;
              const value = paramsOf[type](name);
              if (value) {
                const parsed = await schema.safeParseAsync(value);
                if (!parsed.success) {
                  throw new ZodiosError(
                    `Zodios: Invalid ${type} parameter '${name}'`,
                    config,
                    value,
                    parsed.error
                  );
                }
                setParamsOf[type](name, parsed.data);
              }
            }
            return conf;
          }
        : undefined,
    response:
      validate === true || validate === "all" || validate === "response"
        ? async (api, config, response) => {
            const endpoint = findEndpoint(api, config.method, config.url);
            /* istanbul ignore next */
            if (!endpoint) {
              throw new Error(
                `No endpoint found for ${config.method} ${config.url}`
              );
            }
            if (
              response.headers?.["content-type"]?.includes("application/json")
            ) {
              const parsed = await endpoint.response.safeParseAsync(
                response.data
              );
              if (!parsed.success) {
                throw new ZodiosError(
                  `Zodios: Invalid response from endpoint '${endpoint.method} ${
                    endpoint.path
                  }'\nstatus: ${response.status} ${
                    response.statusText
                  }\ncause:\n${
                    parsed.error.message
                  }\nreceived:\n${JSON.stringify(response.data, null, 2)}`,
                  config,
                  response.data,
                  parsed.error
                );
              }
              response.data = parsed.data;
            }
            return response;
          }
        : undefined,
  };
}
