type BatchDataForeachCallback = (
  request: Request,
  contentId: string,
  batchdata: BatchData
) => void;

export class BatchData {
  #requests = new Map<string, Request>();
  #contentIdSuffix = `${Date.now()}@zodios.org`;
  #boundary = `batch__${Date.now()}__batch`;
  #encoder = new TextEncoder();

  constructor() {}

  get boundary() {
    return this.#boundary;
  }

  addRequest(request: Request) {
    const contentId = `request-${this.#requests.size + 1}-${
      this.#contentIdSuffix
    }`;
    this.#requests.set(contentId, request);
    return contentId;
  }

  getHeaders(init?: HeadersInit) {
    const headers = new Headers(init);
    headers.set("Content-Type", `multipart/mixed; boundary=${this.#boundary}`);
    return headers;
  }

  [Symbol.iterator]() {
    return this.#requests.entries();
  }

  hasRequest(contentId: string) {
    return this.#requests.has(contentId);
  }

  requests() {
    return this.#requests.values();
  }

  contentIds() {
    return this.#requests.keys();
  }

  entries() {
    return this.#requests.entries();
  }

  getRequest(contentId: string) {
    return this.#requests.get(contentId);
  }

  forEach(callback: BatchDataForeachCallback) {
    this.#requests.forEach((request, contentId) =>
      callback(request, contentId, this)
    );
  }

  find(request: Request) {
    for (const [contentId, req] of this.#requests.entries()) {
      if (req === request) {
        return contentId;
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

  *#encodePart(contentId: string) {
    const headers = new Headers();
    headers.set("Content-ID", `<${contentId}>`);
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

    for (const [contentId, request] of this.#requests) {
      yield boundary;
      yield* this.#encodePart(contentId);
      yield* this.#encodeRequest(request);
      yield this.#encoder.encode("\r\n");
    }
    yield boundaryClose;
  }
}
