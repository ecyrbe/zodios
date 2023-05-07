---
sidebar_position: 2
---

# Client Error Handling

Error handling is a very important part of any API client. Zodios provides helpers to handle errors in a typesafe way.
Indeed, many things can go wrong when making a request to an API. The server can be down, the request can be malformed, the response can be malformed, the response can be a 404, etc.

## `isErrorFromPath`

`isErrorFromPath` is a type guard that allows you to check if an error is an expected error by its path. Allowing to have typesafe error handling.

```ts
function isErrorFromPath(api: ZodiosEndpointDefinitions, method: string, path: string, error: unknown): error is AxiosError<ErrorsFromDefinition>
```

## `isErrorFromAlias`

`isErrorFromAlias` is a type guard that allows you to check if an error is an expected error by its alias. Allowing to have typesafe error handling.

```ts
function isErrorFromAlias(api: ZodiosEndpointDefinitions, alias: string, error: unknown): error is AxiosError<ErrorsFromDefinition>
```

## Example

```typescript
import { isErrorFromPath, makeApi, Zodios } from "@zodios/core";

const api = makeApi([
  {
    path: "/users/:id",
    method: "get",
    alias: "getUser",
    response: z.object({
      id: z.number(),
      name: z.string(),
    }),
    errors: [
      {
        status: 404,
        schema: z.object({
          message: z.string(),
          specificTo404: z.string(),
        }),
      },
      {
        status: 'default',
        schema: z.object({
          message: z.string(),
        }),
      }
    ],
  },
]);

const apiClient = new Zodios(api);

try {
  const response = await apiClient.getUser({ params: { id: 1 } });
} catch (error) {
  // you can also do:
  // - isErrorFromPath(zodios.api, "get", "/users/:id", error)
  // - isErrorFromAlias(api, "getUser", error)
  // - isErrorFromAlias(zodios.api, "getUser", error)
  if(isErrorFromPath(api, "get", "/users/:id", error)){
    // error type is now narrowed to an axios error with a response from the ones defined in the api
    if(error.response.status === 404) {
      // error.response.data is guaranteed to be of type { message: string, specificTo404: string }
    } else {
      // error.response.data is guaranteed to be of type { message: string }
    }
  }
}
```