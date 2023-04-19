import { z } from "zod";
import { makeApi, ZodiosCore } from "./index";
import { Assert } from "./utils.types";

const api = makeApi([
  {
    method: "get",
    path: "/users",
    alias: "getUsers",
    description: "Get all users",
    parameters: [
      {
        name: "page",
        type: "Query",
        schema: z.number().positive().optional(),
      },
      {
        name: "limit",
        type: "Query",
        schema: z.number().positive().optional(),
      },
    ],
    response: z.object({
      page: z.number(),
      count: z.number(),
      nextPage: z.number().optional(),
      users: z.array(
        z.object({
          id: z.number(),
          name: z.string(),
        })
      ),
    }),
  },
  {
    method: "post",
    path: "/users/search",
    alias: "searchUsers",
    description: "Search users",
    immutable: true,
    parameters: [
      {
        name: "body",
        type: "Body",
        schema: z.object({
          name: z.string(),
          page: z.number().positive().optional(),
          limit: z.number().positive().optional(),
        }),
      },
    ],
    response: z.object({
      page: z.number(),
      count: z.number(),
      nextPage: z.number().optional(),
      users: z.array(
        z.object({
          id: z.number(),
          name: z.string(),
        })
      ),
    }),
  },
  {
    method: "get",
    path: "/users/:id",
    alias: "getUser",
    response: z.object({
      id: z.number(),
      name: z.string(),
    }),
  },
  {
    method: "get",
    path: "/users/:id/address/:address",
    alias: "getUserAddress",
    response: z.object({
      id: z.number(),
      address: z.string(),
    }),
  },
  {
    method: "post",
    path: "/users",
    alias: "createUser",
    parameters: [
      {
        name: "body",
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
  {
    method: "put",
    path: "/users",
    alias: "updateUser",
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
  {
    method: "patch",
    path: "/users",
    alias: "patchUser",
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
  {
    method: "delete",
    path: "/users/:id",
    alias: "deleteUser",
    response: z.object({
      id: z.number(),
    }),
  },
  {
    method: "get",
    path: "/users/:id/error",
    alias: "getUserError",
    response: z.object({
      id: z.number(),
      name: z.string(),
    }),
  },
  {
    method: "get",
    path: "/users/:id/cancel",
    alias: "getUserCancel",
    response: z.object({
      id: z.number(),
      name: z.string(),
    }),
  },
]);
const core = new ZodiosCore(api);

describe("ZodiosCore request", () => {
  it("should return only one response type for get request", async () => {
    const req = () =>
      core.request({
        method: "get",
        url: "/users",
      });
    type Req = typeof req;
    const testResult: Assert<
      ReturnType<Req>,
      Promise<{
        nextPage?: number | undefined;
        page: number;
        count: number;
        users: {
          name: string;
          id: number;
        }[];
      }>
    > = true;
  });

  it("should return only one response type for post request", async () => {
    const core = new ZodiosCore(api);

    const req = () =>
      core.request({
        method: "post",
        url: "/users",
        body: {
          name: "John",
        },
      });
    type Req = typeof req;
    const testResult: Assert<
      ReturnType<Req>,
      Promise<{ name: string; id: number }>
    > = true;
  });
});
