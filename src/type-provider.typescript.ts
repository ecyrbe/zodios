import {
  AnyZodiosTypeProvider,
  ZodiosRuntimeTypeProvider,
  ZodiosValidateResult,
} from "./type-provider.types";

/**
 * A basic typescript schema provider
 * @returns
 */
export const tsSchema = <Schema extends any>(): {
  readonly _schema: Schema;
  parse: (input: unknown) => ZodiosValidateResult;
} => {
  return {
    _schema: undefined as Schema,
    parse: (data) => {
      return { success: true, data };
    },
  };
};

export interface TsTypeProvider extends AnyZodiosTypeProvider {
  input: this["schema"] extends { _schema: unknown }
    ? this["schema"]["_schema"]
    : never;
  output: this["schema"] extends { _schema: unknown }
    ? this["schema"]["_schema"]
    : never;
}

export const tsTypeProvider: ZodiosRuntimeTypeProvider<TsTypeProvider> = {
  validate: (schema, input) => schema.parse(input),
  validateAsync: (schema, input) => schema.parse(input),
};
