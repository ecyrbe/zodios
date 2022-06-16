import type {
  FilterArrayByValue,
  IfEquals,
  FilterArrayByKey,
} from "./utils.types";

type Assert<T, U> = IfEquals<
  T,
  U,
  true,
  { error: "Types are not equal"; type1: T; type2: U }
>;

describe("utils.types", () => {
  describe("FilterArrayByValue", () => {
    it("should support empty array", () => {
      type Input = [];
      const test: Assert<FilterArrayByValue<Input, { a: number }>, []> = true;
    });

    it("should filter typed Array by value in declared order", () => {
      type Input = [
        { a: number; b: string },
        { a: number; c: boolean },
        { c: boolean },
        { d: string },
        { e: number }
      ];
      const test1: Assert<
        FilterArrayByValue<Input, { a: number }>,
        [{ a: number; b: string }, { a: number; c: boolean }]
      > = true;
      const test2: Assert<
        FilterArrayByValue<Input, { c: boolean }>,
        [{ a: number; c: boolean }, { c: boolean }]
      > = true;
      const test3: Assert<
        FilterArrayByValue<Input, { d: string }>,
        [{ d: string }]
      > = true;
      const test4: Assert<
        FilterArrayByValue<Input, { e: number }>,
        [{ e: number }]
      > = true;
    });
  });

  describe("FilterArrayByKey", () => {
    it("should support empty array", () => {
      type Input = [];
      const test: Assert<FilterArrayByKey<Input, "a">, []> = true;
    });
    it("should filter typed Array by key in declared order", () => {
      type Input = [
        { a: number; b: string },
        { a: number; c: boolean },
        { c: boolean },
        { d: string },
        { e: number }
      ];
      const test1: Assert<
        FilterArrayByKey<Input, "a">,
        [{ a: number; b: string }, { a: number; c: boolean }]
      > = true;
      const test2: Assert<
        FilterArrayByKey<Input, "c">,
        [{ a: number; c: boolean }, { c: boolean }]
      > = true;
      const test3: Assert<FilterArrayByKey<Input, "d">, [{ d: string }]> = true;
      const test4: Assert<FilterArrayByKey<Input, "e">, [{ e: number }]> = true;
    });
  });
});
