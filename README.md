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
   <a href="https://www.npmjs.com/package/@zodios/core">
   <img src="https://img.shields.io/npm/v/@zodios/core.svg" alt="langue typescript">
   </a>
   <a href="https://www.npmjs.com/package/@zodios/core">
   <img alt="npm" src="https://img.shields.io/npm/dw/@zodios/core">
   </a>
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
> npm install @zodios/core
```

or

```bash
> yarn add @zodios/core
```

# Usage

For an almost complete example on how to use zodios and how to split your APIs declarations, take a look at [dev.to](examples/dev.to/) example.

## Declare your API with zodios

Here is an example of API declaration with Zodios.
  
```typescript
import { Zodios } from "@zodios/core";
import { z } from "zod";

const apiClient = new Zodios(
  "https://jsonplaceholder.typicode.com",
  // API definition
  [
    {
      method: "get",
      path: "/users/:id", // auto detect :id and ask for it in apiClient get params
      alias: "getUser", // optionnal alias to call this endpoint with it
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
You can also use aliases :
  
```typescript
//   typed                     alias   auto-complete params
//     ▼                        ▼                ▼
const user = await apiClient.getUser({ params: { id: 7 } });
console.log(user);
```
  
## Use token provider plugin
  
Zodios comes with a plugin to inject and renew your tokens :
```typescript
  import { pluginToken } from '@zodios/plugins';

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

## Send multipart/form-data requests

Zodios supports multipart/form-data requests with integrated `requestFormat`. Zodios is using `formdata-node` internally on NodeJs as it's the most up to date library for node.

```typescript
const apiClient = new Zodios(
  "https://mywebsite.com",
  [{
    method: "post",
    path: "/upload",
    alias: "upload",
    description: "Upload a file",
    requestFormat: "form-data",
    parameters:[
      {
        name: "body",
        type: "Body",
        schema: z.object({
          file: z.instanceof(File),
        }),
      }
    ],
    response: z.object({
      id: z.number(),
    }),
  }] as const,
);
const id = await apiClient.upload({ file: document.querySelector('#file').files[0] });
```

But you can also use your own multipart/form-data library, for example with `form-data` library on node.

```typescript
import FormData from 'form-data';

const apiClient = new Zodios(
  "https://mywebsite.com",
  [{
    method: "post",
    path: "/upload",
    alias: "upload",
    description: "Upload a file",
    parameters:[
      {
        name: "body",
        type: "Body",
        schema: z.instanceof(FormData),
      }
    ],
    response: z.object({
      id: z.number(),
    }),
  }] as const,
);
const form = new FormData();
form.append('file', document.querySelector('#file').files[0]);
const id = await apiClient.upload(form, { headers: form.getHeaders() });
```

## Send application/x-www-form-urlencoded requests

Zodios supports application/x-www-form-urlencoded requests with integrated `requestFormat`. Zodios is using URLSearchParams internally on both browser and node. (If you need IE support, see next example)
    
  ```typescript
  const apiClient = new Zodios(
    "https://mywebsite.com",
    [{
      method: "post",
      path: "/login",
      alias: "login",
      description: "Submit a form",
      requestFormat: "form-url",
      parameters:[
        {
          name: "body",
          type: "Body",
          schema: z.object({
            userName: z.string(),
            password: z.string(),
          }),
        }
      ],
      response: z.object({
        id: z.number(),
      }),
    }] as const,
  );
  const id = await apiClient.login({ userName: "user", password: "password" });
  ```

  But you can also use custom code to support for application/x-www-form-urlencoded requests.
  For example with `qs` library on IE :
    
  ```typescript
  import qs from 'qs';

  const apiClient = new Zodios(
    "https://mywebsite.com",
    [{
      method: "post",
      path: "/login",
      alias: "login",
      description: "Submit a form",
      parameters:[
        {
          name: "body",
          type: "Body",
          schema: z.string()
        }
      ],
      response: z.object({
        id: z.number(),
      }),
    }] as const,
  );
  const id = await apiClient.login(qs.stringify({ userName: "user", password: "password" }),
    { headers: 
        { 
          'Content-Type': 'application/x-www-form-urlencoded' 
        }
    });
  ```

## CRUD helper

Zodios has a helper to generate basic CRUD API. It will generate all the api definitions for you :  
  
```typescript
import { Zodios, asCrudApi } from '@zodios/core';

const apiClient = new Zodios(BASE_URL,
  asCrudApi(
    'user',
    z.object({
      id: z.number(),
      name: z.string(),
    })
  ));
```

Is the same as :
```typescript
const apiClient = new Zodios(BASE_URL, [
  {
    method: "get",
    path: "/users",
    alias: "getUsers",
    description: "Get all users",
    response: z.array(userSchema),
  },
  {
    method: "get",
    path: "/users/:id",
    alias: "getUser",
    description: "Get a user",
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
        description: "The object to create",
        schema: userSchema.partial(),
      },
    ],
    response: userSchema,
  },
  {
    method: "put",
    path: "/users/:id",
    alias: "updateUser",
    description: "Update a user",
    parameters: [
      {
        name: "body",
        type: "Body",
        description: "The object to update",
        schema: userSchema,
      },
    ],
    response: userSchema,
  },
  {
    method: "patch",
    path: "/users/:id",
    alias: "patchUser",
    description: "Patch a user",
    parameters: [
      {
        name: "body",
        type: "Body",
        description: "The object to patch",
        schema: userSchema.partial(),
      },
    ],
    response: userSchema,
  },
  {
    method: "delete",
    path: "/users/:id",
    alias: "deleteUser",
    description: "Delete a user",
    response: userSchema,
  },
] as const);
```

## React helpers

Zodios comes with a Query and Mutation hook helper.  
It's a thin wrapper around React-Query but with zodios auto completion.
  
Zodios query hook also returns an invalidation helper to allow you to reset react query cache easily
  
```typescript
import React from "react";
import { QueryClient, QueryClientProvider } from "react-query";
import { Zodios } from "@zodios/core";
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
] as const;
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

## Dependencies

Zodios do not embed any dependency. It's your Job to install the peer dependencies you need.  
  
Internally Zodios uses these libraries on all platforms :
- zod
- axios
  
In addition, it also uses on NodeJS :
- formdata-node
- form-data-encoder
