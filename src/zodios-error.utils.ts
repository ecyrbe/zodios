import { AxiosError } from "axios";
import { findEndpointErrorByAlias, findEndpointErrorByPath } from "./utils";
import { Merge } from "./utils.types";
import { ZodiosError, ZodiosMatchingErrorType } from "./zodios-error";
import {
  Method,
  ZodiosAliases,
  ZodiosEndpointDefinitions,
  ZodiosEndpointError,
  ZodiosMatchingErrorsByAlias,
  ZodiosMatchingErrorsByPath,
  ZodiosPathsByMethod,
} from "./zodios.types";

function matchError(
  error: unknown,
  findEndpoint: (error: AxiosError) => ZodiosEndpointError | undefined
) {
  if (error instanceof ZodiosError) {
    return { type: ZodiosMatchingErrorType.ValidationError, error };
  }
  if (
    error instanceof AxiosError ||
    (error && typeof error === "object" && "isAxiosError" in error)
  ) {
    const err = error as AxiosError;
    if (err.response) {
      const endpointError = findEndpoint(err);
      if (endpointError) {
        const result = endpointError.schema.safeParse(err.response!.data);
        if (result.success) {
          return {
            type: ZodiosMatchingErrorType.ExpectedError,
            error: err,
            status: err.response.status,
          } as any;
        }
      }
    }
    return { type: ZodiosMatchingErrorType.UnexpectedError, error: err };
  }
  if (error instanceof Error) {
    return { type: ZodiosMatchingErrorType.Error, error };
  }
  return { type: ZodiosMatchingErrorType.UnknownError, error };
}

export function matchErrorByPath<
  Api extends ZodiosEndpointDefinitions,
  M extends Method,
  Path extends ZodiosPathsByMethod<Api, M>
>(
  api: Api,
  method: M,
  path: Path,
  error: unknown
):
  | {
      type: typeof ZodiosMatchingErrorType.ValidationError;
      error: ZodiosError;
    }
  | {
      type: typeof ZodiosMatchingErrorType.UnexpectedError;
      error: AxiosError;
    }
  | Merge<
      { type: typeof ZodiosMatchingErrorType.ExpectedError },
      ZodiosMatchingErrorsByPath<Api, M, Path>
    >
  | { type: typeof ZodiosMatchingErrorType.Error; error: Error }
  | { type: typeof ZodiosMatchingErrorType.UnknownError; error: unknown } {
  if (error instanceof ZodiosError) {
    return { type: ZodiosMatchingErrorType.ValidationError, error };
  }
  return matchError(error, (e) =>
    findEndpointErrorByPath(api, method, path, e)
  );
}

export function matchErrorByAlias<
  Api extends ZodiosEndpointDefinitions,
  Alias extends keyof ZodiosAliases<Api>
>(
  api: Api,
  alias: Alias,
  error: unknown
):
  | {
      type: typeof ZodiosMatchingErrorType.ValidationError;
      error: ZodiosError;
    }
  | {
      type: typeof ZodiosMatchingErrorType.UnexpectedError;
      error: AxiosError;
    }
  | Merge<
      { type: typeof ZodiosMatchingErrorType.ExpectedError },
      ZodiosMatchingErrorsByAlias<Api, Alias>
    >
  | { type: typeof ZodiosMatchingErrorType.Error; error: Error }
  | { type: typeof ZodiosMatchingErrorType.UnknownError; error: unknown } {
  return matchError(error, (e) => findEndpointErrorByAlias(api, alias, e));
}
