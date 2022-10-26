---
sidebar_position: 5
---

# Solid hooks

Zodios comes with a Query and Mutation hook helper.  
It's a thin wrapper around Solid-Query but with zodios auto completion and automatic key management.
No need to remember your keys anymore.
  
Zodios query hook also returns an invalidation helper to allow you to reset Solid query cache easily.

## Zodios Hooks instance

When creating an instance or zodios hooks, you need to provide a name that will be used as `Solid-query` key prefix and your instance of Zodios Api Client.  

```ts
new ZodiosHook(name: string, client: Zodios)
```

**Example**
```ts
const apiClient = new Zodios(baseUrl, [...]);
const apiHooks = new ZodiosHooks("myAPI", apiClient);
```

:::info Never destructure the hook result in Solid-JS
if you want to keep reactivity, you should never destructure the hook results.
and when passing reactives states to the hook, you should always use a `get mydParam()` access to make parameters reactive.
:::

## Zodios hooks methods

### `hooks.create[Alias]`

You will usually want to use aliases to call your endpoints. You can define them in the `alias` option in your API definition endpoint.

#### query alias:

Query alias hooks will return a `QueryResult` object from `solid-query` with:
- the response data and all solid-query result properties
- the generated `key`
- the `invalidate` helper.

```ts
function create[Alias](config?: ZodiosRequestOptions, queryOptions: CreateQueryOptions): CreateQueryResult<Response>;
```

**example**:
```ts
// identical to hooks.createQuery("/users")
const state =  hooks.createGetUsers();
```

#### immutable query alias:
```ts
function create[Alias](body: Body, config?: ZodiosRequestOptions, queryOptions: CreateQueryOptions): CreateQueryResult<Response>;
```

**example**:
```ts
// identical to hooks.createImmutableQuery("/users/search")
const state =  hooks.createSearchUsers({ name: "John" });
```

:::note
Immutable query aliases are only available for `post` endpoints.
you also need to set the `immutable` option to `true` in your API definition endpoint if you want alias to use `createImmutableQuery` hook.
:::
#### mutation alias 

Alias for `post`, `put`, `patch`, `delete` endpoints:
```ts
function create[Alias](config?: ZodiosRequestOptions, mutationOptions?: CreateMutationOptions): MutationResult<Response>;
```

**example**:
```ts
// identical to createPost("/users") or createMutation("post","/users")
const state = hooks.useCreateUser();

```

### `zodios.createQuery`

Generic request method that allows to do queries (same as useGet).
Query hooks will return a `QueryResult` object from `solid-query` with:
- the response data and all solid-query result properties
- the generated `key`
- the `invalidate` helper.

```ts
createQuery(path: string, config?: ZodiosRequestOptions, queryOptions?: CreateQueryOptions): CreateQueryResult<Response>;
```

**Example**:
```ts
const state = hooks.createQuery('/users');
```

:::note
check [solid-query documentation](https://tanstack.com/query/v4/docs/adapters/solid-query) for more informations on `QueryResult` and `QueryOptions`.
:::

### `zodios.createImmutableQuery`

Generic request method that allows to do queries on post requests.

```ts
createImmutableQuery(path: string, body: Body ,config?: ZodiosRequestOptions, queryOptions?: CreateQueryOptions): CreateQueryResult<Response>;
```

**Example**:
```ts
const state = hooks.createImmutableQuery('/users/search', { name: "John" });
```

:::note
check [solid-query documentation](https://tanstack.com/query/v4/docs/adapters/solid-query) for more informations on `QueryResult` and `QueryOptions`.
:::


### `zodios.createInfiniteQuery`

Generic request method that allows to load pages indefinitly.

```ts
useInfiniteQuery(path: string, config?: ZodiosRequestOptions, infiniteQueryOptions?: CreateInfiniteQueryOptions): CreateInfiniteQueryResult<Response>;
```

Compared to native solid-query infinite query, you also need to provide a function named `getPageParamList` to tell zodios which parameters will be used to paginate. Indeed, zodios needs to know it to be able to generate the correct query key automatically for you.

**Example**:
```ts
  const state = apiHooks.createInfiniteQuery(
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
check [solid-query infinite query documentation](https://tanstack.com/query/v4/docs/adapters/solid-query) for more informations on `InfiniteQueryResult` and `InfiniteQueryOptions`.
:::

### `zodios.createImmutableInfiniteQuery`

Generic request method that allows to search pages indefinitly with post requests.

```ts
useImmutableInfiniteQuery(path: string, body: Body ,config?: ZodiosRequestOptions, infiniteQueryOptions?: CreateInfiniteQueryOptions): CreateInfiniteQueryResult<Response>;
```

Compared to native solid-query infinite query, you also need to provide a function named `getPageParamList` to tell zodios which parameters will be used to paginate. Indeed, zodios needs to know it to be able to generate the correct query key automatically for you.

**Example**:
```ts
  const state = apiHooks.createImmutableInfiniteQuery(
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
check [create-query infinite query documentation](https://tanstack.com/query/v4/docs/adapters/solid-query) for more informations on `InfiniteQueryResult` and `InfiniteQueryOptions`.
:::

### `zodios.createMutation`

Generic request method that allows to do mutations.

```ts
createMutation(method: string, path: string, config: ZodiosRequestOptions, queryOptions?: CreateQueryOptions): CreateMutationResult<Response>;
```

**Example**:
```ts
const state = hooks.createMutation('post','/users');
```

:::note
check [solid-query documentation](https://tanstack.com/query/v4/docs/adapters/solid-query) for more informations on `MutationResult` and `MutationOptions`.
:::

### `zodios.createGet`

Query hooks will return a `QueryResult` object from `solid-query` with:
- the response data and all solid-query result properties
- the generated `key`
- the `invalidate` helper.

```ts
createGet(path: string, config?: ZodiosRequestOptions, queryOptions?: CreateQueryOptions): CreateQueryResult<Response>;
```

**Example**:
```ts
const state = hooks.createGet("/users/:id", { params: { id: 1 } });
// reactive example
const [id, setId] = createSignal(1);
const state = hooks.createGet("/users/:id", { params: { get id() { return id()} } });
```

### `zodios.createPost`

```ts
createPost(path: string, config?: ZodiosRequestOptions, queryOptions?: CreateMutationOptions): CreateMutationResult<Response>;
```

**Example**:
```ts
const state = hooks.createPost("/users");
```

### `zodios.createPut`

```ts
createPut(path: string, config?: ZodiosRequestOptions, queryOptions?: CreateMutationOptions): CreateMutationResult<Response>;
```

**Example**:
```ts
const state = hooks.createPut("/users/:id", { params: { id: 1 } });
// reactive example
const [id, setId] = createSignal(1);
const state = hooks.createPut("/users/:id", { params: { get id() { return id()} } });
```

### `zodios.createPatch`

```ts
createPatch(path: string, config?: ZodiosRequestOptions, queryOptions?: CreateMutationOptions): CreateMutationResult<Response>;
```

**Example**:
```ts
const state = hooks.createPatch("/users/:id", {params: {id: 1}});
// reactive example
const [id, setId] = createSignal(1);
const state = hooks.createPatch("/users/:id", { params: { get id() { return id()} } });
```

### `zodios.createDelete`

```ts
createDelete(path: string, config?: ZodiosRequestOptions, queryOptions?: CreateMutationOptions): CreateReactMutationResult<Response>;
```

**Example**:
```ts
const state = hooks.createDelete("/users/:id", { params: {id: 1 }});
// reactive example
const [id, setId] = createSignal(1);
const state = hooks.createDelete("/users/:id", { params: { get id() { return id()} } });
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
## Example

```tsx title="users.tsx"
import { createSignal, For, Match, Show, Switch } from "solid-js";
import { QueryClient, QueryClientProvider } from "@tanstack/solid-query";
import { makeApi, Zodios } from "@zodios/core";
import { ZodiosHooks } from "../src";
import { z } from "zod";

// you can define schema before declaring the API to get back the type
const userSchema = z
  .object({
    id: z.number(),
    name: z.string(),
  })
  .required();

const createUserSchema = z
  .object({
    name: z.string(),
  })
  .required();

const usersSchema = z.array(userSchema);

// you can then get back the types
type User = z.infer<typeof userSchema>;
type Users = z.infer<typeof usersSchema>;

const api = makeApi([
  {
    method: "get",
    path: "/users",
    alias: "getUsers",
    description: "Get all users",
    parameters: [
      {
        name: "page",
        type: "Query",
        schema: z.number().positive().optional(),
      },
      {
        name: "limit",
        type: "Query",
        schema: z.number().positive().optional(),
      },
    ],
    response: usersSchema,
  },
  {
    method: "get",
    path: "/users/:id",
    description: "Get a user",
    response: userSchema,
  },
  {
    method: "post",
    path: "/users",
    alias: "createUser",
    description: "Create a user",
    parameters: [
      {
        name: "body",
        type: "Body",
        schema: createUserSchema,
      },
    ],
    response: userSchema,
  },
]);
const baseUrl = "https://jsonplaceholder.typicode.com";

const zodios = new Zodios(baseUrl, api);
const zodiosHooks = new ZodiosHooks("jsonplaceholder", zodios);

const Users = () => {
  const [page, setPage] = createSignal(0);
  const users = zodiosHooks.createInfiniteQuery(
    "/users",
    { queries: { limit: 10 } },
    {
      getPageParamList: () => {
        return ["page"];
      },
      getNextPageParam: () => {
        return {
          queries: {
            get page() {
              return page() + 1;
            },
          },
        };
      },
    }
  );
  const user = zodiosHooks.createCreateUser(undefined, {
    onSuccess: () => users.invalidate(),
  });

  return (
    <>
      <button onClick={() => user.mutate({ name: "john" })}>create user</button>
      <Show when={users.hasNextPage}>
        <button onClick={() => users.fetchNextPage()}>next</button>
      </Show>
      <Switch>
        <Match when={users.isLoading}>Loading...</Match>
        <Match when={users.isFetchingNextPage}>Fetching...</Match>
        <Match when={!users.isFetching}>
          <ul>
            <For each={users.data?.pages}>
              {(user) => (
                <For each={user}>{(user) => <li>{user.name}</li>}</For>
              )}
            </For>
          </ul>
        </Match>
      </Switch>
    </>
  );
};

// on another file
const queryClient = new QueryClient();

export const App = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <Users />
    </QueryClientProvider>
  );
};
```