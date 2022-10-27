import { AxiosError } from "axios";
import { findEndpointErrorsByAlias, findEndpointErrorsByPath } from "./utils";
import {
  Method,
  ZodiosAliases,
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

export function isErrorFromPath<
  Api extends ZodiosEndpointDefinitions,
  M extends Method,
  Path extends ZodiosPathsByMethod<Api, M>
>(
  api: Api,
  method: M,
  path: Path,
  error: unknown
): error is ZodiosMatchingErrorsByPath<Api, M, Path> {
  return isDefinedError(error, (err) =>
    findEndpointErrorsByPath(api, method, path, err)
  );
}

export function isErrorFromAlias<
  Api extends ZodiosEndpointDefinitions,
  Alias extends keyof ZodiosAliases<Api>
>(
  api: Api,
  alias: Alias,
  error: unknown
): error is ZodiosMatchingErrorsByAlias<Api, Alias> {
  return isDefinedError(error, (err) =>
    findEndpointErrorsByAlias(api, alias, err)
  );
}
