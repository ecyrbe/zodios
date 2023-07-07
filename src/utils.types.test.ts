import type {
  Assert,
  FilterArrayByValue,
  FilterArrayByKey,
} from "./utils.types";
import {SplitBy, PathParamNames} from "./utils.types";

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

  describe("PathParamNames", () => {
    it("should support empty string", () => {
      type Input = [];
      const test: Assert<PathParamNames<"">, never> = true;
    });
    it("should extract params from path", () => {
      const test: Assert<PathParamNames<"/endpoint/:param1/:param2/rest">, "param1" | "param2"> = true;
    });
    it("should extract multiple params one after another from path", () => {
      const test: Assert<PathParamNames<"/endpoint/:param1:param2/rest">, "param1" | "param2"> = true;
    });
    it("should extract param when encoded colon is in path", () => {
      const test1: Assert<PathParamNames<"/endpoint/:param1%3Aaction">, "param1"> = true;
      const test2: Assert<PathParamNames<"/endpoint/:param1%3Aaction:param2">, "param1" | "param2"> = true;
    });
  });

  describe("SplitBy", () => {
    it("should support empty string", () => {
      type Input = [];
      const test1: Assert<SplitBy<"", ":">, never> = true;
      const test2: Assert<SplitBy<"", "">, never> = true;
    });
    it("should split by given separator", () => {
      const test1: Assert<SplitBy<"param1:param2", ":">, "param1" | "param2"> = true;
      const test2: Assert<SplitBy<"param1:param2:param3", ":">, "param1" | "param2" | "param3"> = true;
      const test3: Assert<SplitBy<"param1|param2", "|">, "param1" | "param2"> = true;
      const test4: Assert<SplitBy<"param1:param2|param3", ":">, "param1" | "param2|param3"> = true;
      const test5: Assert<SplitBy<"param1:param2", "">, never> = true;
      const test6: Assert<SplitBy<"param1|param2", ":">, "param1|param2"> = true;
      const test7: Assert<SplitBy<":param2", ":">, "" | "param2"> = true;
    });
  });
});
