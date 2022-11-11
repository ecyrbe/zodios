import { z } from "zod";
import { makeApi } from "../../packages/core/src/index";

export const devUser = z.object({
  id: z.number(),
  type_of: z.string(),
  name: z.string(),
  username: z.string(),
  summary: z.string().or(z.null()),
  twitter_username: z.string().or(z.null()),
  github_username: z.string().or(z.null()),
  website_url: z.string().or(z.null()),
  location: z.string().or(z.null()),
  joined_at: z.string(),
  profile_image: z.string(),
  profile_image_90: z.string(),
});

export type User = z.infer<typeof devUser>;

export const devProfileImage = z.object({
  type_of: z.string(),
  image_of: z.string(),
  profile_image: z.string(),
  profile_image_90: z.string(),
});

export type ProfileImage = z.infer<typeof devProfileImage>;

export const userApi = makeApi([
  {
    method: "get",
    path: "/users/:id",
    alias: "getUser",
    description: "Get a user",
    response: devUser,
    errors: [
      {
        status: "default",
        description: "Default error",
        schema: z.object({
          error: z.object({
            code: z.string(),
            message: z.string(),
          }),
        }),
      },
    ],
  },
  {
    method: "get",
    path: "/users/me",
    alias: "getMe",
    description: "Get current user",
    response: devUser,
  },
  {
    method: "get",
    path: "/profile_image/:username",
    alias: "getProfileImage",
    description: "Get a user's profile image",
    response: devProfileImage,
  },
]);
