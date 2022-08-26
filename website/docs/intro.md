---
sidebar_position: 1
---

# Introduction

Zodios is a REST API toolbox with end-to-end typesafety.  
It allows you to create a REST API with a clean, intuitive and declarative syntax.

It's best used with [TypeScript](https://www.typescriptlang.org/), but it's also usable with pure [JavaScript](https://www.javascript.com/).

It's composed of multiple components:
- `@zodios/core` - the core library that contains an API client. You can use it independently of the other components.
- `@zodios/react` - react hooks for the client based on [tanstack-query](https://tanstack.com/query).
- `@zodios/plugins` - a set of plugins for the API client.
- `@zodios/express` - a simple wrapper over [Express](https://expressjs.com/) but with full typesafety and autocompletion.
- `@zodios/openapi` - openapi helper that generates openapi specs from Zodios API declaration and allows you to easily generate swagger ui.