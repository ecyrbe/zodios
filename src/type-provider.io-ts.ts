import {
  AnyZodiosTypeProvider,
  ZodiosRuntimeTypeProvider,
} from "./type-provider.types";

export interface IoTsTypeProvider extends AnyZodiosTypeProvider {
  input: this["schema"] extends { _I: unknown } ? this["schema"]["_I"] : never;
  output: this["schema"] extends { _O: unknown } ? this["schema"]["_O"] : never;
}

export const ioTsTypeProvider: ZodiosRuntimeTypeProvider<IoTsTypeProvider> = {
  validate: (schema, input) => {
    const result = schema.decode(input);
    return result._tag === "Right"
      ? { success: true, data: result.right }
      : { success: false, error: result.left };
  },
  validateAsync: async (schema, input) => {
    const result = schema.decode(input);
    return result._tag === "Right"
      ? { success: true, data: result.right }
      : { success: false, error: result.left };
  },
};
