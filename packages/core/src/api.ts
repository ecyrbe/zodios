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
export function checkApi<const T extends readonly ZodiosEndpointDefinition[]>(api: T) {
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

const test = makeApi([{
  method: "get",
  path: "/test",
  response: {},
}]);

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

/**
 * Simple helper to split your error definitions into multiple files
 * Mandatory to be used when declaring errors appart from your endpoint definitions
 * to enable type inferrence and autocompletion
 * @param errors - api error definitions
 * @returns the error definitions
 */
export function makeErrors<const ErrorDescription extends readonly ZodiosEndpointError[]>(
  errors: ErrorDescription
) {
  return errors;
}

/**
 * Simple helper to split your error definitions into multiple files
 * Mandatory to be used when declaring errors appart from your endpoint definitions
 * to enable type inferrence and autocompletion
 * @param endpoint - api endpoint definition
 * @returns the endpoint definition
 */
export function makeEndpoint<const EndpointDescription extends ZodiosEndpointDefinition>(
  endpoint: EndpointDescription
) {
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
