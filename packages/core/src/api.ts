import type {
  ZodiosEndpointDefinition,
  ZodiosEndpointParameter,
  ZodiosEndpointError,
} from "./zodios.types";

/**
 * check api for non unique paths
 * @param api - api to check
 * @return - nothing
 * @throws - error if api has non unique paths
 */
export function checkApi<const T extends readonly ZodiosEndpointDefinition[]>(
  api: T
) {
  const paths = new Set<string>();
  for (let endpoint of api) {
    const fullpath = `${endpoint.method} ${endpoint.path}`;
    if (paths.has(fullpath)) {
      throw new Error(`Zodios: Duplicate path '${fullpath}'`);
    }
    paths.add(fullpath);
  }
  // check if no duplicate alias
  const aliases = new Set<string>();
  for (let endpoint of api) {
    if (endpoint.alias) {
      if (aliases.has(endpoint.alias)) {
        throw new Error(`Zodios: Duplicate alias '${endpoint.alias}'`);
      }
      aliases.add(endpoint.alias);
    }
  }

  // check if no duplicate body in parameters
  for (let endpoint of api) {
    if (endpoint.parameters) {
      const bodyParams = endpoint.parameters.filter((p) => p.type === "Body");
      if (bodyParams.length > 1) {
        throw new Error(
          `Zodios: Multiple body parameters in endpoint '${endpoint.path}'`
        );
      }
    }
  }
}

/**
 * Simple helper to split your api definitions into multiple files
 * Mandatory to be used when declaring your endpoint definitions outside zodios constructor
 * to enable type inferrence and autocompletion
 * @param api - api definitions
 * @returns the api definitions
 */
export function makeApi<const Api extends readonly ZodiosEndpointDefinition[]>(
  api: Api
): Api {
  checkApi(api);
  return api;
}

const test = makeApi([
  {
    method: "get",
    path: "/test",
    response: {},
  },
]);

/**
 * Simple helper to split your parameter definitions into multiple files
 * Mandatory to be used when declaring parameters appart from your endpoint definitions
 * to enable type inferrence and autocompletion
 * @param params - api parameter definitions
 * @returns the api parameter definitions
 */
export function makeParameters<
  const ParameterDescriptions extends readonly ZodiosEndpointParameter[]
>(params: ParameterDescriptions) {
  return params;
}

export function parametersBuilder() {
  return new ParametersBuilder<[]>([]);
}

type ObjectToQueryParameters<
  Type extends "Query" | "Path" | "Header",
  T extends Record<string, z.ZodType<any, any, any>>,
  Keys = UnionToTuple<keyof T>
> = {
  [Index in keyof Keys]: {
    name: Keys[Index];
    type: Type;
    description?: string;
    schema: T[Extract<Keys[Index], keyof T>];
  };
};

class ParametersBuilder<T extends ZodiosEndpointParameter[]> {
  constructor(private params: T) {}

  addParameter<
    Name extends string,
    Type extends "Path" | "Query" | "Body" | "Header",
    Schema extends z.ZodType<any, any, any>
  >(name: Name, type: Type, schema: Schema) {
    return new ParametersBuilder<
      [...T, { name: Name; type: Type; description?: string; schema: Schema }]
    >([
      ...this.params,
      { name, type, description: schema.description, schema },
    ]);
  }

  addParameters<
    Type extends "Query" | "Path" | "Header",
    Schemas extends Record<string, z.ZodType<any, any, any>>
  >(type: Type, schemas: Schemas) {
    const parameters = Object.keys(schemas).map((key) => ({
      name: key,
      type,
      description: schemas[key].description,
      schema: schemas[key],
    }));
    return new ParametersBuilder<
      [
        ...T,
        ...Extract<
          ObjectToQueryParameters<Type, Schemas>,
          ZodiosEndpointParameter[]
        >
      ]
    >([...this.params, ...parameters] as any);
  }

  addBody<Schema extends z.ZodType<any, any, any>>(schema: Schema) {
    return this.addParameter("body", "Body", schema);
  }

  addQuery<Name extends string, Schema extends z.ZodType<any, any, any>>(
    name: Name,
    schema: Schema
  ) {
    return this.addParameter(name, "Query", schema);
  }

  addPath<Name extends string, Schema extends z.ZodType<any, any, any>>(
    name: Name,
    schema: Schema
  ) {
    return this.addParameter(name, "Path", schema);
  }

  addHeader<Name extends string, Schema extends z.ZodType<any, any, any>>(
    name: Name,
    schema: Schema
  ) {
    return this.addParameter(name, "Header", schema);
  }

  addQueries<Schemas extends Record<string, z.ZodType<any, any, any>>>(
    schemas: Schemas
  ) {
    return this.addParameters("Query", schemas);
  }

  addPaths<Schemas extends Record<string, z.ZodType<any, any, any>>>(
    schemas: Schemas
  ) {
    return this.addParameters("Path", schemas);
  }

  addHeaders<Schemas extends Record<string, z.ZodType<any, any, any>>>(
    schemas: Schemas
  ) {
    return this.addParameters("Header", schemas);
  }

  build() {
    return this.params;
  }
}

/**
 * Simple helper to split your error definitions into multiple files
 * Mandatory to be used when declaring errors appart from your endpoint definitions
 * to enable type inferrence and autocompletion
 * @param errors - api error definitions
 * @returns the error definitions
 */
export function makeErrors<
  const ErrorDescription extends readonly ZodiosEndpointError[]
>(errors: ErrorDescription) {
  return errors;
}

/**
 * Simple helper to split your error definitions into multiple files
 * Mandatory to be used when declaring errors appart from your endpoint definitions
 * to enable type inferrence and autocompletion
 * @param endpoint - api endpoint definition
 * @returns the endpoint definition
 */
export function makeEndpoint<
  const EndpointDescription extends ZodiosEndpointDefinition
>(endpoint: EndpointDescription) {
  return endpoint;
}

export class Builder<const T extends readonly ZodiosEndpointDefinition[]> {
  constructor(private api: T) {}
  addEndpoint<const E extends ZodiosEndpointDefinition>(endpoint: E) {
    return new Builder<[...T, E]>([...this.api, endpoint] as [...T, E]);
  }
  build(): T {
    checkApi(this.api);
    return this.api;
  }
}

/**
 * Advanced helper to build your api definitions
 * compared to `makeApi()` you'll have better autocompletion experience and better error messages,
 * @param endpoint
 * @returns - a builder to build your api definitions
 */
export function apiBuilder<const T extends ZodiosEndpointDefinition>(
  endpoint: T
): Builder<[T]> {
  return new Builder([endpoint] as [T]);
}

/**
 * Helper to generate a basic CRUD api for a given resource
 * @param resource - the resource to generate the api for
 * @param schema - the schema of the resource
 * @returns - the api definitions
 */
export function makeCrudApi<
  T extends string,
  S extends z.ZodObject<z.ZodRawShape>
>(resource: T, schema: S) {
  type Schema = z.input<S>;
  const capitalizedResource = capitalize(resource);
  return makeApi([
    {
      method: "get",
      // @ts-expect-error
      path: `/${resource}s`,
      // @ts-expect-error
      alias: `get${capitalizedResource}s`,
      description: `Get all ${resource}s`,
      response: z.array(schema),
    },
    {
      method: "get",
      // @ts-expect-error
      path: `/${resource}s/:id`,
      // @ts-expect-error
      alias: `get${capitalizedResource}`,
      description: `Get a ${resource}`,
      // @ts-expect-error
      response: schema,
    },
    {
      method: "post",
      // @ts-expect-error
      path: `/${resource}s`,
      // @ts-expect-error
      alias: `create${capitalizedResource}`,
      description: `Create a ${resource}`,
      parameters: [
        {
          name: "body",
          type: "Body",
          description: "The object to create",
          schema: schema.partial() as z.Schema<Partial<Schema>>,
        },
      ],
      // @ts-expect-error
      response: schema,
    },
    {
      method: "put",
      // @ts-expect-error
      path: `/${resource}s/:id`,
      // @ts-expect-error
      alias: `update${capitalizedResource}`,
      description: `Update a ${resource}`,
      parameters: [
        {
          name: "body",
          type: "Body",
          description: "The object to update",
          // @ts-expect-error
          schema: schema,
        },
      ],
      // @ts-expect-error
      response: schema,
    },
    {
      method: "patch",
      // @ts-expect-error
      path: `/${resource}s/:id`,
      // @ts-expect-error
      alias: `patch${capitalizedResource}`,
      description: `Patch a ${resource}`,
      parameters: [
        {
          name: "body",
          type: "Body",
          description: "The object to patch",
          schema: schema.partial() as z.Schema<Partial<Schema>>,
        },
      ],
      // @ts-expect-error
      response: schema,
    },
    {
      method: "delete",
      // @ts-expect-error
      path: `/${resource}s/:id`,
      // @ts-expect-error
      alias: `delete${capitalizedResource}`,
      description: `Delete a ${resource}`,
      // @ts-expect-error
      response: schema,
    },
  ]);
}

type CleanPath<Path extends string> = Path extends `${infer PClean}/`
  ? PClean
  : Path;

type MapApiPath<
  Path extends string,
  Api,
  Acc extends unknown[] = []
> = Api extends readonly [infer Head, ...infer Tail]
  ? MapApiPath<
      Path,
      Tail,
      [
        ...Acc,
        {
          [K in keyof Head]: K extends "path"
            ? Head[K] extends string
              ? CleanPath<`${Path}${Head[K]}`>
              : Head[K]
            : Head[K];
        }
      ]
    >
  : Acc;

type MergeApis<
  Apis extends Record<string, ZodiosEndpointDefinition[]>,
  MergedPathApis = UnionToTuple<
    {
      [K in keyof Apis]: K extends string ? MapApiPath<K, Apis[K]> : never;
    }[keyof Apis]
  >
> = TupleFlat<MergedPathApis>;

function cleanPath(path: string) {
  return path.endsWith("/") ? path.slice(0, -1) : path;
}

/**
 * prefix all paths of an api with a given prefix
 * @param prefix - the prefix to add
 * @param api - the api to prefix
 * @returns the prefixed api
 */
export function prefixApi<
  Prefix extends string,
  Api extends ZodiosEndpointDefinition[]
>(prefix: Prefix, api: Api) {
  return api.map((endpoint) => ({
    ...endpoint,
    path: cleanPath(`${prefix}${endpoint.path}`),
  })) as MapApiPath<Prefix, Api>;
}

/**
 * Merge multiple apis into one in a route friendly way
 * @param apis - the apis to merge
 * @returns the merged api
 *
 * @example
 * ```ts
 * const api = mergeApis({
 *   "/users": usersApi,
 *   "/posts": postsApi,
 * });
 * ```
 */
export function mergeApis<
  Apis extends Record<string, ZodiosEndpointDefinition[]>
>(apis: Apis): MergeApis<Apis> {
  return Object.keys(apis).flatMap((key) => prefixApi(key, apis[key])) as any;
}
