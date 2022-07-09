/**
 * Custom Zodios Error with additional information
 * @param message - the error message
 * @param response - the response object from axios
 * @param config - the config object from zodios
 * @param cause - the error cause
 */
export class ZodiosError extends Error {
  constructor(
    message: string,
    public readonly config?: unknown,
    public readonly response?: unknown,
    public readonly cause?: Error
  ) {
    super(message);
  }
}
