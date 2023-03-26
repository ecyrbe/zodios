import { z } from "zod";

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

export function withoutTransform(t: z.ZodTypeAny): z.ZodTypeAny {
  if (t._def?.typeName === z.ZodFirstPartyTypeKind.ZodEffects) {
    return withoutTransform((t as z.ZodEffects<any>).innerType());
  }
  return t;
}
