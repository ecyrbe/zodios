---
sidebar_position: 2
---

# API definition helpers

Usually, you'll want to define your API definition in a separate file and import it in your server and client code.
For this use case, Zodios provides some helpers to make your life easier and still keep your API definition correctly inferred without needing to use Typescript `as const`.  
These helpers, allow your API definitions to be correctly inferred in both pure Javascript and Typescript.

## asApi

`asApi` is a helper to narrow your api definitions and make some runtime checks.

```ts
function asAPI(api: ZodiosEndpointDescriptions): ZodiosEndpointDescriptions;
```

**Example**
```ts
import { asApi } from "@zodios/core";

const api = asApi([
  {
    method: "GET",
    path: "/users/:id",
    response: user,
    alias: "getUser",
    description: "Get user",
  },
  {
    method: "GET",
    path: "/users",
    response: z.array(user),
    alias: "getUsers",
    description: "Get users",
  },
]);
```

## asParameters

`asParameters` is a helper to narrow your parameter definitions.

```ts
function asParameters(params: ZodiosEndpointParameters): ZodiosEndpointParameters;
```

**Example**
```ts
import { asParameters } from "@zodios/core";

const params = asParameters([
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

## asErrors

`asErrors` is a helper to narrow your error definitions.

```ts
function asErrors(errors: ZodiosEndpointErrors): ZodiosEndpointErrors;
```

**Example**
```ts
import { asErrors } from "@zodios/core";

const errors = asErrors([
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
  method: "GET",
  path: "/users",
  response: z.array(user),
  alias: "getUsers",
  description: "Get users",
})
  .addEndpoint({
    method: "GET",
    path: "/users/:id",
    response: user,
    alias: "getUser",
    description: "Get user",
  })
  .build();
```