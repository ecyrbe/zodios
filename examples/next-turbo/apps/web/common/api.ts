import { makeApi } from "@zodios/core";
import z from "zod";

export const api = makeApi([
  {
    method: "get",
    path: "/health",
    alias: "health",
    response: z.object({
      status: z.literal("ok"),
    }),
  },
]);
