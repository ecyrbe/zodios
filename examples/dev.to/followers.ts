import { z } from "zod";
import { asApi } from "../../src/index";
import { paramPages } from "./params";

const devFollower = z.object({
  type_of: z.string(),
  created_at: z.string(),
  id: z.number(),
  name: z.string(),
  path: z.string(),
  username: z.string(),
  profile_image: z.string(),
});

const devFollowers = z.array(devFollower);

export const followersApi = asApi([
  {
    method: "get",
    path: "/followers/users",
    alias: "getAllFollowers",
    parameters: [
      ...paramPages,
      {
        name: "sort",
        description: "Sort by. defaults to created_at",
        type: "Query",
        schema: z.string().optional(),
      },
    ],
    response: devFollowers,
  },
]);
