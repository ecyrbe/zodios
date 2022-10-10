---
sidebar_position: 3
---

# OpenAPI
## Zodios API definition to OpenAPI

Zodios api definition format while simple can contain sufficient information to generate an OpenAPI documentation.

To generate an OpenAPI documentation from your api definition, you can use the `toOpenApi` method of `@zodios/openapi` package.

```ts
function toOpenApi(
  api: ZodiosApiDefinition,
  options?: {
    info?: OpenAPIV3.InfoObject
    servers?: OpenAPIV3.ServerObject[];
    securityScheme?: OpenAPIV3.SecuritySchemeObject;
    tagsFromPathFn?: (path: string) => string[];
  }
): OpenAPIV3.Document;
```

### Info option

The `info` option allows you to specify the OpenAPI info object.

```ts
const doc = toOpenApi(api, {
  info: {
    title: "My API",
    version: "1.0.0",
  },
});
```

### Servers option

The `servers` option allows you to specify the OpenAPI servers object. This is useful if you want to specify the base url of your api.

```ts
const doc = toOpenApi(api, {
  servers: [
    {
      url: "https://api.example.com",
    },
  ],
});
```

### Security scheme option

The `securityScheme` option allows you to specify the OpenAPI security scheme object. Zodios has 3 helper functions to generate the security scheme object.

#### Basic auth

```ts
import { basicAuthScheme } from "@zodios/openapi";

const doc = toOpenApi(api, {
  securityScheme: basicAuthScheme(),
});
```

#### Bearer auth

```ts
import { bearerAuthScheme } from "@zodios/openapi";

const doc = toOpenApi(api, {
  securityScheme: bearerAuthScheme(),
});
```

#### OAuth2

```ts

import { oauth2Scheme } from "@zodios/openapi";

const doc = toOpenApi(api, {
  securityScheme: oauth2Scheme({
    implicit: {
      authorizationUrl: "https://example.com/oauth2/authorize",
      scopes: {
        "read:users": "read users",
        "write:users": "write users",
      },
    },
  }),
});
```

### custom tags

The `tagsFromPathFn` option allows you to specify a function that returns an array of tags for a given path. This is useful if you want to group your endpoints by tags.

:::note
Zodios will by default deduce tags from the last named resource in the path. So for example, the path `/users/:id` will have the tag `users`, and the path `/users/:id/comments` will have the tag `comments`.
Only pass this option if you want to override this behavior.
:::

```ts
const doc = toOpenApi(api, {
  // hardcoded tags with dictionary
  tagsFromPathFn: (path) => {
    '/users': ['users'],
    '/users/:id': ['users'],
    '/users/:id/comments': ['users'],
  }[path],
});
```
### Examples

#### swagger-ui-express

You can expose your OpenAPI documentation with the `@zodios/express` package.

```ts
import { serve, setup } from "swagger-ui-express";
import { makeApi } from "@zodios/core";
import { zodiosApp, zodiosRouter } from "@zodios/express";
import { toOpenApi } from "@zodios/openapi";
import { userApi } from "./api";
import { userRouter } from './userRouter';

const app = zodiosApp();

// expose user api endpoints
app.use('/api/v1', userRouter);

// expose openapi documentation
const document = toOpenApi(userApi, {
  info: {
    title: "User API",
    version: "1.0.0",
    description: "A simple user API",
  },
  servers: [
    {
      url: "/api/v1", // base path of user api
    },
  ],
});

app.use(`/docs/swagger.json`, (_, res) => res.json(document));
app.use("/docs", serve);
app.use("/docs", setup(undefined, { swaggerUrl: "/docs/swagger.json" }));

app.listen(3000);
```

Result:  
![openapi](/img/openapi.png)

## OpenAPI to Zodios API definition

If you want to use an existing OpenAPI documentation to generate your Zodios API definition, you can use the [openapi-zod-client](https://github.com/astahmer/openapi-zod-client) package.

```bash
npx openapi-zod-client "swagger.json" -o "zodios-client.ts"
```
