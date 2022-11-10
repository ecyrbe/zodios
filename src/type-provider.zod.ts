import { z } from "zod";
import {
  AnyZodiosTypeProvider,
  ZodiosDynamicTypeProvider,
} from "./type-provider.types";

export interface ZodTypeProvider extends AnyZodiosTypeProvider {
  input: this["schema"] extends z.ZodTypeAny ? z.input<this["schema"]> : never;
  output: this["schema"] extends z.ZodTypeAny
    ? z.output<this["schema"]>
    : never;
}

export const zodTypeProvider: ZodiosDynamicTypeProvider<ZodTypeProvider> = {
  validate: (schema, input) => schema.safeParse(input),
  validateAsync: (schema: z.ZodTypeAny, input: unknown) =>
    schema.safeParseAsync(input),
};
