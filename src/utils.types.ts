import { z, ZodType } from "zod";

/**
 * filter an array type by a predicate value
 * @param T - array type
 * @param C - predicate object to match
 * @details - this is using tail recursion type optimization from typescript 4.5
 */
export type FilterArrayByValue<
  T extends unknown[] | undefined,
  C,
  Acc extends unknown[] = []
> = T extends [infer Head, ...infer Tail]
  ? Head extends C
    ? FilterArrayByValue<Tail, C, [...Acc, Head]>
    : FilterArrayByValue<Tail, C, Acc>
  : Acc;

/**
 * filter an array type by key
 * @param T - array type
 * @param K - key to match
 * @details - this is using tail recursion type optimization from typescript 4.5
 */
export type FilterArrayByKey<
  T extends unknown[],
  K extends string,
  Acc extends unknown[] = []
> = T extends [infer Head, ...infer Tail]
  ? Head extends { [Key in K]: unknown }
    ? FilterArrayByKey<Tail, K, [...Acc, Head]>
    : FilterArrayByKey<Tail, K, Acc>
  : Acc;

/**
 * filter an array type by removing undefined values
 * @param T - array type
 * @details - this is using tail recursion type optimization from typescript 4.5
 */
export type DefinedArray<
  T extends unknown[],
  Acc extends unknown[] = []
> = T extends [infer Head, ...infer Tail]
  ? Head extends undefined
    ? DefinedArray<Tail, Acc>
    : DefinedArray<Tail, [Head, ...Acc]>
  : Acc;

type Try<A, B, C> = A extends B ? A : C;

type NarrowRaw<T> =
  | (T extends Function ? T : never)
  | (T extends string | number | bigint | boolean ? T : never)
  | (T extends [] ? [] : never)
  | {
      [K in keyof T]: K extends "description" ? T[K] : NarrowNotZod<T[K]>;
    };

type NarrowNotZod<T> = Try<T, ZodType, NarrowRaw<T>>;

/**
 * Utility to infer the embedded primitive type of any type
 * Same as `as const` but without setting the object as readonly and without needing the user to use it
 * @param T - type to infer the embedded type of
 * @see - thank you tannerlinsley for this idea
 */
export type Narrow<T> = Try<T, [], NarrowNotZod<T>>;

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
export type RequiredProps<T> = Omit<
  T,
  {
    [P in keyof T]-?: undefined extends T[P] ? P : never;
  }[keyof T]
>;

/**
 * get all optional properties from an object type
 * @param T - object type
 */
export type OptionalProps<T> = Pick<
  T,
  {
    [P in keyof T]-?: undefined extends T[P] ? P : never;
  }[keyof T]
>;

/**
 * get all properties from an object type that are not undefined or optional
 * @param T - object type
 * @returns - union type of all properties that are not undefined or optional
 */
export type RequiredKeys<T> = {
  [P in keyof T]-?: undefined extends T[P] ? never : P;
}[keyof T];

/**
 * Simplify a type by merging intersections if possible
 * @param T - type to simplify
 */
export type Simplify<T> = T extends unknown ? { [K in keyof T]: T[K] } : T;

/**
 * Merge two types into a single type
 * @param T - first type
 * @param U - second type
 */
export type Merge<T, U> = Simplify<T & U>;

/**
 * transform possible undefined properties from a type into optional properties
 * @param T - object type
 */
export type UndefinedToOptional<T> = Merge<
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
 * check if two types are equal
 */
export type IfEquals<T, U, Y = unknown, N = never> = (<G>() => G extends T
  ? 1
  : 2) extends <G>() => G extends U ? 1 : 2
  ? Y
  : N;

/**
 * get never if empty type
 * @param T - type
 * @example
 * ```ts
 * type A = {};
 * type B = NotEmpty<A>; // B = never
 */
export type NeverIfEmpty<T> = IfEquals<T, {}, never, T>;

/**
 * get undefined if empty type
 * @param T - type
 * @example
 * ```ts
 * type A = {};
 * type B = NotEmpty<A>; // B = never
 */
export type UndefinedIfEmpty<T> = IfEquals<T, {}, undefined, T>;

export type UndefinedIfNever<T> = IfEquals<T, never, undefined, T>;

type RequiredChildProps<T> = {
  [K in keyof T]: IfEquals<T[K], OptionalProps<T[K]>, never, K>;
}[keyof T];

export type OptionalChildProps<T> = {
  [K in keyof T]: IfEquals<T[K], OptionalProps<T[K]>, K, never>;
}[keyof T];

/**
 * set properties to optional if their child properties are optional
 * @param T - object type
 */
export type SetPropsOptionalIfChildrenAreOptional<T> = Merge<
  Pick<Partial<T>, OptionalChildProps<T>>,
  Pick<T, RequiredChildProps<T>>
>;

/**
 * transform an array type into a readonly array type
 * @param T - array type
 */
interface ReadonlyArrayDeep<T> extends ReadonlyArray<ReadonlyDeep<T>> {}

/**
 * transform an object type into a readonly object type
 * @param T - object type
 */
export type DeepReadonlyObject<T> = {
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

export type MaybeReadonly<T> = T | ReadonlyDeep<T>;

/**
 * Map a type an api description parameter to a zod infer type
 * @param T - array of api description parameters
 * @details -  this is using tail recursion type optimization from typescript 4.5
 */
export type MapSchemaParameters<
  T,
  Frontend extends boolean = true,
  Acc = {}
> = T extends [infer Head, ...infer Tail]
  ? Head extends {
      name: infer Name;
      schema: infer Schema;
    }
    ? Name extends string
      ? MapSchemaParameters<
          Tail,
          Frontend,
          Merge<
            {
              [Key in Name]: Schema extends z.ZodType<any, any, any>
                ? Frontend extends true
                  ? z.input<Schema>
                  : z.output<Schema>
                : never;
            },
            Acc
          >
        >
      : Acc
    : Acc
  : Acc;

/**
 * Split string into a tuple, using a simple string literal separator
 * @description - This is a simple implementation of split, it does not support multiple separators
 *  A more complete implementation is built on top of this one
 * @param Str - String to split
 * @param Sep - Separator, must be a string literal not a union of string literals
 * @returns Tuple of strings
 */
export type Split<
  Str,
  Sep extends string,
  Acc extends string[] = []
> = Str extends ""
  ? Acc
  : Str extends `${infer T}${Sep}${infer U}`
  ? Split<U, Sep, [...Acc, T]>
  : [...Acc, Str];

type ConcatSplits<
  Parts extends string[],
  Seps extends string[],
  Acc extends string[] = []
> = Parts extends [infer First extends string, ...infer Rest extends string[]]
  ? ConcatSplits<Rest, Seps, [...Acc, ...SplitMany<First, Seps>]>
  : Acc;

/**
 * Split a string into a tuple.
 * @param Str - The string to split.
 * @param Sep - The separators to split on, a tuple of strings with one or more characters.
 * @returns The tuple of each split. if sep is an empty string, returns a tuple of each character.
 */
export type SplitMany<
  Str extends string,
  Sep extends string[],
  Acc extends string[] = []
> = Sep extends [
  infer FirstSep extends string,
  ...infer RestSep extends string[]
]
  ? ConcatSplits<Split<Str, FirstSep>, RestSep>
  : [Str, ...Acc];

type PathSeparator = ["/", "?", "&", "#", "=", "(", ")", "[", "]", "%"];

type FilterParams<Params, Acc extends string[] = []> = Params extends [
  infer First,
  ...infer Rest
]
  ? First extends `:${infer Param}`
    ? FilterParams<Rest, [...Acc, ...Split<Param, ":">]>
    : FilterParams<Rest, Acc>
  : Acc;

/**
 * Extract Path Params from a path
 * @param Path - Path to extract params from
 * @returns Path params
 * @example
 * ```ts
 * type Path = "/users/:id/posts/:postId"
 * type PathParams = ApiPathToParams<Path>
 * // output: ["id", "postId"]
 * ```
 */
export type ApiPathToParams<Path extends string> = FilterParams<
  SplitMany<Path, PathSeparator>
>;

/**
 * get all parameters from an API path
 * @param Path - API path
 * @details - this is using tail recursion type optimization from typescript 4.5
 */
export type PathParamNames<Path> = Path extends string
  ? ApiPathToParams<Path>[number]
  : never;

/**
 * Check if two type are equal else generate a compiler error
 * @param T - type to check
 * @param U - type to check against
 * @returns true if types are equal else a detailed compiler error
 */
export type Assert<T, U> = IfEquals<
  T,
  U,
  true,
  { error: "Types are not equal"; type1: T; type2: U }
>;

export type PickRequired<T, K extends keyof T> = Merge<T, { [P in K]-?: T[P] }>;

/**
 * Flatten a tuple type one level
 * @param T - tuple type
 * @returns flattened tuple type
 *
 * @example
 * ```ts
 * type T0 = TupleFlat<[1, 2, [3, 4], 5]>; // T0 = [1, 2, 3, 4, 5]
 * ```
 */
export type TupleFlat<T, Acc extends unknown[] = []> = T extends [
  infer Head,
  ...infer Tail
]
  ? Head extends unknown[]
    ? TupleFlat<Tail, [...Acc, ...Head]>
    : TupleFlat<Tail, [...Acc, Head]>
  : Acc;

/**
 * trick to combine multiple unions of objects into a single object
 * only works with objects not primitives
 * @param union - Union of objects
 * @returns Intersection of objects
 */
export type UnionToIntersection<union> = (
  union extends any ? (k: union) => void : never
) extends (k: infer intersection) => void
  ? intersection
  : never;
/**
 * get last element of union
 * @param Union - Union of any types
 * @returns Last element of union
 */
type GetUnionLast<Union> = UnionToIntersection<
  Union extends any ? () => Union : never
> extends () => infer Last
  ? Last
  : never;

/**
 * Convert union to tuple
 * @param Union - Union of any types, can be union of complex, composed or primitive types
 * @returns Tuple of each elements in the union
 */
export type UnionToTuple<Union, Tuple extends unknown[] = []> = [
  Union
] extends [never]
  ? Tuple
  : UnionToTuple<
      Exclude<Union, GetUnionLast<Union>>,
      [GetUnionLast<Union>, ...Tuple]
    >;
