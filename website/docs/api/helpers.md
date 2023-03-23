---
sidebar_position: 2
---

# API definition helpers

Usually, you'll want to define your API definition in a separate file and import it in your server and client code.
For this use case, Zodios provides some helpers to make your life easier and still keep your API definition correctly inferred without needing to use Typescript `as const`.  

:::caution
These helpers, are mandatory to be used when declaring your definitions outside of `Zodios` constructor to allow your API definitions to be correctly inferred in both pure Javascript and Typescript.
:::

## makeApi

`makeApi` is a helper to narrow your api definitions and make some runtime checks.

```ts
function makeApi(api: ZodiosEndpointDescriptions): ZodiosEndpointDescriptions;
```

**Example**
```ts
import { makeApi } from "@zodios/core";

const api = makeApi([
  {
    method: "get",
    path: "/users/:id",
    response: user,
    alias: "getUser",
    description: "Get user",
  },
  {
    method: "get",
    path: "/users",
    response: z.array(user),
    alias: "getUsers",
    description: "Get users",
  },
]);
```

## makeEndpoint

`makeEndpoint` is a helper to narrow a single endpoint definition and make some runtime checks.

```ts
function makeEndpoint(endpoint: ZodiosEndpointDescription): ZodiosEndpointDescription;
```

**Example**
```ts
import { makeEndpoint } from "@zodios/core";

const getUser = makeEndpoint({
  method: "get",
  path: "/users/:id",
  response: user,
  alias: "getUser",
  description: "Get user",
});
```

it can then be combined with `makeApi` to compose a full api description.

```ts
import { makeApi } from "@zodios/core";
import { getUser,getUsers } from "./endpoints";

const api = makeApi([getUser, getUsers]);
```

## makeParameters

`makeParameters` is a helper to narrow your parameter definitions.

```ts
function makeParameters(params: ZodiosEndpointParameters): ZodiosEndpointParameters;
```

**Example**
```ts
import { makeParameters } from "@zodios/core";

const params = makeParameters([
  {
    name: "limit",
    description: "Limit",
    schema: z.number().positive(),
  },
  {
    name: "offset",
    description: "Offset",
    schema: z.number().positive(),
  },
]);
```

## makeErrors

`makeErrors` is a helper to narrow your error definitions.

```ts
function makeErrors(errors: ZodiosEndpointErrors): ZodiosEndpointErrors;
```

**Example**
```ts
import { makeErrors } from "@zodios/core";

const errors = makeErrors([
  {
    status: 404,
    description: "User not found",
    schema: z.object({
      error: z.object({
        userId: z.number(),
        code: z.string(),
        message: z.string(),
      }),
    }),
  },
  {
    status: "default",
    description: "Default error",
    schema: z.object({
      error: z.object({
        code: z.string(),
        message: z.string(),
      }),
    }),
  },
]);
```

## apiBuilder

`apiBuilder` is a helper to build API definitions with better type autocompletion.

```ts
function apiBuilder(endpoint: ZodiosEndpointDescription): ApiBuilder;
```

### ApiBuilder methods

ApiBuilder is a helper to build API definitions with better type autocompletion.

| methods     | parameters                | return                     | Description                |
| ----------- | ------------------------- | -------------------------- |
| addEndpoint | ZodiosEndpointDescription | ApiBuilder                 | Add an endpoint to the API |
| build       | none                      | ZodiosEndpointDescriptions | Build the API              |

**Example**
```ts
import { apiBuilder } from "@zodios/core";

const api = apiBuilder({
  method: "get",
  path: "/users",
  response: z.array(user),
  alias: "getUsers",
  description: "Get users",
})
  .addEndpoint({
    method: "get",
    path: "/users/:id",
    response: user,
    alias: "getUser",
    description: "Get user",
  })
  .build();
```

## mergeApis

`mergeApis` is a helper to merge multiple API definitions in a router friendly way.

```ts
function mergeApis(apis: Record<string,ZodiosEndpointDescriptions>): ZodiosEndpointDescriptions;
```

**Example**
```ts
import { mergeApis } from "@zodios/core";
import { usersApi } from "./users";
import { postsApi } from "./posts";

const api = mergeApis({
  '/users': usersApi,
  '/posts': postsApi,
});
```
