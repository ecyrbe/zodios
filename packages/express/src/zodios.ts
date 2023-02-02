import express, { RouterOptions } from "express";
import { z } from "zod";
import {
  ZodiosEndpointDefinitions,
  AnyZodiosTypeProvider,
  ZodTypeProvider,
  InferInputTypeFromSchema,
} from "@zodios/core";
import { Narrow } from "@zodios/core/lib/utils.types";
import {
  ZodiosApp,
  ZodiosRouter,
  ZodiosAppOptions,
  ZodiosRouterOptions,
} from "./zodios.types";
import { injectParametersValidators } from "./zodios-validator";

/**
 * create a zodios app based on the given api and express
 * @param api - api definition
 * @param options - options to configure the app
 * @returns
 */
export function zodiosApp<
  ContextSchema,
  Api extends ZodiosEndpointDefinitions = any,
  TypeProvider extends AnyZodiosTypeProvider = ZodTypeProvider
>(
  api?: Narrow<Api>,
  options: ZodiosAppOptions<ContextSchema> = {}
): ZodiosApp<
  Api,
  [unknown] extends [ContextSchema]
    ? unknown
    : InferInputTypeFromSchema<TypeProvider, ContextSchema>
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
  Api extends ZodiosEndpointDefinitions,
  ContextSchema,
  TypeProvider extends AnyZodiosTypeProvider = ZodTypeProvider
>(
  api: Narrow<Api>,
  options: RouterOptions & ZodiosRouterOptions<ContextSchema> = {}
): ZodiosRouter<
  Api,
  [unknown] extends [ContextSchema]
    ? unknown
    : InferInputTypeFromSchema<TypeProvider, ContextSchema>
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
  Api extends ZodiosEndpointDefinitions = any,
  TypeProvider extends AnyZodiosTypeProvider = ZodTypeProvider
>(
  api?: Narrow<Api>,
  options: ZodiosAppOptions<ContextSchema> = {}
): ZodiosApp<
  Api,
  [unknown] extends [ContextSchema]
    ? unknown
    : InferInputTypeFromSchema<TypeProvider, ContextSchema>
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
  constructor(
    public context?: ContextSchema,
    options?: {
      typeProvider: TypeProvider;
    }
  ) {}

  app<Api extends ZodiosEndpointDefinitions = any>(
    api?: Narrow<Api>,
    options?: ZodiosAppOptions<ContextSchema>
  ): ZodiosApp<
    Api,
    [unknown] extends [ContextSchema]
      ? unknown
      : InferInputTypeFromSchema<TypeProvider, ContextSchema>
  > {
    return zodiosApp(api, options);
  }

  nextApp<Api extends ZodiosEndpointDefinitions = any>(
    api?: Narrow<Api>,
    options?: ZodiosAppOptions<ContextSchema>
  ): ZodiosApp<
    Api,
    [unknown] extends [ContextSchema]
      ? unknown
      : InferInputTypeFromSchema<TypeProvider, ContextSchema>
  > {
    return zodiosNextApp(api, options);
  }

  router<Api extends ZodiosEndpointDefinitions>(
    api: Narrow<Api>,
    options?: RouterOptions & ZodiosRouterOptions<ContextSchema>
  ): ZodiosRouter<
    Api,
    [unknown] extends [ContextSchema]
      ? unknown
      : InferInputTypeFromSchema<TypeProvider, ContextSchema>
  > {
    return zodiosRouter(api, options);
  }
}

export function zodiosContext<
  ContextSchema,
  TypeProvider extends AnyZodiosTypeProvider = ZodTypeProvider
>(
  context?: ContextSchema,
  options?: {
    typeProvider: TypeProvider;
  }
): ZodiosContext<ContextSchema, TypeProvider> {
  return new ZodiosContext(context, options);
}
