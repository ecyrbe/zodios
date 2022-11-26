 <h1 align="center">Zodios React</h1>
 <p align="center">
   <a href="https://github.com/ecyrbe/zodios-react">
     <img align="center" src="https://raw.githubusercontent.com/ecyrbe/zodios-react/main/docs/logo.svg" width="128px" alt="Zodios logo">
   </a>
 </p>
 
 <p align="center">
    React hooks for zodios backed by <a src="https://react-query.tanstack.com/" >react-query</a>
 </p>
 
 <p align="center">
   <a href="https://www.npmjs.com/package/@zodios/react">
   <img src="https://img.shields.io/npm/v/@zodios/react.svg" alt="langue typescript">
   </a>
   <a href="https://www.npmjs.com/package/@zodios/react">
   <img alt="npm" src="https://img.shields.io/npm/dw/@zodios/react">
   </a>
   <a href="https://github.com/ecyrbe/zodios-react/blob/main/LICENSE">
    <img alt="GitHub" src="https://img.shields.io/github/license/ecyrbe/zodios-react">   
   </a>
   <img alt="GitHub Workflow Status" src="https://img.shields.io/github/workflow/status/ecyrbe/zodios-react/CI">
 </p>

# Install

```bash
> npm install @zodios/react
```

or

```bash
> yarn add @zodios/react
```

# Usage

Zodios comes with a Query and Mutation hook helper.  
It's a thin wrapper around React-Query but with zodios auto completion.
  
Zodios query hook also returns an invalidation helper to allow you to reset react query cache easily
  
```typescript
import React from "react";
import { QueryClient, QueryClientProvider } from "react-query";
import { Zodios, asApi } from "@zodios/core";
import { ZodiosHooks } from "@zodios/react";
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

const api = asApi([
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
  {
    method: "post",
    path: "/users",
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
  const {
    data: users,
    isLoading,
    error,
    invalidate: invalidateUsers, // zodios also provides invalidation helpers
  } = zodiosHooks.useQuery("/users");
  const { mutate } = zodiosHooks.useMutation("post", "/users", undefined, {
    onSuccess: () => invalidateUsers(),
  });

  return (
    <>
      <h1>Users</h1>
      <button onClick={() => mutate({ name: "john doe" })}>add user</button>
      {isLoading && <div>Loading...</div>}
      {error && <div>Error: {(error as Error).message}</div>}
      {users && (
        <ul>
          {users.map((user) => (
            <li key={user.id}>{user.name}</li>
          ))}
        </ul>
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
```
