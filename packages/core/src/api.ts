import type {
  ZodiosEndpointDefinition,
  ZodiosEndpointParameter,
  ZodiosEndpointDefinitions,
  ZodiosEndpointError,
} from "./zodios.types";
import type { Narrow } from "./utils.types";

/**
 * check api for non unique paths
 * @param api - api to check
 * @return - nothing
 * @throws - error if api has non unique paths
 */
export function checkApi<T extends ZodiosEndpointDefinitions>(api: T) {
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
export function makeApi<Api extends ZodiosEndpointDefinitions>(
  api: Narrow<Api>
): Api {
  checkApi(api);
  return api as Api;
}

/**
 * Simple helper to split your parameter definitions into multiple files
 * Mandatory to be used when declaring parameters appart from your endpoint definitions
 * to enable type inferrence and autocompletion
 * @param params - api parameter definitions
 * @returns the api parameter definitions
 */
export function makeParameters<
  ParameterDescriptions extends ZodiosEndpointParameter[]
>(params: Narrow<ParameterDescriptions>): ParameterDescriptions {
  return params as ParameterDescriptions;
}

/**
 * Simple helper to split your error definitions into multiple files
 * Mandatory to be used when declaring errors appart from your endpoint definitions
 * to enable type inferrence and autocompletion
 * @param errors - api error definitions
 * @returns the error definitions
 */
export function makeErrors<ErrorDescription extends ZodiosEndpointError[]>(
  errors: Narrow<ErrorDescription>
): ErrorDescription {
  return errors as ErrorDescription;
}

/**
 * Simple helper to split your error definitions into multiple files
 * Mandatory to be used when declaring errors appart from your endpoint definitions
 * to enable type inferrence and autocompletion
 * @param endpoint - api endpoint definition
 * @returns the endpoint definition
 */
export function makeEndpoint<T extends ZodiosEndpointDefinition>(
  endpoint: Narrow<T>
): T {
  return endpoint as T;
}
export class Builder<T extends ZodiosEndpointDefinitions> {
  constructor(private api: T) {}
  addEndpoint<E extends ZodiosEndpointDefinition>(endpoint: Narrow<E>) {
    return new Builder<[...T, E]>([...this.api, endpoint] as [...T, E]);
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
export function apiBuilder<T extends ZodiosEndpointDefinition>(
  endpoint: Narrow<T>
): Builder<[T]> {
  return new Builder([endpoint] as [T]);
}
