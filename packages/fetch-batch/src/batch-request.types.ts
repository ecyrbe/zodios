export type BatchCallbacks = {
  resolve: (value: Response) => void;
  reject: (reason?: unknown) => void;
};

export type BatchRequestOptions = {
  fetch?: typeof fetch;
  alwaysBatch?: boolean;
};

export type BatchRequestEndpoint = {
  input: RequestInfo | URL;
  init?: RequestInit;
};
