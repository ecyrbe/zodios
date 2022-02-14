import { z } from "zod";

/**
 * filter an array type by a predicate
 * @param T - array type
 * @param C - predicate object to match
 */
export type FilterArray<T, C> = T extends readonly [infer F, ...infer R]
  ? F extends Readonly<C>
    ? [F, ...FilterArray<R, C>]
    : FilterArray<R, C>
  : [];

/**
 * merge all union types into a single type
 * @param T - union type
 */
export type MergeUnion<T> = (
  T extends unknown ? (k: T) => void : never
) extends (k: infer I) => void
  ? { [K in keyof I]: I[K] }
  : never;

/**
 * get all required properties from an object type
 * @param T - object type
 */
type RequiredProps<T> = Omit<
  T,
  {
    [P in keyof T]-?: undefined extends T[P] ? P : never;
  }[keyof T]
>;

/**
 * get all optional properties from an object type
 * @param T - object type
 */
type OptionalProps<T> = Pick<
  T,
  {
    [P in keyof T]-?: undefined extends T[P] ? P : never;
  }[keyof T]
>;

/**
 * merge two types into a single type
 * @param T - first type
 * @param U - second type
 */
type MergeSimplify<T, U> = MergeUnion<T | U>;

/**
 * transform possible undefined properties from a type into optional properties
 * @param T - object type
 */
export type UndefinedToOptional<T> = MergeSimplify<
  RequiredProps<T>,
  Partial<OptionalProps<T>>
>;

/**
 * remove all the never properties from a type object
 * @param T - object type
 */
export type PickDefined<T> = Pick<
  T,
  { [K in keyof T]: T[K] extends never ? never : K }[keyof T]
>;

/**
 * remove empty object union from a type
 * @param T - type
 * @example
 * ```ts
 * type A = { a: number } | {};
 * type B = NotEmpty<A>; // { a: number }
 */
export type NotEmpty<T> = {} extends Required<OptionalProps<T>>
  ? {} extends RequiredProps<T>
    ? never
    : T
  : T;

/**
 * transform an array type into a readonly array type
 * @param T - array type
 */
interface ReadonlyArrayDeep<T> extends ReadonlyArray<ReadonlyDeep<T>> {}

/**
 * transform an object type into a readonly object type
 * @param T - object type
 */
type DeepReadonlyObject<T> = {
  readonly [P in keyof T]: ReadonlyDeep<T[P]>;
};

/**
 * transform a type into a readonly type
 * @param T - type
 */
export type ReadonlyDeep<T> = T extends (infer R)[]
  ? ReadonlyArrayDeep<R>
  : T extends Function
  ? T
  : T extends object
  ? DeepReadonlyObject<T>
  : T;

/**
 * Map a type an api description parameter to a zod infer type
 * @param T - array of api description parameters
 */
export type MapSchemaParameters<T> = T extends readonly [infer F, ...infer R]
  ? F extends Readonly<{
      name: infer Name;
      schema: z.ZodType<infer Z>;
    }>
    ? Name extends string
      ?
          | {
              [Key in Name]: Z;
            }
          | MapSchemaParameters<R>
      : never
    : never
  : never;

/**
 * split template type string with '/' separator into a tuple of strings
 * @param T - template type string
 * @param S - separator
 */
export type SplitTemplateType<
  T,
  C extends string = "/"
> = T extends `${infer F}${C}${infer R}`
  ? [F, ...SplitTemplateType<R, C>]
  : [T];

/**
 * Trim away a type string from each element of an array of template type string
 * @param T - type string
 * @param C - type string
 */
export type TrimLeftArray<T, C extends string> = T extends readonly [
  infer F,
  ...infer R
]
  ? F extends `${C}${infer U}`
    ? [U, ...TrimLeftArray<R, C>]
    : [F, ...TrimLeftArray<R, C>]
  : [];

/**
 * Extract params prefixed with ':' from a type string URL
 * @param T - type string URL
 */
export type Params<T extends string> = TrimLeftArray<
  FilterArray<SplitTemplateType<T>, `:${string}`>,
  ":"
>;

export type ParamsToObject<T> = T extends [infer F, ...infer R]
  ? F extends string
    ? MergeSimplify<
        {
          [Key in F]: string | number;
        },
        ParamsToObject<R>
      >
    : ParamsToObject<R>
  : {};
