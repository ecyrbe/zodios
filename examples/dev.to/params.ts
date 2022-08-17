import { z } from "zod";
import { asParameters } from "../../src/api";

export const paramPages = asParameters([
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
