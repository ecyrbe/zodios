import { AnyZodiosTypeProvider, ZodiosValidateResult } from "@zodios/core";

export interface ZodiosExpressTypeProviderFactory<
  TypeProvider extends AnyZodiosTypeProvider
> {
  readonly _provider?: TypeProvider;
  validate: (schema: any, input: unknown) => ZodiosValidateResult;
  validateAsync: (schema: any, input: unknown) => Promise<ZodiosValidateResult>;
  isSchemaString: (schema: any) => boolean;
}
