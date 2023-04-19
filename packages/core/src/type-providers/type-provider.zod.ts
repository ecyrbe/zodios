import {
  AnyZodiosTypeProvider,
  ZodiosRuntimeTypeProvider,
} from "./type-provider.types";

export interface ZodTypeProvider
  extends AnyZodiosTypeProvider<{ _input: unknown; _output: unknown }> {
  input: this["schema"]["_input"];
  output: this["schema"]["_output"];
}

export const zodTypeProvider: ZodiosRuntimeTypeProvider<ZodTypeProvider> = {
  validate: (schema, input) => schema.safeParse(input),
  validateAsync: (schema, input) => schema.safeParseAsync(input),
};
