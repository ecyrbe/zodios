import express from "express";
import type { Request, Response, NextFunction } from "express";
import {
  ZodiosEndpointDefinition,
  ZodiosErrorByPath,
  ZodiosResponseByPath,
  ZodiosQueryParamsByPath,
  ZodiosBodyByPath,
  ZodiosPathsByMethod,
  ZodiosPathParamsByPath,
  Method,
  AnyZodiosTypeProvider,
  ZodTypeProvider,
} from "@zodios/core";
import { IfEquals } from "@zodios/core/lib/utils.types";
import { ZodiosExpressTypeProviderFactory } from "./type-providers";

export type ZodiosSucessCodes =
  | 200
  | 201
  | 202
  | 203
  | 204
  | 205
  | 206
  | 207
  | 208
  | 226;

export type WithZodiosContext<T, Context> = T & Context;

type Test = WithZodiosContext<Request, unknown>;

export interface ZodiosPathMiddleware<
  Api extends readonly ZodiosEndpointDefinition[] | ZodiosEndpointDefinition[],
  Context,
  M extends Method,
  Path extends ZodiosPathsByMethod<Api, M>,
  TypeProvider extends AnyZodiosTypeProvider = ZodTypeProvider,
  ReqPath = ZodiosPathParamsByPath<Api, M, Path, false, TypeProvider>,
  ReqBody = ZodiosBodyByPath<Api, M, Path, false, TypeProvider>,
  ReqQuery = ZodiosQueryParamsByPath<Api, M, Path, false, TypeProvider>,
  Res = ZodiosResponseByPath<Api, M, Path, false, TypeProvider>
> {
  (
    req: WithZodiosContext<Request<ReqPath, Res, ReqBody, ReqQuery>, Context>,
    res: Omit<Response<Res>, "status"> & {
      // rebind context to allow for type inference
      status<
        StatusCode extends number,
        API extends
          | readonly ZodiosEndpointDefinition[]
          | ZodiosEndpointDefinition[] = Api,
        METHOD extends Method = M,
        PATH extends ZodiosPathsByMethod<Api, M> = Path
      >(
        status: StatusCode
      ): StatusCode extends ZodiosSucessCodes
        ? Response<Res>
        : Response<
            ZodiosErrorByPath<
              API,
              METHOD,
              PATH,
              StatusCode,
              false,
              TypeProvider
            >
          >;
    },
    next: NextFunction
  ): void;
}

export type ZodiosMiddleware<Context> = (
  req: WithZodiosContext<Request, Context>,
  res: Response,
  next: NextFunction
) => void;

export type ZodiosErrorMiddleware<Context> = (
  error: unknown,
  req: WithZodiosContext<Request, Context>,
  res: Response,
  next: NextFunction
) => void;

export type ZodiosMethodMiddleware<
  Router,
  Context,
  Api extends readonly ZodiosEndpointDefinition[] | ZodiosEndpointDefinition[],
  M extends Method,
  TypeProvider extends AnyZodiosTypeProvider
> = <Path extends ZodiosPathsByMethod<Api, M>>(
  path: Path,
  ...handlers: Array<ZodiosPathMiddleware<Api, Context, M, Path, TypeProvider>>
) => Router;

export interface ZodiosRouterMiddlewares<Context> {
  use(handlers: Array<ZodiosMiddleware<Context>>): this;
  use(...handlers: Array<ZodiosMiddleware<Context>>): this;
  use(...handler: Array<ZodiosErrorMiddleware<Context>>): this;
  use(path: string, ...handlers: Array<ZodiosMiddleware<Context>>): this;
  use(path: string, handlers: Array<ZodiosMiddleware<Context>>): this;
}

export interface ZodiosRouterMethodMiddlewares<
  Api extends readonly ZodiosEndpointDefinition[] | ZodiosEndpointDefinition[],
  Context,
  TypeProvider extends AnyZodiosTypeProvider
> extends ZodiosRouterMiddlewares<Context> {
  get: ZodiosMethodMiddleware<this, Context, Api, "get", TypeProvider>;
  post: ZodiosMethodMiddleware<this, Context, Api, "post", TypeProvider>;
  put: ZodiosMethodMiddleware<this, Context, Api, "put", TypeProvider>;
  patch: ZodiosMethodMiddleware<this, Context, Api, "patch", TypeProvider>;
  delete: ZodiosMethodMiddleware<this, Context, Api, "delete", TypeProvider>;
  head: ZodiosMethodMiddleware<this, Context, Api, "head", TypeProvider>;
}

export interface ZodiosValidationOptions {
  /**
   * validate request parameters - default is true
   */
  validate?: boolean;
  /**
   * transform request parameters - default is true
   */
  transform?: boolean;
}

export interface ZodiosAppOptions<
  ContextSchema,
  TypeProvider extends AnyZodiosTypeProvider
> extends ZodiosValidationOptions {
  /**
   * express app intance - default is express()
   */
  express?: ReturnType<typeof express>;
  /**
   * enable express json body parser - default is true
   */
  enableJsonBodyParser?: boolean;
  context?: ContextSchema;
  typeFactory?: ZodiosExpressTypeProviderFactory<TypeProvider>;
}

export interface ZodiosRouterOptions<
  ContextSchema,
  TypeProvider extends AnyZodiosTypeProvider
> extends ZodiosValidationOptions {
  /**
   * express router instance - default is express.Router
   */
  router?: ReturnType<typeof express.Router>;
  context?: ContextSchema;
  typeFactory?: ZodiosExpressTypeProviderFactory<TypeProvider>;
}

export interface ZodiosUnknownApp<Context>
  extends Omit<ReturnType<typeof express>, "use">,
    ZodiosRouterMiddlewares<Context> {}

export interface ZodiosApiApp<
  Api extends readonly ZodiosEndpointDefinition[] | ZodiosEndpointDefinition[],
  Context,
  TypeProvider extends AnyZodiosTypeProvider
> extends Omit<ReturnType<typeof express>, Method | "use">,
    ZodiosRouterMethodMiddlewares<Api, Context, TypeProvider> {}

export type ZodiosApp<
  Api extends readonly ZodiosEndpointDefinition[] | ZodiosEndpointDefinition[],
  Context,
  TypeProvider extends AnyZodiosTypeProvider
> = IfEquals<
  Api,
  any,
  ZodiosUnknownApp<Context>,
  ZodiosApiApp<Api, Context, TypeProvider>
>;

interface ZodiosUnknownRouter<Context>
  extends Omit<ReturnType<typeof express.Router>, "use">,
    ZodiosRouterMiddlewares<Context>,
    ZodiosMiddleware<Context> {}

interface ZodiosApiRouter<
  Api extends readonly ZodiosEndpointDefinition[] | ZodiosEndpointDefinition[],
  Context,
  TypeProvider extends AnyZodiosTypeProvider
> extends Omit<ReturnType<typeof express.Router>, Method | "use">,
    ZodiosRouterMethodMiddlewares<Api, Context, TypeProvider>,
    ZodiosMiddleware<Context> {}

export type ZodiosRouter<
  Api extends readonly ZodiosEndpointDefinition[] | ZodiosEndpointDefinition[],
  Context,
  TypeProvider extends AnyZodiosTypeProvider
> = IfEquals<
  Api,
  any,
  ZodiosUnknownRouter<Context>,
  ZodiosApiRouter<Api, Context, TypeProvider>
>;
