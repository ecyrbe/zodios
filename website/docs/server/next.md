---
sidebar_position: 3
---

# Next integration

Next integration is easy, with end-to-end typesafe developer experience, where you can combine the power of all the Zodios packages into one single codebase.  

:::info
For more information about the Next framework, check out the [Next documentation](https://nextjs.org/docs)
:::

## File structure

To integrate zodios to NextJS, you need to create a `slug` file named `[...zodios].ts` in your api folder.
`@zodios/express` works out of the box with [NextJS](https://nextjs.org/) if you use the following structure:

```bash
│
├── src
│   ├── common
│   │   └── api.ts # API definition
│   ├── pages
│   │   ├── _app.tsx
│   │   ├── api
│   │   │   └── [...zodios].ts # import and re-export your main server app router here
│   │   └── [..]
│   ├── server
│   │   ├── routers
│   │   │   ├── app.ts   # import your API definition and export your main app router here
│   │   │   ├── users.ts  # sub routers
│   │   │   └── [..]
│   │   ├── context.ts # export your main app context here
└── [..]
```
:::tip It's recommended to use the example below to bootstrap your NextJS application. 
  It has correct setup for webpack configuration with `@zodios/react`
  [Example project](https://github.com/ecyrbe/zodios-express/tree/main/examples/next)
:::

## Bundling

If you are bundling your NextJS App with a custom library that embeds `@zodios/react` or `@tanstack/react-query`, you need to bundle you library with both `esm` and `cjs` support.
We recommend using [tsup](https://esbuild.github.io/) to bundle your library and declare your `package.json` like [this](https://github.com/ecyrbe/zodios/blob/main/package.json)
Else, you'll get the following error:

![error](https://user-images.githubusercontent.com/38932402/196659212-5bdb675f-d019-4d8b-8681-5f00ed24db4d.png)

## example

### Export your main router

```typescript title="/src/pages/api/[...zodios].ts"
import { app } from "../../server/routers/app";

export default app;
```

### Declare your main router

Use `zodiosNextApp` or `ctx.nextApp` to create your main app router.

```typescript title="/src/server/routers/app.ts"
import { zodiosNextApp } from "@zodios/express";
import { userRouter } from "./users";

export const app = zodiosNextApp();
app.use("/api", userRouter);
```

### Declare your sub routers

Use `zodiosRouter` or `ctx.router` to create your sub routers.

```typescript title="/src/server/routers/users.ts"
import { zodiosRouter } from "@zodios/express";
import { userService } from "../services/users";
import { userApi } from "../../common/api";

export const userRouter = zodiosRouter(userApi);

userRouter.get("/users", async (req, res) => {
  const users = await userService.getUsers();
  res.status(200).json(users);
});

userRouter.get("/users/:id", async (req, res, next) => {
  const user = await userService.getUser(req.params.id);
  if (!user) {
    return res.status(404).json({
      error: {
        code: 404,
        message: "User not found",
      },
    });
  }
  return res.status(200).json(user);
});

userRouter.post("/users", async (req, res) => {
  const createdUser = await userService.createUser(req.body);
  res.status(201).json(createdUser);
});
```
