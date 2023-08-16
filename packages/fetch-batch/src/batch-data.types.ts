export type BatchDataForeachCallback = (
  request: Request,
  requestId: string,
  batchdata: IBatchData
) => void;

export interface IBatchData {
  get boundary(): string;
  addRequest(request: Request): string;
  getHeaders(init?: HeadersInit): Headers;
  requests(): IterableIterator<Request>;
  requestIds(): IterableIterator<string>;
  entries(): IterableIterator<[string, Request]>;
  getRequest(requestOrResponseId: string): Request | undefined;
  forEach(callback: BatchDataForeachCallback): void;
  getRequestId(request: Request): string | undefined;
  body(): ReadableStream<Uint8Array> | Promise<string> | undefined;
  [Symbol.iterator](): IterableIterator<[string, Request]>;
}
