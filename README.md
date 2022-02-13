# ZODIOS

│ <p align="center">
   <a href="https://github.com/ecyrbe/zodios">
     <img align="center" src="https://raw.githubusercontent.com/ecyrbe/zodios/main/docs/logo.svg" width="128px" alt="Zodios logo">
   </a>
 </p>
 
 <p align="center">
    Zodios is a typescript api client with auto-completion features backed by zod and typescript
 </p>
 
 <p align="center">
   <img src="https://img.shields.io/npm/v/zodios.svg" alt="langue typescript">
   <img alt="npm" src="https://img.shields.io/npm/dw/zodios">
   <a href="https://github.com/ecyrbe/zodios/blob/main/LICENSE">
    <img alt="GitHub" src="https://img.shields.io/github/license/ecyrbe/zodios">   
   </a>
 </p>

# What is it ?

It's an API client, made with axios, zod and typescript to allow easy client API definitions

# Install

```bash
> npm install zodios
```
or 
```bash
> yarn add zodios
```

# Declare your API with zodios

```typescript
import { Zodios } from "zodios";
import { z } from "zod";

const apiClient = new Zodios(
  "https://jsonplaceholder.typicode.com",
  {
    getToken: () => Promise.resolve("token"),
  },
  [
    {
      method: "get",
      path: "/users/:id",
      description: "Get a user",
      parameters: [
        {
          type: "Path",
          name: "id",
          schema: z.number(),
        },
      ],
      response: z.object({
        id: z.number(),
        name: z.string(),
      }),
    },
  ] as const
);
//                               auto-complete url  auto-complete params
//                                    ▼                   ▼
const user = await apiClient.get("/users/:id", { params: { id: 7 } });
console.log(user);
// Output: { id: 7, name: 'Kurtis Weissnat' }
```