import { AxiosError } from "axios";
import {
  AnyZodiosTypeProvider,
  ZodiosRuntimeTypeProvider,
} from "./type-provider.types";
import { ZodTypeProvider, zodTypeProvider } from "./type-provider.zod";
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

function isDefinedError<
  TypeProvider extends AnyZodiosTypeProvider = ZodTypeProvider
>(
  error: unknown,
  typeProvider: ZodiosRuntimeTypeProvider<TypeProvider> = zodTypeProvider as any,
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
          (desc) =>
            typeProvider.validate(desc.schema, err.response!.data).success
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
  Path extends ZodiosPathsByMethod<Api, M>,
  TypeProvider extends AnyZodiosTypeProvider = ZodTypeProvider
>(
  api: Api,
  method: M,
  path: Path,
  error: unknown,
  typeProvider: ZodiosRuntimeTypeProvider<TypeProvider> = zodTypeProvider as any
): error is ZodiosMatchingErrorsByPath<Api, M, Path, TypeProvider> {
  return isDefinedError(error, typeProvider, (err) =>
    findEndpointErrorsByPath(api, method, path, err)
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
  Alias extends Aliases<Api>,
  TypeProvider extends AnyZodiosTypeProvider = ZodTypeProvider
>(
  api: Api,
  alias: Alias,
  error: unknown,
  typeProvider: ZodiosRuntimeTypeProvider<TypeProvider> = zodTypeProvider as any
): error is ZodiosMatchingErrorsByAlias<Api, Alias, TypeProvider> {
  return isDefinedError(error, typeProvider, (err) =>
    findEndpointErrorsByAlias(api, alias, err)
  );
}
