---
sidebar_position: 4
---

# React hooks

Zodios comes with a Query and Mutation hook helper.  
It's a thin wrapper around React-Query but with zodios auto completion and automatic key management.
No need to remember your keys anymore.
  
Zodios query hook also returns an invalidation helper to allow you to reset react query cache easily.

## Zodios Hooks instance

When creating an instance or zodios hooks, you need to provide a name that will be used as `react-query` key prefix and your instance of Zodios Api Client.  

```ts
new ZodiosHooks(name: string, client: Zodios)
```

**Example**
```ts
const apiClient = new Zodios(baseUrl, [...]);
const apiHooks = new ZodiosHooks("myAPI", apiClient);
```
## Zodios hooks methods

### `hooks.use[Alias]`

You will usually want to use aliases to call your endpoints. You can define them in the `alias` option in your API definition endpoint.

#### query alias:

Query alias hooks will return a `QueryResult` object from `react-query` with:
- the response data and all react-query result properties
- the generated `key`
- the `invalidate` helper.

```ts
function use[Alias](config?: ZodiosRequestOptions, queryOptions: QueryOptions): QueryResult<Response>;
```

**example**:
```ts
// identical to hooks.useQuery("/users")
const { data: users, isLoading, isError, invalidate, key } =  hooks.useGetUsers();
```

#### immutable query alias:
```ts
function use[Alias](body: Body, config?: ZodiosRequestOptions, queryOptions: QueryOptions): QueryResult<Response>;
```

**example**:
```ts
// identical to hooks.useImmutableQuery("/users/search")
const { data: users, isLoading, isError } =  hooks.useSearchUsers({ name: "John" });
```

:::note
Immutable query aliases are only available for `post` endpoints.
you also need to set the `immutable` option to `true` in your API definition endpoint if you want alias to use `useImmutableQuery` hook.
:::
#### mutation alias 

Alias for `post`, `put`, `patch`, `delete` endpoints:
```ts
function use[Alias](config?: ZodiosRequestOptions, queryOptions?: QueryOptions): MutationResult<Response>;
```

**example**:
```ts
// identical to usePost("/users") or useMutation("post","/users")
const { mutate } = hooks.useCreateUser();

```

### `zodios.useQuery`

Generic request method that allows to do queries (same as useGet).
Query hooks will return a `QueryResult` object from `react-query` with:
- the response data and all react-query result properties
- the generated `key`
- the `invalidate` helper.

```ts
useQuery(path: string, config?: ZodiosRequestOptions, queryOptions?: QueryOptions): QueryResult<Response>;
```

**Example**:
```ts
const { data: users, isLoading, isError } = hooks.useQuery('/users');
```

:::note
check [react-query documentation](https://react-query.tanstack.com/reference/useQuery) for more informations on `QueryResult` and `QueryOptions`.
:::

### `zodios.useImmutableQuery`

Generic request method that allows to do queries on post requests.

```ts
useImmutableQuery(path: string, body: Body ,config?: ZodiosRequestOptions, queryOptions?: QueryOptions): QueryResult<Response>;
```

**Example**:
```ts
const { data: users, isLoading, isError } = hooks.useImmutableQuery('/users/search', { name: "John" });
```

:::note
check [react-query documentation](https://react-query.tanstack.com/reference/useQuery) for more informations on `QueryResult` and `QueryOptions`.
:::


### `zodios.useInfiniteQuery`

Generic request method that allows to load pages indefinitly.

```ts
useInfiniteQuery(path: string, config?: ZodiosRequestOptions, infiniteQueryOptions?: InfiniteQueryOptions): InfiniteQueryResult<Response>;
```

Compared to native react-query infinite query, you also need to provide a function named `getPageParamList` to tell zodios which parameters will be used to paginate. Indeed, zodios needs to know it to be able to generate the correct query key automatically for you.

**Example**:
```ts
  const { data: userPages, isFectching, fetchNextPage } = apiHooks.useInfiniteQuery(
    "/users",
    {
      // request 10 users per page
      queries: { limit: 10 },
    },
    {
      // tell zodios to not use page as query key to allow infinite loading
      getPageParamList: () => ["page"],
      // get next page param has to return the next page as a query or path param
      getNextPageParam: (lastPage, pages) => lastPage.nextPage ? {
          queries: {
            page: lastPage.nextPage,
          },
        }: undefined;
    }
  );
```

:::note
check [react-query infinite query documentation](https://react-query.tanstack.com/reference/useInfiniteQuery) for more informations on `InfiniteQueryResult` and `InfiniteQueryOptions`.
:::

### `zodios.useImmutableInfiniteQuery`

Generic request method that allows to search pages indefinitly with post requests.

```ts
useImmutableInfiniteQuery(path: string, body: Body ,config?: ZodiosRequestOptions, infiniteQueryOptions?: InfiniteQueryOptions): InfiniteQueryResult<Response>;
```

Compared to native react-query infinite query, you also need to provide a function named `getPageParamList` to tell zodios which parameters will be used to paginate. Indeed, zodios needs to know it to be able to generate the correct query key automatically for you.

**Example**:
```ts
  const { data: userPages, isFectching, fetchNextPage } = apiHooks.useImmutableInfiniteQuery(
    "/users/search",
    {
      // search for users named John
      name: "John",
      // request 10 users per page
      limit: 10,
    },
    undefined,
    {
      // tell zodios to not use page as query key to allow infinite loading
      getPageParamList: () => ["page"],
      // get next page param has to return the next page as a query or path param
      getNextPageParam: (lastPage, pages) => lastPage.nextPage ? {
          body: {
            page: lastPage.nextPage,
          },
        }: undefined;
    }
  );
```

:::note
check [react-query infinite query documentation](https://react-query.tanstack.com/reference/useInfiniteQuery) for more informations on `InfiniteQueryResult` and `InfiniteQueryOptions`.
:::

### `zodios.useMutation`

Generic request method that allows to do mutations.

```ts
useMutation(method: string, path: string, config: ZodiosRequestOptions, reactQueryOptions?: ReactQueryOptions): ReactMutationResult<Response>;
```

**Example**:
```ts
const { mutate } = hooks.useMutation('post','/users');
```

:::note
check [react-query documentation](https://react-query.tanstack.com/reference/useMutation) for more informations on `MutationResult` and `MutationOptions`.
:::

### `zodios.useGet`

Query hooks will return a `QueryResult` object from `react-query` with:
- the response data and all react-query result properties
- the generated `key`
- the `invalidate` helper.

```ts
useGet(path: string, config?: ZodiosRequestOptions, reactQueryOptions?: ReactQueryOptions): ReactQueryResult<Response>;
```

**Example**:
```ts
const { data: user, isLoading, isError, invalidate, key } = hooks.useGet("/users/:id", { params: { id: 1 } });
```

### `zodios.usePost`

```ts
usePost(path: string, config?: ZodiosRequestOptions, reactQueryOptions?: ReactQueryOptions): ReactMutationResult<Response>;
```

**Example**:
```ts
const { mutate } = hooks.usePost("/users");
```

### `zodios.usePut`

```ts
usePut(path: string, config?: ZodiosRequestOptions, reactQueryOptions?: ReactQueryOptions): ReactMutationResult<Response>;
```

**Example**:
```ts
const { mutate } = hooks.usePut("/users/:id", { params: { id: 1 } });
```

### `zodios.usePatch`

```ts
usePatch(path: string, config?: ZodiosRequestOptions, reactQueryOptions?: ReactQueryOptions): ReactMutationResult<Response>;
```

**Example**:
```ts
const { mutate } = hooks.usePatch("/users/:id", {params: {id: 1}});
```

### `zodios.useDelete`

```ts
useDelete(path: string, config?: ZodiosRequestOptions, reactQueryOptions?: ReactQueryOptions): ReactMutationResult<Response>;
```

**Example**:
```ts
const { mutate } = hooks.useDelete("/users/:id", { params: {id: 1 }});
```
## Zodios key helpers

Zodios provides some helpers to generate query keys to be used to invalidate cache or to get it directly from cache with 'QueryClient.getQueryData(key)'.

### `zodios.getKeyByPath`

```ts
getKeyByPath(method: string, path: string, config?: ZodiosRequestOptions): QueryKey;
```

**Examples**:

To get a key for a path endpoint with parameters:
```ts
const key = zodios.getKeyByPath('get', '/users/:id', { params: { id: 1 } });
const user = queryClient.getQueryData<User>(key);
```

To get a key to invalidate a path endpoint for all possible parameters:
```ts
const key = zodios.getKeyByPath('get', '/users/:id');
queryClient.invalidateQueries(key);
```

### `zodios.getKeyByAlias`

```ts
getKeyByAlias(alias: string, config?: ZodiosRequestOptions): QueryKey;
```

**Examples**:

To get a key for an alias endpoint with parameters:
```ts
const key = zodios.getKeyByAlias('getUser', { params: { id: 1 } });
const user = queryClient.getQueryData<User>(key);
```
To get a key to invalidate an alias endpoint for all possible parameters:
```ts
const key = zodios.getKeyByAlias('getUser');
queryClient.invalidateQueries(key);
```

## Bundling

If you are bundling your App with Webpack and with a custom library that embeds `@zodios/react` or `@tanstack/react-query`, you need to bundle you library with both `esm` and `cjs` support.
We recommend using [tsup](https://tsup.egoist.dev/) to bundle your library and declare your `package.json` like [this](https://github.com/ecyrbe/zodios/blob/main/package.json)
Else, you'll get the following error:

![error](https://user-images.githubusercontent.com/38932402/196659212-5bdb675f-d019-4d8b-8681-5f00ed24db4d.png)
## Example

```tsx title="users.tsx"
import React from "react";
import { Zodios } from "@zodios/core";
import { ZodiosHooks } from "@zodios/react";
import { z } from "zod";

const baseUrl = "https://jsonplaceholder.typicode.com";
const zodios = new Zodios(baseUrl, [...]);
const zodiosHooks = new ZodiosHooks("jsonplaceholder", zodios);

const Users = () => {
  const {
    data: users,
    isLoading,
    error,
    invalidate: invalidateUsers, // zodios also provides invalidation helpers
    key // zodios also returns the generated key
  } = zodiosHooks.useQuery("/users"); // or useGetUsers();
  const { mutate } = zodiosHooks.useMutation("post", "/users", undefined, {
    onSuccess: () => invalidateUsers(),
  }); // or .useCreateUser(...);

  return (
    <>
      <h1>Users</h1>
      <button onClick={() => mutate({ name: "john doe" })}>add user</button>
      {isLoading && <div>Loading...</div>}
      {error && <div>Error: {(error as Error).message}</div>}
      {users && (
        <ul>
          {users.map((user) => (
            <li key={user.id}>{user.name}</li>
          ))}
        </ul>
      )}
    </>
  );
};
```

```tsx title="root.tsx"
import { QueryClient, QueryClientProvider } from "react-query";
import { Users } from "./users";

const queryClient = new QueryClient();

export const App = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <Users />
    </QueryClientProvider>
  );
};
```
