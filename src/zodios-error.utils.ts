import { AxiosError } from "axios";
import { findEndpointErrorsByAlias, findEndpointErrorsByPath } from "./utils";
import {
  Aliases,
  Method,
  ZodiosEndpointDefinitions,
  ZodiosEndpointError,
  ZodiosMatchingErrorsByAlias,
  ZodiosMatchingErrorsByPath,
  ZodiosPathsByMethod,
} from "./zodios.types";

function isDefinedError(
  error: unknown,
  findEndpointErrors: (error: AxiosError) => ZodiosEndpointError[] | undefined
): boolean {
  if (
    error instanceof AxiosError ||
    (error && typeof error === "object" && "isAxiosError" in error)
  ) {
    const err = error as AxiosError;
    if (err.response) {
      const endpointErrors = findEndpointErrors(err);
      if (endpointErrors) {
        return endpointErrors.some(
          (desc) => desc.schema.safeParse(err.response!.data).success
        );
      }
    }
  }
  return false;
}

/**
 * check if the error is matching the endpoint errors definitions
 * @param api - the api definition
 * @param method - http method of the endpoint
 * @param path - path of the endpoint
 * @param error - the error to check
 * @returns - if true, the error type is narrowed to the matching endpoint errors
 */
export function isErrorFromPath<
  Api extends ZodiosEndpointDefinitions,
  M extends Method,
  Path extends ZodiosPathsByMethod<Api, M>
>(
  api: Api,
  method: M,
  path: Path,
  error: unknown,
  params: Record<string, unknown> = {}
): error is ZodiosMatchingErrorsByPath<Api, M, Path> {
  return isDefinedError(error, (err) =>
    findEndpointErrorsByPath(api, method, path, err, params)
  );
}

/**
 * check if the error is matching the endpoint errors definitions
 * @param api - the api definition
 * @param alias - alias of the endpoint
 * @param error - the error to check
 * @returns - if true, the error type is narrowed to the matching endpoint errors
 */
export function isErrorFromAlias<
  Api extends ZodiosEndpointDefinitions,
  Alias extends Aliases<Api>
>(
  api: Api,
  alias: Alias,
  error: unknown,
  params: Record<string, unknown> = {}
): error is ZodiosMatchingErrorsByAlias<Api, Alias> {
  return isDefinedError(error, (err) =>
    findEndpointErrorsByAlias(api, alias, err, params)
  );
}
