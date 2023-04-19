import { zodiosContext } from "@zodios/express";
import z from "zod";

export const ctx = zodiosContext(
  z.object({
    user: z.object({
      id: z.string(),
      name: z.string(),
    }),
  })
);
