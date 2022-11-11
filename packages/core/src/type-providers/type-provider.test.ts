import {
  ioTsTypeProvider,
  zodTypeProvider,
  tsTypeProvider,
  tsSchema,
  tsFnSchema,
} from "./index";
import * as t from "io-ts";
import z from "zod";
import assert from "assert";

describe("type-provider", () => {
  describe("io-ts", () => {
    it("should validate", async () => {
      const schema = t.type({
        name: t.string,
      });
      const result = ioTsTypeProvider.validate(schema, { name: "test" });
      assert(result.success);
      expect(result.data).toEqual({ name: "test" });
      const result2 = await ioTsTypeProvider.validateAsync(schema, {
        name: "test",
      });
      assert(result2.success);
      expect(result2.data).toEqual({ name: "test" });
    });
  });
  it("should not validate", async () => {
    const schema = t.type({
      name: t.string,
    });
    const result = ioTsTypeProvider.validate(schema, { names: "test" });
    assert(!result.success);
    expect(result.error).toBeDefined();
    const result2 = await ioTsTypeProvider.validateAsync(schema, {
      name: 2,
    });
    assert(!result2.success);
    expect(result2.error).toBeDefined();
  });
  describe("zod", () => {
    it("should validate", () => {
      const schema = z.object({
        name: z.string(),
      });
      const result = zodTypeProvider.validate(schema, { name: "test" });
      assert(result.success);
      expect(result.data).toEqual({ name: "test" });
    });
  });
  it("should not validate", () => {
    const schema = z.object({
      name: z.string(),
    });
    const result = zodTypeProvider.validate(schema, { names: "test" });
    assert(!result.success);
    expect(result.error).toBeDefined();
  });
  describe("ts", () => {
    it("should validate", async () => {
      const schema = tsSchema<{ name: string }>();
      const result = tsTypeProvider.validate(schema, { name: "test" });
      assert(result.success);
      expect(result.data).toEqual({ name: "test" });
      const result2 = await tsTypeProvider.validateAsync(schema, {
        name: "test",
      });
      assert(result2.success);
      expect(result2.data).toEqual({ name: "test" });
    });
  });
  it("should not validate", () => {
    const schema = tsFnSchema((data) => {
      if (!data || typeof data !== "object") throw new Error("not an object");
      if (!("name" in data)) throw new Error("missing name");
      // @ts-ignore
      const { name } = data;
      if (typeof name !== "string") throw new Error("name is not a string");
      return data;
    });
    const result = tsTypeProvider.validate(schema, { names: "test" });
    assert(!result.success);
  });
});
