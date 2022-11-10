import {
  AnyZodiosTypeProvider,
  ZodiosRuntimeTypeProvider,
  ZodiosValidateResult,
} from "./type-provider.types";

const genericTsSchema = {
  parse: (data: unknown): ZodiosValidateResult => ({
    success: true,
    data,
  }),
};

type TsSchema<Schema> = {
  readonly _schema: Schema;
  parse: (input: unknown) => ZodiosValidateResult;
};

/**
 * A basic typescript schema provider
 * @returns
 */
export const tsSchema = <Schema>(): TsSchema<Schema> => genericTsSchema as any;

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
