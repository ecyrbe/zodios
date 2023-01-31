import { zodiosContext } from "@zodios/express";
import z from "zod";

const user = z.object({
  id: z.number(),
  name: z.string(),
  email: z.string().email(),
});

export const ctx = zodiosContext(z.object({ user }));
