export class BatchData {
  #requests = new Map<string, Request>();
  #contentIdSuffix = `${Date.now()}@zodios.org`;
  #boundary = `batch__${Date.now()}__batch`;
  #encoder = new TextEncoder();

  constructor() {}

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

  stream() {
    const iterator = this[Symbol.asyncIterator]();
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

  formatHeaders(headers: Headers) {
    let result = "";
    for (const [name, value] of headers) {
      result += `${name}: ${value}\r\n`;
    }
    result += "\r\n";
    return result;
  }

  *encodePart(contentId: string) {
    const headers = new Headers();
    headers.set("Content-ID", `<${contentId}>`);
    headers.set("Content-Type", "application/http; msgtype=request");
    yield this.#encoder.encode(this.formatHeaders(headers));
  }

  async *encodeRequest(request: Request) {
    const url = new URL(request.url);
    yield this.#encoder.encode(
      `${request.method} ${url.pathname}${url.search}${url.hash} HTTP/1.1\r\n`
    );
    yield this.#encoder.encode(this.formatHeaders(request.headers));
    if (request.body) {
      const reader = request.body.getReader();
      while (true) {
        const { done, value } = await reader.read();
        if (done) {
          break;
        }
        yield value;
      }
    }
  }

  async *[Symbol.asyncIterator]() {
    const boundary = this.#encoder.encode(`--${this.#boundary}\r\n`);
    const boundaryClose = this.#encoder.encode(`--${this.#boundary}--\r\n`);

    for (const [contentId, request] of this.#requests) {
      yield boundary;
      yield* this.encodePart(contentId);
      yield* this.encodeRequest(request);
      yield this.#encoder.encode("\r\n");
    }
    yield boundaryClose;
  }
}
