---
sidebar_position: 3
---

# Next integration

Next integration is easy, with end-to-end typesafe developper experience, where you can combine the powwer of all the Zodios packages into one single codebase.  


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
└── [..]
```
:::tip It's recommended to use the example below to bootstrap your NextJS application.
  [Example project](https://github.com/ecyrbe/zodios-express/tree/main/examples/next)
:::

## example

### Export your main router

```typescript title="/src/pages/api/[...zodios].ts"
import { app } from "../../server/routers/app";

export default app;
```

### Declare your main router

Use `zodiosNextApp` to create your main app router.

```typescript title="/src/server/routers/app.ts"
import { zodiosNextApp } from "@zodios/express";
import { userRouter } from "./users";

export const app = zodiosNextApp();
app.use("/api", userRouter);
```

### Declare your sub routers

Use `zodiosRouter` to create your sub routers.

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