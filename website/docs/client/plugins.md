---
sidebar_position: 3
---

# Client API plugins

Zodios client has a powerfull plugin system. You can attach a plugin to all your API calls or to a specific API call.
## Fetch plugin

Axios is using XHR on the browser. This might be a showstopper for your application, because XHR lacks some options of `fetch` you might rely on.  
For those use cases, you can use the `fetch` plugin that implements an axios adapter using the standard fetch.  
  
:::caution 🚧 Warning 🚧**
It's worth noting, that you should not use the `fetch` plugin on nodejs. Indeed, fetch lacks a lot of features on backend side and you should use axios default http adapter for node (default). If you still want to use fetch on your backend, you should use a polyfill, zodios does not provide one.   

 Do not open an issue for `fetch` support on `nodejs` unless you are willing to add support for it with a PR at the same time. I might reconsider this position in the future when fetch becomes feature complete on nodejs.
:::

```typescript
import { pluginFetch } from "@zodios/plugins";

apiClient.use(pluginFetch({
  // all fetch options are supported
  keepAlive: true,
}));
```
  
## Authorization with Token plugin

`@zodios/plugins` comes with a plugin to inject and renew your tokens :
```typescript
  import { pluginToken } from '@zodios/plugins';

  apiClient.use(pluginToken({
    getToken: async () => "token"
  }));
```
## Use a plugin only for some endpoints

Zodios plugin system is much like the middleware system of `express`. This means you can apply a plugin to a specific endpoint or to all endpoints.
  
```typescript
  import { pluginToken } from '@zodios/plugins';

  // apply a plugin by alias
  apiClient.use("getUser", pluginToken({
    getToken: async () => "token"
  }));
  // apply a plugin by endpoint
  apiClient.use("get","/users/:id", pluginToken({
    getToken: async () => "token"
  }));
```
## Override plugin

Zodios plugins can be named and can be overridden.
Here are the list of integrated plugins that are used by zodios by default :
- zodValidationPlugin : validation of response schema with zod library
- formDataPlugin : convert provided body object to `multipart/form-data` format
- formURLPlugin : convert provided body object to `application/x-www-form-urlencoded` format

For example, you can override internal 'zod-validation' plugin with your own validation plugin :
  
```typescript
  import { zodValidationPlugin } from '@zodios/core';
  import { myValidationInterceptor } from './my-custom-validation';
 
  apiClient.use({
    name: zodValidationPlugin().name, // using the same name as an already existing plugin will override it
    response: myValidationInterceptor,
  });
```

Some Zodios plugins are registered per-endpoint. For example, you cannot override `formDataPlugin` globally. Instead, you should do:

```typescript
  import { formDataPlugin } from '@zodios/core';
  import { myFormDataPlugin } from './my-custom-formdata';
 
  for(const endpoint of apiClient.api) {
    if(endpoint.requestFormat === 'form-data') {
      apiClient.use(endpoint.alias, {
        name: formDataPlugin().name, // using the same name as an already existing plugin will override it
        request: myFormDataPlugin
      })
    }
  }
```

## Plugin execution order

Zodios plugins that are not attached to an endpoint are executed first.
Then plugins that match your endpoint are executed.
In addition, plugins are executed in their declaration order for requests, and in reverse order for responses.

example, `pluginLog` logs the message it takes as parameter when it's called :
  ```typescript
    apiClient.use("getUser", pluginLog('2'));
    apiClient.use(pluginLog('1'));
    apiClient.use("get","/users/:id", pluginLog('3'));

    apiClient.get("/users/:id", { params: { id: 7 } });

    // output :
    // request 1 
    // request 2
    // request 3
    // response 3
    // response 2
    // response 1
  ```

## Write your own plugin

Zodios plugins are middleware interceptors for requests and responses.
If you want to create your own, they should have the following signature :  
  
```typescript
export type ZodiosPlugin = {
  /**
   * Optional name of the plugin
   * naming a plugin allows to remove it or replace it later
   */
  name?: string;
  /**
   * request interceptor to modify or inspect the request before it is sent
   * @param api - the api description
   * @param request - the request config
   * @returns possibly a new request config
   */
  request?: (
    api: ZodiosEnpointDescriptions,
    config: AnyZodiosRequestOptions
  ) => Promise<AnyZodiosRequestOptions>;
  /**
   * response interceptor to modify or inspect the response before it is returned
   * @param api - the api description
   * @param config - the request config
   * @param response - the response
   * @returns possibly a new response
   */
  response?: (
    api: ZodiosEnpointDescriptions,
    config: AnyZodiosRequestOptions,
    response: AxiosResponse
  ) => Promise<AxiosResponse>;
  /**
   * error interceptor for response errors
   * there is no error interceptor for request errors
   * @param api - the api description
   * @param config - the config for the request
   * @param error - the error that occured
   * @returns possibly a new response or throw a new error
   */
  error?: (
    api: ZodiosEnpointDescriptions,
    config: AnyZodiosRequestOptions,
    error: Error
  ) => Promise<AxiosResponse>;
};
```
