import { makeApi, makeEndpoint } from "../../src/index";
import { z } from "zod";
import { devUser, User } from "./users";

/**
 * zod does not handle recusive well, so we need to manually define the schema
 */
export type Comment = {
  type_of: string;
  id_code: string;
  created_at: string;
  body_html: string;
  user: User;
  children: Comment[];
};

export const devComment: z.ZodSchema<Comment> = z.lazy(() =>
  z.object({
    type_of: z.string(),
    id_code: z.string(),
    created_at: z.string(),
    body_html: z.string(),
    user: devUser,
    children: z.array(devComment),
  })
);
export const devComments = z.array(devComment);

export type Comments = z.infer<typeof devComments>;

const getAllComments = makeEndpoint({
  method: "get",
  path: "/comments",
  alias: "getAllComments",
  description: "Get all comments",
  parameters: [
    {
      name: "a_id",
      description: "Article ID",
      type: "Query",
      schema: z.number().optional(),
    },
    {
      name: "p_id",
      description: "Podcast comment ID",
      type: "Query",
      schema: z.number().optional(),
    },
  ],
  response: devComments,
});

const getComment = makeEndpoint({
  method: "get",
  path: "/comments/:id",
  alias: "getComment",
  description: "Get a comment",
  response: devComment,
});

export const commentsApi = makeApi([getAllComments, getComment]);
