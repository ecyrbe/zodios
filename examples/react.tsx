import { QueryClient, QueryClientProvider } from "react-query";
import { Paths, Zodios, ZodiosMethodOptions } from "../src/index";
import { useZodios, ZodiosProvider } from "../src/react";
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

const api = [
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
] as const;
const baseUrl = "https://jsonplaceholder.typicode.com";

type Api = typeof api;
type ApiUrl = typeof baseUrl;

function useJsonPlaceholder<Path extends Paths<Api, "get">>(
  path: Path,
  config?: ZodiosMethodOptions<Api, "get", Path>
) {
  return useZodios<ApiUrl, Api, Path>(baseUrl, path, config);
}

const Users = () => {
  const { data: users, isLoading, error } = useJsonPlaceholder("/users");

  return (
    <div>
      <h1>Users</h1>
      {isLoading && <div>Loading...</div>}
      {error && <div>Error: {(error as Error).message}</div>}
      {users && (
        <ul>
          {users.map((user) => (
            <li key={user.id}>{user.name}</li>
          ))}
        </ul>
      )}
    </div>
  );
};

const apiClient = new Zodios(baseUrl, api);
const queryClient = new QueryClient();

export const App = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <ZodiosProvider apis={[apiClient]}>
        <Users />
      </ZodiosProvider>
    </QueryClientProvider>
  );
};
