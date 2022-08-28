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