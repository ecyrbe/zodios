---
sidebar_position: 2
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

### Options

| Property             | Type           | Description                                            |
| -------------------- | -------------- | ------------------------------------------------------ |
| router               | express.Router | optional express router - default to express.Router()  |
| enableJsonBodyParser | boolean        | enable json body parser - default to true              |
| validate             | boolean        | enable zod input validation - default to true          |
| transform            | boolean        | enable zod input transformation - default to false     |
| caseSensitive        | boolean        | enable case sensitive path matching - default to false |
| strict               | boolean        | enable strict path matching - default to false         |


### Example

```typescript
import { zodiosApp, zodiosRouter } from "@zodios/express";

const app = zodiosApp(); // just an axpess app with type annotations
const userRouter = zodiosRouter(userApi); // just an express router with type annotations and validation middlewares
const adminRouter = zodiosRouter(adminApi); // just an express router with type annotations and validation middlewares

const app.use(userRouter,adminRouter);

app.listen(3000);
```
