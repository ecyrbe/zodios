import {
  AnyZodiosTypeProvider,
  ZodiosRuntimeTypeProvider,
} from "./type-provider.types";

export interface IoTsTypeProvider
  extends AnyZodiosTypeProvider<{ _A: unknown; _O: unknown }> {
  input: this["schema"]["_O"];
  output: this["schema"]["_A"];
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
