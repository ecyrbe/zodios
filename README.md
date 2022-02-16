 <h1 align="center">Zodios</h1>
 <p align="center">
   <a href="https://github.com/ecyrbe/zodios">
     <img align="center" src="https://raw.githubusercontent.com/ecyrbe/zodios/main/docs/logo.svg" width="128px" alt="Zodios logo">
   </a>
 </p>
 
 <p align="center">
    Zodios is a typescript api client with auto-completion features backed by <a src="https://axios-http.com" >axios</a> and <a src="https://github.com/colinhacks/zod">zod</a>
 </p>
 
 <p align="center">
   <img src="https://img.shields.io/npm/v/zodios.svg" alt="langue typescript">
   <img alt="npm" src="https://img.shields.io/npm/dw/zodios">
   <a href="https://github.com/ecyrbe/zodios/blob/main/LICENSE">
    <img alt="GitHub" src="https://img.shields.io/github/license/ecyrbe/zodios">   
   </a>
   <img alt="GitHub Workflow Status" src="https://img.shields.io/github/workflow/status/ecyrbe/zodios/CI">
 </p>

# What is it ?

It's an axios compatible API client, with the following features:  
  
- really simple centralized API declaration
- typescript autocompletion in your favorite IDE for URL and parameters
- typescript response types
- parameters and responses schema thanks to zod
- response schema validation
- bearer token injection and token renewal with simple token provider interface
- all axios features available

# Install

```bash
> npm install zodios
```

or

```bash
> yarn add zodios
```

# Usage

## Declare your API with zodios

```typescript
import { Zodios } from "zodios";
import { z } from "zod";

const apiClient = new Zodios(
  "https://jsonplaceholder.typicode.com",
  // API definition
  [
    {
      method: "get",
      path: "/users/:id", // auto detect :id and ask for it in apiClient get params
      description: "Get a user",
      response: z.object({
        id: z.number(),
        name: z.string(),
      }),
    },
  ] as const,
  // Optional Token provider
  {
    tokenProvider: {
      getToken: () => Promise.resolve("token"),
    }
  }
);
//   typed                     auto-complete url   auto-complete params
//     ▼                               ▼                   ▼
const user = await apiClient.get("/users/:id", { params: { id: 7 } });
console.log(user);
// Output: { id: 7, name: 'Kurtis Weissnat' }
```
## Get underlying axios instance

you can get back the underlying axios instance to customize it.

```typescript
const axiosInstance = apiClient.axios;
```
## Give your own axios intance to zodios

you can instanciate zodios with your own axios intance.

```typescript
const apiClient = new Zodios(
  "https://jsonplaceholder.typicode.com",
  [ ... ] as const,
  // Optional Axios instance
  {
    axiosIntance: customAxiosInstance
  }
);
```

## Disable zodios response validation

```typescript
const apiClient = new Zodios(
  "https://jsonplaceholder.typicode.com",
  [ ... ] as const,
  // Disable validation
  {
    validateResponse: false
  }
);
```
