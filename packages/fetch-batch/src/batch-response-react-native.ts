import {
  parseBoundary,
  parseContentId,
  parseHeadersString,
  parseStatusLineString,
} from "./batch-response.utils";

/**
 * A BatchResponse implementation for react native not using streams
 * it's less efficient than the stream implementation but it's the only way to make it work on react native
 * since it only supports .text() and .json() methods on the response
 */
export class ReactNativeBatchResponse
  implements AsyncIterable<[string, Response]>
{
  #response: Response;

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
    const boundary = parseBoundary(this.#response.headers);
    const data = await this.#response.text();

    const boundaryPattern = `--${boundary}\r\n`;
    const endBoundaryPattern = `--${boundary}--\r\n`;
    const boundaryIndexes = this.#findAllIndexes(data, boundaryPattern);
    const endBoundaryIndex = data.indexOf(endBoundaryPattern);
    if (endBoundaryIndex === -1) {
      throw new Error(
        "BatchResponse: Invalid response, no ending boundary found"
      );
    }
    const indexes = boundaryIndexes.map((index, i) => ({
      start: index + boundaryPattern.length,
      end: (boundaryIndexes[i + 1] || endBoundaryIndex) - 2,
    }));
    for (const { start, end } of indexes) {
      const parsedResponse = this.#parseEmbeddedResponse(
        data.substring(start, end)
      );
      if (parsedResponse) {
        yield [parsedResponse.contentId, parsedResponse.response] as [
          string,
          Response
        ];
      }
    }
  }

  #findAllIndexes(data: string, pattern: string) {
    const indexes = [];
    let index = data.indexOf(pattern);
    while (index !== -1) {
      indexes.push(index);
      index = data.indexOf(pattern, index + pattern.length);
    }
    return indexes;
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
  #parseEmbeddedResponse(data: string) {
    const dividerPattern = "\r\n\r\n";
    const newLinePattern = "\r\n";
    const partHeadersEndIndex = data.indexOf(dividerPattern);
    if (partHeadersEndIndex === -1) {
      throw new Error("BatchResponse: Invalid part, no headers found");
    }
    const partHeadersString = data.substring(0, partHeadersEndIndex);
    const partHeaders = parseHeadersString(partHeadersString);
    const contentType = partHeaders.get("content-type");
    if (!contentType?.startsWith("application/http")) {
      return undefined;
    }

    const partBodyString = data.substring(
      partHeadersEndIndex + dividerPattern.length
    );
    const responseHeadersEndIndex = partBodyString.indexOf(dividerPattern);
    if (responseHeadersEndIndex === -1) {
      throw new Error("BatchResponse: Invalid response");
    }
    const responseStatusLineEndIndex = partBodyString.indexOf(newLinePattern);
    if (responseStatusLineEndIndex === -1) {
      throw new Error("BatchResponse: Invalid response status line");
    }
    const responseStatusLineString = partBodyString.substring(
      0,
      responseStatusLineEndIndex
    );
    const responseHeadersString = partBodyString.substring(
      responseStatusLineEndIndex + newLinePattern.length,
      responseHeadersEndIndex
    );
    const responseBodyString = partBodyString.substring(
      responseHeadersEndIndex + dividerPattern.length
    );
    const responseStatusLine = parseStatusLineString(responseStatusLineString);
    const responseHeaders = parseHeadersString(responseHeadersString);

    const contentId = parseContentId(partHeaders);
    const response = new Response(
      responseBodyString.length > 0 ? responseBodyString : undefined,
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

export function makeReactNativeBatchResponse(response: Response) {
  return new ReactNativeBatchResponse(response);
}
