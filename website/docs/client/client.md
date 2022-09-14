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

```ts
import { Zodios, asErrors } from "@zodios/core";
import z from "zod";

const errors = asErrors([
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

### Options

Zodios constructor options are straightforward.

```ts
export type ZodiosOptions = {
  validate?: boolean; // validate zod input params and response - default: true
  axiosInstance?: AxiosInstance; // add your own axios instance
  axiosConfig?: AxiosRequestConfig; // add your own default axios config
};
```

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

**example**:
```ts
// identical to api.get("/users")
const users = await api.getUsers();
```

#### mutation alias 

Alias for `post`, `put`, `patch`, `delete` endpoints:
```ts
function [alias](body: BodyParam, config?: ZodiosRequestOptions): Promise<Response>;
```

**example**:
```ts
// identical to api.post("/users", { name: "John" })
const user = await api.createUser({ name: "John" });
```

### `zodios.request`

Generic request method that allows to do both query and mutation calls.

```ts
request(config: ZodiosRequestOptions): Promise<Response>;
```

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

**Example**:
```ts
const user = await api.get("/users/:id", { params: { id: 1 } });
```

### `zodios.post`

```ts
post(path: string, body: BodyParam, config?: ZodiosRequestOptions): Promise<Response>;
```

**Example**:
```ts
const user = await api.post("/users", { name: "John" });
```

### `zodios.put`

```ts
put(path: string, body: BodyParam, config?: ZodiosRequestOptions): Promise<Response>;
```

**Example**:
```ts
const user = await api.put("/users/:id", {id: 1, name: "John" }, { params: { id: 1 } });
```

### `zodios.patch`

```ts
patch(path: string, body: BodyParam, config?: ZodiosRequestOptions): Promise<Response>;
```

**Example**:
```ts
const user = await api.patch("/users/:id", {name: "John" }, {params: {id: 1}});
```

### `zodios.delete`

```ts
delete(path: string, body: BodyParam, config?: ZodiosRequestOptions): Promise<Response>;
```

**Example**:
```ts
const user = await api.delete("/users/:id", {params: {id: 1}});
```

## Request Options

```ts
type ZodiosRequestOptions ={
  method: "get" | "post" | "put" | "patch"| "delete";
  url: string; // path to the endpoint
  data?: BodyParam, // body param for post, put, patch, delete
  params?: PathParams; // path parameters
  queries?: QueryParams; // search string params
  headers?: HeaderParams; // request headers
  paramsSerializer?: (params) => string; // default to qs with array brackets
  timeout: number; // default to 5s
  withCredentials?: boolean; // default to false
  adapter?: (config) => Promise<Response>; // internal adapter replacement, you usually don't need to use it, let library authors implement it
  auth?: {
    username: string;
    password: string;
  },
  responseType?: 'arraybuffer'| 'blob' | 'document'| 'json'| 'text'| 'stream'; // default to json
  responseEncoding?: 'utf8'; // only for node
  xsrfCookieName?: string; // default to XSRF-TOKEN
  xsrfHeaderName: string; // default to X-XSRF-TOKEN
  onUploadProgress: (progressEvent) => void; // only for browser with XMLHttpRequest
  onDownloadProgress: (progressEvent) => void; // only for browser with XMLHttpRequest
  maxContentLength?: number; // default to 2000
  maxBodyLength?: number; // default to 2000 - Node only
  validateStatus?: (status) => boolean; // default to status >= 200 && status < 300
  maxRedirects?: number; // default to 5
  httpAgent?: NodeHttpAgent; // only for node
  httpsAgent?: NodeHttpsAgent; // only for node
  proxy?: {  // only for node
    protocol: string; // http or https
    host: string; // proxy host
    port: number; // proxy port
    auth: {
      username: string;
      password: string;
    }
  };

  decompress?: boolean; // default to true
}
```

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
import { Zodios, asCrudApi } from '@zodios/core';

const apiClient = new Zodios(BASE_URL,
  asCrudApi(
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