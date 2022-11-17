import { AnyZodiosFetcherProvider } from "../fetcher-providers";
import { ZodiosPlugin } from "../zodios.types";
import { ZodiosPlugins } from "./zodios-plugins";

describe("ZodiosPlugins", () => {
  it("should be defined", () => {
    expect(ZodiosPlugins).toBeDefined();
  });

  it("should register one plugin", () => {
    const plugins = new ZodiosPlugins("any", "any");
    const plugin: ZodiosPlugin<AnyZodiosFetcherProvider> = {
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
    const plugin: ZodiosPlugin<AnyZodiosFetcherProvider> = {
      request: async (api, config) => config,
      response: async (api, config, response) => response,
    };
    const id = plugins.use(plugin);
    plugins.eject(id);
    expect(plugins.count()).toBe(0);
  });

  it("should replace named plugins", () => {
    const plugins = new ZodiosPlugins("any", "any");
    const plugin: ZodiosPlugin<AnyZodiosFetcherProvider> = {
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

  it("should execute response plugins consistently", async () => {
    const plugins = new ZodiosPlugins("any", "any");
    const plugin1: ZodiosPlugin<AnyZodiosFetcherProvider> = {
      request: async (api, config) => config,
      response: async (api, config, response) => {
        response.data += "1";
        return response;
      },
    };
    plugins.use(plugin1);
    const plugin2: ZodiosPlugin<AnyZodiosFetcherProvider> = {
      request: async (api, config) => config,
      response: async (api, config, response) => {
        response.data += "2";
        return response;
      },
    };
    plugins.use(plugin2);
    const response1 = await plugins.interceptResponse(
      [],
      // @ts-ignore
      {},
      Promise.resolve({ data: "test1:" })
    );
    expect(response1.data).toBe("test1:21");
    const response2 = await plugins.interceptResponse(
      [],
      // @ts-ignore
      {},
      Promise.resolve({ data: "test2:" })
    );
    expect(response2.data).toBe("test2:21");
  });

  it('should catch error if plugin "error" is defined', async () => {
    const plugins = new ZodiosPlugins("any", "any");
    const plugin: ZodiosPlugin<AnyZodiosFetcherProvider> = {
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

  it("should count plugins", () => {
    const plugins = new ZodiosPlugins("any", "any");
    const namedPlugin: (n: number) => ZodiosPlugin<AnyZodiosFetcherProvider> = (
      n
    ) => ({
      name: `test${n}`,
      request: async (api, config) => config,
      response: async (api, config, response) => response,
    });
    const plugin: ZodiosPlugin<AnyZodiosFetcherProvider> = {
      request: async (api, config) => config,
      response: async (api, config, response) => response,
    };
    plugins.use(namedPlugin(1));
    plugins.use(plugin);
    plugins.use(namedPlugin(2));
    expect(plugins.count()).toBe(3);
  });
});
