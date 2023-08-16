import { IBatchData } from "./batch-data.types";

export type BatchCallbacks = {
  resolve: (value: Response) => void;
  reject: (reason?: unknown) => void;
};

export type BatchRequestOptions = {
  fetch?: typeof fetch;
  alwaysBatch?: boolean;
  makeBatchData: () => IBatchData;
  makeBatchResponse: (response: Response) => AsyncIterable<[string, Response]>;
};

export type BatchRequestEndpoint = {
  input: RequestInfo | URL;
  init?: RequestInit;
};
