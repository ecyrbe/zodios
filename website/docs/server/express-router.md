---
sidebar_position: 3
---

# Zodios Router

Zodios Router allows you to split your API endpoints into different files. You need attach an API definition for each router for them to be typesafe and give you autocompletion.

:::info
For more information on how to use express Router, check out the [Express documentation](https://expressjs.com/en/guide/routing.html)
:::

## `zodiosRouter`

To upgrade an existing express router with typesafety, replace your `express.Router()` calls to `zodiosRouter(api)`.  

```ts
function zodiosRouter(api?: ZodiosEndpointDescriptions, options?: ZodiosRouterOptions): ZodiosRouter
```

## `ctx.router`

You can also create a context aware express router with `ctx.router`:

```ts
Context.router(api?: ZodiosEndpointDescriptions, options?: ZodiosRouterOptions): ZodiosRouter
```

## Options

| Property               | Type                         | Description                                                           |
| ---------------------- | ---------------------------- | --------------------------------------------------------------------- |
| router                 | express.Router               | optional express router - default to express.Router()                 |
| enableJsonBodyParser   | boolean                      | enable json body parser - default to true                             |
| validate               | boolean                      | enable zod input validation - default to true                         |
| transform              | boolean                      | enable zod input transformation - default to false                    |
| validationErrorHandler | RouterValidationErrorHandler | error handler for validation errors - default to `defaulErrorHandler` |
| caseSensitive          | boolean                      | enable case sensitive path matching - default to false                |
| strict                 | boolean                      | enable strict path matching - default to false                        |

```ts
type RouterValidationErrorHandler = (
  err: {
      context: string;
      error: z.ZodIssue[];
  },
  req: Request,
  res: Response,
  next: NextFunction
): void;
```

## Examples


### Express Router from context

```ts

import { zodiosContext } from "@zodios/express";
import z from "zod";
import { userApi } from "../../common/api";
import { userMiddleware } from "./userMiddleware";

const ctx = zodiosContext(z.object({
  user: z.object({
    id: z.number(),
    name: z.string(),
    isAdmin: z.boolean(),
  }),
}));

const router = ctx.router();

// middleware that adds the user to the context
router.use(userMiddleware);
```

### Merge multiple routers

```ts
import { zodiosApp, zodiosRouter } from "@zodios/express";

const app = zodiosApp(); // just an axpess app with type annotations
const userRouter = zodiosRouter(userApi); // just an express router with type annotations and validation middlewares
const adminRouter = zodiosRouter(adminApi); // just an express router with type annotations and validation middlewares

const app.use(userRouter,adminRouter);

app.listen(3000);
```

or context aware

```ts
import { zodiosContext } from "@zodios/express";

const ctx = zodiosContext(z.object({
  user: z.object({
    id: z.number(),
    name: z.string(),
    isAdmin: z.boolean(),
  }),
}));

const app = ctx.app();
const userRouter = ctx.router(userApi);
const adminRouter = ctx.router(adminApi);

app.use(userRouter,adminRouter);

app.listen(3000);
```
