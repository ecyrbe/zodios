import { AxiosError } from "axios";
import express, { Application } from "express";
import { AddressInfo } from "net";
import { z, ZodError } from "zod";
import { Zodios } from "./zodios";

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
    app.get("/:id", (req, res) => {
      res.status(200).json({ id: Number(req.params.id), name: "test" });
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
    server = app.listen(0);
    port = (server.address() as AddressInfo).port;
  });

  afterAll(() => {
    server.close();
  });

  it("should be defined", () => {
    expect(Zodios).toBeDefined();
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
        parameters: [
          {
            name: "id",
            type: "Path",
            schema: z.number(),
          },
        ],
        response: z.object({
          id: z.number(),
          name: z.string(),
        }),
      },
    ]);
    expect(zodios).toBeDefined();
  });
  it("should create a new instance when providing a token provider", () => {
    const zodios = new Zodios(`http://localhost:${port}`, [], {
      getToken: async () => "token",
      renewToken: async () => {},
    });
    expect(zodios).toBeDefined();
  });
  it("should make an http request", async () => {
    const zodios = new Zodios(`http://localhost:${port}`, [
      {
        method: "get",
        path: "/:id",
        parameters: [
          {
            name: "id",
            type: "Path",
            schema: z.number(),
          },
        ],
        response: z.object({
          id: z.number(),
          name: z.string(),
        }),
      },
    ] as const);
    const response = await zodios.request("get", "/:id", undefined, {
      params: { id: 7 },
    });
    expect(response).toEqual({ id: 7, name: "test" });
  });
  it("should make an http get", async () => {
    const zodios = new Zodios(`http://localhost:${port}`, [
      {
        method: "get",
        path: "/:id",
        parameters: [
          {
            name: "id",
            type: "Path",
            schema: z.number(),
          },
        ],
        response: z.object({
          id: z.number(),
          name: z.string(),
        }),
      },
    ] as const);
    const response = await zodios.get("/:id", { params: { id: 7 } });
    expect(response).toEqual({ id: 7, name: "test" });
  });
  it("should make an http post", async () => {
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
    ] as const);
    const response = await zodios.post("/", { name: "post" });
    expect(response).toEqual({ id: 3, name: "post" });
  });
  it("should make an http put", async () => {
    const zodios = new Zodios(`http://localhost:${port}`, [
      {
        method: "put",
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
    ] as const);
    const response = await zodios.put("/", { id: 5, name: "put" });
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
    ] as const);
    const response = await zodios.patch("/", { id: 4, name: "patch" });
    expect(response).toEqual({ id: 4, name: "patch" });
  });
  it("should make an http delete", async () => {
    const zodios = new Zodios(`http://localhost:${port}`, [
      {
        method: "delete",
        path: "/:id",
        parameters: [
          {
            name: "id",
            type: "Path",
            schema: z.number(),
          },
        ],
        response: z.object({
          id: z.number(),
        }),
      },
    ] as const);
    const response = await zodios.delete("/:id", { params: { id: 6 } });
    expect(response).toEqual({ id: 6 });
  });
  it("should make an http request with a token", async () => {
    const zodios = new Zodios(
      `http://localhost:${port}`,
      [
        {
          method: "get",
          path: "/token",
          response: z.object({
            token: z.string(),
          }),
        },
      ] as const,
      {
        getToken: async () => "token",
        renewToken: async () => {},
      }
    );
    const response = await zodios.get("/token");
    expect(response).toEqual({ token: "Bearer token" });
  });
  it("should make an http post with a token", async () => {
    const zodios = new Zodios(
      `http://localhost:${port}`,
      [
        {
          method: "post",
          path: "/token",
          response: z.object({
            token: z.string(),
          }),
        },
      ] as const,
      {
        getToken: async () => "token",
        renewToken: async () => {},
      }
    );
    const response = await zodios.post("/token");
    expect(response).toEqual({ token: "Bearer token" });
  });
  it("should handle 401 error with a token", async () => {
    const zodios = new Zodios(
      `http://localhost:${port}`,
      [
        {
          method: "get",
          path: "/error401",
          response: z.object({}),
        },
      ] as const,
      {
        getToken: async () => "token",
        renewToken: async () => {},
      }
    );
    try {
      await zodios.get("/error401");
    } catch (e) {
      expect((e as AxiosError).response!.status).toBe(401);
    }
  });
  it("should not validate bad formatted responses", async () => {
    const zodios = new Zodios(`http://localhost:${port}`, [
      {
        method: "get",
        path: "/:id",
        parameters: [
          {
            name: "id",
            type: "Path",
            schema: z.number(),
          },
        ],
        response: z.object({
          id: z.number(),
          name: z.string(),
          more: z.string(),
        }),
      },
    ] as const);
    try {
      await zodios.get("/:id", { params: { id: 1 } });
    } catch (e) {
      expect(e).toBeInstanceOf(ZodError);
    }
  });
});
