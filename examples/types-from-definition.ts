import {
  ZodiosResponseByPath,
  ZodiosBodyByPath,
  ZodiosPathParamsByPath,
  ZodiosQueryParamsByPath,
  makeApi,
  ZodiosPathParamByAlias,
  makeErrors,
} from "../packages/core/src/index";
import z from "zod";

const user = z.object({
  id: z.number(),
  name: z.string(),
  email: z.string().email(),
  phone: z.string(),
});

const errors = makeErrors([
  {
    status: 404,
    schema: z.object({
      message: z.string(),
    }),
  },
  {
    status: 401,
    schema: z.object({
      message: z.string(),
    }),
  },
  {
    status: 500,
    schema: z.object({
      message: z.string(),
      cause: z.record(z.string()),
    }),
  },
]);

const api = makeApi([
  {
    path: "/users",
    method: "get",
    response: z.array(user),
  },
  {
    path: "/users/:id",
    method: "get",
    alias: "getUser",
    parameters: [
      {
        name: "id",
        type: "Path",
        schema: z.number().positive(),
      },
    ],
    response: user,
    errors,
  },
  {
    path: "/users",
    method: "post",
    parameters: [
      {
        name: "body",
        type: "Body",
        schema: user,
      },
    ],
    response: user,
  },
  {
    path: "/users/:id",
    method: "put",
    parameters: [
      {
        name: "body",
        type: "Body",
        schema: user,
      },
    ],
    response: user,
  },
  {
    path: "/users/:id",
    method: "patch",
    parameters: [
      {
        name: "body",
        type: "Body",
        schema: user,
      },
    ],
    response: user,
  },
  {
    path: "/users/:id",
    method: "delete",
    response: z.object({}),
  },
]);

type User = z.infer<typeof user>;
type Api = typeof api;

type Users = ZodiosResponseByPath<Api, "get", "/users">;
//    ^?
type UserById = ZodiosResponseByPath<Api, "get", "/users/:id">;
//    ^?
type GetUserParams = ZodiosPathParamsByPath<Api, "get", "/users/:id">;
//    ^?
type GetUserParamsByAlias = ZodiosPathParamByAlias<Api, "getUser">;
//    ^?
type GetUsersParams = ZodiosPathParamsByPath<Api, "get", "/users">;
//    ^?
type GetUserQueries = ZodiosQueryParamsByPath<Api, "get", "/users/:id">;
//    ^?
type CreateUserBody = ZodiosBodyByPath<Api, "post", "/users">;
//    ^?
type CreateUserResponse = ZodiosResponseByPath<Api, "post", "/users">;
//    ^?
type UpdateUserBody = ZodiosBodyByPath<Api, "put", "/users/:id">;
//    ^?
type PatchUserBody = ZodiosBodyByPath<Api, "patch", "/users/:id">;
//    ^?
type DeleteUserResponse = ZodiosResponseByPath<Api, "delete", "/users/:id">;
//    ^?
