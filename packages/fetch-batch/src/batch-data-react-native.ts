import { IBatchData, BatchDataForeachCallback } from "./batch-data.types";

export class ReactNativeBatchData implements IBatchData {
  #requests = new Map<string, Request>();
  #requestIdSuffix = `${Date.now()}@zodios.org`;
  #boundary = `batch__${Date.now()}__batch`;

  constructor() {}

  get boundary() {
    return this.#boundary;
  }

  addRequest(request: Request) {
    const requestId = `request-${this.#requests.size + 1}-${
      this.#requestIdSuffix
    }`;
    this.#requests.set(requestId, request);
    return requestId;
  }

  getHeaders(init?: HeadersInit) {
    const headers = new Headers(init);
    headers.set("Content-Type", `multipart/mixed; boundary=${this.#boundary}`);
    return headers;
  }

  [Symbol.iterator]() {
    return this.#requests.entries();
  }

  requests() {
    return this.#requests.values();
  }

  requestIds() {
    return this.#requests.keys();
  }

  entries() {
    return this.#requests.entries();
  }

  getRequest(requestOrResponseId: string) {
    for (const id of this.requestIds()) {
      if (requestOrResponseId.includes(id)) {
        return this.#requests.get(id);
      }
    }
  }

  forEach(callback: BatchDataForeachCallback) {
    this.#requests.forEach((request, requestId) =>
      callback(request, requestId, this)
    );
  }

  getRequestId(request: Request) {
    for (const [requestId, req] of this.#requests.entries()) {
      if (req === request) {
        return requestId;
      }
    }
  }

  async body() {
    return this.#format();
  }

  #formatHeaders(headers: Headers) {
    let result = "";
    for (const [name, value] of headers) {
      result += `${name}: ${value}\r\n`;
    }
    result += "\r\n";
    return result;
  }

  #formatPart(requestId: string) {
    const headers = new Headers();
    headers.set("Content-ID", `<${requestId}>`);
    headers.set("Content-Type", "application/http; msgtype=request");
    return this.#formatHeaders(headers);
  }

  async #formatRequest(request: Request) {
    const url = new URL(request.url);
    let result = `${request.method} ${url.pathname}${url.search}${url.hash} HTTP/1.1\r\n`;
    result += this.#formatHeaders(request.headers);
    result += await request.text();
    return result;
  }

  async #format() {
    let result = "";
    const boundary = `--${this.#boundary}\r\n`;
    const boundaryClose = `--${this.#boundary}--\r\n`;
    for (const [requestId, request] of this.#requests) {
      result += boundary;
      result += this.#formatPart(requestId);
      result += await this.#formatRequest(request);
      result += "\r\n";
    }
    result += boundaryClose;
    return result;
  }
}

export function makeReactNativeBatchData() {
  return new ReactNativeBatchData();
}
