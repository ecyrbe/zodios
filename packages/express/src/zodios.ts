import express, { RouterOptions } from "express";
import { ZodObject } from "zod";
import { ZodiosEndpointDefinitions } from "@zodios/core";
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
  Api extends ZodiosEndpointDefinitions = any,
  Context extends ZodObject<any> = ZodObject<any>
>(
  api?: Narrow<Api>,
  options: ZodiosAppOptions<Context> = {}
): ZodiosApp<Api, Context> {
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
  return app as unknown as ZodiosApp<Api, Context>;
}

/**
 * create a zodios router based on the given api and express router
 * @param api - api definition
 * @param options - options to configure the router
 * @returns
 */
export function zodiosRouter<
  Api extends ZodiosEndpointDefinitions,
  Context extends ZodObject<any> = ZodObject<any>
>(
  api: Narrow<Api>,
  options: RouterOptions & ZodiosRouterOptions<Context> = {}
): ZodiosRouter<Api, Context> {
  const { validate = true, transform = false, ...routerOptions } = options;
  const router = options?.router ?? express.Router(routerOptions);
  if (validate) {
    injectParametersValidators(api, router, transform);
  }
  return router as unknown as ZodiosRouter<Api, Context>;
}

/**
 * create a zodios app for nextjs
 * @param options - options to configure the app
 * @returns - a zodios app
 */
export function zodiosNextApp<
  Api extends ZodiosEndpointDefinitions = any,
  Context extends ZodObject<any> = ZodObject<any>
>(
  api?: Narrow<Api>,
  options: ZodiosAppOptions<Context> = {}
): ZodiosApp<Api, Context> {
  return zodiosApp(api, {
    ...options,
    enableJsonBodyParser: false,
  });
}

export class ZodiosContext<Context extends ZodObject<any>> {
  constructor(public context?: Context) {}

  app<Api extends ZodiosEndpointDefinitions = any>(
    api?: Narrow<Api>,
    options: ZodiosAppOptions<Context> = {}
  ): ZodiosApp<Api, Context> {
    return zodiosApp<Api, Context>(api, options);
  }

  nextApp<Api extends ZodiosEndpointDefinitions = any>(
    api?: Narrow<Api>,
    options: ZodiosAppOptions<Context> = {}
  ): ZodiosApp<Api, Context> {
    return zodiosNextApp<Api, Context>(api, options);
  }

  router<Api extends ZodiosEndpointDefinitions>(
    api: Narrow<Api>,
    options?: RouterOptions & ZodiosRouterOptions<Context>
  ): ZodiosRouter<Api, Context> {
    return zodiosRouter<Api, Context>(api, options);
  }
}

export function zodiosContext<Context extends ZodObject<any> = ZodObject<any>>(
  context?: Context
): ZodiosContext<Context> {
  return new ZodiosContext(context);
}
