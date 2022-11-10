import * as t from "io-ts";
import * as Either from "fp-ts/Either";
import {
  AnyZodiosTypeProvider,
  ZodiosDynamicTypeProvider,
} from "./type-provider.types";

export interface IoTsTypeProvider extends AnyZodiosTypeProvider {
  input: this["schema"] extends t.Type<any> ? t.InputOf<this["schema"]> : never;
  output: this["schema"] extends t.Type<any>
    ? t.OutputOf<this["schema"]>
    : never;
}

export const ioTsTypeProvider: ZodiosDynamicTypeProvider<IoTsTypeProvider> = {
  validate: (schema: t.Type<any>, input: unknown) => {
    const result = schema.decode(input);
    return Either.isRight(result)
      ? { success: true, data: result.right }
      : { success: false, error: result.left };
  },
  validateAsync: async (schema: t.Type<any>, input: unknown) => {
    const result = schema.decode(input);
    return Either.isRight(result)
      ? { success: true, data: result.right }
      : { success: false, error: result.left };
  },
};
