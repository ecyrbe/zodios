import { createContext, useMemo } from "react";
import { Zodios } from "../zodios";

type ZodiosProviderProps = {
  children: React.ReactNode;
  apis: Record<string, Zodios<any>>;
};

export const ZodiosContext = createContext<Record<string, Zodios<any>>>({});

/**
 * A react provider for zodios api client
 * @example
 * ```typescript
 *   <QueryClientProvider client={queryClient}>
 *     <ZodiosProvider apis={{ myApiName: apiClient }}>
 *       <Users />
 *     </ZodiosProvider>
 *   </QueryClientProvider>
 * ```
 */
export function ZodiosProvider({ apis, children }: ZodiosProviderProps) {
  return (
    <ZodiosContext.Provider value={apis}>{children}</ZodiosContext.Provider>
  );
}
