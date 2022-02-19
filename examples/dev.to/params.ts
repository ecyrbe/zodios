import { z } from "zod";

export const paramPages = [
  {
    name: "page",
    type: "Query",
    schema: z.number().optional(),
  },
  {
    name: "per_page",
    type: "Query",
    schema: z.number().optional(),
  },
] as const;
