import { AnyZodiosFetcherProvider } from "../fetcher-providers";
import { tsSchema } from "../type-providers";
import { ZodiosEndpointDefinition, ZodiosPlugin } from "../zodios.types";
import { ZodiosPlugins } from "./zodios-plugins";

const testEndpoint: ZodiosEndpointDefinition = {
  method: "get",
  path: "/test",
  alias: "getTest",
  response: tsSchema<{ test: string }>(),
};

describe("ZodiosPlugins", () => {
  it("should be defined", () => {
    expect(ZodiosPlugins).toBeDefined();
  });

  it("should register one plugin", () => {
    const plugins = new ZodiosPlugins();
    const plugin: ZodiosPlugin<AnyZodiosFetcherProvider> = {
      request: async (endpoint, config) => config,
      response: async (endpoint, config, response) => response,
    };
    const id = plugins.use({}, plugin);
    expect(id).toBe(0);
  });

  it("should unregister one plugin", () => {
    const plugins = new ZodiosPlugins();
    const plugin: ZodiosPlugin<AnyZodiosFetcherProvider> = {
      request: async (api, config) => config,
      response: async (api, config, response) => response,
    };
    const id = plugins.use({}, plugin);
    plugins.eject(id);
    // @ts-ignore
    expect(plugins.plugins.filter((filter) => filter.plugin).length).toBe(0);
  });

  it("should execute response plugins consistently", async () => {
    const plugins = new ZodiosPlugins();
    const plugin1: ZodiosPlugin<AnyZodiosFetcherProvider> = {
      request: async (api, config) => config,
      response: async (api, config, response) => {
        response.data += "1";
        return response;
      },
    };
    plugins.use({}, plugin1);
    const plugin2: ZodiosPlugin<AnyZodiosFetcherProvider> = {
      request: async (api, config) => config,
      response: async (api, config, response) => {
        response.data += "2";
        return response;
      },
    };
    plugins.use({}, plugin2);
    const response1 = await plugins.interceptResponse(
      testEndpoint,
      // @ts-ignore
      {},
      Promise.resolve({ data: "test1:" })
    );
    expect(response1.data).toBe("test1:21");
    const response2 = await plugins.interceptResponse(
      testEndpoint,
      // @ts-ignore
      {},
      Promise.resolve({ data: "test2:" })
    );
    expect(response2.data).toBe("test2:21");
  });

  it('should catch error if plugin "error" is defined', async () => {
    const plugins = new ZodiosPlugins();
    const plugin: ZodiosPlugin<AnyZodiosFetcherProvider> = {
      request: async (api, config) => config,
      error: async (api, config, error) => ({ test: true }),
    };
    plugins.use({}, plugin);
    const response = await plugins.interceptResponse(
      testEndpoint,
      // @ts-ignore
      { method: "any", url: "any" },
      Promise.reject(new Error("test"))
    );
    expect(response).toEqual({ test: true });
  });
});
