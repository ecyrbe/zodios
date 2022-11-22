import {
  Zodios,
  makeApi,
  ApiOf,
  TypeProviderOf,
  FetcherProviderOf,
  ioTsTypeProvider,
} from "../src/index";
import * as t from "io-ts";

// you can define schema before declaring the API to get back the type

// you can then get back the types
type User = t.TypeOf<typeof userSchema>;
type Users = t.TypeOf<typeof usersSchema>;

// you can also predefine your API
const jsonplaceholderUrl = "https://jsonplaceholder.typicode.com";

const userSchema = t.type({
  id: t.number,
  name: t.string,
});

const usersSchema = t.array(userSchema);

const jsonplaceholderApi = makeApi([
  {
    method: "get",
    path: "/users",
    alias: "getUsers",
    description: "Get all users",
    parameters: [
      {
        name: "q",
        description: "full text search",
        type: "Query",
        schema: t.string,
      },
      {
        name: "page",
        description: "page number",
        type: "Query",
        schema: t.union([t.number, t.undefined]),
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
    typeProvider: ioTsTypeProvider,
  });

  type Api = ApiOf<typeof apiClient>;
  //    ^?
  type Provider = TypeProviderOf<typeof apiClient>;
  //    ^?
  type FetcherProvider = FetcherProviderOf<typeof apiClient>;
  //    ^?
  const users = await apiClient.get("/users", { queries: { q: "Nicholas" } });
  //    ^?
  const users2 = await apiClient.getUsers({ queries: { q: "Nicholas" } });
  //    ^?
  console.log(users);
  const user = await apiClient.get("/users/:id", { params: { id: 7 } });
  //    ^?
  console.log(user);
}

bootstrap();
