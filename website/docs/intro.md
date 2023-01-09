---
sidebar_position: 1
---

# Introduction

Zodios is a REST API toolbox with end-to-end typesafety.  
It allows you to create a REST API with a clean, intuitive and declarative syntax.

It's best used with [TypeScript](https://www.typescriptlang.org/), but it's also usable with pure [JavaScript](https://www.javascript.com/).

It's composed of multiple packages :

| Package           | Type             | Description                                                                                                                                                       |
| ----------------- | ---------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `@zodios/core`    | Frontend Backend | The core library that contains an API client with full typesafety and autocompletion.<br/> You can use it as a standalone API client without using other modules. |
| `@zodios/plugins` | Frontend Backend | A set of plugins for the API client.                                                                                                                              |
| `@zodios/react`   | Frontend         | React hooks for the client based on [tanstack-query](https://tanstack.com/query).                                                                                 |
| `@zodios/solid`   | Frontend         | Solid hooks for the client based on [tanstack-query](https://tanstack.com/query).                                                                                 |
| `@zodios/express` | Backend          | A simple adapter for [Express](https://expressjs.com/) but with full typesafety and autocompletion.                                                               |
| `@zodios/openapi` | Backend          | Helper that generates OpenAPI specs from Zodios [API definitions](api/api-definition.md) and allows you to easily generate swagger ui.                            |

:::tip It's worth noting that frontend and backend packages can be used as standalone packages.
Meaning that you don't need to use Zodios Backend to use Zodios Frontend packages and vice-versa. Allowing you to scale the developement of your API between frontend and backend teams.  
  
You only need to share the API definition between the two teams.
:::
