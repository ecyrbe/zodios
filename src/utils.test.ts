import { omit } from "./utils";

describe("omit", () => {
  it("should be defined", () => {
    expect(omit).toBeDefined();
  });

  it("should remove the given keys from the object", () => {
    const obj = {
      a: 1,
      b: 2,
      c: 3,
    };

    expect(omit(obj, ["a"])).toEqual({
      b: 2,
      c: 3,
    });
  });

  it("should accept to remove all keys from object", () => {
    const obj = {
      a: 1,
      b: 2,
      c: 3,
    };

    expect(omit(obj, ["a","b","c"])).toEqual({});
  });

});
