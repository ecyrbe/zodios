import { makeApi } from "@zodios/core";
import { z } from "zod";
import { prefixApi } from "./zodios.utils";
import { Assert } from "@zodios/core/lib/utils.types";

const response = z.object({
  id: z.number(),
  name: z.string(),
});

const api = makeApi([
  {
    method: "get",
    path: "/",
    response,
  },
  {
    method: "get",
    path: "/foo",
    response,
  },
]);

describe("zodios utils", () => {
  it("should prefix api", () => {
    type Expected = [
      {
        method: "get";
        path: "/api/";
        response: typeof response;
      },
      {
        method: "get";
        path: "/api/foo";
        response: typeof response;
      }
    ];
    const prefix = "/api";
    const prefixedApi = prefixApi(prefix, api);
    const testApi: Assert<typeof prefixedApi, Expected> = true;
    expect(prefixedApi).toEqual([
      {
        method: "get",
        path: "/api/",
        response,
      },
      {
        method: "get",
        path: "/api/foo",
        response,
      },
    ]);
  });
});
