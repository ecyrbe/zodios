---
sidebar_position: 4
---

# Typescript

Even though zodios is written in typescript, you can use it with javascript. However, if you are using typescript, you can benefit from the typescript type helpers.

## `ApiOf`

`ApiOf` is a type helper that extracts the api definition type from your zodios client instance.

```ts
import { ApiOf, Zodios } from '@zodios/core';;
import { myApiDefinition } from './api-definition';

const client = new Zodios(myApiDefinition);

type MyApi = ApiOf<typeof client>;
```
## `ZodiosBodyByPath`

`ZodiosBodyByPath` is a type helper that extracts the body type of a request from your api definition.

```ts
import { ZodiosBodyByPath } from '@zodios/core';
import { MyApi } from './my-api';

type User = ZodiosBodyByPath<MyApi,'post','/users'>;
```

## `ZodiosBodyByAlias`

`ZodiosBodyByAlias` is a type helper that extracts the body type of a request from your api definition.

```ts
import { ZodiosBodyByAlias } from '@zodios/core';
import { MyApi } from './my-api';

type User = ZodiosBodyByAlias<MyApi,'createUsers'>;
```
## `ZodiosHeaderParamsByPath`

`ZodiosHeaderParamsByPath` is a type helper that extracts the header params type of a request from your api definition.

```ts
import { ZodiosHeaderParamsByPath } from '@zodios/core';
import { MyApi } from './my-api';

type CreateUsersHeaderParams = ZodiosHeaderParamsByPath<MyApi,'post','/users'>;
```
## `ZodiosHeaderParamsByAlias`

`ZodiosHeaderParamsByAlias` is a type helper that extracts the header params type of a request from your api definition.

```ts
import { ZodiosHeaderParamsByAlias } from '@zodios/core';
import { MyApi } from './my-api';

type CreateUsersHeaderParams = ZodiosHeaderParamsByAlias<MyApi,'createUsers'>;
```

## `ZodiosPathParamsByPath`

`ZodiosPathParamsPath` is a type helper that extracts the path params type of a request from your api definition.

```ts
import { ZodiosPathParamsByPath } from '@zodios/core';
import { MyApi } from './my-api';

type GetUserPathParams = ZodiosPathParamsByPath<MyApi,'get','/users/:id'>;
```
## `ZodiosPathParamByAlias`

`ZodiosPathParamByAlias` is a type helper that extracts the path params type of a request from your api definition.
  
```ts
import { ZodiosPathParamByAlias } from '@zodios/core';
import { MyApi } from './my-api';

type GetUserPathParams = ZodiosPathParamByAlias<MyApi,'getUser'>;
```
## `ZodiosResponseByPath`

`ZodiosResponseByPath` is a type helper that extracts the response type of a request from your api definition.

```ts
import { ZodiosResponseByPath } from '@zodios/core';
import { MyApi } from './my-api';

type Users = ZodiosResponseByPath<MyApi,'get','/users'>;
```

## `ZodiosResponseByAlias`

`ZodiosResponseByAlias` is a type helper that extracts the response type of a request from your api definition.

```ts
import { ZodiosResponseByAlias } from '@zodios/core';
import { MyApi } from './my-api';

type Users = ZodiosResponseByAlias<MyApi,'getUsers'>;
```
## `ZodiosQueryParamsByPath`

`ZodiosQueryParamsByPath` is a type helper that extracts the query params type of a request from your api definition.

```ts
import { ZodiosQueryParamsByPath } from '@zodios/core';
import { MyApi } from './my-api';

type GetUsersQueryParams = ZodiosQueryParamsByPath<MyApi,'get','/users'>;
```
## `ZodiosQueryParamsByAlias`

`ZodiosQueryParamsByAlias` is a type helper that extracts the query params type of a request from your api definition.

```ts
import { ZodiosQueryParamsByAlias } from '@zodios/core';
import { MyApi } from './my-api';

type GetUsersQueryParams = ZodiosQueryParamsByAlias<MyApi,'getUsers'>;
```
## `ZodiosErrorByPath`

`ZodiosErrorByPath` is a type helper that extracts the error type of a request from your api definition given a status code.

```ts
import { ZodiosErrorByPath } from '@zodios/core';
import { MyApi } from './my-api';

type NotFoundUsersError = ZodiosErrorByPath<MyApi,'get','/users',404>;
```
## `ZodiosErrorByAlias`

`ZodiosErrorByAlias` is a type helper that extracts the error type of a request from your api definition given a status code.

```ts
import { ZodiosErrorByAlias } from '@zodios/core';
import { MyApi } from './my-api';

type NotFoundUsersError = ZodiosErrorByAlias<MyApi,'getUsers',404>;
```
## Example

```ts
import {
  makeCrudApi,
  ZodiosBodyByPath,
  ZodiosResponseByPath,
  ZodiosPathParamsByPath,
  ZodiosQueryParamsByPath,
} from "@zodios/code";
import z from "zod";

const user = z.object({
  id: z.number(),
  name: z.string(),
  email: z.string().email(),
  phone: z.string(),
});

const api = makeCrudApi("user", user);

type User = z.infer<typeof user>;
type Api = typeof api;

type Users = ZodiosResponseByPath<Api, "get", "/users">;
//    ^? type Users = { id: number; name: string; email: string; phone: string; }[]
type UserById = ZodiosResponseByPath<Api, "get", "/users/:id">;
//    ^? type UserById = { id: number; name: string; email: string; phone: string; }
type GetUserParams = ZodiosPathParamsByPath<Api,'get',"/users/:id">;
//    ^? type GetUserParams = { id: number; }
type GetUserQueries = ZodiosQueryParamsByPath<Api, "get", "/users/:id">;
//    ^? type GetUserQueries = never
type CreateUserBody = ZodiosBodyByPath<Api, "post", "/users">;
//    ^? type CreateUserBody = { name: string; email: string; phone: string; }
type CreateUserResponse = ZodiosResponseByPath<Api, "post", "/users">;
//    ^? type CreateUserResponse = { id: number; name: string; email: string; phone: string; }
type UpdateUserBody = ZodiosBodyByPath<Api, "put", "/users/:id">;
//    ^? type UpdateUserBody = { name: string; email: string; phone: string; }
type PatchUserBody = ZodiosBodyByPath<Api, "patch", "/users/:id">;
//    ^? type PatchUserBody = { name?: string | undefined; email?: string | undefined; phone?: string | undefined; }
```
