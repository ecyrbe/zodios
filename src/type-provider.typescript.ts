import {
  AnyZodiosTypeProvider,
  ZodiosRuntimeTypeProvider,
  ZodiosValidateResult,
} from "./type-provider.types";

const parse = (data: unknown): ZodiosValidateResult => ({
  success: true,
  data,
});

const genericTsSchema = {
  parse,
};
/**
 * A basic typescript schema provider
 * @returns
 */
export const tsSchema = <Schema extends any>(): {
  readonly _schema: Schema;
  parse: (input: unknown) => ZodiosValidateResult;
} => genericTsSchema as any;

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
