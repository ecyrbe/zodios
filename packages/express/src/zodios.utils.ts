import { z } from "zod";

type MapPrefixPath<
  T extends readonly unknown[],
  PrefixValue extends string,
  ACC extends unknown[] = []
> = T extends readonly [infer Head, ...infer Tail]
  ? MapPrefixPath<
      Tail,
      PrefixValue,
      [
        ...ACC,
        {
          [K in keyof Head]: K extends "path"
            ? Head[K] extends string
              ? `${PrefixValue}${Head[K]}`
              : Head[K]
            : Head[K];
        }
      ]
    >
  : ACC;

export function prefixApi<Prefix extends string, Api extends readonly any[]>(
  prefix: Prefix,
  api: Api
) {
  return api.map((endpoint) => ({
    ...endpoint,
    path: `${prefix}${endpoint.path}`,
  })) as MapPrefixPath<Api, Prefix>;
}

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
