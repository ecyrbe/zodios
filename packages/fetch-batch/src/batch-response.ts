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

import { concat, SearchArray } from "./utils";
import {
  ensureBody,
  parseBoundary,
  parseContentId,
  parseHeaders,
  parseStatusLine,
} from "./batch-response.utils";

export class BatchResponse implements AsyncIterable<[string, Response]> {
  #response: Response;
  #encoder = new TextEncoder();
  #searchNewline = new SearchArray(this.#encoder.encode("\r\n"));
  #searchDivider = new SearchArray(this.#encoder.encode("\r\n\r\n"));

  constructor(response: Response) {
    this.#response = response;
  }

  /**
   * async iterator that allows to iterate over the responses
   *
   * if not already, it parses the multipart/mixed response and yields a response for each request
   * allowing to handle each response individually
   *
   * parse the multipart/mixed response and store each response in a map
   * where the key is the content id of the request
   *
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
   *
   * @returns an async iterator that yields a response for each request
   */
  async *[Symbol.asyncIterator]() {
    const boundary = parseBoundary(this.#response);
    const buffers = await this.#readChuncks();
    const data = concat(buffers);
    const searchBoundary = new SearchArray(
      this.#encoder.encode(`--${boundary}\r\n`)
    );
    const searchEndBoundary = new SearchArray(
      this.#encoder.encode(`--${boundary}--\r\n`)
    );
    const boundaryIndexes = searchBoundary.searchAll(data);
    const endBoundaryIndex = searchEndBoundary.search(data);
    if (endBoundaryIndex === -1) {
      throw new Error(
        "BatchResponse: Invalid response, no ending boundary found"
      );
    }
    const indexes = boundaryIndexes.map((index, i) => ({
      start: index + searchBoundary.pattern.length,
      end:
        (boundaryIndexes[i + 1] || endBoundaryIndex) -
        this.#searchNewline.pattern.length,
    }));
    for (const { start, end } of indexes) {
      const parsedResponse = this.#parseEmbeddedResponse(
        data.subarray(start, end)
      );
      if (parsedResponse) {
        yield [parsedResponse.contentId, parsedResponse.response] as [
          string,
          Response
        ];
      }
    }
  }

  /**
   * read all chuncks of the multipart/mixed response body
   * @returns - the combined data of the multipart/mixed response body in a single Uint8Array
   */
  async #readChuncks() {
    ensureBody(this.#response.body);
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
  #parseEmbeddedResponse(data: Uint8Array) {
    const partHeadersEndIndex = this.#searchDivider.search(data);
    if (partHeadersEndIndex === -1) {
      throw new Error("BatchResponse: Invalid part, no headers found");
    }
    const partHeadersBytes = data.subarray(0, partHeadersEndIndex);
    const partHeaders = parseHeaders(partHeadersBytes);
    const contentType = partHeaders.get("content-type");
    if (!contentType?.startsWith("application/http")) {
      return undefined;
    }

    const partBodyBytes = data.subarray(
      partHeadersEndIndex + this.#searchDivider.pattern.length
    );
    const responseHeadersEndIndex = this.#searchDivider.search(partBodyBytes);
    if (responseHeadersEndIndex === -1) {
      throw new Error("BatchResponse: Invalid response");
    }
    const responseStatusLineEndIndex =
      this.#searchNewline.search(partBodyBytes);
    if (responseStatusLineEndIndex === -1) {
      throw new Error("BatchResponse: Invalid response status line");
    }
    const responseStatusLineBytes = partBodyBytes.subarray(
      0,
      responseStatusLineEndIndex
    );
    const responseHeadersBytes = partBodyBytes.subarray(
      responseStatusLineEndIndex + this.#searchNewline.pattern.length,
      responseHeadersEndIndex
    );
    const responseBodyBytes = partBodyBytes.subarray(
      responseHeadersEndIndex + this.#searchDivider.pattern.length
    );
    const responseStatusLine = parseStatusLine(responseStatusLineBytes);
    const responseHeaders = parseHeaders(responseHeadersBytes);

    const contentId = parseContentId(partHeaders);
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
}

export function makeBatchResponse(response: Response) {
  return new BatchResponse(response);
}
