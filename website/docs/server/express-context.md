---
sidebar_position: 1
---

# Zodios Context

Zodios context allows you to declare a context object that will be available in all your zodios handlers.
Usually in express apps, you would use `req` to store some data, like `req.user`, that you want to access in all your handlers.
Zodios context allows you to do the same it by declaring a context schema , and this way have your `req.user` properly typed.

## Creating a context

To create a context, you need to use the `zodiosContext` function.

```ts
import { zodiosContext } from "@zodios/express";
import z from "zod";

const ctx = zodiosContext({
  user: z.object({
    id: z.number(),
    name: z.string(),
  }),
});
```

## Creating a context-aware app

To create a context-aware app, you need to use the `app()` method of the context.

```ts
const app = ctx.app();
```

## Creating a context-aware router

To create a context-aware router, you need to use the `router()` method of the context.

```ts
const router = ctx.router();
```
