if (globalThis.FormData === undefined) {
  globalThis.FormData = require("form-data");
}
import "cross-fetch/polyfill";
import express from "express";
import { AddressInfo } from "net";
import { z, ZodError } from "zod";
import { ZodiosCore } from "./zodios";
import { ZodiosError } from "./zodios-error";
import multer from "multer";
import { ZodiosPlugin } from "./zodios.types";
import { apiBuilder } from "./api";
import { Assert } from "./utils.types";
import { AnyZodiosFetcherProvider, fetchProvider } from "./fetcher-providers";
import { FetchError } from "./fetcher-providers/fetch-provider/fetch";

const multipart = multer({ storage: multer.memoryStorage() });

describe("Zodios", () => {
  let app: express.Express;
  let server: ReturnType<typeof app.listen>;
  let port: number;

  beforeAll(async () => {
    app = express();
    app.use(express.json());
    app.get("/token", (req, res) => {
      res.status(200).json({ token: req.headers.authorization });
    });
    app.post("/token", (req, res) => {
      res.status(200).json({ token: req.headers.authorization });
    });
    app.get("/error401", (req, res) => {
      res.status(401).json({});
    });
    app.get("/error//error401", (req, res) => {
      res.status(401).json({});
    });
    app.get("/error/:id/error401", (req, res) => {
      res.status(401).json({});
    });
    app.get("/error502", (req, res) => {
      res.status(502).json({ error: { message: "bad gateway" } });
    });
    app.get("/queries", (req, res) => {
      res.status(200).json({
        queries: req.query.id,
      });
    });
    app.get("/:id", (req, res) => {
      res.status(200).json({ id: Number(req.params.id), name: "test" });
    });
    app.get("/path/:uuid", (req, res) => {
      res.status(200).json({ uuid: req.params.uuid });
    });
    app.get("/:id/address/:address", (req, res) => {
      res
        .status(200)
        .json({ id: Number(req.params.id), address: req.params.address });
    });
    app.post("/", (req, res) => {
      res.status(200).json({ id: 3, name: req.body.name });
    });
    app.put("/", (req, res) => {
      res.status(200).json({ id: req.body.id, name: req.body.name });
    });
    app.patch("/", (req, res) => {
      res.status(200).json({ id: req.body.id, name: req.body.name });
    });
    app.delete("/:id", (req, res) => {
      res.status(200).json({ id: Number(req.params.id) });
    });
    app.post("/form-data", multipart.none() as any, (req, res) => {
      res.status(200).json(req.body);
    });
    app.post(
      "/form-url",
      express.urlencoded({ extended: false }),
      (req, res) => {
        res.status(200).json(req.body);
      }
    );
    app.post("/text", express.text(), (req, res) => {
      res.status(200).send(req.body);
    });
    server = app.listen(0);
    port = (server.address() as AddressInfo).port;
  });

  afterAll(() => {
    server.close();
  });

  it("should be defined", () => {
    expect(ZodiosCore).toBeDefined();
  });

  it("should throw if baseUrl is not provided", () => {
    // @ts-ignore
    expect(() => new ZodiosCore(undefined, [])).toThrowError(
      "Zodios: missing base url"
    );
  });

  it("should throw if api is not provided", () => {
    // @ts-ignore
    expect(() => new ZodiosCore()).toThrowError(
      "Zodios: missing api description"
    );
  });

  it("should throw if api is not an array", () => {
    // @ts-ignore
    expect(() => new ZodiosCore({})).toThrowError(
      "Zodios: api must be an array"
    );
  });

  it("should create a new instance of Zodios", () => {
    const zodios = new ZodiosCore(`http://localhost:${port}`, []);
    expect(zodios).toBeDefined();
  });
  it("should create a new instance when providing an api", () => {
    const zodios = new ZodiosCore(`http://localhost:${port}`, [
      {
        method: "get",
        path: "/:id",
        response: z.object({
          id: z.number(),
          name: z.string(),
        }),
      },
    ]);
    expect(zodios).toBeDefined();
  });

  it("should should throw with duplicate api endpoints", () => {
    expect(
      () =>
        new ZodiosCore(`http://localhost:${port}`, [
          {
            method: "get",
            path: "/:id",
            response: z.object({
              id: z.number(),
              name: z.string(),
            }),
          },
          {
            method: "get",
            path: "/:id",
            response: z.object({
              id: z.number(),
              name: z.string(),
            }),
          },
        ])
    ).toThrowError("Zodios: Duplicate path 'get /:id'");
  });

  it("should create a new instance whithout base URL", () => {
    const zodios = new ZodiosCore([
      {
        method: "get",
        path: "/:id",
        response: z.object({
          id: z.number(),
          name: z.string(),
        }),
      },
    ]);
    expect(zodios).toBeDefined();
  });

  it("should register have validation plugin automatically installed", () => {
    const zodios = new ZodiosCore(`http://localhost:${port}`, []);
    // @ts-ignore
    expect(zodios.endpointPlugins.get("any-any").count()).toBe(1);
  });

  it("should register a plugin", () => {
    const zodios = new ZodiosCore(`http://localhost:${port}`, []);
    zodios.use({
      request: async (_, config) => config,
    });
    // @ts-ignore
    expect(zodios.endpointPlugins.get("any-any").count()).toBe(2);
  });

  it("should unregister a plugin", () => {
    const zodios = new ZodiosCore(`http://localhost:${port}`, []);
    const id = zodios.use({
      request: async (_, config) => config,
    });
    // @ts-ignore
    expect(zodios.endpointPlugins.get("any-any").count()).toBe(2);
    zodios.eject(id);
    // @ts-ignore
    expect(zodios.endpointPlugins.get("any-any").count()).toBe(1);
  });

  it("should replace a named plugin", () => {
    const zodios = new ZodiosCore(`http://localhost:${port}`, []);
    const plugin: ZodiosPlugin<AnyZodiosFetcherProvider> = {
      name: "test",
      request: async (_, config) => config,
    };
    zodios.use(plugin);
    zodios.use(plugin);
    zodios.use(plugin);
    // @ts-ignore
    expect(zodios.endpointPlugins.get("any-any").count()).toBe(2);
  });

  it("should unregister a named plugin", () => {
    const zodios = new ZodiosCore(`http://localhost:${port}`, []);
    const plugin: ZodiosPlugin<AnyZodiosFetcherProvider> = {
      name: "test",
      request: async (_, config) => config,
    };
    zodios.use(plugin);
    zodios.eject("test");
    // @ts-ignore
    expect(zodios.endpointPlugins.get("any-any").count()).toBe(1);
  });

  it("should throw if invalide parameters when registering a plugin", () => {
    const zodios = new ZodiosCore(`http://localhost:${port}`, []);
    // @ts-ignore
    expect(() => zodios.use(0)).toThrowError("Zodios: invalid plugin");
  });

  it("should throw if invalid alias when registering a plugin", () => {
    const zodios = new ZodiosCore(`http://localhost:${port}`, [
      {
        method: "get",
        path: "/:id",
        alias: "test",
        response: z.object({
          id: z.number(),
          name: z.string(),
        }),
      },
    ]);
    expect(() =>
      // @ts-ignore
      zodios.use("tests", {
        // @ts-ignore
        request: async (_, config) => config,
      })
    ).toThrowError("Zodios: no alias 'tests' found to register plugin");
  });

  it("should throw if invalid endpoint when registering a plugin", () => {
    const zodios = new ZodiosCore(`http://localhost:${port}`, [
      {
        method: "get",
        path: "/:id",
        response: z.object({
          id: z.number(),
          name: z.string(),
        }),
      },
    ]);
    expect(() =>
      // @ts-ignore
      zodios.use("get", "/test/:id", {
        // @ts-ignore
        request: async (_, config) => config,
      })
    ).toThrowError(
      "Zodios: no endpoint 'get /test/:id' found to register plugin"
    );
  });

  it("should register a plugin by endpoint", () => {
    const zodios = new ZodiosCore(`http://localhost:${port}`, [
      {
        method: "get",
        path: "/:id",
        response: z.object({
          id: z.number(),
          name: z.string(),
        }),
      },
    ]);
    zodios.use("get", "/:id", {
      request: async (_, config) => config,
    });
    // @ts-ignore
    expect(zodios.endpointPlugins.get("get-/:id").count()).toBe(1);
  });

  it("should register a plugin by alias", () => {
    const zodios = new ZodiosCore(`http://localhost:${port}`, [
      {
        method: "get",
        path: "/:id",
        alias: "test",
        response: z.object({
          id: z.number(),
          name: z.string(),
        }),
      },
    ]);
    zodios.use("test", {
      request: async (_, config) => config,
    });
    // @ts-ignore
    expect(zodios.endpointPlugins.get("get-/:id").count()).toBe(1);
  });

  it("should make an http request", async () => {
    const zodios = new ZodiosCore(`http://localhost:${port}`, [
      {
        method: "get",
        path: "/:id",
        response: z.object({
          id: z.number(),
          name: z.string(),
        }),
      },
      {
        method: "get",
        path: "/users",
        response: z.array(
          z.object({
            id: z.number(),
            name: z.string(),
          })
        ),
      },
    ]);
    const response = await zodios.request({
      //      ^?
      method: "get",
      url: "/:id",
      params: { id: 7 },
    });
    const testResonseType: Assert<
      typeof response,
      { id: number; name: string }
    > = true;
    expect(response).toEqual({ id: 7, name: "test" });
  });

  it("should make an http get with standard query arrays", async () => {
    const zodios = new ZodiosCore(`http://localhost:${port}`, [
      {
        method: "get",
        path: "/queries",
        parameters: [
          {
            name: "id",
            type: "Query",
            schema: z.array(z.number()),
          },
        ],
        response: z.object({
          queries: z.array(z.string()),
        }),
      },
    ]);
    const response = await zodios.get("/queries", { queries: { id: [1, 2] } });
    expect(response).toEqual({ queries: ["1", "2"] });
  });

  it("should make an http get with one path params", async () => {
    const zodios = new ZodiosCore(`http://localhost:${port}`, [
      {
        method: "get",
        path: "/:id",
        response: z.object({
          id: z.number(),
          name: z.string(),
        }),
      },
    ]);
    const response = await zodios.get("/:id", { params: { id: 7 } });
    expect(response).toEqual({ id: 7, name: "test" });
  });

  it("should make an http alias request with one path params", async () => {
    const zodios = new ZodiosCore(`http://localhost:${port}`, [
      {
        method: "get",
        path: "/:id",
        alias: "getById",
        response: z.object({
          id: z.number(),
          name: z.string(),
        }),
      },
    ]);
    const response = await zodios.getById({ params: { id: 7 } });
    expect(response).toEqual({ id: 7, name: "test" });
  });

  it("should work with api builder", async () => {
    const api = apiBuilder({
      method: "get",
      path: "/:id",
      alias: "getById",
      response: z.object({
        id: z.number(),
        name: z.string(),
      }),
    }).build();
    const zodios = new ZodiosCore(`http://localhost:${port}`, api);
    const response = await zodios.getById({ params: { id: 7 } });
    expect(response).toEqual({ id: 7, name: "test" });
  });

  it("should make a get request with forgotten params and get back a zod error", async () => {
    const zodios = new ZodiosCore(`http://localhost:${port}`, [
      {
        method: "get",
        path: "/:id",
        response: z.object({
          id: z.number(),
          name: z.string(),
        }),
      },
    ]);
    try {
      // @ts-ignore
      await zodios.get("/:id");
    } catch (e) {
      expect(e).toBeInstanceOf(ZodiosError);
    }
  });

  it("should make an http get with multiples path params", async () => {
    const zodios = new ZodiosCore(`http://localhost:${port}`, [
      {
        method: "get",
        path: "/:id/address/:address",
        response: z.object({
          id: z.number(),
          address: z.string(),
        }),
      },
    ]);
    const response = await zodios.get("/:id/address/:address", {
      params: { id: 7, address: "address" },
    });
    expect(response).toEqual({ id: 7, address: "address" });
  });

  it("should make an http post with body param", async () => {
    const zodios = new ZodiosCore(`http://localhost:${port}`, [
      {
        method: "post",
        path: "/",
        parameters: [
          {
            name: "name",
            type: "Body",
            schema: z.object({
              name: z.string(),
            }),
          },
        ],
        response: z.object({
          id: z.number(),
          name: z.string(),
        }),
      },
    ]);
    const response = await zodios.post("/", { body: { name: "post" } });
    expect(response).toEqual({ id: 3, name: "post" });
  });

  it("should make an http post with transformed body param", async () => {
    const zodios = new ZodiosCore(`http://localhost:${port}`, [
      {
        method: "post",
        path: "/",
        parameters: [
          {
            name: "name",
            type: "Body",
            schema: z
              .object({
                firstname: z.string(),
                lastname: z.string(),
              })
              .transform((data) => ({
                name: `${data.firstname} ${data.lastname}`,
              })),
          },
        ],
        response: z.object({
          id: z.number(),
          name: z.string(),
        }),
      },
    ]);
    const config = {
      method: "post",
      url: "/",
      body: { firstname: "post", lastname: "test" },
    } as const;
    const response = await zodios.request(config);
    expect(config).toEqual({
      method: "post",
      url: "/",
      body: { firstname: "post", lastname: "test" },
    });
    expect(response).toEqual({ id: 3, name: "post test" });
  });

  it("should throw a zodios error if params are not correct", async () => {
    const zodios = new ZodiosCore(`http://localhost:${port}`, [
      {
        method: "post",
        path: "/",
        parameters: [
          {
            name: "name",
            type: "Body",
            schema: z
              .object({
                email: z.string().email(),
              })
              .transform((data) => ({
                name: `${data.email.split("@")[0]}`,
              })),
          },
        ],
        response: z.object({
          id: z.number(),
          name: z.string(),
        }),
      },
    ]);
    let response;
    let error: ZodiosError | undefined;
    try {
      response = await zodios.post("/", {
        body: {
          email: "post",
        },
      });
    } catch (err) {
      error = err as ZodiosError;
    }
    expect(response).toBeUndefined();
    expect(error).toBeInstanceOf(ZodiosError);
    expect(error!.cause).toBeInstanceOf(ZodError);
    expect(error!.message).toBe("Zodios: Invalid Body parameter 'name'");
  });

  it("should make an http mutation alias request with body param", async () => {
    const zodios = new ZodiosCore(`http://localhost:${port}`, [
      {
        method: "post",
        path: "/",
        alias: "create",
        parameters: [
          {
            name: "name",
            type: "Body",
            schema: z.object({
              name: z.string(),
            }),
          },
        ],
        response: z.object({
          id: z.number(),
          name: z.string(),
        }),
      },
    ]);
    const response = await zodios.create({ body: { name: "post" } });
    expect(response).toEqual({ id: 3, name: "post" });
  });

  it("should make an http put", async () => {
    const zodios = new ZodiosCore(`http://localhost:${port}`, [
      {
        method: "put",
        path: "/",
        parameters: [
          {
            name: "body",
            type: "Body",
            schema: z.object({
              id: z.number(),
              name: z.string(),
            }),
          },
        ],
        response: z.object({
          id: z.number(),
          name: z.string(),
        }),
      },
    ]);
    const response = await zodios.put("/", { body: { id: 5, name: "put" } });
    expect(response).toEqual({ id: 5, name: "put" });
  });

  it("should make an http put alias", async () => {
    const zodios = new ZodiosCore(`http://localhost:${port}`, [
      {
        method: "put",
        path: "/",
        alias: "update",
        parameters: [
          {
            name: "body",
            type: "Body",
            schema: z.object({
              id: z.number(),
              name: z.string(),
            }),
          },
        ],
        response: z.object({
          id: z.number(),
          name: z.string(),
        }),
      },
    ]);
    const response = await zodios.update({ body: { id: 5, name: "put" } });
    expect(response).toEqual({ id: 5, name: "put" });
  });

  it("should make an http patch", async () => {
    const zodios = new ZodiosCore(`http://localhost:${port}`, [
      {
        method: "patch",
        path: "/",
        parameters: [
          {
            name: "id",
            type: "Body",
            schema: z.object({
              id: z.number(),
              name: z.string(),
            }),
          },
        ],
        response: z.object({
          id: z.number(),
          name: z.string(),
        }),
      },
    ]);
    const response = await zodios.patch("/", {
      body: { id: 4, name: "patch" },
    });
    expect(response).toEqual({ id: 4, name: "patch" });
  });

  it("should make an http patch alias", async () => {
    const zodios = new ZodiosCore(`http://localhost:${port}`, [
      {
        method: "patch",
        path: "/",
        alias: "update",
        parameters: [
          {
            name: "id",
            type: "Body",
            schema: z.object({
              id: z.number(),
              name: z.string(),
            }),
          },
        ],
        response: z.object({
          id: z.number(),
          name: z.string(),
        }),
      },
    ]);
    const response = await zodios.update({ body: { id: 4, name: "patch" } });
    expect(response).toEqual({ id: 4, name: "patch" });
  });

  it("should make an http delete", async () => {
    const zodios = new ZodiosCore(`http://localhost:${port}`, [
      {
        method: "delete",
        path: "/:id",
        response: z.object({
          id: z.number(),
        }),
      },
    ]);
    const response = await zodios.delete("/:id", {
      params: { id: 6 },
    });
    expect(response).toEqual({ id: 6 });
  });

  it("should make an http delete alias", async () => {
    const zodios = new ZodiosCore(`http://localhost:${port}`, [
      {
        method: "delete",
        path: "/:id",
        alias: "remove",
        response: z.object({
          id: z.number(),
        }),
      },
    ]);
    const response = await zodios.remove({
      params: { id: 6 },
    });
    expect(response).toEqual({ id: 6 });
  });

  it("should validate uuid in path params", async () => {
    const zodios = new ZodiosCore(`http://localhost:${port}`, [
      {
        method: "get",
        path: "/path/:uuid",
        parameters: [
          {
            name: "uuid",
            type: "Path",
            schema: z.string().uuid(),
          },
        ],
        response: z.object({
          uuid: z.string(),
        }),
      },
    ]);
    const response = await zodios.get("/path/:uuid", {
      params: { uuid: "e9e09a1d-3967-4518-bc89-75a901aee128" },
    });
    expect(response).toEqual({
      uuid: "e9e09a1d-3967-4518-bc89-75a901aee128",
    });
  });

  it("should not validate bad path params", async () => {
    const zodios = new ZodiosCore(`http://localhost:${port}`, [
      {
        method: "get",
        path: "/path/:uuid",
        parameters: [
          {
            name: "uuid",
            type: "Path",
            schema: z.string().uuid(),
          },
        ],
        response: z.object({
          uuid: z.string(),
        }),
      },
    ]);
    let error;
    try {
      await zodios.get("/path/:uuid", {
        params: { uuid: "e9e09a1-3967-4518-bc89-75a901aee128" },
      });
    } catch (e) {
      error = e;
    }
    expect(error).toBeInstanceOf(ZodiosError);
    expect((error as ZodiosError).cause).toBeInstanceOf(ZodError);
    expect((error as ZodiosError).message).toBe(
      "Zodios: Invalid Path parameter 'uuid'"
    );
  });

  it("should not validate bad formatted responses", async () => {
    const zodios = new ZodiosCore(`http://localhost:${port}`, [
      {
        method: "get",
        path: "/:id",
        response: z.object({
          id: z.number(),
          name: z.string(),
          more: z.string(),
        }),
      },
    ]);
    try {
      await zodios.get("/:id", { params: { id: 1 } });
    } catch (e) {
      expect(e).toBeInstanceOf(ZodiosError);
      expect((e as ZodiosError).cause).toBeInstanceOf(ZodError);
      expect((e as ZodiosError).message)
        .toBe(`Zodios: Invalid response from endpoint 'get /:id'
status: 200 OK
cause:
[
  {
    "code": "invalid_type",
    "expected": "string",
    "received": "undefined",
    "path": [
      "more"
    ],
    "message": "Required"
  }
]
received:
{
  "id": 1,
  "name": "test"
}`);
      expect((e as ZodiosError).data).toEqual({
        id: 1,
        name: "test",
      });
      expect((e as ZodiosError).config).toEqual({
        method: "get",
        url: "/:id",
        params: { id: 1 },
      });
    }
  });

  it("should match Expected error", async () => {
    const zodios = new ZodiosCore(
      `http://localhost:${port}`,
      [
        {
          method: "get",
          alias: "getError502",
          path: "/error502",
          response: z.void(),
          errors: [
            {
              status: 502,
              schema: z.object({
                error: z.object({
                  message: z.string(),
                }),
              }),
            },
            {
              status: 401,
              schema: z.object({
                error: z.object({
                  message: z.string(),
                  _401: z.literal(true),
                }),
              }),
            },
            {
              status: "default",
              schema: z.object({
                error: z.object({
                  message: z.string(),
                  _default: z.literal(true),
                }),
              }),
            },
          ],
        },
      ],
      {
        fetcherProvider: fetchProvider,
      }
    );
    let error;
    try {
      await zodios.get("/error502");
    } catch (e) {
      error = e;
    }
    expect(error).toBeInstanceOf(Error);
    expect((error as FetchError<any>).response?.status).toBe(502);
    if (zodios.isErrorFromPath(zodios.api, "get", "/error502", error)) {
      expect(error.response.status).toBe(502);
      if (error.response.status === 502) {
        const data = error.response.data;
        const test: Assert<
          typeof data,
          { error: { message: string; _502: true } }
        > = true;
      }
      expect(error.response?.data).toEqual({
        error: { message: "bad gateway" },
      });
    }
    if (zodios.isErrorFromAlias(zodios.api, "getError502", error)) {
      expect(error.response.status).toBe(502);
      if (error.response.status === 502) {
        const data = error.response.data;
        //     ^?
        const test: Assert<
          typeof data,
          { error: { message: string; _502: true } }
        > = true;
      } else if (error.response.status === 401) {
        const data = error.response.data;
        //     ^?
        const test: Assert<
          typeof data,
          { error: { message: string; _401: true } }
        > = true;
      } else {
        const testStatus = error.response.status;
        //        ^?
        const data = error.response.data;
        //     ^?
        const test: Assert<
          typeof data,
          { error: { message: string; _default: true } }
        > = true;
      }
      expect(error.response?.data).toEqual({
        error: { message: "bad gateway" },
      });
    }
  });

  it("should match error with params", async () => {
    const zodios = new Zodios(`http://localhost:${port}`, [
      {
        method: "get",
        alias: "getError401",
        path: "/error/:id/error401",
        response: z.void(),
        errors: [
          {
            status: 401,
            schema: z.object({}),
          },
        ],
      },
      {
        method: "get",
        alias: "getError404",
        path: "/error/:id/error404",
        response: z.void(),
        errors: [
          {
            status: 404,
            schema: z.object({}),
          },
        ],
      },
    ]);

    const params = {
      id: "test",
    };

    let error;
    try {
      await zodios.getError401({ params });
    } catch (e) {
      error = e;
    }

    expect(isErrorFromAlias(zodios.api, "getError401", error)).toBe(true);
    expect(isErrorFromAlias(zodios.api, "getError404", error)).toBe(false);

    expect(
      isErrorFromPath(zodios.api, "get", "/error/:id/error401", error)
    ).toBe(true);
    expect(
      isErrorFromPath(zodios.api, "get", "/error/:id/error404", error)
    ).toBe(false);
  });

  it("should match error with empty params", async () => {
    const zodios = new Zodios(`http://localhost:${port}`, [
      {
        method: "get",
        alias: "getError401",
        path: "/error/:id/error401",
        response: z.void(),
        errors: [
          {
            status: 401,
            schema: z.object({}),
          },
        ],
      },
      {
        method: "get",
        alias: "getError404",
        path: "/error/:id/error404",
        response: z.void(),
        errors: [
          {
            status: 404,
            schema: z.object({}),
          },
        ],
      },
    ]);

    const params = {
      id: "",
    };

    let error;
    try {
      await zodios.getError401({ params });
    } catch (e) {
      error = e;
    }

    expect(isErrorFromAlias(zodios.api, "getError401", error)).toBe(true);
    expect(isErrorFromAlias(zodios.api, "getError404", error)).toBe(false);

    expect(
      isErrorFromPath(zodios.api, "get", "/error/:id/error401", error)
    ).toBe(true);
    expect(
      isErrorFromPath(zodios.api, "get", "/error/:id/error404", error)
    ).toBe(false);
  });

  it("should match error with optional params at the end", async () => {
    const zodios = new Zodios(`http://localhost:${port}`, [
      {
        method: "get",
        alias: "getError401",
        path: "/error/:id/error401/:message",
        response: z.void(),
        errors: [
          {
            status: 401,
            schema: z.object({}),
          },
        ],
      },
      {
        method: "get",
        alias: "getError404",
        path: "/error/:id/error404/:message",
        response: z.void(),
        errors: [
          {
            status: 404,
            schema: z.object({}),
          },
        ],
      },
    ]);

    const params = {
      id: "test",
      message: "",
    };

    let error;
    try {
      await zodios.getError401({ params });
    } catch (e) {
      error = e;
    }

    expect(isErrorFromAlias(zodios.api, "getError401", error)).toBe(true);
    expect(isErrorFromAlias(zodios.api, "getError404", error)).toBe(false);

    expect(
      isErrorFromPath(zodios.api, "get", "/error/:id/error401/:message", error)
    ).toBe(true);
    expect(
      isErrorFromPath(zodios.api, "get", "/error/:id/error404/:message", error)
    ).toBe(false);
  });

  it("should match Unexpected error", async () => {
    const zodios = new ZodiosCore(`http://localhost:${port}`, [
      {
        method: "get",
        alias: "getError502",
        path: "/error502",
        response: z.void(),
      },
    ]);
    let error;
    try {
      await zodios.get("/error502");
    } catch (e) {
      error = e;
    }

    expect(error).toBeInstanceOf(Error);
    expect((error as FetchError<any>).response?.status).toBe(502);
    expect(zodios.isErrorFromPath(zodios.api, "get", "/error502", error)).toBe(
      false
    );
    expect(zodios.isErrorFromAlias(zodios.api, "getError502", error)).toBe(
      false
    );
  });

  it("should return response when disabling validation", async () => {
    const zodios = new ZodiosCore(
      `http://localhost:${port}`,
      [
        {
          method: "get",
          path: "/:id",
          response: z.object({
            id: z.number(),
            name: z.string(),
            more: z.string(),
          }),
        },
      ],
      { validate: false }
    );
    const response = await zodios.get("/:id", { params: { id: 1 } });
    expect(response).toEqual({
      id: 1,
      name: "test",
    });
  });

  it("should trigger an error with error response", async () => {
    const zodios = new ZodiosCore(`http://localhost:${port}`, [
      {
        method: "get",
        path: "/error502",
        response: z.object({
          id: z.number(),
          name: z.string(),
        }),
      },
    ]);
    try {
      await zodios.get("/error502");
    } catch (e) {
      expect((e as FetchError<any>).response?.data).toEqual({
        error: {
          message: "bad gateway",
        },
      });
    }
  });

  it("should send a form data request", async () => {
    const zodios = new ZodiosCore(`http://localhost:${port}`, [
      {
        method: "post",
        path: "/form-data",
        requestFormat: "form-data",
        parameters: [
          {
            name: "body",
            type: "Body",
            schema: z.object({
              id: z.number(),
              name: z.string(),
            }),
          },
        ],
        response: z.object({
          id: z.string(),
          name: z.string(),
        }),
      },
    ]);
    const response = await zodios.post("/form-data", {
      body: { id: 4, name: "post" },
    });
    expect(response).toEqual({ id: "4", name: "post" });
  });

  it("should send a form data request a second time under 100 ms", async () => {
    const zodios = new ZodiosCore(`http://localhost:${port}`, [
      {
        method: "post",
        path: "/form-data",
        requestFormat: "form-data",
        parameters: [
          {
            name: "body",
            type: "Body",
            schema: z.object({
              id: z.string(),
              name: z.string(),
            }),
          },
        ],
        response: z.object({
          id: z.string(),
          name: z.string(),
        }),
      },
    ]);
    const response = await zodios.post("/form-data", {
      // @ts-ignore
      body: { id: "4", name: "post" },
    });
    expect(response).toEqual({ id: "4", name: "post" });
  }, 100);

  it("should not send an array as form data request", async () => {
    const zodios = new ZodiosCore(`http://localhost:${port}`, [
      {
        method: "post",
        path: "/form-data",
        requestFormat: "form-data",
        parameters: [
          {
            name: "body",
            type: "Body",
            schema: z.array(z.string()),
          },
        ],
        response: z.string(),
      },
    ]);
    let error: Error | undefined;
    let response: string | undefined;
    try {
      response = await zodios.post("/form-data", { body: ["test", "test2"] });
    } catch (err) {
      error = err as Error;
    }
    expect(response).toBeUndefined();
    expect(error).toBeInstanceOf(ZodiosError);
    expect((error as ZodiosError).message).toBe(
      "Zodios: multipart/form-data body must be an object"
    );
  });

  it("should send a form url request", async () => {
    const zodios = new ZodiosCore(`http://localhost:${port}`, [
      {
        method: "post",
        path: "/form-url",
        requestFormat: "form-url",
        parameters: [
          {
            name: "body",
            type: "Body",
            schema: z.object({
              id: z.number(),
              name: z.string(),
            }),
          },
        ],
        response: z.object({
          id: z.string(),
          name: z.string(),
        }),
      },
    ]);
    const response = await zodios.post("/form-url", {
      body: { id: 4, name: "post" },
    });
    expect(response).toEqual({ id: "4", name: "post" });
  });

  it("should not send an array as form url request", async () => {
    const zodios = new ZodiosCore(`http://localhost:${port}`, [
      {
        method: "post",
        path: "/form-url",
        requestFormat: "form-url",
        parameters: [
          {
            name: "body",
            type: "Body",
            schema: z.array(z.string()),
          },
        ],
        response: z.string(),
      },
    ]);
    let error: Error | undefined;
    let response: string | undefined;
    try {
      response = await zodios.post("/form-url", { body: ["test", "test2"] });
    } catch (err) {
      error = err as Error;
    }
    expect(response).toBeUndefined();
    expect(error).toBeInstanceOf(ZodiosError);
    expect((error as ZodiosError).message).toBe(
      "Zodios: application/x-www-form-urlencoded body must be an object"
    );
  });

  it("should send a text request", async () => {
    const zodios = new ZodiosCore(`http://localhost:${port}`, [
      {
        method: "post",
        path: "/text",
        requestFormat: "text",
        parameters: [
          {
            name: "body",
            type: "Body",
            schema: z.string(),
          },
        ],
        response: z.string(),
      },
    ]);
    const response = await zodios.post("/text", { body: "test" });
    expect(response).toEqual("test");
  });
});
