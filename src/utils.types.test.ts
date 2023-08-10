import type {
  Assert,
  FilterArrayByValue,
  FilterArrayByKey,
  PathParamNames,
} from "./utils.types";

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
      type Input = PathParamNames<"">;
      //    ^?
      const test: Assert<PathParamNames<"">, never> = true;
    });
    it("should extract params from path", () => {
      type Input = PathParamNames<"/endpoint/:param1/:param2/rest">;
      //    ^?
      const test: Assert<Input, "param1" | "param2"> = true;
    });
    it("should extract multiple params one after another from path", () => {
      type Input = PathParamNames<"/endpoint/:param1:param2/rest">;
      //    ^?
      const test: Assert<Input, "param1" | "param2"> = true;
    });
    it("should extract param when encoded colon is in path", () => {
      type Input1 = PathParamNames<"/endpoint/:param1%3Aaction">;
      //    ^?
      const test1: Assert<Input1, "param1"> = true;
      type Input2 = PathParamNames<"/endpoint/:param1%action:param2">;
      //    ^?
      const test2: Assert<Input2, "param1" | "param2"> = true;
    });

    it("should allow path params in query string", () => {
      type Input = PathParamNames<"/endpoint/:param1?:param2">;
      //    ^?
      const test: Assert<Input, "param1" | "param2"> = true;
    });

    it("should allow params between parenthesis", () => {
      type Input = PathParamNames<"/endpoint/:param1/(:param2)">;
      //    ^?
      const test: Assert<Input, "param1" | "param2"> = true;
    });
  });
});
