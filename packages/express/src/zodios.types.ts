import express, { Request } from "express";
import {
  ZodiosEndpointDefinitions,
  ZodiosEndpointDefinition,
  ZodiosErrorByPath,
  ZodiosResponseByPath,
  ZodiosQueryParamsByPath,
  ZodiosBodyByPath,
  ZodiosPathsByMethod,
  ZodiosPathParamsByPath,
  Method,
} from "@zodios/core";
import { IfEquals, Merge } from "@zodios/core/lib/utils.types";
import { z, ZodAny, ZodObject } from "zod";

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

export interface ZodiosRequestHandler<
  Api extends ZodiosEndpointDefinitions,
  Context,
  M extends Method,
  Path extends ZodiosPathsByMethod<Api, M>,
  ReqPath = ZodiosPathParamsByPath<Api, M, Path, false>,
  ReqBody = ZodiosBodyByPath<Api, M, Path, false>,
  ReqQuery = ZodiosQueryParamsByPath<Api, M, Path, false>,
  Res = ZodiosResponseByPath<Api, M, Path, false>
> {
  (
    req: WithZodiosContext<
      express.Request<ReqPath, Res, ReqBody, ReqQuery>,
      Context
    >,
    res: Omit<express.Response<Res>, "status"> & {
      // rebind context to allow for type inference
      status<
        StatusCode extends number,
        API extends ZodiosEndpointDefinition[] = Api,
        METHOD extends Method = M,
        PATH extends ZodiosPathsByMethod<Api, M> = Path
      >(
        status: StatusCode
      ): StatusCode extends ZodiosSucessCodes
        ? express.Response<Res>
        : express.Response<
            ZodiosErrorByPath<API, METHOD, PATH, StatusCode, false>
          >;
    },
    next: express.NextFunction
  ): void;
}

export interface ZodiosRouterContextRequestHandler<Context> {
  (
    req: WithZodiosContext<express.Request, Context>,
    res: express.Response,
    next: express.NextFunction
  ): void;
}

export type ZodiosHandler<
  Router,
  Context,
  Api extends ZodiosEndpointDefinitions,
  M extends Method
> = <Path extends ZodiosPathsByMethod<Api, M>>(
  path: Path,
  ...handlers: Array<ZodiosRequestHandler<Api, Context, M, Path>>
) => Router;

export interface ZodiosUse<Context> {
  use(...handlers: Array<ZodiosRouterContextRequestHandler<Context>>): this;
  use(handlers: Array<ZodiosRouterContextRequestHandler<Context>>): this;
  use(
    path: string,
    ...handlers: Array<ZodiosRouterContextRequestHandler<Context>>
  ): this;
  use(
    path: string,
    handlers: Array<ZodiosRouterContextRequestHandler<Context>>
  ): this;
}

export interface ZodiosHandlers<Api extends ZodiosEndpointDefinitions, Context>
  extends ZodiosUse<Context> {
  get: ZodiosHandler<this, Context, Api, "get">;
  post: ZodiosHandler<this, Context, Api, "post">;
  put: ZodiosHandler<this, Context, Api, "put">;
  patch: ZodiosHandler<this, Context, Api, "patch">;
  delete: ZodiosHandler<this, Context, Api, "delete">;
  head: ZodiosHandler<this, Context, Api, "head">;
}

export interface ZodiosValidationOptions {
  /**
   * validate request parameters - default is true
   */
  validate?: boolean;
  /**
   * transform request parameters - default is false
   */
  transform?: boolean;
}

export interface ZodiosAppOptions<ContextSchema>
  extends ZodiosValidationOptions {
  /**
   * express app intance - default is express()
   */
  express?: ReturnType<typeof express>;
  /**
   * enable express json body parser - default is true
   */
  enableJsonBodyParser?: boolean;
  context?: ContextSchema;
}

export interface ZodiosRouterOptions<ContextSchema>
  extends ZodiosValidationOptions {
  /**
   * express router instance - default is express.Router
   */
  router?: ReturnType<typeof express.Router>;
  context?: ContextSchema;
}

export type ZodiosApp<
  Api extends ZodiosEndpointDefinitions,
  Context
> = IfEquals<
  Api,
  any,
  Omit<ReturnType<typeof express>, "use"> & ZodiosUse<Context>,
  Omit<ReturnType<typeof express>, Method | "use"> &
    ZodiosHandlers<Api, Context>
>;

export type ZodiosRouter<
  Api extends ZodiosEndpointDefinitions,
  Context
> = IfEquals<
  Api,
  any,
  Omit<ReturnType<typeof express.Router>, "use"> &
    ZodiosUse<Context> &
    ZodiosRouterContextRequestHandler<Context>,
  Omit<ReturnType<typeof express.Router>, Method | "use"> &
    ZodiosHandlers<Api, Context> &
    ZodiosRouterContextRequestHandler<Context>
>;
