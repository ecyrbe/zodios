import React, { useRef } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { makeApi, Zodios } from "@zodios/fetch";
import { ZodiosHooks } from "../src";
import { z } from "zod";

// you can define schema before declaring the API to get back the type
const userSchema = z
  .object({
    id: z.number(),
    name: z.string(),
  })
  .required();

const createUserSchema = z
  .object({
    name: z.string(),
  })
  .required();

const usersSchema = z.array(userSchema);

// you can then get back the types
type User = z.infer<typeof userSchema>;
type Users = z.infer<typeof usersSchema>;

const api = makeApi([
  {
    method: "get",
    path: "/users",
    alias: "getUsers",
    description: "Get all users",
    parameters: [
      {
        name: "page",
        type: "Query",
        schema: z.number().positive().optional(),
      },
      {
        name: "limit",
        type: "Query",
        schema: z.number().positive().optional(),
      },
    ],
    response: usersSchema,
  },
  {
    method: "get",
    path: "/users/:id",
    description: "Get a user",
    alias: "getUser",
    response: userSchema,
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
        schema: createUserSchema,
      },
    ],
    response: userSchema,
  },
]);
const baseUrl = "https://jsonplaceholder.typicode.com";

const zodios = new Zodios(baseUrl, api);
const zodiosHooks = new ZodiosHooks("jsonplaceholder", zodios);

const Users = () => {
  const page = useRef(0);
  const {
    data: users,
    isLoading,
    error,
    fetchNextPage,
    invalidate: invalidateUsers, // zodios also provides invalidation helpers
  } = zodiosHooks.useInfiniteQuery(
    "/users",
    { queries: { limit: 10 } },
    {
      getPageParamList: () => {
        return ["page"];
      },
      getNextPageParam: () => {
        return {
          queries: {
            page: page.current + 1,
          },
        };
      },
    }
  );
  const { mutate } = zodiosHooks.useCreateUser(undefined, {
    onSuccess: () => invalidateUsers(),
  });

  return (
    <>
      <h1>Users</h1>
      <button onClick={() => mutate({ name: "john doe" })}>add user</button>
      {isLoading && <div>Loading...</div>}
      {error && <div>Error: {(error as Error).message}</div>}
      {users && (
        <>
          <ul>
            {users.pages.flatMap((page) =>
              page.map((user) => <li key={user.id}>{user.name}</li>)
            )}
          </ul>
          <button onClick={() => fetchNextPage()}>more</button>
        </>
      )}
    </>
  );
};

// on another file
const queryClient = new QueryClient();

export const App = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <Users />
    </QueryClientProvider>
  );
};
