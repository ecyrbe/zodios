---
sidebar_position: 5
---

# Typescript

Even though zodios is written in typescript, you can use it with javascript. However, if you are using typescript, you can benefit from the typescript type helpers.

## `ApiOf`

```ts
import { ApiOf, Zodios } from 'zodios';

const client = new Zodios(myApiDefinition);

type MyApi = ApiOf<typeof myApiDefinition>;
```
## `ZodiosBodyByPath`

```ts
import { ZodiosBodyByPath, Zodios } from 'zodios'
import { MyApi } from './my-api';

type User = ZodiosBodyByPath<MyApi,'post','/users'>;
```

## `ZodiosBodyByAlias`

```ts
import { ZodiosBodyByAlias, Zodios } from 'zodios'
import { MyApi } from './my-api';

type User = ZodiosBodyByAlias<MyApi,'createUsers'>;
```
## `ZodiosHeaderParamsByPath`

```ts
import { ZodiosHeaderParamsByPath, Zodios } from 'zodios'
import { MyApi } from './my-api';

type CreateUsersHeaderParams = ZodiosHeaderParamsByPath<MyApi,'post','/users'>;
```
## `ZodiosHeaderParamsByAlias`

```ts
import { ZodiosHeaderParamsByAlias, Zodios } from 'zodios'
import { MyApi } from './my-api';

type CreateUsersHeaderParams = ZodiosHeaderParamsByAlias<MyApi,'createUsers'>;
```

## `ZodiosPathParams`

```ts
import { ZodiosPathParams, Zodios } from 'zodios'
import { MyApi } from './my-api';

type GetUserPathParams = ZodiosPathParams<'/users/:id'>;
```
## `ZodiosPathParamByAlias`
  
  ```ts
import { ZodiosPathParamByAlias, Zodios } from 'zodios'
import { MyApi } from './my-api';

type GetUserPathParams = ZodiosPathParamByAlias<MyApi,'getUser'>;
```
## `ZodiosResponseByPath`

```ts
import { ZodiosResponseByPath, Zodios } from 'zodios'
import { MyApi } from './my-api';

type Users = ZodiosResponseByPath<MyApi,'get','/users'>;
```

## `ZodiosResponseByAlias`

```ts
import { ZodiosResponseByAlias, Zodios } from 'zodios'
import { MyApi } from './my-api';

type Users = ZodiosResponseByAlias<MyApi,'getUsers'>;
```
## `ZodiosQueryParamsByPath`
  
```ts
import { ZodiosQueryParamsByPath, Zodios } from 'zodios'
import { MyApi } from './my-api';

type GetUsersQueryParams = ZodiosQueryParamsByPath<MyApi,'get','/users'>;
```
## `ZodiosQueryParamsByAlias`

```ts
import { ZodiosQueryParamsByAlias, Zodios } from 'zodios'
import { MyApi } from './my-api';

type GetUsersQueryParams = ZodiosQueryParamsByAlias<MyApi,'getUsers'>;
```
## `ZodiosErrorByPath`

```ts
import { ZodiosErrorByPath, Zodios } from 'zodios'
import { MyApi } from './my-api';

type NotFoundUsersError = ZodiosErrorByPath<MyApi,'get','/users',404>;
```
## `ZodiosErrorByAlias`

```ts
import { ZodiosErrorByAlias, Zodios } from 'zodios'
import { MyApi } from './my-api';

type NotFoundUsersError = ZodiosErrorByAlias<MyApi,'getUsers',404>;
```
## Example

```ts
import {
  makeCrudApi,
  ZodiosBodyByPath,
  ZodiosResponseByPath,
  ZodiosPathParams,
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
type GetUserParams = ZodiosPathParams<"/users/:id">;
//    ^? type GetUserParams = { id: string; }
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
