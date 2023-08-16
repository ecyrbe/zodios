import { concat, SearchArray } from "./utils";
import {
  parseBoundary,
  parseContentId,
  parseHeaders,
  parseStatusLine,
} from "./batch-response.utils";

type ChunkType = "multipart-header" | "statusline" | "header" | "body";

type HttpMultipartChunk = {
  type: ChunkType;
  data: Uint8Array;
  done?: boolean;
};

const STATUS_PREAMBLE = "preamble";
const STATUS_MULTIPART_HEADER = "multipart-header";
const STATUS_STATUSLINE = "statusline";
const STATUS_HEADER = "header";
const STATUS_BODY = "body";
const STATUS_EPILOGUE = "epilogue";

export interface HttpBatchTansformerOptions {
  /**
   * max discard size for preamble and epilogue
   * protect against preamble attacks, default to 16kb
   */
  maxDiscardSize?: number;
  /**
   * max status line size
   * protect against status line overflow attacks, default to 1kb
   */
  maxStatusLineSize?: number;
  /**
   * max header size
   * protect against header overflow attacks, default to 16kb
   */
  maxHeaderSize?: number;
  /**
   * max body size
   * protect against body overflow attacks, default to 1mb
   */
  maxChunkBodySize?: number;
}

/**
 * Grammar for multipart/mixed content type:
 * multipart-body  := preamble 1*encapsulation close-delimiter epilogue
 * encapsulation   := delimiter body-part CRLF
 * delimiter       := "--" boundary CRLF
 * close-delimiter := "--" boundary "--" CRLF
 * preamble        := discard-text
 * epilogue        := discard-text
 * discard-text    := *(*text CRLF)
 * body-part       := *(header-field CRLF) CRLF [HTTP-message]
 *
 * Grammar for application/http content type:
 * HTTP-message   := start-line *(header-field CRLF) CRLF [ message-body ]
 * start-line     := Request-Line | Status-Line
 * Request-Line   := Method SP Request-URI SP HTTP-Version CRLF
 * Status-Line    := HTTP-Version SP Status-Code SP Reason-Phrase CRLF
 * header-field   := field-name ":" [ SP ] field-value [ SP ]
 * field-name     := <ANY ASCII CHARACTERS EXCEPT CTLs ":" and SPACE>
 * field-value    := <ASCII CHARACTERS EXCEPT CR and LF>
 * message-body   := *OCTET ; message body may be any OCTET but should not contain the same delimiter as the enclosing multipart type
 */
export class HttpBatchTansformer
  implements Transformer<Uint8Array, HttpMultipartChunk>
{
  #state: ChunkType | "preamble" | "epilogue" = STATUS_PREAMBLE;
  #boundary: string;
  #buffer?: Uint8Array;
  #encoder = new TextEncoder();
  #searchStartBoundary: SearchArray<Uint8Array>;
  #searchBoundary: SearchArray<Uint8Array>;
  #searchEndBoundary: SearchArray<Uint8Array>;
  #searchNewline = new SearchArray(this.#encoder.encode("\r\n"));
  #searchDivider = new SearchArray(this.#encoder.encode("\r\n\r\n"));
  #maxDiscardSize: number;
  #maxStatusLineSize: number;
  #maxHeaderSize: number;
  #maxChunkBodySize: number;
  #epilogueSize = 0;

  /**
   * create a transformer for multipart/mixed content type that handle application/http envelop
   * @param boundary - boundary string to separate each part
   * @param options - options for the transformer to protect against overflow attacks
   */
  constructor(boundary: string, options?: HttpBatchTansformerOptions) {
    this.#boundary = boundary;
    this.#searchStartBoundary = new SearchArray(
      this.#encoder.encode(`--${this.#boundary}\r\n`)
    );
    this.#searchBoundary = new SearchArray(
      this.#encoder.encode(`\r\n--${this.#boundary}\r\n`)
    );
    this.#searchEndBoundary = new SearchArray(
      this.#encoder.encode(`\r\n--${this.#boundary}--\r\n`)
    );
    this.#maxDiscardSize = options?.maxDiscardSize ?? 16 * 1024;
    this.#maxStatusLineSize = options?.maxStatusLineSize ?? 1 * 1024;
    this.#maxHeaderSize = options?.maxHeaderSize ?? 16 * 1024;
    this.#maxChunkBodySize = options?.maxChunkBodySize ?? 1 * 1024 * 1024;
  }

  /**
   * transform readable stream of Uint8Array to an stream of HttpMultipartChunk
   * @param chunk - chunk of data to parse
   * @param controller - transform stream controller
   * @returns void
   */
  transform(
    chunk: Uint8Array,
    controller: TransformStreamDefaultController<HttpMultipartChunk>
  ) {
    if (this.#buffer) {
      this.#buffer = concat([this.#buffer, chunk]);
    } else {
      this.#buffer = chunk;
    }

    while (this.#buffer?.length > 0) {
      switch (this.#state) {
        case STATUS_PREAMBLE:
          if (!this.#parsePreamble()) return;
          break;
        case STATUS_MULTIPART_HEADER:
          if (!this.#parseMultipart(controller)) return;
          break;
        case STATUS_STATUSLINE:
          if (!this.#parseStatusLine(controller)) return;
          break;
        case STATUS_HEADER:
          if (!this.#parseHeader(controller)) return;
          break;
        case STATUS_BODY:
          if (!this.#parseBody(controller)) return;
          break;
        case STATUS_EPILOGUE:
          if (!this.#parseEpilogue()) return;
          break;
      }
    }
  }

  /**
   * we just discard the preamble
   * @param controller - transform stream controller
   * @returns true if preamble is parsed and advance to next state
   */
  #parsePreamble() {
    const index = this.#searchStartBoundary.search(this.#buffer!);
    if (index !== -1) {
      this.#state = STATUS_MULTIPART_HEADER;
      this.#buffer = this.#buffer!.subarray(
        index + this.#searchStartBoundary.pattern.length
      );
      return true;
    }
    if (this.#buffer!.length > this.#maxDiscardSize) {
      throw new Error("Preamble too large");
    }
    return false;
  }

  /**
   * parse the multipart/mixed header
   * @param controller - transform stream controller
   * @returns true if header is parsed and advance to next state
   */
  #parseMultipart(
    controller: TransformStreamDefaultController<HttpMultipartChunk>
  ) {
    const index = this.#searchDivider.search(this.#buffer!);
    if (index !== -1) {
      const header = this.#buffer!.subarray(0, index);
      controller.enqueue({ type: STATUS_MULTIPART_HEADER, data: header });
      this.#state = STATUS_STATUSLINE;
      this.#buffer = this.#buffer!.subarray(
        index + this.#searchDivider.pattern.length
      );
      return true;
    }
    if (this.#buffer!.length > this.#maxHeaderSize) {
      throw new Error(
        `Header size exceeded maxHeaderSize : ${this.#maxHeaderSize} bytes`
      );
    }
    return false;
  }

  /**
   * parse http status line - keep in mind that status line is terminated by newline
   * @param controller - transform stream controller
   * @returns true if status line is parsed and advance to next state
   */
  #parseStatusLine(
    controller: TransformStreamDefaultController<HttpMultipartChunk>
  ) {
    const index = this.#searchNewline.search(this.#buffer!);
    if (index !== -1) {
      const statusLine = this.#buffer!.subarray(0, index);
      controller.enqueue({ type: STATUS_STATUSLINE, data: statusLine });
      this.#state = STATUS_HEADER;
      this.#buffer = this.#buffer!.subarray(
        index + this.#searchNewline.pattern.length
      );
      return true;
    }
    if (this.#buffer!.length > this.#maxStatusLineSize) {
      throw new Error(
        `Header size exceeded maxHeaderSize : ${this.#maxHeaderSize} bytes`
      );
    }
    return false;
  }

  /**
   * parse http header block - keep in mind that header block is terminated by an empty line
   * @param controller - transform stream controller
   * @returns true if header is completly parsed and advance to next state
   */
  #parseHeader(
    controller: TransformStreamDefaultController<HttpMultipartChunk>
  ) {
    const index = this.#searchDivider.search(this.#buffer!);
    if (index !== -1) {
      const header = this.#buffer!.subarray(0, index);
      controller.enqueue({ type: STATUS_HEADER, data: header });
      this.#state = STATUS_BODY;
      this.#buffer = this.#buffer!.subarray(
        index + this.#searchDivider.pattern.length
      );
      return true;
    }
    if (this.#buffer!.length > this.#maxHeaderSize) {
      throw new Error(
        `Header size exceeded maxHeaderSize : ${this.#maxHeaderSize} bytes`
      );
    }

    return false;
  }

  /**
   * parse http body
   *
   * It will try to not accumulate the whole body in memory
   * but it will return a body chunk if it can guarantee that
   * the last bytes of body chunk does not contain a CR
   * the last bytes being the size of the end boundary
   * this allows to stream the body chunks to as a ReadableStream
   *
   * @param controller - transform stream controller
   * @returns true if body end is found and advance to next state
   */
  #parseBody(controller: TransformStreamDefaultController<HttpMultipartChunk>) {
    const index = this.#searchBoundary.search(this.#buffer!);
    if (index !== -1) {
      const body = this.#buffer!.subarray(0, index);
      controller.enqueue({ type: STATUS_BODY, data: body, done: true });
      this.#state = STATUS_MULTIPART_HEADER;
      this.#buffer = this.#buffer!.subarray(
        index + this.#searchBoundary.pattern.length
      );
      return true;
    } else {
      const index = this.#searchEndBoundary.search(this.#buffer!);
      if (index !== -1) {
        const body = this.#buffer!.subarray(0, index);
        controller.enqueue({ type: STATUS_BODY, data: body, done: true });
        this.#state = STATUS_EPILOGUE;
        this.#buffer = this.#buffer!.subarray(
          index + this.#searchEndBoundary.pattern.length
        );
        return true;
      }
      // 13 is CR in CRLF that may be the start of a boundary
      else if (
        this.#buffer!.indexOf(13, -this.#searchEndBoundary.pattern.length) ===
        -1
      ) {
        controller.enqueue({
          type: STATUS_BODY,
          data: this.#buffer!,
          done: false,
        });
        this.#buffer = undefined;
        return false;
      }
    }

    if (this.#buffer!.length > this.#maxChunkBodySize) {
      throw new Error(
        `Chunk body size exceeded maxChunkBodySize : ${
          this.#maxChunkBodySize
        } bytes`
      );
    }
    return false;
  }

  /**
   * we just discard the epilogue
   * @param controller - the controller of the transform stream
   * @returns true
   */
  #parseEpilogue() {
    this.#epilogueSize += this.#buffer!.length;
    if (this.#epilogueSize > this.#maxDiscardSize) {
      throw new Error(`Epilogue too large`);
    }
    this.#buffer = undefined;
    return true;
  }
}

class HttpBodyStreamSource implements UnderlyingDefaultSource<Uint8Array> {
  #reader: ReadableStreamDefaultReader<HttpMultipartChunk>;
  #completed = false;
  #reading = false;
  #cancelled = false;
  #completedPromise: Promise<void>;
  #completedPromiseResolve!: () => void;

  /**
   * Create a new HttpBodyStreamSource
   *
   * The HttpBodyStreamSource is a ReadableStreamSource that will
   * read the body of a multipart stream that will complete when
   * a boundary is found
   *
   * @param reader - the reader of the multipart stream
   */
  constructor(reader: ReadableStreamDefaultReader<HttpMultipartChunk>) {
    this.#reader = reader;
    this.#completedPromise = new Promise<void>((resolve) => {
      this.#completedPromiseResolve = resolve;
    });
  }

  /**
   * a promise fired when the body is completely read
   * @returns a promise that will resolve when the body is completly read from the stream
   */
  completed() {
    return this.#completedPromise;
  }

  /**
   * resolve the completed promise and set the completed flags
   */
  #setCompleted() {
    this.#completed = true;
    this.#completedPromiseResolve();
    this.#reading = false;
  }

  /**
   * consume the body until a boundary is found
   * this is used when the stream is cancelled
   * to discard the rest of the body
   */
  async #consumeBody() {
    while (true) {
      const { value, done } = await this.#reader.read();
      if (done || value.done) break;
    }
  }

  /**
   * pull one chunk from the body at a time
   * @param controller - the controller of the readable stream
   * @returns void
   */
  async pull(controller: ReadableStreamDefaultController<Uint8Array>) {
    if (this.#completed) return controller.close();

    this.#reading = true;

    if (this.#cancelled) {
      this.#setCompleted();
      return controller.close();
    }

    const { value: body, done: bodyDone } = await this.#reader.read();
    if (this.#cancelled) {
      if (body && !body?.done) {
        await this.#consumeBody();
      }
      this.#setCompleted();
      return controller.close();
    }
    if (body?.type !== STATUS_BODY) {
      this.#setCompleted();
      controller.close();
      throw new Error(`Unexpected body type ${body?.type}`);
    }
    if (bodyDone || body.done) {
      if (body.data) controller.enqueue(body.data);
      this.#setCompleted();
      return controller.close();
    }
    controller.enqueue(body.data);
    this.#reading = false;
  }
  async cancel() {
    this.#cancelled = true;
    if (!this.#completed && !this.#reading) {
      this.#reading = true;
      await this.#consumeBody();
      this.#setCompleted();
    }
  }
}

export class BatchStreamResponse implements AsyncIterable<[string, Response]> {
  #response: Response;
  #options?: HttpBatchTansformerOptions;

  constructor(response: Response, options?: HttpBatchTansformerOptions) {
    this.#response = response;
    this.#options = options;
  }

  /**
   * async iterator that allows to iterate over the responses
   *
   * if not already, it parses the multipart/mixed response and yields a response for each request
   * allowing to handle each response individually
   *
   * @returns an async iterator that yields a response for each request
   */
  async *[Symbol.asyncIterator]() {
    const boundary = parseBoundary(this.#response);
    const stream = this.#response.body!.pipeThrough(
      new TransformStream(new HttpBatchTansformer(boundary, this.#options))
    );
    const reader = stream.getReader();
    let currentBodyStreamSource: HttpBodyStreamSource | undefined;

    while (true) {
      // we wait until previous body is consumed or cancelled
      await currentBodyStreamSource?.completed();
      const multipart = await this.#parseMultipartHeader(reader);
      if (multipart.done) break;
      const embedded = await this.#parseEmbeddedResponse(reader);
      currentBodyStreamSource = embedded.bodyStreamSource;
      yield [multipart.contentId, embedded.response] as [string, Response];
    }
  }

  async #parseMultipartHeader(
    reader: ReadableStreamDefaultReader<HttpMultipartChunk>
  ) {
    const { value, done } = await reader.read();

    if (done) return { done };
    if (value.type !== STATUS_MULTIPART_HEADER) {
      throw new Error("BatchResponse: Invalid multipart header");
    }
    const partHeaders = parseHeaders(value.data);
    const contentId = parseContentId(partHeaders);
    const contentType = partHeaders.get("content-type");
    if (!contentType || !contentType.startsWith("application/http")) {
      throw new Error(
        "BatchResponse: Invalid content type, expected application/http"
      );
    }
    return { done, contentId };
  }

  async #parseEmbeddedResponse(
    reader: ReadableStreamDefaultReader<HttpMultipartChunk>
  ) {
    const { value: statusLine, done: statusLineDone } = await reader.read();
    if (statusLineDone || statusLine.type !== STATUS_STATUSLINE) {
      throw new Error("BatchResponse: Invalid status line");
    }
    const { status, statusText } = parseStatusLine(statusLine.data);
    const { value: headers, done: headersDone } = await reader.read();
    if (headersDone || headers.type !== STATUS_HEADER) {
      throw new Error("BatchResponse: Invalid headers");
    }
    const responseHeaders = parseHeaders(headers.data);
    if (status === 204 || status === 304) {
      const { value: body, done: bodyDone } = await reader.read();
      if (body && (body.type !== STATUS_BODY || !body.done)) {
        throw new Error("BatchResponse: Body not empty");
      }
      return {
        response: new Response(undefined, {
          status,
          statusText,
          headers: responseHeaders,
        }),
      };
    }
    const bodyStreamSource = new HttpBodyStreamSource(reader);
    const bodyStream = new ReadableStream(bodyStreamSource);
    const response = new Response(bodyStream, {
      status,
      statusText,
      headers: responseHeaders,
    });
    return { bodyStreamSource, response };
  }
}
export function makeBatchStreamResponse(
  response: Response,
  options?: HttpBatchTansformerOptions
): BatchStreamResponse {
  return new BatchStreamResponse(response, options);
}
