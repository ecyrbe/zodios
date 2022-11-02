import { z } from "zod";
import { apiBuilder } from "../api";
import { ReadonlyDeep } from "../utils.types";
import { AnyZodiosRequestOptions } from "../zodios.types";
import { zodValidationPlugin } from "./zod-validation.plugin";

describe("zodValidationPlugin", () => {
  const plugin = zodValidationPlugin({ validate: true, transform: true });
  const pluginWithoutTransform = zodValidationPlugin({
    validate: true,
    transform: false,
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

      expect(transformed.data).toBe("123");
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

      expect(transformed.data).toBe("123_transformed");
      expect(transformed.queries).toStrictEqual({
        sampleQueryParam: "456_transformed",
      });
      expect(transformed.headers).toStrictEqual({
        sampleHeader: "789_transformed",
      });
    });

    it("should not transform parameters", async () => {
      const notTransformed = await pluginWithoutTransform.request!(
        api,
        createSampleConfig("/transform")
      );

      expect(notTransformed.data).toBe("123");
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

      expect(transformed.data).toBe("123_transformed");
      expect(transformed.queries).toStrictEqual({
        sampleQueryParam: "456_transformed",
      });
      expect(transformed.headers).toStrictEqual({
        sampleHeader: "789_transformed",
      });
    });

    it("should not transform parameters (async)", async () => {
      const notTransformed = await pluginWithoutTransform.request!(
        api,
        createSampleConfig("/transformAsync")
      );

      expect(notTransformed.data).toBe("123");
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

    it("should not transform body", async () => {
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

    it("should not transform body (async)", async () => {
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
      // @ts-expect-error Inject wrong data
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

  const notExistingConfig: ReadonlyDeep<AnyZodiosRequestOptions> = {
    method: "get",
    url: "/notExisting",
  };

  const createSampleConfig = (url: string): AnyZodiosRequestOptions => ({
    method: "post",
    url,
    data: "123",
    queries: {
      sampleQueryParam: "456",
    },
    headers: {
      sampleHeader: "789",
    },
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
