---
sidebar_position: 3
---

# Next integration

Next integration is easy, with end-to-end typesafe developper experience, where you can combine the power of all the Zodios packages into one single codebase.  

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

:::caution
If you are using `@zodios/react` on the client side, you need to customize your next config to tell it to share the same instance with `@tanstack/react-query` :
```js title="next.config.js"
const path = require("path");

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  webpack: (config, options) => {
    if (options.isServer) {
      config.externals = ["@tanstack/react-query", ...config.externals];
    }
    const reactQuery = path.resolve(require.resolve("@tanstack/react-query"));
    config.resolve.alias["@tanstack/react-query"] = reactQuery;
    return config;
  },
};

module.exports = nextConfig;
``` 
:::

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