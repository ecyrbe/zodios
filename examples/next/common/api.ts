import z from "zod";
import { makeApi } from "@zodios/core";

const user = z.object({
  id: z.number(),
  name: z.string(),
  age: z.number().positive(),
  email: z.string().email(),
});

export const userApi = makeApi([
  {
    method: "get",
    path: "/users",
    alias: "getUsers",
    response: z.array(user),
  },
  {
    method: "get",
    path: "/users/:id",
    alias: "getUser",
    parameters: [
      {
        name: "id",
        type: "Path",
        schema: z.number().positive(),
      },
    ],
    response: user,
    errors: [
      {
        status: "default",
        schema: z.object({
          error: z.object({
            code: z.number(),
            message: z.string(),
          }),
        }),
      },
    ],
  },
  {
    method: "post",
    path: "/users",
    alias: "createUser",
    parameters: [
      {
        name: "user",
        type: "Body",
        schema: user.omit({ id: true }),
      },
    ],
    response: user,
  },
]);
