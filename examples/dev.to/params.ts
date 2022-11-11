import { z } from "zod";
import { makeParameters } from "../../packages/core/src/api";

export const paramPages = makeParameters([
  {
    name: "page",
    type: "Query",
    description: "Page number",
    schema: z.number().optional(),
  },
  {
    name: "per_page",
    type: "Query",
    schema: z.number().optional(),
  },
]);
