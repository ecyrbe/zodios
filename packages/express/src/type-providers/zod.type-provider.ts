import type { ZodTypeProvider } from "@zodios/core";
import { ZodiosExpressTypeProviderFactory } from "./type-provider.types";
import { z } from "zod";

// istanbul ignore next
export function isZodType(
  t: z.ZodTypeAny,
  type: z.ZodFirstPartyTypeKind
): boolean {
  if (t._def?.typeName === type) {
    return true;
  }
  if (
    t._def?.typeName === z.ZodFirstPartyTypeKind.ZodEffects &&
    (t as z.ZodEffects<any>)._def.effect.type === "refinement"
  ) {
    return isZodType((t as z.ZodEffects<any>).innerType(), type);
  }
  if (t._def?.innerType) {
    return isZodType(t._def?.innerType, type);
  }
  return false;
}

export const zodTypeFactory: ZodiosExpressTypeProviderFactory<ZodTypeProvider> =
  {
    validate: (schema, input) => schema.safeParse(input),
    validateAsync: (schema, input) => schema.safeParseAsync(input),
    isSchemaString: (schema) =>
      isZodType(schema, z.ZodFirstPartyTypeKind.ZodString),
  };
