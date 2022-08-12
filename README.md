 <h1 align="center">Zodios</h1>
 <p align="center">
   <a href="https://github.com/ecyrbe/zodios">
     <img align="center" src="https://raw.githubusercontent.com/ecyrbe/zodios/main/docs/logo.svg" width="128px" alt="Zodios logo">
   </a>
 </p>
 <p align="center">
    Zodios is a typescript api client with auto-completion features backed by <a href="https://axios-http.com" >axios</a> and <a href="https://github.com/colinhacks/zod">zod</a>
    <br/>
    <a href="https://ecyrbe.github.io/zodios/">Documentation</a>
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
  
**Table of contents:**

- [What is it ?](#what-is-it-)
- [Install](#install)
- [How to use it ?](#how-to-use-it-)
  - [Declare your API with zodios](#declare-your-api-with-zodios)
  - [API definition format](#api-definition-format)
  - [Get underlying axios instance](#get-underlying-axios-instance)
  - [Give your own axios instance to zodios](#give-your-own-axios-instance-to-zodios)
  - [Disable zodios validation](#disable-zodios-validation)
  - [Use zod transformations](#use-zod-transformations)
  - [Send multipart/form-data requests](#send-multipartform-data-requests)
  - [Send application/x-www-form-urlencoded requests](#send-applicationx-www-form-urlencoded-requests)
  - [CRUD helper](#crud-helper)
  - [React helpers](#react-helpers)
- [Plugin system](#plugin-system)
  - [Use fetch on browser](#use-fetch-on-browser)
  - [Use token provider plugin](#use-token-provider-plugin)
  - [Use a plugin only for some endpoints](#use-a-plugin-only-for-some-endpoints)
  - [Override plugin](#override-plugin)
  - [Plugin execution order](#plugin-execution-order)
  - [Write your own plugin](#write-your-own-plugin)
- [Roadmap](#roadmap)
- [Dependencies](#dependencies)

# Install

```bash
> npm install @zodios/core
```

or

```bash
> yarn add @zodios/core
```

# How to use it ?

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
## API definition format

```typescript
type ZodiosEndpointDescriptions = Array<{
  method: 'get'|'post'|'put'|'patch'|'delete';
  path: string; // example: /posts/:postId/comments/:commentId
  alias?: string; // example: getPostComments
  description?: string;
  requestFormat?: 'json'|'form-data'|'form-url'|'binary'|'text'; // default to json if not set
  parameters?: Array<{
    name: string;
    description?: string;
    type: 'Query'|'Body'|'Header';
    schema: ZodSchema; // you can use zod `transform` to transform the value of the parameter before sending it to the server
  }>;
  response: ZodSchema; // you can use zod `transform` to transform the value of the response before returning it
}>;
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

## Disable zodios validation

You can disable zod validation for both parameters and responses. But be aware that this will also disable zod transformations.
So if you want to disable zod validation, do not use transformations.

```typescript
const apiClient = new Zodios(
  "https://jsonplaceholder.typicode.com",
  [ ... ] as const,
  {
    validate: false
  }
);
```

## Use zod transformations

Since Zodios is using zod, you can use zod transformations.

```typescript
const apiClient = new Zodios(
  "https://jsonplaceholder.typicode.com",
  [
    {
      method: "get",
      path: "/users/:id",
      alias: "getUser",
      description: "Get a user",
      response: z.object({
        id: z.number(),
        name: z.string(),
      }).transform(({ name,...rest }) => ({
        ...rest,
        firstname: name.split(" ")[0],
        lastname: name.split(" ")[1],
      })),
    },
  ] as const
);

const user = await apiClient.getUser({ params: { id: 7 } });

console.log(user);
```
It should output  
  
```js
{ id: 7, firstname: 'Kurtis', lastname: 'Weissnat' }
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
          schema: z.object({
            userName: z.string(),
            password: z.string(),
          }).transform(data=> qs.stringify(data)),
        }
      ],
      response: z.object({
        id: z.number(),
      }),
    }] as const,
  );
  const id = await apiClient.login({ userName: "user", password: "password" },
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

const baseUrl = "https://jsonplaceholder.typicode.com";
const zodios = new Zodios(baseUrl, [...] as const);
const zodiosHooks = new ZodiosHooks("jsonplaceholder", zodios);

const Users = () => {
  const {
    data: users,
    isLoading,
    error,
    invalidate: invalidateUsers, // zodios also provides invalidation helpers
  } = zodiosHooks.useQuery("/users"); // or useGetUsers();
  const { mutate } = zodiosHooks.useMutation("post", "/users", undefined, {
    onSuccess: () => invalidateUsers(),
  }); // or .useCreateUser(...);

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

# Plugin system

Zodios has a powefull plugin system that are middleware interceptors for requests and responses.  

## Use fetch on browser

__since__ version 2.2.0 of `@zodios/plugins`

Axios is using XHR on the browser. This might be a showstopper for your application, because XHR lacks some options of `fetch` you might rely on.  
For those use cases, you can use the `fetch` plugin that implements an axios adapter using the standard fetch.  
  
It's worth noting, that you should not use the `fetch` plugin on nodejs. Indeed, fetch lacks a lot of features on backend side and you should use axios default http adapter for node (default). If you still want to use fetch on your backend, you should use a polyfill, zodios does not provide one. 
**🚧 Warning 🚧** : Do not open an issue for `fetch` support on `nodejs` unless you are willing to add support for it with a PR at the same time. I might reconsider this position in the future when fetch becomes feature complete on nodejs.

```typescript
import { pluginFetch } from "@zodios/plugins";

apiClient.use(pluginFetch({
  // all fetch options are supported
  keepAlive: true,
}));
```
  
## Use token provider plugin

`@zodios/plugins` comes with a plugin to inject and renew your tokens :
```typescript
  import { pluginToken } from '@zodios/plugins';

  apiClient.use(pluginToken({
    getToken: async () => "token"
  }));
```
## Use a plugin only for some endpoints

Zodios plugin system is much like the middleware system of `express`. This means you can apply a plugin to a specific endpoint or to all endpoints.
  
```typescript
  import { pluginToken } from '@zodios/plugins';

  // apply a plugin by alias
  apiClient.use("getUser", pluginToken({
    getToken: async () => "token"
  }));
  // apply a plugin by endpoint
  apiClient.use("get","/users/:id", pluginToken({
    getToken: async () => "token"
  }));
```
## Override plugin

Zodios plugins can be named and can be overridden.
Here are the list of integrated plugins that are used by zodios by default :
- zodValidationPlugin : validation of response schema with zod library
- formDataPlugin : convert provided body object to `multipart/form-data` format
- formURLPlugin : convert provided body object to `application/x-www-form-urlencoded` format

For example, you can override internal 'zod-validation' plugin with your own validation plugin :
  
```typescript
  import { zodValidationPlugin } from '@zodios/core';
  import { myValidationInterceptor } from './my-custom-validation';
 
  apiClient.use({
    name: zodValidationPlugin().name, // using the same name as an already existing plugin will override it
    response: myValidationInterceptor,
  });
```

## Plugin execution order

Zodios plugins that are not attached to an endpoint are executed first.
Then plugins that match your endpoint are executed.
In addition, plugins are executed in their declaration order for requests, and in reverse order for responses.

example, `pluginLog` logs the message it takes as parameter when it's called :
  ```typescript
    apiClient.use(pluginLog('1'));
    apiClient.use("getUser", pluginLog('2'));
    apiClient.use("get","/users/:id", pluginLog('3'));

    apiClient.get("/users/:id", { params: { id: 7 } });

    // output :
    // request 1 
    // request 2
    // request 3
    // response 3
    // response 2
    // response 1
  ```

## Write your own plugin

Zodios plugins are middleware interceptors for requests and responses.
If you want to create your own, they should have the following signature :  
  
```typescript
export type ZodiosPlugin = {
  /**
   * Optional name of the plugin
   * naming a plugin allows to remove it or replace it later
   */
  name?: string;
  /**
   * request interceptor to modify or inspect the request before it is sent
   * @param api - the api description
   * @param request - the request config
   * @returns possibly a new request config
   */
  request?: (
    api: ZodiosEnpointDescriptions,
    config: AnyZodiosRequestOptions
  ) => Promise<AnyZodiosRequestOptions>;
  /**
   * response interceptor to modify or inspect the response before it is returned
   * @param api - the api description
   * @param config - the request config
   * @param response - the response
   * @returns possibly a new response
   */
  response?: (
    api: ZodiosEnpointDescriptions,
    config: AnyZodiosRequestOptions,
    response: AxiosResponse
  ) => Promise<AxiosResponse>;
  /**
   * error interceptor for response errors
   * there is no error interceptor for request errors
   * @param api - the api description
   * @param config - the config for the request
   * @param error - the error that occured
   * @returns possibly a new response or a new error
   */
  error?: (
    api: ZodiosEnpointDescriptions,
    config: AnyZodiosRequestOptions,
    error: Error
  ) => Promise<AxiosResponse>;
};
```

# Roadmap

Zodios is a work in progress. Here is a roadmap of the features that are planned for future releases :
- Improve API definition by adding either construction helpers or add more typescript magic to have better autocompletion and better error messages

The following will need investigation to check if it's doable :
- implement `@zodios/express` to define your API endpoints with express and share it with your frontend (like tRPC)
- implement `@zodios/nestjs` to define your API endpoints with nestjs and share it with your frontend (like tRPC)

You have other ideas ? [Let me know !](https://github.com/ecyrbe/zodios/discussions)
# Dependencies

Zodios do not embed any dependency. It's your Job to install the peer dependencies you need.  
  
Internally Zodios uses these libraries on all platforms :
- zod
- axios
  
In addition, it also uses on NodeJS :
- formdata-node
- form-data-encoder
