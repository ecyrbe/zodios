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
    public readonly config?: unknown,
    public readonly data?: unknown,
    public readonly cause?: Error
  ) {
    super(message);
  }
}
