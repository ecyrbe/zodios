import z from "zod";
import { makeApi, mergeApis, parametersBuilder } from "./index";
import { Assert } from "./utils.types";

const userSchema = z.object({
  id: z.number(),
  name: z.string(),
});

describe("makeApi", () => {
  it("should throw on duplicate path", () => {
    expect(() =>
      makeApi([
        {
          method: "get",
          path: "/users",
          alias: "getUsers",
          description: "Get all users",
          response: z.array(userSchema),
        },
        {
          method: "get",
          path: "/users",
          alias: "getUsers2",
          description: "Get all users",
          response: z.array(userSchema),
        },
      ])
    ).toThrowError("Zodios: Duplicate path 'get /users'");
  });

  it("should throw on duplicate alias", () => {
    expect(() =>
      makeApi([
        {
          method: "get",
          path: "/users",
          alias: "getUsers",
          description: "Get all users",
          response: z.array(userSchema),
        },
        {
          method: "get",
          path: "/users2",
          alias: "getUsers",
          description: "Get all users",
          response: z.array(userSchema),
        },
      ])
    ).toThrowError("Zodios: Duplicate alias 'getUsers'");
  });

  it("should throw on duplicate Body", () => {
    expect(() =>
      makeApi([
        {
          method: "post",
          path: "/users",
          alias: "createUser",
          description: "Create a user",
          parameters: [
            {
              name: "first",
              type: "Body",
              description: "The object to create",
              schema: userSchema.partial(),
            },
            {
              name: "second",
              type: "Body",
              description: "The object to create",
              schema: userSchema.partial(),
            },
          ],
          response: userSchema,
        },
      ])
    ).toThrowError("Zodios: Multiple body parameters in endpoint '/users'");
  });

  it("should build with parameters (Path,Query,Body,Header)", () => {
    // get users api with query filter for user name, and path parameter for user id and header parameter for user token
    const optionalTrueSchema = z.boolean().default(true).optional();
    const partialUserSchema = userSchema.partial();
    const bearerSchema = z.string().transform((s) => `Bearer ${s}`);
    const api = makeApi([
      {
        method: "post",
        path: "/users/:id",
        alias: "createtUser",
        description: "Create a user",
        parameters: [
          {
            name: "id",
            type: "Path",
            description: "The user id",
            schema: z.number(),
          },
          {
            name: "homonyms",
            type: "Query",
            description: "Allow homonyms",
            schema: optionalTrueSchema,
          },
          {
            name: "email",
            type: "Query",
            description: "create an email account for the user",
            schema: optionalTrueSchema,
          },
          {
            name: "body",
            type: "Body",
            description: "The object to create",
            schema: partialUserSchema,
          },
          {
            name: "Authorization",
            type: "Header",
            description: "The user token",
            schema: bearerSchema,
          },
          {
            name: "x-custom-header",
            type: "Header",
            description: "A custom header",
            schema: z.string(),
          },
        ],
        response: userSchema,
      },
    ]);
    // check narrowing works
    const test: Assert<
      typeof api,
      readonly [
        {
          readonly method: "post";
          readonly path: "/users/:id";
          readonly alias: "createtUser";
          readonly description: "Create a user";
          readonly parameters: readonly [
            {
              readonly name: "id";
              readonly type: "Path";
              readonly description: "The user id";
              readonly schema: z.ZodNumber;
            },
            {
              readonly name: "homonyms";
              readonly type: "Query";
              readonly description: "Allow homonyms";
              readonly schema: typeof optionalTrueSchema;
            },
            {
              readonly name: "email";
              readonly type: "Query";
              readonly description: "create an email account for the user";
              readonly schema: typeof optionalTrueSchema;
            },
            {
              readonly name: "body";
              readonly type: "Body";
              readonly description: "The object to create";
              readonly schema: typeof partialUserSchema;
            },
            {
              readonly name: "Authorization";
              readonly type: "Header";
              readonly description: "The user token";
              readonly schema: typeof bearerSchema;
            },
            {
              readonly name: "x-custom-header";
              readonly type: "Header";
              readonly description: "A custom header";
              readonly schema: z.ZodString;
            }
          ];
          readonly response: typeof userSchema;
        }
      ]
    > = true;
  });
});

describe("parametersBuilder", () => {
  it("should build parameters (Path,Query,Body,Header)", () => {
    // get users api with query filter for user name, and path parameter for user id and header parameter for user token
    const optionalTrueSchema = z.boolean().default(true).optional();
    const partialUserSchema = userSchema.partial();
    const bearerSchema = z.string().transform((s) => `Bearer ${s}`);

    const parameters = parametersBuilder()
      .addParameters("Path", {
        id: z.number(),
      })
      .addQueries({
        homonyms: optionalTrueSchema,
        email: optionalTrueSchema,
      })
      .addBody(partialUserSchema)
      .addHeaders({
        Authorization: bearerSchema,
        "x-custom-header": z.string(),
      })
      .build();

    const test: Assert<
      (typeof parameters)[number],
      | {
          name: "id";
          type: "Path";
          description?: string;
          schema: z.ZodNumber;
        }
      | {
          name: "homonyms";
          type: "Query";
          description?: string;
          schema: typeof optionalTrueSchema;
        }
      | {
          name: "email";
          type: "Query";
          description?: string;
          schema: typeof optionalTrueSchema;
        }
      | {
          name: "body";
          type: "Body";
          description?: string;
          schema: typeof partialUserSchema;
        }
      | {
          name: "Authorization";
          type: "Header";
          description?: string;
          schema: typeof bearerSchema;
        }
      | {
          name: "x-custom-header";
          type: "Header";
          description?: string;
          schema: z.ZodString;
        }
    > = true;
  });
});

describe("mergeApis", () => {
  it("should merge two apis", () => {
    const usersSchema = z.array(userSchema);
    const api1 = makeApi([
      {
        method: "get",
        path: "/",
        alias: "getUsers",
        description: "Get all users",
        response: usersSchema,
      },
      {
        method: "get",
        path: "/:id",
        alias: "getUser",
        description: "Get a user",
        response: userSchema,
      },
    ]);

    const api2 = makeApi([
      {
        method: "get",
        path: "/",
        alias: "getAdmins",
        description: "Get all admins",
        response: usersSchema,
      },
    ]);
    const merged = mergeApis({
      "/users": api1,
      "/admins": api2,
    });
    expect(merged).toHaveLength(3);
    expect(merged[0].path).toEqual("/users");
    expect(merged[1].path).toEqual("/users/:id");
    expect(merged[2].path).toEqual("/admins");
    const test1: Assert<
      typeof merged,
      [
        {
          readonly method: "get";
          readonly path: "/users";
          readonly alias: "getUsers";
          readonly description: "Get all users";
          readonly response: typeof usersSchema;
        },
        {
          readonly method: "get";
          readonly path: "/users/:id";
          readonly alias: "getUser";
          readonly description: "Get a user";
          readonly response: typeof userSchema;
        },
        {
          readonly method: "get";
          readonly path: "/admins";
          readonly alias: "getAdmins";
          readonly description: "Get all admins";
          readonly response: typeof usersSchema;
        }
      ]
    > = true;
  });
});
