import { makeApi, makeErrors } from "@zodios/core";
import { zodiosApp, zodiosRouter } from "@zodios/express";
import { serve, setup } from "swagger-ui-express";
import { z } from "zod";
import { bearerAuthScheme, openApiBuilder } from "../src";

const userSchema = z.object({
  id: z.string(),
  name: z.string(),
  email: z.string().email(),
});

const commentSchema = z.object({
  id: z.string(),
  content: z.string(),
  createdAt: z.string(),
  modifiedAt: z.string(),
});

type User = z.infer<typeof userSchema>;

const errors = makeErrors([
  {
    status: 404,
    description: "No users found",
    schema: z.object({
      message: z.enum(["No users found", "User not found"]),
    }),
  },
  {
    status: "default",
    description: "Default error",
    schema: z.object({
      message: z.string(),
    }),
  },
]);

const api = makeApi([
  {
    method: "get",
    path: "/users",
    alias: "getUsers",
    description: "Get all users",
    parameters: [
      {
        name: "limit",
        type: "Query",
        description: "Limit the number of users",
        schema: z.number().positive().default(10),
      },
      {
        name: "offset",
        type: "Query",
        description: "Offset the number of users",
        schema: z.number().positive().optional(),
      },
      {
        name: "filter",
        type: "Query",
        description: "Filter users by name",
        schema: z
          .array(z.string())
          .refine((array) => array.length === new Set(array).size, {
            message: "Duplicate values are not allowed",
          }),
      },
    ],
    response: z.array(userSchema),
    errors,
  },
  {
    method: "get",
    path: "/users/:id",
    alias: "getUser",
    description: "Get a user by id",
    response: userSchema,
    errors,
  },
  {
    method: "get",
    path: "/users/:id/comments",
    alias: "getComments",
    description: "Get all user comments",
    response: z.array(commentSchema),
    errors,
  },
  {
    method: "get",
    path: "/users/:id/comments/:commentId",
    alias: "getComment",
    description: "Get a user comment by id",
    response: commentSchema,
    errors,
  },
]);

const adminApi = makeApi([
  {
    method: "post",
    path: "/users",
    alias: "createUser",
    description: "Create a user",
    parameters: [
      {
        name: "user",
        type: "Body",
        description: "The user to create",
        schema: userSchema.omit({ id: true }),
      },
    ],
    response: userSchema,
    errors,
  },
  {
    method: "put",
    path: "/users/:id",
    alias: "updateUser",
    description: "Update a user",
    parameters: [
      {
        name: "user",
        type: "Body",
        description: "The user to update",
        schema: userSchema,
      },
    ],
    response: userSchema,
    errors,
  },
  {
    method: "delete",
    path: "/users/:id",
    alias: "deleteUser",
    description: "Delete a user",
    response: z.void(),
    status: 204,
    errors,
  },
]);

const app = zodiosApp();
const userRouter = zodiosRouter([...api, ...adminApi]);

const users: User[] = [
  {
    id: "1",
    name: "John Doe",
    email: "john.doe@test.com",
  },
  {
    id: "2",
    name: "John Doe",
    email: "john.doe@test.com",
  },
];

userRouter.get("/users", (req, res) => {
  res.json(users);
});

userRouter.get("/users/:id", (req, res) => {
  const user = users.find((user) => user.id === req.params.id);
  if (!user) {
    res.status(404).json({ message: "User not found" });
  }
  return res.json(user);
});

userRouter.post("/users", (req, res) => {
  const user = { ...req.body, id: String(users.length + 1) };
  users.push(user);
  return res.json(user);
});

userRouter.put("/users/:id", (req, res) => {
  const userIdx = users.findIndex((user) => user.id === req.params.id);
  if (userIdx < 0) {
    res.status(404).json({ message: "User not found" });
  }
  const updatedUser = { ...users[userIdx], ...req.body };
  users[userIdx] = updatedUser;
  return res.json(updatedUser);
});

userRouter.delete("/users/:id", (req, res) => {
  const userIdx = users.findIndex((user) => user.id === req.params.id);
  if (userIdx < 0) {
    res.status(404).json({ message: "User not found" });
  }
  users.splice(userIdx, 1);
  return res.status(204).send();
});

app.use("/api/v1", userRouter);

const document = openApiBuilder({
  title: "User API",
  version: "1.0.0",
  description: "A simple user API",
})
  .addServer({ url: "/api/v1" })
  .addSecurityScheme("admin", bearerAuthScheme())
  .addPublicApi(api)
  .addProtectedApi("admin", adminApi)
  .build();

app.use(`/docs/swagger.json`, (_, res) => res.json(document));
app.use("/docs", serve);
app.use("/docs", setup(undefined, { swaggerUrl: "/docs/swagger.json" }));

app.listen(3000);
