export interface AnyZodiosTypeProvider {
  schema: unknown;
  input: unknown;
  output: unknown;
}

export type InferInputTypeFromSchema<
  F extends AnyZodiosTypeProvider,
  Schema
> = (F & { schema: Schema })["input"];
export type InferOutputTypeFromSchema<
  F extends AnyZodiosTypeProvider,
  Schema
> = (F & { schema: Schema })["output"];

export type ZodiosValidateResult =
  | { success: true; data: any }
  | { success: false; error: any };

export type ZodiosDynamicTypeProvider<
  TypeProvider extends AnyZodiosTypeProvider
> = {
  _provider?: TypeProvider;
  validate: (schema: any, input: unknown) => ZodiosValidateResult;
  validateAsync: (schema: any, input: unknown) => Promise<ZodiosValidateResult>;
};
