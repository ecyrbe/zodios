// @ts-nocheck
// disable type checking for this file as we need to defer type checking when using these utility types
// indeed typescript seems to have a bug, where it tries to infer the type of an undecidable generic type
// but when using the functions, types are inferred correctly
import {
  ZodiosEndpointDescription,
  ZodiosEndpointParameter,
  ZodiosEnpointDescriptions,
  ZodiosEndpointError,
} from "./zodios.types";
import z from "zod";
import { capitalize } from "./utils";
import { Narrow } from "./utils.types";

/**
 * check api for non unique paths
 * @param api - api to check
 * @return - nothing
 * @throws - error if api has non unique paths
 */
export function checkApi<T extends ZodiosEnpointDescriptions>(api: T) {
  const paths = new Set<string>();
  for (let endpoint of api) {
    const fullpath = `${endpoint.method} ${endpoint.path}`;
    if (paths.has(fullpath)) {
      throw new Error(`Zodios: Duplicate path '${fullpath}'`);
    }
    paths.add(fullpath);
  }
}

/**
 * Simple helper to split your api definitions into multiple files
 * By just providing autocompletions for the endpoint descriptions
 * @param api - api definitions
 * @returns the api definitions
 */
export function asApi<T extends ZodiosEnpointDescriptions>(api: Narrow<T>): T {
  checkApi(api);
  return api;
}

export function asParameters<T extends ZodiosEndpointParameter[]>(
  params: Narrow<T>
): T {
  return params;
}

export function asErrors<T extends ZodiosEndpointError[]>(
  errors: Narrow<T>
): T {
  return errors;
}

export class Builder<T extends ZodiosEnpointDescriptions> {
  constructor(private api: T) {}
  addEndpoint<E extends ZodiosEndpointDescription>(endpoint: Narrow<E>) {
    return new Builder<[...T, E]>([...this.api, endpoint]);
  }
  build(): T {
    checkApi(this.api);
    return this.api;
  }
}

/**
 * Advanced helper to build your api definitions
 * compared to `asApi()` you'll have better autocompletion experience and better error messages,
 * @param endpoint
 * @returns - a builder to build your api definitions
 */
export function apiBuilder<T extends ZodiosEndpointDescription<any>>(
  endpoint: Narrow<T>
): Builder<[T]> {
  return new Builder([endpoint]);
}

/**
 * Helper to generate a basic CRUD api for a given resource
 * @param resource - the resource to generate the api for
 * @param schema - the schema of the resource
 * @returns - the api definitions
 */
export function asCrudApi<T extends string, S extends z.Schema>(
  resource: T,
  schema: S
) {
  type Schema = z.infer<S>;
  const capitalizedResource = capitalize(resource);
  return asApi([
    {
      method: "get",
      path: `/${resource}s`,
      alias: `get${capitalizedResource}s`,
      description: `Get all ${resource}s`,
      response: z.array(schema),
    },
    {
      method: "get",
      path: `/${resource}s/:id`,
      alias: `get${capitalizedResource}`,
      description: `Get a ${resource}`,
      response: schema,
    },
    {
      method: "post",
      path: `/${resource}s`,
      alias: `create${capitalizedResource}`,
      description: `Create a ${resource}`,
      parameters: [
        {
          name: "body",
          type: "Body",
          description: "The object to create",
          schema: (
            schema as unknown as z.AnyZodObject
          ).partial() as unknown as z.Schema<Partial<Schema>>,
        },
      ],
      response: schema,
    },
    {
      method: "put",
      path: `/${resource}s/:id`,
      alias: `update${capitalizedResource}`,
      description: `Update a ${resource}`,
      parameters: [
        {
          name: "body",
          type: "Body",
          description: "The object to update",
          schema: schema,
        },
      ],
      response: schema,
    },
    {
      method: "patch",
      path: `/${resource}s/:id`,
      alias: `patch${capitalizedResource}`,
      description: `Patch a ${resource}`,
      parameters: [
        {
          name: "body",
          type: "Body",
          description: "The object to patch",
          schema: (
            schema as unknown as z.AnyZodObject
          ).partial() as unknown as z.Schema<Partial<Schema>>,
        },
      ],
      response: schema,
    },
    {
      method: "delete",
      path: `/${resource}s/:id`,
      alias: `delete${capitalizedResource}`,
      description: `Delete a ${resource}`,
      response: schema,
    },
  ]);
}
