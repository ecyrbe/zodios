import express from "express";
import { AddressInfo } from "net";
import z from "zod";
import { makeApi, makeCrudApi, mergeApis, Zodios } from "./index";
import { Assert } from "./utils.types";

const userSchema = z.object({
  id: z.number(),
  name: z.string(),
});

describe("makeCrudApi", () => {
  let app: express.Express;
  let server: ReturnType<typeof app.listen>;
  let port: number;

  beforeAll(async () => {
    app = express();
    app.use(express.json());
    app.get("/users", (req, res) => {
      res.status(200).json([{ id: 1, name: "test" }]);
    });
    app.get("/users/:id", (req, res) => {
      res.status(200).json({ id: Number(req.params.id), name: "test" });
    });
    app.post("/users", (req, res) => {
      res.status(200).json({ id: 1, name: "test" });
    });
    app.put("/users/:id", (req, res) => {
      res.status(200).json({ id: Number(req.params.id), name: req.body.name });
    });
    app.patch("/users/:id", (req, res) => {
      res.status(200).json({ id: Number(req.params.id), name: req.body.name });
    });
    app.delete("/users/:id", (req, res) => {
      res.status(200).json({ id: Number(req.params.id), name: "test" });
    });
    server = app.listen(0);
    port = (server.address() as AddressInfo).port;
  });

  afterAll(() => {
    server.close();
  });

  it("should create a CRUD api definition", () => {
    const api = makeCrudApi("user", userSchema);

    const usersSchema = z.array(userSchema);

    type ExpectedGetEndpoint = {
      method: "get";
      path: "/users";
      alias: "getUsers";
      description: "Get all users";
      response: typeof usersSchema;
    };

    // check narrowing works
    const testGet: Assert<typeof api[0], ExpectedGetEndpoint> = true;

    expect(JSON.stringify(api)).toEqual(
      JSON.stringify([
        {
          method: "get",
          path: "/users",
          alias: "getUsers",
          description: "Get all users",
          response: z.array(userSchema),
        },
        {
          method: "get",
          path: "/users/:id",
          alias: "getUser",
          description: "Get a user",
          response: userSchema,
        },
        {
          method: "post",
          path: "/users",
          alias: "createUser",
          description: "Create a user",
          parameters: [
            {
              name: "body",
              type: "Body",
              description: "The object to create",
              schema: userSchema.partial(),
            },
          ],
          response: userSchema,
        },
        {
          method: "put",
          path: "/users/:id",
          alias: "updateUser",
          description: "Update a user",
          parameters: [
            {
              name: "body",
              type: "Body",
              description: "The object to update",
              schema: userSchema,
            },
          ],
          response: userSchema,
        },
        {
          method: "patch",
          path: "/users/:id",
          alias: "patchUser",
          description: "Patch a user",
          parameters: [
            {
              name: "body",
              type: "Body",
              description: "The object to patch",
              schema: userSchema.partial(),
            },
          ],
          response: userSchema,
        },
        {
          method: "delete",
          path: "/users/:id",
          alias: "deleteUser",
          description: "Delete a user",
          response: userSchema,
        },
      ])
    );
  });

  it("should get one user", async () => {
    const api = makeCrudApi("user", userSchema);
    const client = new Zodios(`http://localhost:${port}`, api);
    const user = await client.getUser({ params: { id: 1 } });
    expect(user).toEqual({ id: 1, name: "test" });
  });

  it("should get all users", async () => {
    const api = makeCrudApi("user", userSchema);
    const client = new Zodios(`http://localhost:${port}`, api);
    const users = await client.getUsers();
    expect(users).toEqual([{ id: 1, name: "test" }]);
  });

  it("should create a user", async () => {
    const api = makeCrudApi("user", userSchema);
    const client = new Zodios(`http://localhost:${port}`, api);
    const user = await client.createUser({ name: "test" });
    expect(user).toEqual({ id: 1, name: "test" });
  });

  it("should update a user", async () => {
    const api = makeCrudApi("user", userSchema);
    const client = new Zodios(`http://localhost:${port}`, api);
    const user = await client.updateUser(
      { id: 2, name: "test2" },
      { params: { id: 2 } }
    );
    expect(user).toEqual({ id: 2, name: "test2" });
  });

  it("should patch a user", async () => {
    const api = makeCrudApi("user", userSchema);
    const client = new Zodios(`http://localhost:${port}`, api);
    const user = await client.patchUser(
      { name: "test2" },
      { params: { id: 2 } }
    );
    expect(user).toEqual({ id: 2, name: "test2" });
  });

  it("should delete a user", async () => {
    const api = makeCrudApi("user", userSchema);
    const client = new Zodios(`http://localhost:${port}`, api);
    const user = await client.deleteUser(undefined, { params: { id: 2 } });
    expect(user).toEqual({ id: 2, name: "test" });
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
          method: "get";
          path: "/users";
          alias: "getUsers";
          description: "Get all users";
          response: typeof usersSchema;
        },
        {
          method: "get";
          path: "/users/:id";
          alias: "getUser";
          description: "Get a user";
          response: typeof userSchema;
        },
        {
          method: "get";
          path: "/admins";
          alias: "getAdmins";
          description: "Get all admins";
          response: typeof usersSchema;
        }
      ]
    > = true;
  });
});
