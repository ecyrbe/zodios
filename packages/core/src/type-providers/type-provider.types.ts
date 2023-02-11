export interface AnyZodiosTypeProvider<Schema = unknown> {
  schema: Schema;
  input: unknown;
  output: unknown;
}

export type InferInputTypeFromSchema<
  TypeProvider extends AnyZodiosTypeProvider,
  Schema
> = (TypeProvider & { schema: Schema })["input"];

export type InferOutputTypeFromSchema<
  TypeProvider extends AnyZodiosTypeProvider,
  Schema
> = (TypeProvider & { schema: Schema })["output"];

export type ZodiosValidateResult =
  | { success: true; data: any }
  | { success: false; error: any };

export interface ZodiosRuntimeTypeProvider<
  TypeProvider extends AnyZodiosTypeProvider
> {
  readonly _provider?: TypeProvider;
  validate: (schema: any, input: unknown) => ZodiosValidateResult;
  validateAsync: (schema: any, input: unknown) => Promise<ZodiosValidateResult>;
}
