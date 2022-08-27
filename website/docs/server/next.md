---
sidebar_position: 3
---

# Next integration

Next integration is easy, with end-to-end typesafe developper experience, where you can combine the powwer of all the Zodios packages into one single codebase.  
`@zodios/express` works out of the box with [NextJS](https://nextjs.org/) if you use the following structure:


```bash
│
├── src
│   ├── common
│   │   └── api.ts # API definition
│   ├── pages
│   │   ├── _app.tsx
│   │   ├── api
│   │   │   └── [...zodios].ts # import and re-export your main server app router here
│   │   └── [..]
│   ├── server
│   │   ├── routers
│   │   │   ├── app.ts   # import your API definition and export your main app router here
│   │   │   ├── users.ts  # sub routers
│   │   │   └── [..]
└── [..]
```
:::tip It's recommended to use the example above to bootstrap your NextJS application.
  [Example project](https://github.com/ecyrbe/zodios-express/tree/main/examples/next)
:::
