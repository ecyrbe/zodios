import { z } from "zod";
import { asApi } from "../../src/index";

export const devFollow = z.object({
  id: z.number(),
  name: z.string(),
  points: z.number(),
});

export const devFollows = z.array(devFollow);

export type Follow = z.infer<typeof devFollow>;
export type Follows = z.infer<typeof devFollows>;

export const followsApi = asApi([
  {
    method: "get",
    path: "/follows/tags",
    alias: "getAllFollowedTags",
    description: "Get all followed tags",
    response: devFollows,
  },
]);
