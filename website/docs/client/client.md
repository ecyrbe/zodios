---
sidebar_position: 1
---

# Client API instance

Use `Zodios` instance to fetch data from multiple API endpoints.  
It's an API client based on [zod](https://www.npmjs.com/package/zod) and [axios](https://www.npmjs.com/package/axios) with a powerful plugin system.

:::info Zodios API client is like no one at the moment to make REST API fetching.
All your parameters and responses are fully typed. And by default they are also validated at runtime to prevent unrecoverable errors.  
Check the simple [API definition format](/docs/api/api-definition) that powers full end-to-end typesafety.
:::
## Create Zodios Client instance

When creating an instance or zodios api client, you need to at least provide the api definition.  
`baseURL` is optional in browsers and will default to the current page url.

```ts
new Zodios(baseURL: string, api: ZodiosEnpointDescriptions, options?: ZodiosOptions)
// or
new Zodios(api: ZodiosEnpointDescriptions, options?: ZodiosOptions)
```

**Example**

You can predefine some schemas to reuse them in your API definition.

```ts
import { Zodios, makeErrors } from "@zodios/core";
import z from "zod";

const errors = makeErrors([
  {
    status: "default",
    schema: z.object({
      error: z.object({
        code: z.number(),
        message: z.string(),
      }),
    }),
  },
]);

const user = z.object({
  id: z.number(),
  name: z.string(),
  age: z.number().positive(),
  email: z.string().email(),
});
```

Then you can define your API endpoints directly in the `Zodios` constructor.

```ts
const apiClient = new Zodios('/api', [
  {
    method: "get",
    path: "/users",
    alias: "getUsers",
    response: z.array(user),
  },
  {
    method: "get",
    path: "/users/:id",
    alias: "getUser",
    response: user,
    errors,
  },
  {
    method: "post",
    path: "/users",
    alias: "createUser",
    parameters: [
      {
        name: "user",
        type: "Body",
        schema: user.omit({ id: true }),
      },
    ],
    response: user,
    errors,
  },  
]);
```

And finally you can use it to fetch data from your API.

```ts
// get all users
const users = await apiClient.getUsers();
// get user by id
const user = await apiClient.getUser({ params: { id: 1 } });
// create user
const newUser = await apiCLient.createUser({ name: "John", age: 20, email: "jodn@doe.com"});
```

:::note Path parameters do not need to be defined in the API definition `parameters` array.
Indeed, they are automatically deduced from the path and added to the request parameters implicitly.
:::

### Options

Zodios API client constructor options `ZodiosOptions` are straightforward.

| Option        | Type               | Default        | Description                                   |
| ------------- | ------------------ | -------------- | --------------------------------------------- |
| validate      | boolean            | true           | Validate parameters and responses at runtime. |
| axiosInstance | AxiosInstance      | axios.create() | add your own axios instance                   |
| axiosConfig   | AxiosRequestConfig | {}             | add your own default axios config             |

## Zodios attributes

### `baseURL`

access `baseURL` property to get the base url of the api.

### `axios`

access `axios` property to get back zodios internal axios instance.

## Zodios methods


### `zodios.use`

`use` method allows to add a plugin to the client instance. See [plugins](/docs/client/plugins) for more information.

```ts
use(plugin: ZodiosPlugin): PluginId;
// or
use(method: string, path: string, plugin: ZodiosPlugin): PluginId;
// or
use(alias: string, plugin: ZodiosPlugin): PluginId;
```

**Example**:
```ts
import { pluginFetch } from "@zodios/plugins";

apiClient.use(pluginFetch({
  keepAlive: true,
}));
```

### `zodios.eject`

Eject method allows to remove a plugin from the client instance.

```ts
eject(pluginId: PluginId): void;
```
### `zodios.[alias]`

You will usually want to use aliases to call your endpoints. You can define them in the `alias` option in your API definition endpoint.

#### query alias:
```ts
function [alias](config?: ZodiosRequestOptions): Promise<Response>;
```

:::note
For more information about `ZodiosRequestOptions` see [request options](#request-options)
You don't need to declare path parameters in the `parameters` array of the API definition.
Just remember you can use `params` to pass path parameters and `queries` to pass query parameters.
See examples below.
:::

**example**:
```ts
// identical to api.get("/users")
const users = await api.getUsers();
```

with path parameters
```ts
// identical to api.get("/users", { params: { id: 1 } })
const user = await api.getUser({ params: { id: 1 } }); // GET /users/1
```
with query parameters
```ts
// identical to api.get("/users", { queries: { limit: 10 } })
const users = await api.getUsers({ queries: { limit: 10 } }); // GET /users?limit=10
```

#### mutation alias 

Alias for `post`, `put`, `patch`, `delete` endpoints:
```ts
function [alias](body: BodyParam, config?: ZodiosRequestOptions): Promise<Response>;
```

:::note
For more information about `ZodiosRequestOptions` see [request options](#request-options)
You don't need to declare path parameters in the `parameters` array of the API definition.
Just remember you can use `params` to pass path parameters and `queries` to pass query parameters.
See examples below.
:::

**example**:
```ts
// identical to api.post("/users", { name: "John" })
const user = await api.createUser({ name: "John" });
```

Is equivalent to the following HTTP request:
```http
POST /users HTTP/1.1
Content-Type: application/json

{
  "name": "John"
}
```
### `zodios.request`

Generic request method that allows to do both query and mutation calls.

```ts
request(config: ZodiosRequestOptions): Promise<Response>;
```

:::note
For more information about `ZodiosRequestOptions` see [request options](#request-options)
You don't need to declare path parameters in the `parameters` array of the API definition.
Just remember you can use `params` to pass path parameters and `queries` to pass query parameters.
See examples below.
:::


**Example**:
```ts
const user = await api.request({
  method: "post",
  url: "/users",
  data: { name: "John" },
});
```

### `zodios.get`

```ts
get(path: string, config?: ZodiosRequestOptions): Promise<Response>;
```

:::note
For more information about `ZodiosRequestOptions` see [request options](#request-options)
You don't need to declare path parameters in the `parameters` array of the API definition.
Just remember you can use `params` to pass path parameters and `queries` to pass query parameters.
See examples below.
:::

**example**:
```ts
const users = await api.get("/users");
```

with path parameters
```ts
const user = await api.get("/users/:id", { params: { id: 1 } }); // GET /users/1
```
with query parameters
```ts
const users = await api.get("/users", { queries: { limit: 10 } }); // GET /users?limit=10
```
### `zodios.post`

```ts
post(path: string, body: BodyParam, config?: ZodiosRequestOptions): Promise<Response>;
```

:::note
For more information about `ZodiosRequestOptions` see [request options](#request-options)
You don't need to declare path parameters in the `parameters` array of the API definition.
Just remember you can use `params` to pass path parameters and `queries` to pass query parameters.
See examples below.
:::

**Example**:
```ts
const user = await api.post("/users", { name: "John" });
```

Is equivalent to the following HTTP request:
```http
POST /users HTTP/1.1
Accept: application/json
Content-Type: application/json

{
  "name": "John"
}
```
### `zodios.put`

```ts
put(path: string, body: BodyParam, config?: ZodiosRequestOptions): Promise<Response>;
```

:::note
For more information about `ZodiosRequestOptions` see [request options](#request-options)
You don't need to declare path parameters in the `parameters` array of the API definition.
Just remember you can use `params` to pass path parameters and `queries` to pass query parameters.
See examples below.
:::


**Example**:
```ts
const user = await api.put("/users/:id", {id: 1, name: "John" }, { params: { id: 1 } });
```

will send the following HTTP request:
```http
PUT /users/1 HTTP/1.1
Accept: application/json
Content-Type: application/json

{
  "id": 1,
  "name": "John"
}
```

### `zodios.patch`

```ts
patch(path: string, body: BodyParam, config?: ZodiosRequestOptions): Promise<Response>;
```
:::note
For more information about `ZodiosRequestOptions` see [request options](#request-options)
You don't need to declare path parameters in the `parameters` array of the API definition.
Just remember you can use `params` to pass path parameters and `queries` to pass query parameters.
See examples below.
:::

**Example**:
```ts
const user = await api.patch("/users/:id", {name: "John" }, {params: {id: 1}});
```

will send the following HTTP request:
```http
PATCH /users/1 HTTP/1.1
Accept: application/json
Content-Type: application/json

{
  "name": "John"
}
```

### `zodios.delete`

```ts
delete(path: string, body: BodyParam, config?: ZodiosRequestOptions): Promise<Response>;
```

:::note
For more information about `ZodiosRequestOptions` see [request options](#request-options)
You don't need to declare path parameters in the `parameters` array of the API definition.
Just remember you can use `params` to pass path parameters and `queries` to pass query parameters.
See examples below.
:::

**Example**:
```ts
const user = await api.delete("/users/:id", {params: {id: 1}});
```

will send the following HTTP request:
```http
DELETE /users/1 HTTP/1.1
Accept: application/json
```

## Request Options

| property           | type                                                                                            | description                                              |
| ------------------ | ----------------------------------------------------------------------------------------------- | -------------------------------------------------------- |
| method             | "get" \| "post" \| "put" \| "patch" \| "delete"                                                 | HTTP method                                              |
| url                | string                                                                                          | path to the endpoint                                     |
| data               | BodyParam                                                                                       | optional request body                                    |
| params             | Record<string, string \| number>                                                                | optional path parameters                                 |
| queries            | Record<string, string \| number \| string[] \| number[]>                                        | optional query parameters                                |
| headers            | Record<string, string>                                                                          | optional request headers                                 |
| signal             | AbortSignal                                                                                     | optional AbortSignal                                     |
| paramsSerializer   | (params: QueryParams) => string                                                                 | optional function to serialize query parameters          |
| timeout            | number                                                                                          | request timeout, default is 0, no timeout                |
| withCredentials    | boolean                                                                                         | flag to enable credentials, default is false             |
| adapter            | AxiosAdapter                                                                                    | optional custom adapter, let libray authors implement it |
| auth               | { username: string; password: string }                                                          | optional basic auth                                      |
| responseType       | "arraybuffer" \| "blob" \| "document" \| "json" \| "text" \| "stream"                           | response type, default is "json"                         |
| responseEncoding   | string                                                                                          | response encoding, default is "utf8" (nodejs only)       |
| xsrfCookieName     | string                                                                                          | xsrf cookie name, default is "XSRF-TOKEN"                |
| xsrfHeaderName     | string                                                                                          | xsrf header name, default is "X-XSRF-TOKEN"              |
| onUploadProgress   | (progressEvent: ProgressEvent) => void                                                          | progress callback (browser only with XMLHttpRequest)     |
| onDownloadProgress | (progressEvent: ProgressEvent) => void                                                          | progress callback (browser only with XMLHttpRequest)     |
| maxContentLength   | number                                                                                          | max response content length, default is 2000 bytes       |
| maxBodyLength      | number                                                                                          | max request body length, default is 2000 bytes           |
| validateStatus     | (status: number) => boolean                                                                     | optional function to validate status code                |
| maxRedirects       | number                                                                                          | max number of redirects, default is 5                    |
| httpAgent          | NodeHttpAgent                                                                                   | optional custom http agent (nodejs only)                 |
| httpsAgent         | NodeHttpsAgent                                                                                  | optional custom https agent (nodejs only)                |
| proxy              | { protocol: string; host: string; port: number; auth?: { username: string; password: string } } | optional proxy configuration (nodejs only)               |
| decompress         | boolean                                                                                         | flag to enable automatic decompression, default is true  |

## Advanced examples
### Use zod transformations

Since Zodios is using zod, you can use zod transformations.

```typescript
const apiClient = new Zodios(
  "https://jsonplaceholder.typicode.com",
  [
    {
      method: "get",
      path: "/users/:id",
      alias: "getUser",
      description: "Get a user",
      response: z.object({
        id: z.number(),
        name: z.string(),
      }).transform(({ name,...rest }) => ({
        ...rest,
        firstname: name.split(" ")[0],
        lastname: name.split(" ")[1],
      })),
    },
  ]
);

const user = await apiClient.getUser({ params: { id: 7 } });

console.log(user);
```
It should output  
  
```js
{ id: 7, firstname: 'Kurtis', lastname: 'Weissnat' }
```

### Send multipart/form-data requests

Zodios supports multipart/form-data requests with integrated `requestFormat`. Zodios is using `formdata-node` internally on NodeJs as it's the most up to date library for node.

```typescript
const apiClient = new Zodios(
  "https://mywebsite.com",
  [{
    method: "post",
    path: "/upload",
    alias: "upload",
    description: "Upload a file",
    requestFormat: "form-data",
    parameters:[
      {
        name: "body",
        type: "Body",
        schema: z.object({
          file: z.instanceof(File),
        }),
      }
    ],
    response: z.object({
      id: z.number(),
    }),
  }],
);
const id = await apiClient.upload({ file: document.querySelector('#file').files[0] });
```

But you can also use your own multipart/form-data library, for example with `form-data` library on node.

```typescript
import FormData from 'form-data';

const apiClient = new Zodios(
  "https://mywebsite.com",
  [{
    method: "post",
    path: "/upload",
    alias: "upload",
    description: "Upload a file",
    parameters:[
      {
        name: "body",
        type: "Body",
        schema: z.instanceof(FormData),
      }
    ],
    response: z.object({
      id: z.number(),
    }),
  }],
);
const form = new FormData();
form.append('file', document.querySelector('#file').files[0]);
const id = await apiClient.upload(form, { headers: form.getHeaders() });
```

### Send application/x-www-form-urlencoded requests

Zodios supports application/x-www-form-urlencoded requests with integrated `requestFormat`. Zodios is using URLSearchParams internally on both browser and node. (If you need IE support, see next example)
    
  ```typescript
  const apiClient = new Zodios(
    "https://mywebsite.com",
    [{
      method: "post",
      path: "/login",
      alias: "login",
      description: "Submit a form",
      requestFormat: "form-url",
      parameters:[
        {
          name: "body",
          type: "Body",
          schema: z.object({
            userName: z.string(),
            password: z.string(),
          }),
        }
      ],
      response: z.object({
        id: z.number(),
      }),
    }],
  );
  const id = await apiClient.login({ userName: "user", password: "password" });
  ```

  But you can also use custom code to support for application/x-www-form-urlencoded requests.
  For example with `qs` library on IE :
    
  ```typescript
  import qs from 'qs';

  const apiClient = new Zodios(
    "https://mywebsite.com",
    [{
      method: "post",
      path: "/login",
      alias: "login",
      description: "Submit a form",
      parameters:[
        {
          name: "body",
          type: "Body",
          schema: z.object({
            userName: z.string(),
            password: z.string(),
          }).transform(data=> qs.stringify(data)),
        }
      ],
      response: z.object({
        id: z.number(),
      }),
    }],
  );
  const id = await apiClient.login({ userName: "user", password: "password" },
    { headers: 
        { 
          'Content-Type': 'application/x-www-form-urlencoded' 
        }
    });
  ```

### CRUD helper

Zodios has a helper to generate basic CRUD API. It will generate all the api definitions for you :  
  
```typescript
import { Zodios, makeCrudApi } from '@zodios/core';

const apiClient = new Zodios(BASE_URL,
  makeCrudApi(
    'user',
    z.object({
      id: z.number(),
      name: z.string(),
    })
  ));
```

Is the same as :
```typescript
const apiClient = new Zodios(BASE_URL, [
  {
    method: "get",
    path: "/users",
    alias: "getUsers",
    description: "Get all users",
    response: z.array(userSchema),
  },
  {
    method: "get",
    path: "/users/:id",
    alias: "getUser",
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
        description: "The object to create",
        schema: userSchema.partial(),
      },
    ],
    response: userSchema,
  },
  {
    method: "put",
    path: "/users/:id",
    alias: "updateUser",
    description: "Update a user",
    parameters: [
      {
        name: "body",
        type: "Body",
        description: "The object to update",
        schema: userSchema,
      },
    ],
    response: userSchema,
  },
  {
    method: "patch",
    path: "/users/:id",
    alias: "patchUser",
    description: "Patch a user",
    parameters: [
      {
        name: "body",
        type: "Body",
        description: "The object to patch",
        schema: userSchema.partial(),
      },
    ],
    response: userSchema,
  },
  {
    method: "delete",
    path: "/users/:id",
    alias: "deleteUser",
    description: "Delete a user",
    response: userSchema,
  },
]);
```
