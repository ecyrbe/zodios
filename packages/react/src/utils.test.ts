import { capitalize, omit, pick } from "./utils";

describe("omit", () => {
  it("should be defined", () => {
    expect(omit).toBeDefined();
  });

  it("should support undefined parameters", () => {
    const obj: any = undefined;
    expect(omit(obj, ["a"])).toEqual({});
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

    expect(omit(obj, ["a", "b", "c"])).toEqual({});
  });
});

describe("pick", () => {
  it("should be defined", () => {
    expect(pick).toBeDefined();
  });

  it("should support undefined parameters", () => {
    const obj: any = undefined;
    expect(pick(obj, ["a"])).toEqual({});
  });

  it("should pick the given keys from the object", () => {
    const obj = {
      a: 1,
      b: 2,
      c: 3,
    };

    expect(pick(obj, ["a"])).toEqual({
      a: 1,
    });
  });

  it("should accept to pick all keys from object", () => {
    const obj = {
      a: 1,
      b: 2,
      c: 3,
    };

    expect(pick(obj, ["a", "b", "c"])).toEqual(obj);
  });

  it("should allow undefined picks", () => {
    expect(pick(undefined, ["a", "b"])).toEqual({});
  });
});

describe("capitalize", () => {
  it("should be defined", () => {
    expect(capitalize).toBeDefined();
  });

  it("should capitalize the first letter of the string", () => {
    expect(capitalize("anyway")).toEqual("Anyway");
  });

  it("should capitalize the first letter of an utf8 string", () => {
    expect(capitalize("émmanuelle")).toEqual("Émmanuelle");
  });
});
