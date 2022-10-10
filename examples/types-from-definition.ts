import {
  makeCrudApi,
  Response,
  Body,
  PathParams,
  QueryParams,
} from "../src/index";
import z from "zod";

const user = z.object({
  id: z.number(),
  name: z.string(),
  email: z.string().email(),
  phone: z.string(),
});

const api = makeCrudApi("user", user);

type User = z.infer<typeof user>;
type Api = typeof api;

type Users = Response<Api, "get", "/users">;
//    ^?
type UserById = Response<Api, "get", "/users/:id">;
//    ^?
type GetUserParams = PathParams<"/users/:id">;
//    ^?
type GetUserQueries = QueryParams<Api, "get", "/users/:id">;
//    ^?
type CreateUserBody = Body<Api, "post", "/users">;
//    ^?
type CreateUserResponse = Response<Api, "post", "/users">;
//    ^?
type UpdateUserBody = Body<Api, "put", "/users/:id">;
//    ^?
type PatchUserBody = Body<Api, "patch", "/users/:id">;
//    ^?
type DeleteUserResponse = Response<Api, "delete", "/users/:id">;
//    ^?
