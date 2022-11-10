import { Zodios, makeApi } from "../src/index";
import { ApiOf, TypeProviderOf } from "../src/zodios";
import { tsSchema, tsTypeProvider } from "../src/type-provider.typescript";

// you can also predefine your API
const jsonplaceholderUrl = "https://jsonplaceholder.typicode.com";

type User = {
  id: number;
  name: string;
};

const userSchema = tsSchema<User>();

const usersSchema = tsSchema<User[]>();

const jsonplaceholderApi = makeApi([
  {
    method: "get",
    path: "/users",
    description: "Get all users",
    parameters: [
      {
        name: "q",
        description: "full text search",
        type: "Query",
        schema: tsSchema<string>(),
      },
      {
        name: "page",
        description: "page number",
        type: "Query",
        schema: tsSchema<number | undefined>(),
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
]);

async function bootstrap() {
  const apiClient = new Zodios(jsonplaceholderUrl, jsonplaceholderApi, {
    typeProvider: tsTypeProvider,
  });

  type Api = ApiOf<typeof apiClient>;
  //    ^?
  type Provider = TypeProviderOf<typeof apiClient>;
  //    ^?
  const users = await apiClient.get("/users", { queries: { q: "Nicholas" } });
  //    ^?
  console.log(users);
  const user = await apiClient.get("/users/:id", { params: { id: 7 } });
  //    ^?
  console.log(user);
}

bootstrap();
