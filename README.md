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
//   typed                     auto-complete path   auto-complete params
//     ▼                               ▼                   ▼
const user = await apiClient.get("/users/:id", { params: { id: 7 } });
console.log(user);
// Output: { id: 7, name: 'Kurtis Weissnat' }
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

Zodios comes with a React Provider to register all your api clients and a hook to use them.  
The hook is a thin wrapper around react-query useQuery, so you need to also add a react-query provider.

```typescript
import { QueryClient, QueryClientProvider } from 'react-query';
import { Paths, Zodios, ZodiosRequestOptions } from "zodios";
import { useZodios, ZodiosProvider } from "zodios/react";
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
  }
] as const;
const baseUrl = "https://jsonplaceholder.typicode.com";

type Api = typeof api;

function useJsonPlaceholder<Path extends Paths<Api, "get">>(path: Path, config?: ZodiosRequestOptions<Api, "get", Path>) {
  return useZodios(baseUrl, path, config);
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
```
