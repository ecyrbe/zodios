type BatchDataForeachCallback = (
  request: Request,
  requestId: string,
  batchdata: BatchData
) => void;

export class BatchData {
  #requests = new Map<string, Request>();
  #requestIdSuffix = `${Date.now()}@zodios.org`;
  #boundary = `batch__${Date.now()}__batch`;
  #encoder = new TextEncoder();

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

  stream() {
    const iterator = this.#encodedIterator();
    return new ReadableStream<Uint8Array>({
      async pull(controller) {
        const { value, done } = await iterator.next();
        if (done) {
          controller.close();
        } else {
          controller.enqueue(value);
        }
      },
    });
  }

  #formatHeaders(headers: Headers) {
    let result = "";
    for (const [name, value] of headers) {
      result += `${name}: ${value}\r\n`;
    }
    result += "\r\n";
    return result;
  }

  *#encodePart(requestId: string) {
    const headers = new Headers();
    headers.set("Content-ID", `<${requestId}>`);
    headers.set("Content-Type", "application/http; msgtype=request");
    yield this.#encoder.encode(this.#formatHeaders(headers));
  }

  async *#encodeRequest(request: Request) {
    const url = new URL(request.url);
    yield this.#encoder.encode(
      `${request.method} ${url.pathname}${url.search}${url.hash} HTTP/1.1\r\n`
    );
    yield this.#encoder.encode(this.#formatHeaders(request.headers));
    if (request.body) {
      const reader = request.body.getReader();
      while (true) {
        const { done, value } = await reader.read();
        if (done) {
          reader.releaseLock();
          break;
        }
        yield value;
      }
    }
  }

  async *#encodedIterator() {
    const boundary = this.#encoder.encode(`--${this.#boundary}\r\n`);
    const boundaryClose = this.#encoder.encode(`--${this.#boundary}--\r\n`);

    for (const [requestId, request] of this.#requests) {
      yield boundary;
      yield* this.#encodePart(requestId);
      yield* this.#encodeRequest(request);
      yield this.#encoder.encode("\r\n");
    }
    yield boundaryClose;
  }
}
