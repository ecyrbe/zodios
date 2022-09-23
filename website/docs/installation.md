---
sidebar_position: 2
---

# Installation

:::info
Zodios packages can be installed using your preferred package manager.  
We only show npm and yarn as they are the most popular.
:::

## Frontend installation

```bash npm2yarn
npm install @zodios/core axios zod
```
### With React

if you want to use the react hooks, you need to install the following packages:

```bash npm2yarn
npm install react-query @zodios/core @zodios/react axios react react-dom zod
```
:::note
@zodios/react is using react-query v3, in future next major version we will upgrade to react-query v4
:::

### Install type definitions

install those even in javascript projects.

```bash npm2yarn
npm install --dev @types/axios 
// if you use react
npm install --dev @types/axios @types/react @types/react-dom
```

## Backend installation

### With Express

```bash npm2yarn
npm install @zodios/core @zodios/express express zod axios
```

### With NextJS

```bash npm2yarn
npm install @zodios/core @zodios/express next zod axios react react-dom
```

### Install type definitions

install those even in javascript projects

```bash npm2yarn
// if you use express
npm install --dev @types/axios @types/express
// or with nextjs
npm install --dev @types/axios @types/express @types/react @types/react-dom
```
