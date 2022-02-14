import { Zodios } from "../src/index";
import { z } from "zod";

// you can define schema before declaring the API to get back the type
const userSchema = z
  .object({
    id: z.number(),
    name: z.string(),
  })
  .required();

const usersSchema = z.array(userSchema);

// you can then get back the types
type User = z.infer<typeof userSchema>;
type Users = z.infer<typeof usersSchema>;

// and then use them in your API
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
      response: usersSchema,
    },
    {
      method: "get",
      path: "/users/:id",
      description: "Get a user",
      response: userSchema,
    },
  ] as const);

  const users = await apiClient.get("/users", { queries: { q: "Nicholas" } });
  console.log(users);
  const user = await apiClient.get("/users/:id", { params: { id: 7 } });
  console.log(user);
}

bootstrap();
