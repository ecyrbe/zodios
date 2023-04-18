 <h1 align="center">Zodios</h1>
 <p align="center">
   <a href="https://github.com/ecyrbe/zodios">
     <img align="center" src="https://raw.githubusercontent.com/ecyrbe/zodios/main/docs/logo.svg" width="128px" alt="Zodios logo">
   </a>
 </p>
 <p align="center">
    Zodios is a typescript api client and an optional api server with auto-completion features backed by <a href="https://axios-http.com" >axios</a> and <a href="https://github.com/colinhacks/zod">zod</a> and <a href="https://expressjs.com/">express</a>
    <br/>
    <a href="https://www.zodios.org/">Documentation</a>
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

https://user-images.githubusercontent.com/633115/185851987-554f5686-cb78-4096-8ff5-c8d61b645608.mp4

# What is it ?

It's an axios compatible API client and an optional expressJS compatible API server with the following features:  
  
- really simple centralized API declaration
- typescript autocompletion in your favorite IDE for URL and parameters
- typescript response types
- parameters and responses schema thanks to zod
- response schema validation
- powerfull plugins like `fetch` adapter or `auth` automatic injection
- all axios features available
- `@tanstack/query` wrappers for react and solid (vue, svelte, etc, soon)
- all expressJS features available (middlewares, etc.)

  
**Table of contents:**

- [What is it ?](#what-is-it-)
- [Install](#install)
  - [Client and api definitions :](#client-and-api-definitions-)
  - [Server :](#server-)
- [How to use it on client side ?](#how-to-use-it-on-client-side-)
  - [Declare your API with zodios](#declare-your-api-with-zodios)
  - [API definition format](#api-definition-format)
- [Full documentation](#full-documentation)
- [Ecosystem](#ecosystem)
- [Roadmap](#roadmap)
- [Dependencies](#dependencies)

# Install

## Client and api definitions :

```bash
> npm install @zodios/core
```

or

```bash
> yarn add @zodios/core
```

## Server :
  
```bash
> npm install @zodios/core @zodios/express
```

or

```bash
> yarn add @zodios/core @zodios/express
```

# How to use it on client side ?

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
      alias: "getUser", // optional alias to call this endpoint with it
      description: "Get a user",
      response: z.object({
        id: z.number(),
        name: z.string(),
      }),
    },
  ],
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
  immutable?: boolean; // flag a post request as immutable to allow it to be cached with react-query
  description?: string;
  requestFormat?: 'json'|'form-data'|'form-url'|'binary'|'text'; // default to json if not set
  parameters?: Array<{
    name: string;
    description?: string;
    type: 'Path'|'Query'|'Body'|'Header';
    schema: ZodSchema; // you can use zod `transform` to transform the value of the parameter before sending it to the server
  }>;
  response: ZodSchema; // you can use zod `transform` to transform the value of the response before returning it
  status?: number; // default to 200, you can use this to override the sucess status code of the response (only usefull for openapi and express)
  responseDescription?: string; // optional response description of the endpoint
  errors?: Array<{
    status: number | 'default';
    description?: string;
    schema: ZodSchema; // transformations are not supported on error schemas
  }>;
}>;
```
# Full documentation

Check out the [full documentation](https://www.zodios.org) or following shortcuts.

- [API definition](https://www.zodios.org/docs/category/zodios-api-definition)
- [Http client](https://www.zodios.org/docs/category/zodios-client)
- [React hooks](https://www.zodios.org/docs/client/react)
- [Solid hooks](https://www.zodios.org/docs/client/solid)
- [API server](http://www.zodios.org/docs/category/zodios-server)
- [Nextjs integration](http://www.zodios.org/docs/server/next)

# Ecosystem

- [openapi-zod-client](https://github.com/astahmer/openapi-zod-client): generate a zodios client from an openapi specification
- [@zodios/express](https://github.com/ecyrbe/zodios-express): full end to end type safety like tRPC, but for REST APIs
- [@zodios/plugins](https://github.com/ecyrbe/zodios-plugins) : some plugins for zodios
- [@zodios/react](https://github.com/ecyrbe/zodios-react) : a react-query wrapper for zodios
- [@zodios/solid](https://github.com/ecyrbe/zodios-solid) : a solid-query wrapper for zodios

# Roadmap for v11

for Zod` / `Io-Ts` :

  - By using the TypeProvider pattern we can now make zodios validation agnostic.

  - Implement at least ZodTypeProvider and IoTsTypeProvider since they both support `input` and `output` type inferrence

  - openapi generation will only be compatible with zod though

  - Not a breaking change so no codemod needed

- [x] MonoRepo:

  - Zodios will become a really large project so maybe migrate to turbo repo + pnpm

  - not a breaking change

- [ ] Transform:

  - By default, activate transforms on backend and disable on frontend (today it's the opposite), would make server transform code simpler since with this option we could make any transforms activated not just zod defaults.

  - Rationale being that transformation can be viewed as business code that should be kept on backend

  - breaking change => codemod to keep current defaults by setting them explicitly

- [x] Axios:

  - Move Axios client to it's own package `@zodios/axios` and keep `@zodios/core` with only common types and helpers

  - Move plugins to `@zodios/axios-plugins`

  - breaking change => easy to do a codemod for this

- [x] Fetch:

  - Create a new Fetch client with almost the same features as axios, but without axios dependency `@zodios/fetch`

  - Today we have fetch support with a plugin for axios instance (zodios maintains it's own axios network adapter for fetch). But since axios interceptors are not used by zodios plugins, we can make fetch implementation lighter than axios instance.

  - Create plugins package `@zodios/fetch-plugins`

  - Not sure it's doable without a lot of effort to keep it in sync/compatible with axios client

  - new feature, so no codemod needed

- [ ] React/Solid:  

   - make ZodiosHooks independant of Zodios client instance (axios, fetch)

   - not a breaking change, so no codemod needed

- [x] Client Request Config

  - uniform Query/Mutation with body sent on the config and not as a standalone object. This would allow to not do `client.deleteUser(undefined, { params: { id: 1 } })` but simply  `client.deleteUser({ params: { id: 1 } })`

  - breaking change, so a codemod would be needed, but might be difficult to implement

- [x] Mock/Tests:

  - if we implement an abstraction layer for client instance, relying on moxios to mock APIs response will likely not work for fetch implementation.

  - create a `@zodios/testing` package that work for both axios/fetch clients

  - new feature, so no breaking change (no codemod needed)

You have other ideas ? [Let me know !](https://github.com/ecyrbe/zodios/discussions)
# Dependencies

Zodios even when working in pure Javascript is better suited to be working with Typescript Language Server to handle autocompletion.
So you should at least use the one provided by your IDE (vscode integrates a typescript language server)
However, we will only support fixing bugs related to typings for versions of Typescript Language v4.5
Earlier versions should work, but do not have TS tail recusion optimisation that impact the size of the API you can declare.

Also note that Zodios do not embed any dependency. It's your Job to install the peer dependencies you need.  
  
Internally Zodios uses these libraries on all platforms :
- zod
- axios
