 <h1 align="center">Zodios Express</h1>
 <p align="center">
   <a href="https://github.com/ecyrbe/zodios-express">
     <img align="center" src="https://raw.githubusercontent.com/ecyrbe/zodios/main/docs/logo.svg" width="128px" alt="Zodios logo">
   </a>
 </p>
 <p align="center">
    Zodios express is a typescript end to end typesafe adapter for express using <a href="https://github.com/colinhacks/zod">zod</a>
    <br/>
 </p>
 
 <p align="center">
   <a href="https://www.npmjs.com/package/@zodios/express">
   <img src="https://img.shields.io/npm/v/@zodios/express.svg" alt="langue typescript">
   </a>
   <a href="https://www.npmjs.com/package/@zodios/express">
   <img alt="npm" src="https://img.shields.io/npm/dw/@zodios/express">
   </a>
   <a href="https://github.com/ecyrbe/zodios/blob/main/LICENSE">
    <img alt="GitHub" src="https://img.shields.io/github/license/ecyrbe/zodios-express">   
   </a>
   <img alt="GitHub Workflow Status" src="https://img.shields.io/github/workflow/status/ecyrbe/zodios-express/CI">
 </p>

https://user-images.githubusercontent.com/633115/185851987-554f5686-cb78-4096-8ff5-c8d61b645608.mp4

# What is it ?

It's an express adapter for zodios that helps you type your express routes.
  
- really simple centralized API declaration
- router endpoints autocompletion
- typescript autocompletion for query, path, header and body input parameters (`req` is fully typed)
- typescript autocompletion for response body (`res.json()`)
- input validation thanks to zod
- openapi specification generation out of the box (using swagger)
- end to end typesafe APIs (a la tRPC when using both @zodios/express and @zodios/core)
  
**Table of contents:**

- [What is it ?](#what-is-it-)
- [Install](#install)
- [How to use it ?](#how-to-use-it-)
  - [`zodiosApp` : Declare your API for fullstack end to end type safety](#zodiosapp--declare-your-api-for-fullstack-end-to-end-type-safety)
  - [`zodiosRouter` : Split your application with multiple routers](#zodiosrouter--split-your-application-with-multiple-routers)
  - [Error Handling](#error-handling)
- [Roadmap](#roadmap)

# Install

```bash
> npm install @zodios/express
```

or

```bash
> yarn add @zodios/express
```

# How to use it ?

For an almost complete example on how to use zodios and how to split your APIs declarations, take a look at [dev.to](examples/dev.to/) example.

## `zodiosApp` : Declare your API for fullstack end to end type safety

Here is an example of API declaration with Zodios.
  
in a common directory (ex: `src/common/api.ts`) :

```typescript
import { makeApi } from "@zodios/core";
import { z } from "zod";

const userApi = makeApi([
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
]);
```

in your frontend (ex: `src/client/api.ts`) :

```typescript
import { Zodios } from "@zodios/core";
import { userApi } from "../../common/api";

const apiClient = new Zodios(
  "https://jsonplaceholder.typicode.com",
  userApi
);

//   typed                     alias   auto-complete params
//     ▼                        ▼                   ▼
const user = await apiClient.getUser({ params: { id: 1 } });
```

in your backend (ex: `src/server/router.ts`) :
```typescript
import { zodiosApp } from "@zodios/express";
import { userApi } from "../../common/api";

// just an express adapter that is aware of  your api, app is just an express app with type annotations and validation middlewares
const app = zodiosApp(userApi);

//  auto-complete path  fully typed and validated input params (body, query, path, header)
//          ▼           ▼    ▼
app.get("/users/:id", (req, res) => {
  // res.json is typed thanks to zod
  res.json({
    //   auto-complete req.params.id
    //              ▼
    id: req.params.id,
    name: "John Doe",
  });
})

app.listen(3000);
```

## `zodiosRouter` : Split your application with multiple routers

When organizing your express application, you usually want to split your API declarations into separate Routers.
You can use the `zodiosRouter` to do that with a `zodiosApp` without APIs attached.

```typescript
import { zodiosApp, zodiosRouter } from "@zodios/express";

const app = zodiosApp(); // just an axpess app with type annotations
const userRouter = zodiosRouter(userApi); // just an express router with type annotations and validation middlewares
const adminRouter = zodiosRouter(adminApi); // just an express router with type annotations and validation middlewares

const app.use(userRouter,adminRouter);

app.listen(3000);
```
## Error Handling

Zodios express can infer the status code to match your API error response and also have your errors correctly typed.

```typescript
import { makeApi } from "@zodios/core";
import { zodiosApp } from "@zodios/express";
import { z } from "zod";

const userApi = makeApi([
  {
    method: "get",
    path: "/users/:id", // auto detect :id and ask for it in apiClient get params
    alias: "getUser", // optionnal alias to call this endpoint with it
    description: "Get a user",
    response: z.object({
      id: z.number(),
      name: z.string(),
    }),
    errors: [
      {
        status: 404,
        response: z.object({
          code: z.string(),
          message: z.string(),
          id: z.number(),
        }),
      }, {
        status: 'default', // default status code will be used if error is not 404
        response: z.object({
          code: z.string(),
          message: z.string(),
        }),
      },
    ],
  },
]);

const app = zodiosApp(userApi);
app.get("/users/:id", (req, res) => {
  try {
    const id = +req.params.id;
    const user = service.findUser(id);
    if(!user) {
      // match error 404 schema with auto-completion
      res.status(404).json({
        code: "USER_NOT_FOUND",
        message: "User not found",
        id, // compile time error if you forget to add id
      });
    } else {
      // match response schema with auto-completion
      res.json(user);
    }
  } catch(err) {
    // match default error schema with auto-completion
    res.status(500).json({
      code: "INTERNAL_ERROR",
      message: "Internal error",
    });
  }
})

app.listen(3000);
```

# Roadmap

- [] add support for swagger/openapi generation
- [] add utilities to combine api declarations to match the express router api
- [] add autocompletion for express `app.name()`
