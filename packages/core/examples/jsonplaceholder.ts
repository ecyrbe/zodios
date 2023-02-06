import {
  ApiOf,
  ZodiosResponseByAlias,
  ZodiosHeaderParamsByAlias,
  Zodios,
} from "../src/index";
import { z } from "zod";

async function bootstrap() {
  const apiClient = new Zodios("https://jsonplaceholder.typicode.com", [
    {
      method: "get",
      path: "/users",
      alias: "getUsers",
      description: "Get all users",
      parameters: [
        {
          name: "q",
          type: "Query",
          schema: z.string(),
        },
        {
          name: "page",
          type: "Query",
          schema: z.string().optional(),
        },
      ],
      response: z.array(z.object({ id: z.number(), name: z.string() })),
    },
    {
      method: "get",
      path: "/users/:id",
      alias: "getUser",
      description: "Get a user",
      response: z.object({
        id: z.number(),
        name: z.string(),
      }),
    },
    {
      method: "delete",
      path: "/users/:id",
      alias: "deleteUser",
      description: "Delete a user",
      response: z.object({}),
    },
    {
      method: "post",
      path: "/users",
      alias: "createUser",
      description: "Create a user",
      parameters: [
        {
          name: "body",
          type: "Body",
          schema: z.object({ name: z.string() }),
        },
        {
          name: "Content-Type",
          type: "Header",
          schema: z.string(),
        },
      ],
      response: z.object({ id: z.number(), name: z.string() }),
    },
  ]);

  type UserResponseAlias = ZodiosResponseByAlias<
    ApiOf<typeof apiClient>,
    "getUsers"
  >;

  type Test = ZodiosHeaderParamsByAlias<ApiOf<typeof apiClient>, "createUser">;

  const users: UserResponseAlias = await apiClient.getUsers({
    queries: { q: "Nicholas" },
  });
  console.log(users);
  const user = await apiClient.getUser({ params: { id: 7 } });
  console.log(user);
  const createdUser = await apiClient.createUser(
    { name: "john doe" },
    {
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
    }
  );
  console.log(createdUser);
  const deletedUser = await apiClient.deleteUser(undefined, {
    params: { id: 7 },
  });
  console.log(deletedUser);
}

bootstrap();
