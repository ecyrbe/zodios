import { createContext, useMemo } from "react";
import { Zodios, ZodiosEnpointDescriptions } from "../index";

type ZodiosProviderProps = {
  children: React.ReactNode;
  apis: Array<Zodios<any, any>>;
};

export const ZodiosContext = createContext<Record<string, Zodios<any, any>>>(
  {}
);

/**
 * A react provider for zodios api client
 * @example
 * ```typescript
 *   <QueryClientProvider client={queryClient}>
 *     <ZodiosProvider apis={[apiClient]}>
 *       <Users />
 *     </ZodiosProvider>
 *   </QueryClientProvider>
 * ```
 */
export function ZodiosProvider({ apis, children }: ZodiosProviderProps) {
  let value = useMemo(() => {
    let value: Record<string, Zodios<any, any>> = {};
    for (const api of apis) {
      value[api.baseURL] = api;
    }
    return value;
  }, [apis]);
  return (
    <ZodiosContext.Provider value={value}>{children}</ZodiosContext.Provider>
  );
}
