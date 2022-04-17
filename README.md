 <h1 align="center">Zodios</h1>
 <p align="center">
   <a href="https://github.com/ecyrbe/zodios">
     <img align="center" src="https://raw.githubusercontent.com/ecyrbe/zodios/main/docs/logo.svg" width="128px" alt="Zodios logo">
   </a>
 </p>
 
 <p align="center">
    Zodios is a typescript api client with auto-completion features backed by <a src="https://axios-http.com" >axios</a> and <a src="https://github.com/colinhacks/zod">zod</a>
 </p>
 
 <p align="center">
   <img src="https://img.shields.io/npm/v/zodios.svg" alt="langue typescript">
   <img alt="npm" src="https://img.shields.io/npm/dw/zodios">
   <a href="https://github.com/ecyrbe/zodios/blob/main/LICENSE">
    <img alt="GitHub" src="https://img.shields.io/github/license/ecyrbe/zodios">   
   </a>
   <img alt="GitHub Workflow Status" src="https://img.shields.io/github/workflow/status/ecyrbe/zodios/CI">
 </p>

# What is it ?

It's an axios compatible API client, with the following features:  
  
- really simple centralized API declaration
- typescript autocompletion in your favorite IDE for URL and parameters
- typescript response types
- parameters and responses schema thanks to zod
- response schema validation
- bearer token injection and token renewal with simple token provider interface
- all axios features available

# Install

```bash
> npm install zodios
```

or

```bash
> yarn add zodios
```

# Usage

For an almost complete example on how to use zodios and how to split your APIs declarations, take a look at [dev.to](examples/dev.to/) example.

## Declare your API with zodios

Here is an example of API declaration with Zodios.
  
```typescript
import { Zodios } from "zodios";
import { z } from "zod";

const apiClient = new Zodios(
  "https://jsonplaceholder.typicode.com",
  // API definition
  [
    {
      method: "get",
      path: "/users/:id", // auto detect :id and ask for it in apiClient get params
      description: "Get a user",
      response: z.object({
        id: z.number(),
        name: z.string(),
      }),
    },
  ] as const,
);
```
Calling this API is now easy and has builtin autocomplete features :  
  
```typescript
//   typed                     auto-complete path   auto-complete params
//     ▼                               ▼                   ▼
const user = await apiClient.get("/users/:id", { params: { id: 7 } });
console.log(user);
```
  
It should output  
  
```js
{ id: 7, name: 'Kurtis Weissnat' }
```
  
## Use token provider plugin
  
Zodios comes with a plugin to inject and renew your tokens :
```typescript
  import { pluginToken } from 'zodios/plugins/token';

  apiClient.use(pluginToken({
    getToken: async () => "token"
  }));
```

## Get underlying axios instance

you can get back the underlying axios instance to customize it.

```typescript
const axiosInstance = apiClient.axios;
```
## Give your own axios instance to zodios

you can instanciate zodios with your own axios intance.

```typescript
const apiClient = new Zodios(
  "https://jsonplaceholder.typicode.com",
  [ ... ] as const,
  // Optional Axios instance
  {
    axiosIntance: customAxiosInstance
  }
);
```

## Disable zodios response validation

```typescript
const apiClient = new Zodios(
  "https://jsonplaceholder.typicode.com",
  [ ... ] as const,
  // Disable validation
  {
    validateResponse: false
  }
);
```

## React helpers

Zodios comes with a Query and Mutation hook helper.  
It's a thin wrapper around React-Query but with zodios auto completion.
  
Zodios query hook also returns an invalidation helper to allow you to reset react query cache easily
  
```typescript
import { QueryClient, QueryClientProvider } from 'react-query';
import { Zodios } from "zodios";
import { ZodiosHooks } from "zodios/react";
import { z } from "zod";

const userSchema = z
  .object({
    id: z.number(),
    name: z.string(),
  });
const usersSchema = z.array(userSchema);

type User = z.infer<typeof userSchema>;
type Users = z.infer<typeof usersSchema>;

const api = [
  {
    method: "get",
    path: "/users",
    description: "Get all users",
    response: usersSchema,
  },
  {
    method: "post",
    path: "/users",
    description: "Create a user",
    parameters: [
      {
        name: "body",
        type: "Body",
        schema: userSchema,
      },
    ],
    response: userSchema,
  },
] as const;
const baseUrl = "https://jsonplaceholder.typicode.com";

const zodios = new Zodios(baseUrl, api);
const zodiosHooks = new ZodiosHooks("jsonplaceholder", zodios);

const Users = () => {
  const {
    data: users,
    isLoading,
    error,
    invalidate: invalidateUsers,
  } = zodiosHooks.useQuery("/users");
  const { mutate } = zodiosHooks.useMutation("post", "/users", {
    onSuccess: () => invalidateUsers(), // zodios also provides invalidation helpers
  });

  return (
    <div>
      <h1>Users</h1>
      <button onClick={() => mutate({ data: { id: 10, name: "john doe" } })}>
        add user
      </button>
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
