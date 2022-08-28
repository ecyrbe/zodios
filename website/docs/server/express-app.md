---
sidebar_position: 1
---

# Zodios Application

A Zodios application is a simple adapter for [Express](https://expressjs.com/). It's an express instance but with full typesafety and autocompletion.

:::info
For more information on how to use express, check out the [Express documentation](https://expressjs.com/)
:::

## `zodiosApp`

To upgrade an existing express application with typesafety, replace your `express()` calls to `zodiosApp(api)`

```ts
function zodiosApp(api?: ZodiosEndpointDescriptions, options?: ZodiosAppOptions): ZodiosApp
```

### Options

| Property             | Type     | Description                                        |
| -------------------- | -------- | -------------------------------------------------- |
| express              | Express> | optional express instance - default to express()   |
| enableJsonBodyParser | boolean  | enable json body parser - default to true          |
| validate             | boolean  | enable zod input validation - default to true      |
| transform            | boolean  | enable zod input transformation - default to false |

## Examples

### Express Application


```ts title="/src/server/app.ts"
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

### Error Handling

Zodios express can infer the status code to match your API error response and also have your errors correctly typed.

```typescript title="/src/server/app.ts"
import { asApi } from "@zodios/core";
import { zodiosApp } from "@zodios/express";
import { z } from "zod";

const userApi = asApi([
  {
    method: "get",
    path: "/users/:id",
    alias: "getUser",
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
