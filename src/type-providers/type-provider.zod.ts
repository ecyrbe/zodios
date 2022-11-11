import {
  AnyZodiosTypeProvider,
  ZodiosRuntimeTypeProvider,
} from "./type-provider.types";

export interface ZodTypeProvider extends AnyZodiosTypeProvider {
  input: this["schema"] extends { _input: unknown }
    ? this["schema"]["_input"]
    : never;
  output: this["schema"] extends { _output: unknown }
    ? this["schema"]["_output"]
    : never;
}

export const zodTypeProvider: ZodiosRuntimeTypeProvider<ZodTypeProvider> = {
  validate: (schema, input) => schema.safeParse(input),
  validateAsync: (schema, input) => schema.safeParseAsync(input),
};
