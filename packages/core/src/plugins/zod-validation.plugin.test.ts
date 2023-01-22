import { z } from "zod";
import { apiBuilder } from "../api";
import { ReadonlyDeep } from "../utils.types";
import { AnyZodiosRequestOptions } from "../zodios.types";
import { zodValidationPlugin } from "./zod-validation.plugin";
import { zodTypeProvider } from "../type-providers";
import { AnyZodiosFetcherProvider } from "../fetcher-providers";

describe("zodValidationPlugin", () => {
  const plugin = zodValidationPlugin({
    validate: true,
    transform: true,
    sendDefaults: false,
    typeProvider: zodTypeProvider,
  });
  const pluginWithDefaults = zodValidationPlugin({
    validate: true,
    transform: true,
    sendDefaults: true,
    typeProvider: zodTypeProvider,
  });
  const pluginWithoutTransform = zodValidationPlugin({
    validate: true,
    transform: false,
    sendDefaults: false,
    typeProvider: zodTypeProvider,
  });

  describe("request", () => {
    it("should be defined", () => {
      expect(plugin.request).toBeDefined();
    });

    it("should throw if endpoint is not found", async () => {
      await expect(
        plugin.request!(api, notExistingConfig)
      ).rejects.toThrowError("No endpoint found for get /notExisting");
    });

    it("should verify parameters", async () => {
      const transformed = await plugin.request!(
        api,
        createSampleConfig("/parse")
      );

      expect(transformed.body).toBe("123");
      expect(transformed.queries).toStrictEqual({
        sampleQueryParam: "456",
      });
      expect(transformed.headers).toStrictEqual({
        sampleHeader: "789",
      });
    });

    it("should transform parameters", async () => {
      const transformed = await plugin.request!(
        api,
        createSampleConfig("/transform")
      );

      expect(transformed.body).toBe("123_transformed");
      expect(transformed.queries).toStrictEqual({
        sampleQueryParam: "456_transformed",
      });
      expect(transformed.headers).toStrictEqual({
        sampleHeader: "789_transformed",
      });
    });

    it("should transform empty string parameters", async () => {
      const transformed = await plugin.request!(
        api,
        createEmptySampleConfig("/transform")
      );

      expect(transformed.body).toBe("_transformed");
      expect(transformed.queries).toStrictEqual({
        sampleQueryParam: "_transformed",
      });
      expect(transformed.headers).toStrictEqual({
        sampleHeader: "_transformed",
      });
    });

    it("should generate default parameter when generateDefaults is activated", async () => {
      const defaulted = await pluginWithDefaults.request!(
        api,
        createUndefinedSampleConfig("/defaults")
      );

      expect(defaulted.queries).toStrictEqual({
        sampleQueryParam: "defaultQueryParam",
      });
      expect(defaulted.headers).toStrictEqual({
        sampleHeader: "defaultHeader",
      });
    });

    it("should not transform parameters when transform is disabled", async () => {
      const notTransformed = await pluginWithoutTransform.request!(
        api,
        createSampleConfig("/transform")
      );

      expect(notTransformed.body).toBe("123");
      expect(notTransformed.queries).toStrictEqual({
        sampleQueryParam: "456",
      });
      expect(notTransformed.headers).toStrictEqual({
        sampleHeader: "789",
      });
    });

    it("should transform parameters (async)", async () => {
      const transformed = await plugin.request!(
        api,
        createSampleConfig("/transformAsync")
      );

      expect(transformed.body).toBe("123_transformed");
      expect(transformed.queries).toStrictEqual({
        sampleQueryParam: "456_transformed",
      });
      expect(transformed.headers).toStrictEqual({
        sampleHeader: "789_transformed",
      });
    });

    it("should not transform parameters (async) when transform is disabled", async () => {
      const notTransformed = await pluginWithoutTransform.request!(
        api,
        createSampleConfig("/transformAsync")
      );

      expect(notTransformed.body).toBe("123");
      expect(notTransformed.queries).toStrictEqual({
        sampleQueryParam: "456",
      });
      expect(notTransformed.headers).toStrictEqual({
        sampleHeader: "789",
      });
    });

    it("should throw on unsuccessful parse", async () => {
      const badConfig = createSampleConfig("/parse");
      badConfig.queries = {
        sampleQueryParam: 123,
      };

      await expect(plugin.request!(api, badConfig)).rejects.toThrowError(
        "Zodios: Invalid Query parameter 'sampleQueryParam'"
      );
    });
  });

  describe("response", () => {
    it("should be defined", () => {
      expect(plugin.response).toBeDefined();
    });

    it("should throw if endpoint is not found", async () => {
      await expect(
        plugin.response!(api, notExistingConfig, createSampleResponse())
      ).rejects.toThrowError("No endpoint found for get /notExisting");
    });

    it("should verify body", async () => {
      const transformed = await plugin.response!(
        api,
        createSampleConfig("/parse"),
        createSampleResponse()
      );

      expect(transformed.data).toStrictEqual({
        first: "123",
        second: 111,
      });
    });

    it("should transform body", async () => {
      const transformed = await plugin.response!(
        api,
        createSampleConfig("/transform"),
        createSampleResponse()
      );

      expect(transformed.data).toStrictEqual({
        first: "123_transformed",
        second: 234,
      });
    });

    it("should not transform body when transform is disabled", async () => {
      const notTransformed = await pluginWithoutTransform.response!(
        api,
        createSampleConfig("/transform"),
        createSampleResponse()
      );

      expect(notTransformed.data).toStrictEqual({
        first: "123",
        second: 111,
      });
    });

    it("should transform body (async)", async () => {
      const transformed = await plugin.response!(
        api,
        createSampleConfig("/transformAsync"),
        createSampleResponse()
      );

      expect(transformed.data).toStrictEqual({
        first: "123_transformed",
        second: 234,
      });
    });

    it("should not transform body (async) when transform is disabled", async () => {
      const notTransformed = await pluginWithoutTransform.response!(
        api,
        createSampleConfig("/transformAsync"),
        createSampleResponse()
      );

      expect(notTransformed.data).toStrictEqual({
        first: "123",
        second: 111,
      });
    });

    it("should throw on unsuccessful parse", async () => {
      const badResponse = createSampleResponse();
      // @ts-expect-error
      badResponse.data.first = 123;

      await expect(
        plugin.response!(api, createSampleConfig("/parse"), badResponse)
      ).rejects
        .toThrowError(`Zodios: Invalid response from endpoint 'post /parse'
status: 200 OK
cause:
[
  {
    "code": "invalid_type",
    "expected": "string",
    "received": "number",
    "path": [
      "first"
    ],
    "message": "Expected string, received number"
  }
]
received:
{
  "first": 123,
  "second": 111
}`);
    });
  });

  const notExistingConfig: ReadonlyDeep<
    AnyZodiosRequestOptions<AnyZodiosFetcherProvider>
  > = {
    method: "get",
    url: "/notExisting",
  };

  const createSampleConfig = (
    url: string
  ): AnyZodiosRequestOptions<AnyZodiosFetcherProvider> => ({
    method: "post",
    url,
    body: "123",
    queries: {
      sampleQueryParam: "456",
    },
    headers: {
      sampleHeader: "789",
    },
  });

  const createEmptySampleConfig = (
    url: string
  ): AnyZodiosRequestOptions<AnyZodiosFetcherProvider> => ({
    method: "post",
    url,
    body: "",
    queries: {
      sampleQueryParam: "",
    },
    headers: {
      sampleHeader: "",
    },
  });

  const createUndefinedSampleConfig = (
    url: string
  ): AnyZodiosRequestOptions<AnyZodiosFetcherProvider> => ({
    method: "get",
    url,
  });

  const createSampleResponse = () => ({
    data: {
      first: "123",
      second: 111,
    },
    status: 200,
    headers: {
      "content-type": "application/json",
    },
    config: {},
    statusText: "OK",
  });

  const api = apiBuilder({
    path: "/parse",
    method: "post",
    response: z.object({
      first: z.string(),
      second: z.number(),
    }),
    parameters: [
      {
        type: "Body",
        schema: z.string(),
        name: "body",
      },
      {
        type: "Query",
        schema: z.string(),
        name: "sampleQueryParam",
      },
      {
        type: "Header",
        schema: z.string(),
        name: "sampleHeader",
      },
    ],
  })
    .addEndpoint({
      path: "/defaults",
      method: "get",
      response: z.object({
        first: z.string(),
        second: z.number(),
      }),
      parameters: [
        {
          type: "Query",
          schema: z.string().default("defaultQueryParam"),
          name: "sampleQueryParam",
        },
        {
          type: "Header",
          schema: z.string().default("defaultHeader"),
          name: "sampleHeader",
        },
      ],
    })
    .addEndpoint({
      path: "/transform",
      method: "post",
      response: z.object({
        first: z.string().transform((data) => data + "_transformed"),
        second: z.number().transform((data) => data + 123),
      }),
      parameters: [
        {
          type: "Body",
          schema: z.string().transform((data) => data + "_transformed"),
          name: "body",
        },
        {
          type: "Query",
          schema: z.string().transform((data) => data + "_transformed"),
          name: "sampleQueryParam",
        },
        {
          type: "Header",
          schema: z.string().transform((data) => data + "_transformed"),
          name: "sampleHeader",
        },
      ],
    })
    // Even if nothing is awaited `transform` returns a `Promise`
    .addEndpoint({
      path: "/transformAsync",
      method: "post",
      response: z.object({
        first: z.string().transform(async (data) => data + "_transformed"),
        second: z.number().transform(async (data) => data + 123),
      }),
      parameters: [
        {
          type: "Body",
          schema: z.string().transform(async (data) => data + "_transformed"),
          name: "body",
        },
        {
          type: "Query",
          schema: z.string().transform(async (data) => data + "_transformed"),
          name: "sampleQueryParam",
        },
        {
          type: "Header",
          schema: z.string().transform(async (data) => data + "_transformed"),
          name: "sampleHeader",
        },
      ],
    })
    .build();
});
