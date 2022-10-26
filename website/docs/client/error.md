---
sidebar_position: 2
---

# Client Error Handling

Error handling is a very important part of any API client. Zodios provides helpers to handle errors in a typesafe way.
Indeed, many things can go wrong when making a request to an API. The server can be down, the request can be malformed, the response can be malformed, the response can be a 404, etc.

## `matchErrorByPath`

`matchErrorByPath` is a helper function that allows you to match errors by their path. It is very useful when you have a lot of errors and you want to handle them in a typesafe way.

```typescript
function matchErrorByPath(api: ZodiosEndpointDefinitions, method: string, path: string, error: unknown): 
{
    type: typeof ZodiosMatchingErrorType.ValidationError;
    error: ZodiosError;
} | 
{
    type: typeof ZodiosMatchingErrorType.UnexpectedError;
    error: AxiosError;
} | 
{
    type: typeof ZodiosMatchingErrorType.ExpectedError;
    error: AxiosError<InferredTypeByStatusAndPath>
} |
{
    type: typeof ZodiosMatchingErrorType.Error;
    error: Error;
} | 
{
    type: typeof ZodiosMatchingErrorType.UnknownError;
    error: unknown;
};
```

## `matchErrorByAlias`

`matchErrorByAlias` is a helper function that allows you to match errors by their alias. It is very useful when you have a lot of errors and you want to handle them in a typesafe way.

```typescript
function matchErrorByAlias(api: ZodiosEndpointDefinitions, alias: string, error: unknown): 
{
    type: typeof ZodiosMatchingErrorType.ValidationError;
    error: ZodiosError;
} | 
{
    type: typeof ZodiosMatchingErrorType.UnexpectedError;
    error: AxiosError;
} | 
{
    type: typeof ZodiosMatchingErrorType.ExpectedError;
    error: AxiosError<InferredTypeByStatusAndPath>
} |
{
    type: typeof ZodiosMatchingErrorType.Error;
    error: Error;
} | 
{
    type: typeof ZodiosMatchingErrorType.UnknownError;
    error: unknown;
};
```

## Example

```typescript
import { matchErrorByPath, makeApi, Zodios } from "@zodios/core";

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
  const response = await apiClient.getUser({ id: 1 });
} catch (error) {
  // you can also do:
  // - matchErrorByPath(zodios.api, "get", "/users/:id", error)
  // - matchErrorByAlias(api, "getUser", error)
  // - matchErrorByAlias(zodios.api, "getUser", error)
  const match = matchErrorByPath(api, "get", "/users/:id", error);

  if (match.type === "ValidationError") {
    // match.error is a ZodiosError
  } else if (match.type === "UnexpectedError") {
    // match.error is an AxiosError but the response is cannot be determined at compile time
    // the cause is usually an insufficient api errors definition
  } else if (match.type === "ExpectedError") {
    // match.error is an AxiosError and the response is determined at compile time
    if(match.status === 404) {
      // match.error.response.data is guaranteed to be of type { message: string, specificTo404: string }
    } else {
      // match.error.response.data is guaranteed to be of type { message: string }
    }
  } else if (match.type === "Error") {
    // match.error is an Error
  } else if (match.type === "UnknownError") {
    // match.error is an unknown error
  }
}
```