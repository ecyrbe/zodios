import { AxiosError } from "axios";
import express from "express";
import { AddressInfo } from "net";
import { z, ZodError } from "zod";
globalThis.FormData = require("form-data");
import { Zodios } from "./zodios";
import { ZodiosError } from "./zodios-error";
import multer from "multer";
import { ZodiosPlugin } from "./zodios.types";
import { apiBuilder } from "./api";
import { matchErrorByAlias, matchErrorByPath } from "./zodios-error.utils";
import { Assert } from "./utils.types";

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
    app.post("/form-data", multipart.none(), (req, res) => {
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
    expect(Zodios).toBeDefined();
  });

  it("should throw if baseUrl is not provided", () => {
    // @ts-ignore
    expect(() => new Zodios(undefined, [])).toThrowError(
      "Zodios: missing base url"
    );
  });

  it("should throw if api is not provided", () => {
    // @ts-ignore
    expect(() => new Zodios()).toThrowError("Zodios: missing api description");
  });

  it("should throw if api is not an array", () => {
    // @ts-ignore
    expect(() => new Zodios({})).toThrowError("Zodios: api must be an array");
  });

  it("should return the underlying axios instance", () => {
    const zodios = new Zodios(`http://localhost:${port}`, []);
    expect(zodios.axios).toBeDefined();
  });
  it("should create a new instance of Zodios", () => {
    const zodios = new Zodios(`http://localhost:${port}`, []);
    expect(zodios).toBeDefined();
  });
  it("should create a new instance when providing an api", () => {
    const zodios = new Zodios(`http://localhost:${port}`, [
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
        new Zodios(`http://localhost:${port}`, [
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

  it("should get base url", () => {
    const zodios = new Zodios(`http://localhost:${port}`, []);
    expect(zodios.baseURL).toBe(`http://localhost:${port}`);
  });

  it("should create a new instance whithout base URL", () => {
    const zodios = new Zodios([
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
    const zodios = new Zodios(`http://localhost:${port}`, []);
    // @ts-ignore
    expect(zodios.endpointPlugins.get("any-any").count()).toBe(1);
  });

  it("should register a plugin", () => {
    const zodios = new Zodios(`http://localhost:${port}`, []);
    zodios.use({
      request: async (_, config) => config,
    });
    // @ts-ignore
    expect(zodios.endpointPlugins.get("any-any").count()).toBe(2);
  });

  it("should unregister a plugin", () => {
    const zodios = new Zodios(`http://localhost:${port}`, []);
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
    const zodios = new Zodios(`http://localhost:${port}`, []);
    const plugin: ZodiosPlugin = {
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
    const zodios = new Zodios(`http://localhost:${port}`, []);
    const plugin: ZodiosPlugin = {
      name: "test",
      request: async (_, config) => config,
    };
    zodios.use(plugin);
    zodios.eject("test");
    // @ts-ignore
    expect(zodios.endpointPlugins.get("any-any").count()).toBe(1);
  });

  it("should throw if invalide parameters when registering a plugin", () => {
    const zodios = new Zodios(`http://localhost:${port}`, []);
    // @ts-ignore
    expect(() => zodios.use(0)).toThrowError("Zodios: invalid plugin");
  });

  it("should throw if invalid alias when registering a plugin", () => {
    const zodios = new Zodios(`http://localhost:${port}`, [
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
    const zodios = new Zodios(`http://localhost:${port}`, [
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
    const zodios = new Zodios(`http://localhost:${port}`, [
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
    const zodios = new Zodios(`http://localhost:${port}`, [
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
    const zodios = new Zodios(`http://localhost:${port}`, [
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
      method: "get",
      url: "/:id",
      params: { id: 7 },
    });
    expect(response).toEqual({ id: 7, name: "test" });
  });

  it("should make an http get with standard query arrays", async () => {
    const zodios = new Zodios(`http://localhost:${port}`, [
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
    const zodios = new Zodios(`http://localhost:${port}`, [
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
    const zodios = new Zodios(`http://localhost:${port}`, [
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
    const zodios = new Zodios(`http://localhost:${port}`, api);
    const response = await zodios.getById({ params: { id: 7 } });
    expect(response).toEqual({ id: 7, name: "test" });
  });

  it("should make a get request with forgotten params and get back a zod error", async () => {
    const zodios = new Zodios(`http://localhost:${port}`, [
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
    const zodios = new Zodios(`http://localhost:${port}`, [
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
    const zodios = new Zodios(`http://localhost:${port}`, [
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
    const response = await zodios.post("/", { name: "post" });
    expect(response).toEqual({ id: 3, name: "post" });
  });

  it("should make an http post with transformed body param", async () => {
    const zodios = new Zodios(`http://localhost:${port}`, [
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
      data: { firstname: "post", lastname: "test" },
    } as const;
    const response = await zodios.request(config);
    expect(config).toEqual({
      method: "post",
      url: "/",
      data: { firstname: "post", lastname: "test" },
    });
    expect(response).toEqual({ id: 3, name: "post test" });
  });

  it("should throw a zodios error if params are not correct", async () => {
    const zodios = new Zodios(`http://localhost:${port}`, [
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
        email: "post",
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
    const zodios = new Zodios(`http://localhost:${port}`, [
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
    const response = await zodios.create({ name: "post" });
    expect(response).toEqual({ id: 3, name: "post" });
  });

  it("should make an http put", async () => {
    const zodios = new Zodios(`http://localhost:${port}`, [
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
    const response = await zodios.put("/", { id: 5, name: "put" });
    expect(response).toEqual({ id: 5, name: "put" });
  });

  it("should make an http put alias", async () => {
    const zodios = new Zodios(`http://localhost:${port}`, [
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
    const response = await zodios.update({ id: 5, name: "put" });
    expect(response).toEqual({ id: 5, name: "put" });
  });

  it("should make an http patch", async () => {
    const zodios = new Zodios(`http://localhost:${port}`, [
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
    const response = await zodios.patch("/", { id: 4, name: "patch" });
    expect(response).toEqual({ id: 4, name: "patch" });
  });

  it("should make an http patch alias", async () => {
    const zodios = new Zodios(`http://localhost:${port}`, [
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
    const response = await zodios.update({ id: 4, name: "patch" });
    expect(response).toEqual({ id: 4, name: "patch" });
  });

  it("should make an http delete", async () => {
    const zodios = new Zodios(`http://localhost:${port}`, [
      {
        method: "delete",
        path: "/:id",
        response: z.object({
          id: z.number(),
        }),
      },
    ]);
    const response = await zodios.delete("/:id", undefined, {
      params: { id: 6 },
    });
    expect(response).toEqual({ id: 6 });
  });

  it("should make an http delete alias", async () => {
    const zodios = new Zodios(`http://localhost:${port}`, [
      {
        method: "delete",
        path: "/:id",
        alias: "remove",
        response: z.object({
          id: z.number(),
        }),
      },
    ]);
    const response = await zodios.remove(undefined, {
      params: { id: 6 },
    });
    expect(response).toEqual({ id: 6 });
  });

  it("should validate uuid in path params", async () => {
    const zodios = new Zodios(`http://localhost:${port}`, [
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
    const zodios = new Zodios(`http://localhost:${port}`, [
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
    const zodios = new Zodios(`http://localhost:${port}`, [
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
    const zodios = new Zodios(`http://localhost:${port}`, [
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
                _502: z.literal(true),
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
              }),
            }),
          },
        ],
      },
    ]);
    let error;
    try {
      await zodios.get("/error502");
    } catch (e) {
      error = e;
    }
    const match = matchErrorByPath(zodios.api, "get", "/error502", error);
    expect(error).toBeInstanceOf(AxiosError);
    expect((error as AxiosError).response?.status).toBe(502);
    expect(match.type).toBe("ZodiosExpectedError");
    if (match.type === "ZodiosExpectedError") {
      expect(match.status).toBe(502);
      if (match.status === 502) {
        const data = match.error.response!.data;
        const test: Assert<
          typeof data,
          { error: { message: string; _502: true } }
        > = true;
      }
      expect(match.error.response?.data).toEqual({
        error: { message: "bad gateway" },
      });
    }
    const matchAlias = matchErrorByAlias(zodios.api, "getError502", error);
    expect(matchAlias.type).toBe("ZodiosExpectedError");
    if (matchAlias.type === "ZodiosExpectedError") {
      expect(matchAlias.status).toBe(502);
      expect(matchAlias.error.response?.data).toEqual({
        error: { message: "bad gateway" },
      });
    }
  });

  it("should match Unexpected error", async () => {
    const zodios = new Zodios(`http://localhost:${port}`, [
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
    const match = matchErrorByPath(zodios.api, "get", "/error502", error);
    expect(error).toBeInstanceOf(AxiosError);
    expect((error as AxiosError).response?.status).toBe(502);
    expect(match.type).toBe("ZodiosUnexpectedError");
    if (match.type === "ZodiosUnexpectedError") {
      expect(match.error.response?.data).toEqual({
        error: { message: "bad gateway" },
      });
    }
    const matchAlias = matchErrorByAlias(zodios.api, "getError502", error);
    expect(matchAlias.type).toBe("ZodiosUnexpectedError");
    if (matchAlias.type === "ZodiosUnexpectedError") {
      expect(matchAlias.error.response?.data).toEqual({
        error: { message: "bad gateway" },
      });
    }
  });

  it("should return response when disabling validation", async () => {
    const zodios = new Zodios(
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

  it("should trigger an axios error with error response", async () => {
    const zodios = new Zodios(`http://localhost:${port}`, [
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
      expect((e as AxiosError).response?.data).toEqual({
        error: {
          message: "bad gateway",
        },
      });
    }
  });

  it("should send a form data request", async () => {
    const zodios = new Zodios(`http://localhost:${port}`, [
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
    const response = await zodios.post("/form-data", { id: 4, name: "post" });
    expect(response).toEqual({ id: "4", name: "post" });
  });

  it("should send a form data request a second time under 100 ms", async () => {
    const zodios = new Zodios(`http://localhost:${port}`, [
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
    const response = await zodios.post("/form-data", { id: 4, name: "post" });
    expect(response).toEqual({ id: "4", name: "post" });
  }, 100);

  it("should not send an array as form data request", async () => {
    const zodios = new Zodios(`http://localhost:${port}`, [
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
      response = await zodios.post("/form-data", ["test", "test2"]);
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
    const zodios = new Zodios(`http://localhost:${port}`, [
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
    const response = await zodios.post("/form-url", { id: 4, name: "post" });
    expect(response).toEqual({ id: "4", name: "post" });
  });

  it("should not send an array as form url request", async () => {
    const zodios = new Zodios(`http://localhost:${port}`, [
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
      response = await zodios.post("/form-url", ["test", "test2"]);
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
    const zodios = new Zodios(`http://localhost:${port}`, [
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
    const response = await zodios.post("/text", "test");
    expect(response).toEqual("test");
  });
});
