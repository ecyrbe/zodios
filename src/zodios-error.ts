import { ReadonlyDeep } from "./utils.types";
import { AnyZodiosRequestOptions } from "./zodios.types";

/**
 * Custom Zodios Error with additional information
 * @param message - the error message
 * @param data - the parameter or response object that caused the error
 * @param config - the config object from zodios
 * @param cause - the error cause
 */
export class ZodiosError extends Error {
  constructor(
    message: string,
    public readonly config?: ReadonlyDeep<AnyZodiosRequestOptions>,
    public readonly data?: unknown,
    public readonly cause?: Error
  ) {
    super(message);
  }
}

export const ZodiosMatchingErrorType = {
  ValidationError: "ZodiosValidationError",
  UnexpectedError: "ZodiosUnexpectedError",
  ExpectedError: "ZodiosExpectedError",
  UnknownError: "UnknownError",
  Error: "Error",
} as const;
