import express from "express";
import { AnyZodiosTypeProvider, ZodiosEndpointDefinition } from "@zodios/core";
import { ZodiosExpressTypeProviderFactory } from "./type-providers";

const METHODS = ["get", "post", "put", "patch", "delete"] as const;

function safeJsonParse(str: string) {
  try {
    return JSON.parse(str);
  } catch {
    return str;
  }
}

async function validateParam(
  schema: unknown,
  parameter: unknown,
  typeFactory: ZodiosExpressTypeProviderFactory<AnyZodiosTypeProvider>
) {
  if (
    !typeFactory.isSchemaString(schema) &&
    parameter &&
    typeof parameter === "string"
  ) {
    return typeFactory.validateAsync(schema, safeJsonParse(parameter));
  }
  return typeFactory.validateAsync(schema, parameter);
}

function validateEndpointMiddleware(
  endpoint: ZodiosEndpointDefinition,
  transform: boolean,
  typeFactory: ZodiosExpressTypeProviderFactory<AnyZodiosTypeProvider>
) {
  return async (
    req: express.Request,
    res: express.Response,
    next: express.NextFunction
  ) => {
    for (let parameter of endpoint.parameters!) {
      let schema = parameter.schema;

      switch (parameter.type) {
        case "Body":
          {
            // @ts-ignore
            const result = await typeFactory.validateAsync(schema, req.body);
            if (!result.success) {
              return res.status(400).json({
                context: "body",
                error: result.error.issues,
              });
            }
            if (transform) req.body = result.data;
          }
          break;
        case "Path":
          {
            const result = await validateParam(
              schema,
              req.params[parameter.name],
              typeFactory
            );
            if (!result.success) {
              return res.status(400).json({
                context: `path.${parameter.name}`,
                error: result.error.issues,
              });
            }
            if (transform) req.params[parameter.name] = result.data as any;
          }
          break;
        case "Query":
          {
            const result = await validateParam(
              schema,
              req.query[parameter.name],
              typeFactory
            );
            if (!result.success) {
              return res.status(400).json({
                context: `query.${parameter.name}`,
                error: result.error.issues,
              });
            }
            if (transform) req.query[parameter.name] = result.data as any;
          }
          break;
        case "Header":
          {
            // @ts-ignore
            const result = await parameter.schema.safeParseAsync(
              req.get(parameter.name)
            );
            if (!result.success) {
              return res.status(400).json({
                context: `header.${parameter.name}`,
                error: result.error.issues,
              });
            }
            if (transform) req.headers[parameter.name] = result.data as any;
          }
          break;
      }
    }
    next();
  };
}

/**
 * monkey patch express.Router to add inject the validation middlewares after the route is matched
 * @param api - the api definition
 * @param router - express router to patch
 * @param transform - whether to transform the data or not
 */
export function injectParametersValidators(
  api: readonly ZodiosEndpointDefinition[] | ZodiosEndpointDefinition[],
  router: express.Router,
  transform: boolean,
  typeFactory: ZodiosExpressTypeProviderFactory<AnyZodiosTypeProvider>
) {
  for (let method of METHODS) {
    const savedMethod = router[method].bind(router);
    // @ts-ignore
    router[method] = (path: string, ...handlers: any[]) => {
      const endpoint = api.find(
        (endpoint) => endpoint.method === method && endpoint.path === path
      );
      if (endpoint && endpoint.parameters) {
        handlers = [
          validateEndpointMiddleware(endpoint, transform, typeFactory),
          ...handlers,
        ];
      }
      return savedMethod(path, ...handlers);
    };
  }
}
