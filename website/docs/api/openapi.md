---
sidebar_position: 3
---

# OpenAPI


Zodios api definition format while simple can contain sufficient information to generate an OpenAPI documentation.

## `openApiBuilder`

`openApiBuilder` is a builder that can be used to generate an OpenAPI documentation from a Zodios api definition.

```ts
function openApiBuilder(info: OpenAPIV3.InfoObject): OpenApiBuilder
```

### Methods of the builder

| Method                                                                                                  | Description                                |
| ------------------------------------------------------------------------------------------------------- | ------------------------------------------ |
| addSecurityScheme(name: string, securityScheme: OpenAPIV3.SecuritySchemeObject)                         | add a security scheme to proctect the apis |
| addPublicApi(definitions: ZodiosEndpointDefinitions)                                                    | add an api with public endpoints           |
| addProtectedApi(scheme: string, definitions: ZodiosEndpointDefinitions, securityRequirement?: string[]) | add an api protected by a security scheme  |
| addServer(server: OpenAPIV3.ServerObject)                                                               | add a server to the openapi document       |
| setCustomTagsFn(tagsFromPathFn: (path: string) => string[])                                             | override the default tagsFromPathFn        |
| build() => OpenAPIV3.Document                                                                           | build the openapi document                 |


### Security scheme

The `securityScheme` allows you to specify an OpenAPI security scheme object. Zodios has 3 helper functions to generate the security scheme object.

#### Basic auth

```ts
import { basicAuthScheme } from "@zodios/openapi";

const doc = openApiBuilder(info)
            .addSecurityScheme('auth',basicAuthScheme())
            .addProtectedApi('auth', api)
            .build();
```

#### Bearer auth

```ts
import { bearerAuthScheme } from "@zodios/openapi";

const doc = openApiBuilder(info)
            .addSecurityScheme('bearer',bearerAuthScheme())
            .addProtectedApi('bearer', api)
            .build();
```

#### OAuth2

```ts

import { oauth2Scheme } from "@zodios/openapi";

const doc = openApiBuilder(info)
            .addSecurityScheme('oauth2',oauth2Scheme({
              implicit: {
                authorizationUrl: "https://example.com/oauth2/authorize",
                scopes: {
                  "read:users": "read users",
                  "write:users": "write users",
                },
              },
            }))
            .addProtectedApi('oauth2', api)
            .build();
```

### custom tags

The `tagsFromPathFn` option allows you to specify a function that returns an array of tags for a given path. This is useful if you want to group your endpoints by tags.

:::note
Zodios will by default deduce tags from the last named resource in the path. So for example, the path `/users/:id` will have the tag `users`, and the path `/users/:id/comments` will have the tag `comments`.
Only pass this option if you want to override this behavior.
:::

```ts
const doc = openApiBuilder(info)
            .addPublicApi(api)
            .setCustomTagsFn((path) => ({
                '/users': ['users'],
                '/users/:id': ['users'],
                '/users/:id/comments': ['users'],
              }[path])
            .build();
```
## `toOpenApi` - deprecated


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

## Examples

### swagger-ui-express

You can expose your OpenAPI documentation with the `@zodios/express` package.

```ts
import { serve, setup } from "swagger-ui-express";
import { zodiosApp } from "@zodios/express";
import { openApiBuilder } from "@zodios/openapi";
import { userApi, adminApi } from "./api";
import { userRouter } from './userRouter';
import { adminRouter } from './adminRouter';

const app = zodiosApp();

// expose user api endpoints
app.use('/api/v1', userRouter);
app.use('/api/v1', adminRouter);

// expose openapi documentation
const document = openApiBuilder({
  title: "User API",
  version: "1.0.0",
  description: "A simple user API",
})
  // you can declare as many security servers as you want
  .addServer({ url: "/api/v1" })
  // you can declare as many security schemes as you want
  .addSecurityScheme("admin", bearerAuthScheme())
  // you can declare as many apis as you want
  .addPublicApi(userApi)
  // you can declare as many protected apis as you want
  .addProtectedApi("admin", adminApi)
  .build();

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
