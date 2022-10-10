---
sidebar_position: 5
---

# Typescript

Even though zodios is written in typescript, you can use it with javascript. However, if you are using typescript, you can benefit from the typescript type helpers.

## Example

```ts
import {
  makeCrudApi,
  Response,
  Body,
  PathParams,
  QueryParams,
} from "@zodios/code";
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
//    ^? type Users = { id: number; name: string; email: string; phone: string; }[]
type UserById = Response<Api, "get", "/users/:id">;
//    ^? type UserById = { id: number; name: string; email: string; phone: string; }
type GetUserParams = PathParams<"/users/:id">;
//    ^? type GetUserParams = { id: string; }
type GetUserQueries = QueryParams<Api, "get", "/users/:id">;
//    ^? type GetUserQueries = never
type CreateUserBody = Body<Api, "post", "/users">;
//    ^? type CreateUserBody = { name: string; email: string; phone: string; }
type CreateUserResponse = Response<Api, "post", "/users">;
//    ^? type CreateUserResponse = { id: number; name: string; email: string; phone: string; }
type UpdateUserBody = Body<Api, "put", "/users/:id">;
//    ^? type UpdateUserBody = { name: string; email: string; phone: string; }
type PatchUserBody = Body<Api, "patch", "/users/:id">;
//    ^? type PatchUserBody = { name?: string | undefined; email?: string | undefined; phone?: string | undefined; }
```
