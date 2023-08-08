/**
 * BatchResponse is a class that allows to deal with batch responses using multipart/mixed content type.
 * @example
 * ```ts
 * const body = new BatchData();
 * const getUser1 = new Request(`http://localhost:${port}/get`, {
 *   method: "GET",
 *   headers: {
 *     Accept: "application/json; charset=utf-8",
 *   },
 * });
 *
 * const renameUser2 = new Request(`http://localhost:${port}/patch`, {
 *   method: "PATCH",
 *   headers: {
 *     Accept: "application/json; charset=utf-8",
 *     "Content-Type": "application/json; charset=utf-8",
 *   },
 *   body: JSON.stringify({
 *     name: "John Doe",
 *   }),
 * });
 *
 * const response = await fetch("http://localhost:3000/batch", {
 *   method: "POST",
 *   headers: body.getHeaders(),
 *   body: body.stream(),
 * });
 * // you can now get the response for each request
 * const batchResponse = new BatchResponse(response, body);
 * const getUser1Response = await batchResponse.getResponse(body.getContentId(getUser1));
 * const renameUser2Response = await batchResponse.getResponse(body.getContentId(renameUser2));
 * // or you can get all responses by iterating over the batch response
 * for await (const response of batchResponse) {
 *   console.log(response);
 * }
 * ```
 */

import { concat, findAllIndexOf, findIndexOf } from "./utils";

const statusLineRegExp = /^HTTP\/\d\.\d (\d{3}) (.*)$/;
const headerRegExp = /^([^:]+):\s*([^\s]*)\s*$/;
const contentIdRegExp = /^<?([^>]+)>?$/;
const boundaryRegExp = /boundary="?([^";]+)"?;?/;

export class BatchResponse {
  #response: Response;
  #decoder = new TextDecoder();
  #encoder = new TextEncoder();
  #responses = new Map<string, Response>();
  #newline = this.#encoder.encode("\r\n");
  #divider = this.#encoder.encode("\r\n\r\n");
  #parsed = false;

  constructor(response: Response) {
    this.#response = response;
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
    if (!this.#parsed) {
      await this.#parseResponse();
    }
    yield* this.#responses.entries();
  }

  /**
   * get the response for a request that was made with BatchData
   *
   * if not already, parse the multipart/mixed response and store each response in a map
   * where the key is the content id of the request
   * subsequent calls to this method will not parse the response again
   *
   * @param requestContentId - the content id of the request that was made with BatchData
   * @returns the response for the request if it exists else undefined
   */
  async getResponse(requestContentId: string): Promise<Response | undefined> {
    if (!this.#parsed) {
      await this.#parseResponse();
    }
    for (const [contentId, response] of this.#responses.entries()) {
      if (contentId.includes(requestContentId)) {
        return response;
      }
    }
  }

  /**
   * parse the multipart/mixed response and store each response in a map
   * where the key is the content id of the request
   *
   * Grammar for multipart/mixed content type:
   * multipart-body  := preamble 1*encapsulation close-delimiter epilogue
   * encapsulation   := delimiter body-part CRLF
   * delimiter       := "--" boundary CRLF
   * close-delimiter := delimiter "--"
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
  async #parseResponse() {
    const contentType = this.#response.headers.get("content-type");
    if (!contentType?.startsWith("multipart/mixed")) {
      throw new Error(
        "BatchResponse: Invalid content type, expected multipart/mixed"
      );
    }
    const boundary = contentType.match(boundaryRegExp)?.[1];
    if (!boundary) {
      throw new Error("BatchResponse: Invalid boundary");
    }

    const buffers: Uint8Array[] = await this.#readChuncks();
    const data = concat(buffers);
    const boundaryBytes = this.#encoder.encode(`--${boundary}\r\n`);
    const endBoundaryBytes = this.#encoder.encode(`--${boundary}--\r\n`);
    const boundaryIndexes = findAllIndexOf(data, boundaryBytes);
    const endBoundaryIndex = findIndexOf(data, endBoundaryBytes);
    if (endBoundaryIndex === -1) {
      throw new Error(
        "BatchResponse: Invalid response, no ending boundary found"
      );
    }
    const indexes = boundaryIndexes.map((index, i) => ({
      start: index + boundaryBytes.length,
      end: (boundaryIndexes[i + 1] || endBoundaryIndex) - this.#newline.length,
    }));
    for (const { start, end } of indexes) {
      const parsedResponse = this.#parseEmbededResponse(
        data.subarray(start, end)
      );
      if (parsedResponse) {
        this.#responses.set(parsedResponse.contentId, parsedResponse.response);
      }
    }
    this.#parsed = true;
  }

  /**
   * read all chuncks of the multipart/mixed response body
   * @returns - the combined data of the multipart/mixed response body in a single Uint8Array
   */
  async #readChuncks() {
    if (!this.#response.body)
      throw new Error("BatchResponse: Empty response body");
    const buffers: Uint8Array[] = [];
    const reader = this.#response.body.getReader();
    while (true) {
      const { done, value } = await reader.read();
      if (done) {
        reader.releaseLock();
        break;
      }
      if (value) {
        buffers.push(value);
      }
    }
    return buffers;
  }

  /**
   * parse a multipart/mixed response part only allowing application/http content type
   * @param data - The data of the multipart/mixed response
   * @returns - The content id and the response
   * @example
   * ```yaml
   * Content-Type: application/http
   * Content-ID: <response-item2:12930812@barnyard.example.com>
   *
   * HTTP/1.1 200 OK
   * Content-Type: application/json
   * Content-Length: response_part_2_content_length
   * ETag: "etag/sheep"
   *
   * {
   *   "kind": "farm#animal",
   *   "etag": "etag/sheep",
   *   "selfLink": "/farm/v1/animals/sheep",
   *   "animalName": "sheep",
   *   "animalAge": 5,
   *   "peltColor": "green"
   * }
   * ```
   */
  #parseEmbededResponse(data: Uint8Array) {
    const partHeadersEndIndex = findIndexOf(data, this.#divider);
    if (partHeadersEndIndex === -1) {
      throw new Error("BatchResponse: Invalid part, no headers found");
    }
    const partHeadersBytes = data.subarray(0, partHeadersEndIndex);
    const partHeaders = this.#parseHeaders(partHeadersBytes);
    const contentType = partHeaders.get("content-type");
    if (!contentType?.startsWith("application/http")) {
      return undefined;
    }

    const partBodyBytes = data.subarray(
      partHeadersEndIndex + this.#divider.length
    );
    const responseHeadersEndIndex = findIndexOf(partBodyBytes, this.#divider);
    if (responseHeadersEndIndex === -1) {
      throw new Error("BatchResponse: Invalid response");
    }
    const responseStatusLineEndIndex = findIndexOf(
      partBodyBytes,
      this.#newline
    );
    if (responseStatusLineEndIndex === -1) {
      throw new Error("BatchResponse: Invalid response status line");
    }
    const responseStatusLineBytes = partBodyBytes.subarray(
      0,
      responseStatusLineEndIndex
    );
    const responseHeadersBytes = partBodyBytes.subarray(
      responseStatusLineEndIndex + this.#newline.length,
      responseHeadersEndIndex
    );
    const responseBodyBytes = partBodyBytes.subarray(
      responseHeadersEndIndex + this.#divider.length
    );
    const responseStatusLine = this.#parseStatusLine(responseStatusLineBytes);
    const responseHeaders = this.#parseHeaders(responseHeadersBytes);

    const contentId = this.#parseContentId(partHeaders);
    const response = new Response(
      responseBodyBytes.length > 0 ? responseBodyBytes : undefined,
      {
        status: responseStatusLine.status,
        statusText: responseStatusLine.statusText,
        headers: responseHeaders,
      }
    );

    return {
      contentId,
      response,
    };
  }

  /**
   * parse content id from headers
   * @param headers - The headers to parse the content id from
   * @returns the content id
   */
  #parseContentId(headers: Headers) {
    const contentIdRaw = headers.get("content-id");
    if (!contentIdRaw) {
      throw new Error("BatchResponse: Content-ID not found");
    }
    const match = contentIdRaw.match(contentIdRegExp);
    if (!match) {
      throw new Error(
        "BatchResponse: Invalid Content-ID format, should be '<'contentId'>'"
      );
    }
    return match[1];
  }

  /**
   * parse HTTP response status line
   * @param statusLineBytes - The status line bytes to parse
   * @returns the status and status text
   */
  #parseStatusLine(statusLineBytes: Uint8Array) {
    const statusLine = this.#decoder.decode(statusLineBytes);
    const match = statusLine.match(statusLineRegExp);
    if (!match) {
      throw new Error("BatchResponse: Invalid response status line");
    }
    const [, status, statusText] = match;
    return {
      status: Number(status),
      statusText,
    };
  }

  /**
   * parse headers from a Uint8Array
   *
   * it supports header folding continuations (https://tools.ietf.org/html/rfc7230#section-3.2.4)
   * even though it's not recommended by the spec and deprecated
   * in case headers are malformed, it will gently ignore them
   *
   * @param headersBytes - The headers bytes to parse
   * @returns
   */
  #parseHeaders(headersBytes: Uint8Array) {
    const decodedHeaders = this.#decoder.decode(headersBytes).split("\r\n");
    const headers = new Headers();
    let lastKey: string | undefined;
    for (const header of decodedHeaders) {
      if (header.startsWith(" ") || header.startsWith("\t")) {
        // this is a header folding continuation
        if (lastKey) {
          const value = header.trim();
          const currentValue = headers.get(lastKey);
          if (currentValue) {
            headers.set(lastKey, `${currentValue} ${value}`);
          }
        }
      } else {
        const match = header.match(headerRegExp);
        if (match) {
          const [, name, value] = match;
          headers.set(name, value);
        }
      }
    }
    return headers;
  }
}
