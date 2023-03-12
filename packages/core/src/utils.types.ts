/**
 * filter an array type by a predicate value
 * @param T - array type
 * @param C - predicate object to match
 * @details - this is using tail recursion type optimization from typescript 4.5
 */
export type FilterArrayByValue<
  T extends readonly unknown[] | unknown[] | undefined,
  C,
  Acc extends unknown[] = []
> = T extends readonly [infer Head, ...infer Tail]
  ? Head extends C
    ? FilterArrayByValue<Tail, C, [...Acc, Head]>
    : FilterArrayByValue<Tail, C, Acc>
  : T extends [infer Head, ...infer Tail]
  ? Head extends C
    ? FilterArrayByValue<Tail, C, [...Acc, Head]>
    : FilterArrayByValue<Tail, C, Acc>
  : Acc;

type Test = FilterArrayByValue<
  readonly [{ hello: "world"; world: "hello" }, { hello: "world" }],
  { hello: "world" }
>;

/**
 * filter an array type by key
 * @param T - array type
 * @param K - key to match
 * @details - this is using tail recursion type optimization from typescript 4.5
 */
export type FilterArrayByKey<
  T extends readonly unknown[] | unknown[],
  K extends string,
  Acc extends unknown[] = []
> = T extends readonly [infer Head, ...infer Tail]
  ? Head extends { [Key in K]: unknown }
    ? FilterArrayByKey<Tail, K, [...Acc, Head]>
    : FilterArrayByKey<Tail, K, Acc>
  : T extends [infer Head, ...infer Tail]
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
  T extends readonly unknown[] | unknown[],
  Acc extends unknown[] = []
> = T extends readonly [infer Head, ...infer Tail]
  ? Head extends undefined
    ? DefinedArray<Tail, Acc>
    : DefinedArray<Tail, [Head, ...Acc]>
  : T extends [infer Head, ...infer Tail]
  ? Head extends undefined
    ? DefinedArray<Tail, Acc>
    : DefinedArray<Tail, [Head, ...Acc]>
  : Acc;

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

/**
 * set properties to optional if their child properties are optional
 * @param T - object type
 */
export type TransitiveOptional<T> = UndefinedToOptional<{
  [k in keyof T]: RequiredKeys<T[k]> extends never ? T[k] | undefined : T[k];
}>;

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
 * get all parameters from an API path
 * @param Path - API path
 * @details - this is using tail recursion type optimization from typescript 4.5
 */
export type PathParamNames<
  Path,
  Acc = never
> = Path extends `${string}:${infer Name}/${infer R}`
  ? PathParamNames<R, Name | Acc>
  : Path extends `${string}:${infer Name}`
  ? Name | Acc
  : Acc;

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
