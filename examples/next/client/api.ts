import { Zodios } from "@zodios/core";
import { ZodiosHooks } from "@zodios/react";
import { userApi } from "../common/api";

export const userClientApi = new Zodios("/api", userApi);
export const userClientHooks = new ZodiosHooks("users", userClientApi);
