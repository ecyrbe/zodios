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
  }
): OpenAPIV3.Document;
```

### Examples

### swagger-ui-express

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

## OpenAPI to Zodios API definition

If you want to use an existing OpenAPI documentation to generate your Zodios API definition, you can use the [openapi-zod-client](https://github.com/astahmer/openapi-zod-client) package.

```bash
npx openapi-zod-client "swagger.json" -o "zodios-client.ts"
```
