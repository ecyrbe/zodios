import express, { RouterOptions } from "express";
import {
  AnyZodiosTypeProvider,
  ZodTypeProvider,
  InferInputTypeFromSchema,
  InferOutputTypeFromSchema,
  ZodiosEndpointDefinition,
} from "@zodios/core";
import {
  ZodiosApp,
  ZodiosRouter,
  ZodiosAppOptions,
  ZodiosRouterOptions,
  ZodiosMiddleware,
} from "./zodios.types";
import { injectParametersValidators } from "./zodios-validator";
import { ZodiosExpressTypeProviderFactory } from "./type-providers";
import { zodTypeFactory } from "./type-providers/zod.type-provider";

/**
 * create a zodios app based on the given api and express
 * @param api - api definition
 * @param options - options to configure the app
 * @returns
 */
export function zodiosApp<
  ContextSchema,
  const Api extends readonly ZodiosEndpointDefinition[]|ZodiosEndpointDefinition[] = any,
  TypeProvider extends AnyZodiosTypeProvider = ZodTypeProvider
>(
  api?: Api,
  options: ZodiosAppOptions<ContextSchema, TypeProvider> = {}
): ZodiosApp<
  Api,
  [unknown] extends [ContextSchema]
    ? unknown
    : InferInputTypeFromSchema<TypeProvider, ContextSchema>,
  TypeProvider
> {
  const {
    express: app = express(),
    enableJsonBodyParser = true,
    validate = true,
    transform = false,
  } = options;
  if (enableJsonBodyParser) {
    app.use(express.json());
  }
  if (api && validate) {
    injectParametersValidators(api, app, transform);
  }
  return app as any;
}

/**
 * create a zodios router based on the given api and express router
 * @param api - api definition
 * @param options - options to configure the router
 * @returns
 */
export function zodiosRouter<
  const Api extends readonly ZodiosEndpointDefinition[]|ZodiosEndpointDefinition[],
  ContextSchema,
  TypeProvider extends AnyZodiosTypeProvider = ZodTypeProvider
>(
  api: Api,
  options: RouterOptions & ZodiosRouterOptions<ContextSchema, TypeProvider> = {}
): ZodiosRouter<
  Api,
  [unknown] extends [ContextSchema]
    ? unknown
    : InferInputTypeFromSchema<TypeProvider, ContextSchema>,
  TypeProvider
> {
  const { validate = true, transform = false, ...routerOptions } = options;
  const router = options?.router ?? express.Router(routerOptions);
  if (validate) {
    injectParametersValidators(api, router, transform);
  }
  return router as any;
}

/**
 * create a zodios app for nextjs
 * @param options - options to configure the app
 * @returns - a zodios app
 */
export function zodiosNextApp<
  ContextSchema,
  const Api extends readonly ZodiosEndpointDefinition[]|ZodiosEndpointDefinition[] = any,
  TypeProvider extends AnyZodiosTypeProvider = ZodTypeProvider
>(
  api?: Api,
  options: ZodiosAppOptions<ContextSchema, TypeProvider> = {}
): ZodiosApp<
  Api,
  [unknown] extends [ContextSchema]
    ? unknown
    : InferInputTypeFromSchema<TypeProvider, ContextSchema>,
  TypeProvider
> {
  return zodiosApp(api, {
    ...options,
    enableJsonBodyParser: false,
  });
}

export class ZodiosContext<
  ContextSchema,
  TypeProvider extends AnyZodiosTypeProvider = ZodTypeProvider
> {
  typeFactory: ZodiosExpressTypeProviderFactory<TypeProvider>;
  constructor(
    public context?: ContextSchema,
    options?: {
      typeFactory: ZodiosExpressTypeProviderFactory<TypeProvider>;
    }
  ) {
    this.typeFactory = options?.typeFactory ?? (zodTypeFactory as any);
  }

  app<const Api extends readonly ZodiosEndpointDefinition[]|ZodiosEndpointDefinition[] = any>(
    api?: Api,
    options?: ZodiosAppOptions<ContextSchema, TypeProvider>
  ): ZodiosApp<
    Api,
    [unknown] extends [ContextSchema]
      ? unknown
      : InferInputTypeFromSchema<TypeProvider, ContextSchema>,
    TypeProvider
  > {
    return zodiosApp(api, options);
  }

  nextApp<const Api extends readonly ZodiosEndpointDefinition[]|ZodiosEndpointDefinition[] = any>(
    api?: Api,
    options?: ZodiosAppOptions<ContextSchema, TypeProvider>
  ): ZodiosApp<
    Api,
    [unknown] extends [ContextSchema]
      ? unknown
      : InferInputTypeFromSchema<TypeProvider, ContextSchema>,
    TypeProvider
  > {
    return zodiosNextApp(api, options);
  }

  router<const Api extends readonly ZodiosEndpointDefinition[]|ZodiosEndpointDefinition[]>(
    api: Api,
    options?: RouterOptions & ZodiosRouterOptions<ContextSchema, TypeProvider>
  ): ZodiosRouter<
    Api,
    [unknown] extends [ContextSchema]
      ? unknown
      : InferInputTypeFromSchema<TypeProvider, ContextSchema>,
    TypeProvider
  > {
    return zodiosRouter(api, options);
  }
}

export function zodiosContext<
  ContextSchema = unknown,
  TypeProvider extends AnyZodiosTypeProvider = ZodTypeProvider
>(
  context?: ContextSchema,
  options?: {
    typeFactory: ZodiosExpressTypeProviderFactory<TypeProvider>;
  }
): ZodiosContext<ContextSchema, TypeProvider> {
  return new ZodiosContext(context, options);
}
