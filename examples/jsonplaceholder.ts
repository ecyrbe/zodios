import { Zodios } from "../src/index";
import { z } from "zod";

async function bootstrap() {
  const apiClient = new Zodios("https://jsonplaceholder.typicode.com", [
    {
      method: "get",
      path: "/users",
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
      description: "Get a user",
      parameters: [
        {
          type: "Path",
          name: "id",
          schema: z.number(),
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
      description: "Delete a user",
      parameters: [
        {
          type: "Path",
          name: "id",
          schema: z.number(),
        },
      ],
      response: z.object({}),
    },
    {
      method: "post",
      path: "/users",
      description: "Create a user",
      parameters: [
        {
          name: "body",
          type: "Body",
          schema: z.object({ name: z.string() }),
        },
      ],
      response: z.object({ id: z.number(), name: z.string() }),
    },
  ] as const);

  const users = await apiClient.get("/users", { queries: { q: "Nicholas" } });
  console.log(users);
  const user = await apiClient.get("/users/:id", { params: { id: 7 } });
  console.log(user);
  const createdUser = await apiClient.post("/users", { name: "john doe" });
  console.log(createdUser);
  const deletedUser = await apiClient.delete("/users/:id", {
    params: { id: 7 },
  });
  console.log(deletedUser);
}

bootstrap();
