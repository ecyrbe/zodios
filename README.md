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
- bearer token injection and token renewal with simple token provider interface
- all axios features available
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
      alias: "getUser", // optionnal alias to call this endpoint with it
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
    type: 'Query'|'Body'|'Header';
    schema: ZodSchema; // you can use zod `transform` to transform the value of the parameter before sending it to the server
  }>;
  response: ZodSchema; // you can use zod `transform` to transform the value of the response before returning it
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
- [API server](http://www.zodios.org/docs/category/zodios-server)
- [Nextjs integration](http://www.zodios.org/docs/server/next)

# Ecosystem

- [openapi-zod-client](https://github.com/astahmer/openapi-zod-client): generate a zodios client from an openapi specification
- [@zodios/express](https://github.com/ecyrbe/zodios-express): full end to end type safety like tRPC, but for REST APIs
- [@zodios/plugins](https://github.com/ecyrbe/zodios-plugins) : some plugins for zodios
- [@zodios/react](https://github.com/ecyrbe/zodios-react) : a react-query wrapper for zodios

# Roadmap

The following will need investigation to check if it's doable :
- implement `@zodios/nestjs` to define your API endpoints with nestjs and share it with your frontend (like tRPC)
- generate openAPI json from your API endpoints

You have other ideas ? [Let me know !](https://github.com/ecyrbe/zodios/discussions)
# Dependencies

Zodios do not embed any dependency. It's your Job to install the peer dependencies you need.  
  
Internally Zodios uses these libraries on all platforms :
- zod
- axios
  
In addition, it also uses on NodeJS :
- formdata-node
- form-data-encoder
