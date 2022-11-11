import { apiBuilder, makeApi } from "../../packages/core/src/index";
import { z } from "zod";
import { devUser } from "./users";
import { paramPages } from "./params";

const devArticle = z.object({
  id: z.number(),
  type_of: z.string(),
  title: z.string(),
  description: z.string(),
  cover_image: z.string().or(z.null()),
  readable_publish_date: z.string().optional(),
  social_image: z.string().optional(),
  tag_list: z.array(z.string()).or(z.string()),
  tags: z.array(z.string()).or(z.string()).optional(),
  slug: z.string(),
  path: z.string(),
  url: z.string(),
  canonical_url: z.string(),
  comments_count: z.number(),
  positive_reactions_count: z.number(),
  public_reactions_count: z.number(),
  collection_id: z.number().or(z.null()).optional(),
  created_at: z.string().optional(),
  edited_at: z.string().optional(),
  crossposted_at: z.string().or(z.null()).optional(),
  published_at: z.string().or(z.null()).optional(),
  last_comment_at: z.string().optional(),
  published_timestamp: z.string(),
  reading_time_minutes: z.number(),
  user: devUser.partial(),
  read_time_minutes: z.number().optional(),
  organization: z
    .object({
      name: z.string(),
      username: z.string(),
      slug: z.string(),
      profile_image: z.string(),
      profile_image_90: z.string(),
    })
    .optional(),
  flare_tag: z
    .object({
      name: z.string(),
      bg_color_hex: z.string(),
      text_color_hex: z.string(),
    })
    .optional(),
});

const devArticles = z.array(devArticle);

export type Article = z.infer<typeof devArticle>;
export type Articles = z.infer<typeof devArticles>;

export const articlesApi = apiBuilder({
  method: "get",
  path: "/articles",
  alias: "getAllArticles",
  description: "Get all articles",
  parameters: [
    ...paramPages,
    {
      name: "tag",
      description: "Filter by tag",
      type: "Query",
      schema: z.string().optional(),
    },
    {
      name: "tags",
      description: "Filter by tags",
      type: "Query",
      schema: z.string().optional(),
    },
    {
      name: "tags_exclude",
      description: "Exclude tags",
      type: "Query",
      schema: z.string().optional(),
    },
    {
      name: "username",
      description: "Filter by username",
      type: "Query",
      schema: z.string().optional(),
    },
    {
      name: "state",
      description: "Filter by state",
      type: "Query",
      schema: z.string().optional(),
    },
    {
      name: "top",
      type: "Query",
      schema: z.number().optional(),
    },
    {
      name: "collection_id",
      type: "Query",
      schema: z.number().optional(),
    },
  ],
  response: devArticles,
})
  .addEndpoint({
    method: "get",
    path: "/articles/latest",
    alias: "getLatestArticle",
    description: "Get latest articles",
    parameters: paramPages,
    response: devArticles,
  })
  .addEndpoint({
    method: "get",
    path: "/articles/:id",
    alias: "getArticle",
    description: "Get an article by id",
    response: devArticle,
  })
  .addEndpoint({
    method: "put",
    path: "/articles/:id",
    alias: "updateArticle",
    description: "Update an article",
    response: devArticle,
  })
  .addEndpoint({
    method: "get",
    path: "/articles/:username/:slug",
    alias: "getArticleByUsernameAndSlug",
    description: "Get an article by username and slug",
    response: devArticle,
  })
  .addEndpoint({
    method: "get",
    path: "/articles/me",
    alias: "getMyArticles",
    description: "Get current user's articles",
    parameters: paramPages,
    response: devArticles,
  })
  .addEndpoint({
    method: "get",
    path: "/articles/me/published",
    alias: "getMyPublishedArticles",
    description: "Get current user's published articles",
    parameters: paramPages,
    response: devArticles,
  })
  .addEndpoint({
    method: "get",
    path: "/articles/me/unpublished",
    alias: "getMyUnpublishedArticles",
    description: "Get current user's unpublished articles",
    parameters: paramPages,
    response: devArticles,
  })
  .addEndpoint({
    method: "get",
    path: "/articles/me/all",
    alias: "getAllMyArticles",
    description: "Get current user's all articles",
    parameters: paramPages,
    response: devArticles,
  })
  .build();
