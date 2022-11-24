export { ZodiosCore } from "./zodios";
export type {
  ApiOf,
  TypeProviderOf,
  FetcherProviderOf,
  ZodiosInstance,
  ZodiosBase,
} from "./zodios";
export { ZodiosError } from "./zodios-error";
export type {
  AnyZodiosMethodOptions,
  AnyZodiosRequestOptions,
  ZodiosBodyForEndpoint,
  ZodiosBodyByPath,
  ZodiosBodyByAlias,
  ZodiosHeaderParamsForEndpoint,
  ZodiosHeaderParamsByPath,
  ZodiosHeaderParamsByAlias,
  Method,
  ZodiosPathParams,
  ZodiosPathParamsForEndpoint,
  ZodiosPathParamsByPath,
  ZodiosPathParamByAlias,
  ZodiosPathsByMethod,
  ZodiosResponseForEndpoint,
  ZodiosResponseByPath,
  ZodiosResponseByAlias,
  ZodiosQueryParamsForEndpoint,
  ZodiosQueryParamsByPath,
  ZodiosQueryParamsByAlias,
  ZodiosEndpointDefinitionByPath,
  ZodiosEndpointDefinitionByAlias,
  ZodiosErrorForEndpoint,
  ZodiosErrorByPath,
  ZodiosErrorByAlias,
  ZodiosErrorsByPath,
  ZodiosErrorsByAlias,
  ZodiosEndpointDefinition,
  ZodiosEndpointDefinitions,
  ZodiosEndpointParameter,
  ZodiosEndpointParameters,
  ZodiosEndpointError,
  ZodiosEndpointErrors,
  ZodiosOptions,
  ZodiosRequestOptions,
  ZodiosRequestOptionsByPath,
  ZodiosRequestOptionsByAlias,
  ZodiosPlugin,
} from "./zodios.types";
export type {
  AnyZodiosTypeProvider,
  InferInputTypeFromSchema,
  InferOutputTypeFromSchema,
  IoTsTypeProvider,
  TsTypeProvider,
  ZodiosRuntimeTypeProvider,
  ZodiosValidateResult,
  ZodTypeProvider,
} from "./type-providers";
export {
  ioTsTypeProvider,
  tsTypeProvider,
  zodTypeProvider,
  tsSchema,
  tsFnSchema,
} from "./type-providers";
export type {
  AnyZodiosFetcherProvider,
  TypeOfFetcherConfig,
  TypeOfFetcherError,
  TypeOfFetcherOptions,
  TypeOfFetcherResponse,
  ZodiosRuntimeFetcherProvider,
} from "./fetcher-providers";
export { hooks } from "./hooks";
export {
  PluginId,
  zodValidationPlugin,
  formDataPlugin,
  formURLPlugin,
  headerPlugin,
} from "./plugins";

export {
  makeApi,
  apiBuilder,
  parametersBuilder,
  makeParameters,
  makeEndpoint,
  makeErrors,
  checkApi,
  prefixApi,
  mergeApis,
} from "./api";
