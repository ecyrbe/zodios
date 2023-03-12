import z from "zod";
import { makeApi, mergeApis } from "./index";
import { Assert, ReadonlyDeep } from "./utils.types";

const userSchema = z.object({
  id: z.number(),
  name: z.string(),
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
