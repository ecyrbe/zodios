import type { ZodTypeProvider } from "@zodios/core";
import { ZodiosExpressTypeProviderFactory } from "./type-provider.types";
import z from "zod";

export const zodTypeFactory: ZodiosExpressTypeProviderFactory<ZodTypeProvider> =
  {
    validate: (schema, input) => schema.safeParse(input),
    validateAsync: (schema, input) => schema.safeParseAsync(input),
    isSchemaBooleanOrNumber: (schema) => true,
  };
