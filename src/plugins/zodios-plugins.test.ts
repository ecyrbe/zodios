import { ZodiosPlugin } from "../zodios.types";
import { ZodiosPlugins } from "./zodios-plugins";

describe("ZodiosPlugins", () => {
  it("should be defined", () => {
    expect(ZodiosPlugins).toBeDefined();
  });

  it("should register one plugin", () => {
    const plugins = new ZodiosPlugins("any", "any");
    const plugin: ZodiosPlugin = {
      request: async (api, config) => config,
      response: async (api, config, response) => response,
    };
    const id = plugins.use(plugin);
    expect(id.key).toBe("any-any");
    expect(id.value).toBe(0);
    expect(plugins.count()).toBe(1);
  });

  it("should unregister one plugin", () => {
    const plugins = new ZodiosPlugins("any", "any");
    const plugin: ZodiosPlugin = {
      request: async (api, config) => config,
      response: async (api, config, response) => response,
    };
    const id = plugins.use(plugin);
    plugins.eject(id);
    expect(plugins.count()).toBe(0);
  });

  it("should replace named plugins", () => {
    const plugins = new ZodiosPlugins("any", "any");
    const plugin: ZodiosPlugin = {
      name: "test",
      request: async (api, config) => config,
      response: async (api, config, response) => response,
    };
    plugins.use(plugin);
    plugins.use(plugin);
    expect(plugins.count()).toBe(1);
  });

  it("should throw if plugin is not registered", () => {
    const plugins = new ZodiosPlugins("any", "any");
    const id = { key: "test-any", value: 5 };
    expect(() => plugins.eject(id)).toThrowError(
      `Plugin with key 'test-any' is not registered for endpoint 'any-any'`
    );
  });

  it("should throw if named plugin is not registered", () => {
    const plugins = new ZodiosPlugins("any", "any");
    expect(() => plugins.eject("test")).toThrowError(
      `Plugin with name 'test' not found`
    );
  });

  it('should catch error if plugin "error" is defined', async () => {
    const plugins = new ZodiosPlugins("any", "any");
    const plugin: ZodiosPlugin = {
      request: async (api, config) => config,
      // @ts-ignore
      error: async (api, config, error) => ({ test: true }),
    };
    plugins.use(plugin);
    const response = await plugins.interceptResponse(
      [],
      // @ts-ignore
      { method: "any", url: "any" },
      Promise.reject(new Error("test"))
    );
    expect(response).toEqual({ test: true });
  });
});
