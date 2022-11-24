/// <reference lib="dom" />
import { z } from "zod";
import { makeApi, makeErrors, mockProvider, ZodiosCore } from "@zodios/core";
import { ZodiosMocks } from "./index";

const userSchema = z.object({
  id: z.number(),
  name: z.string(),
  email: z.string(),
});

const errorSchemas = makeErrors([
  {
    status: "default",
    schema: z.object({
      message: z.string(),
    }),
  },
]);

const api = makeApi([
  {
    method: "get",
    path: "/users",
    response: z.array(userSchema),
    errors: errorSchemas,
  },
  {
    method: "get",
    path: "/users/:id",
    response: userSchema,
    errors: errorSchemas,
  },
  {
    method: "post",
    path: "/users",
    parameters: [
      {
        name: "user",
        type: "Body",
        schema: userSchema.omit({ id: true }),
      },
    ],
    response: userSchema,
    errors: errorSchemas,
  },
  {
    method: "put",
    path: "/users/:id",
    parameters: [
      {
        name: "user",
        type: "Body",
        schema: userSchema,
      },
    ],
    response: userSchema,
    errors: errorSchemas,
  },
  {
    method: "patch",
    path: "/users/:id",
    parameters: [
      {
        name: "user",
        type: "Body",
        schema: userSchema,
      },
    ],
    response: userSchema,
    errors: errorSchemas,
  },
  {
    method: "delete",
    path: "/users/:id",
    response: userSchema,
    errors: errorSchemas,
  },
]);

const zodios = new ZodiosCore(api, { fetcherProvider: mockProvider });
const mocks = new ZodiosMocks(zodios);

describe("Zodios", () => {
  beforeAll(async () => {
    ZodiosMocks.install();
    mocks.get("/users", async (config) => {
      return {
        data: [
          {
            id: 1,
            name: "John Doe",
            email: "john.doe@test.com",
          },
        ],
      };
    });
    mocks.get("/users/:id", async (config) => {
      if (config.params.id === 1) {
        return {
          data: {
            id: 1,
            name: "John Doe",
            email: "john.doe@test.com",
          },
        };
      }
      return {
        status: 404,
        data: {
          message: "User not found",
        },
      };
    });
    mocks.post("/users", async (config) => {
      return {
        data: {
          id: 1,
          ...config.body,
        },
      };
    });
    mocks.put("/users/:id", async (config) => {
      if (config.params.id === 1) {
        return {
          data: {
            ...config.body,
          },
        };
      }
      return {
        status: 404,
        data: {
          message: "User not found",
        },
      };
    });
    mocks.patch("/users/:id", async (config) => {
      if (config.params.id === 1) {
        return {
          data: {
            ...config.body,
          },
        };
      }
      return {
        status: 404,
        data: {
          message: "User not found",
        },
      };
    });
    mocks.delete("/users/:id", async (config) => {
      if (config.params.id === 1) {
        return {
          data: {
            id: 1,
            name: "John Doe",
            email: "john.doe@test.com",
          },
        };
      }
      return {
        status: 404,
        data: {
          message: "User not found",
        },
      };
    });
  });

  afterAll(() => {
    ZodiosMocks.uninstall();
  });

  it("should be defined", () => {
    expect(ZodiosMocks).toBeDefined();
  });

  it("should be able to mock a request", async () => {
    const response = await zodios.get("/users");
    expect(response).toEqual([
      {
        id: 1,
        name: "John Doe",
        email: "john.doe@test.com",
      },
    ]);
  });
  it("should be able to mock a request with params", async () => {
    const response = await zodios.get("/users/:id", { params: { id: 1 } });
    expect(response).toEqual({
      id: 1,
      name: "John Doe",
      email: "john.doe@test.com",
    });
  });
  it("should be able to mock errors of a request with params", async () => {
    let error;
    try {
      const response = await zodios.get("/users/:id", { params: { id: 2 } });
    } catch (e) {
      error = e;
    }
    expect(error).toBeDefined();
    expect((error as any).response.status).toEqual(404);
  });
  it("should be able to mock a post request", async () => {
    const response = await zodios.post("/users", {
      body: { name: "John Doe", email: "john.doe@test-post.com" },
    });
    expect(response).toEqual({
      id: 1,
      name: "John Doe",
      email: "john.doe@test-post.com",
    });
  });
  it("should be able to mock a put request", async () => {
    const response = await zodios.put("/users/:id", {
      params: { id: 1 },
      body: { id: 1, name: "John Doe", email: "john.doe@test-put.com" },
    });
    expect(response).toEqual({
      id: 1,
      name: "John Doe",
      email: "john.doe@test-put.com",
    });
  });
  it("should be able to mock a patch request", async () => {
    const response = await zodios.patch("/users/:id", {
      params: { id: 1 },
      body: { id: 1, name: "John Doe", email: "john.doe@test-patch.com" },
    });
    expect(response).toEqual({
      id: 1,
      name: "John Doe",
      email: "john.doe@test-patch.com",
    });
  });
  it("should be able to mock a delete request", async () => {
    const response = await zodios.delete("/users/:id", {
      params: { id: 1 },
    });
    expect(response).toEqual({
      id: 1,
      name: "John Doe",
      email: "john.doe@test.com",
    });
  });
});
