const statusLineRegExp = /^HTTP\/\d\.\d (\d{3}) (.*)$/;
const headerRegExp = /^([^\s:]+):\s*(.*?)(?=\s*$)/;
const contentIdRegExp = /^<?([^>]+)>?$/;
const boundaryRegExp = /boundary="?([^";]+)"?;?/;

/**
 * parse the headers from a multipart/mixed response and extract the boundary
 * @param response - The response to parse the boundary from
 * @returns the boundary
 * @throws if the response is not multipart/mixed or if the boundary is not found or if there is no response body
 */
export function parseBoundary(response: Response) {
  const contentType = response.headers.get("content-type");
  if (!contentType?.startsWith("multipart/mixed")) {
    throw new Error(
      "BatchResponse: Invalid content type, expected multipart/mixed"
    );
  }
  const boundary = contentType.match(boundaryRegExp)?.[1];
  if (!boundary) {
    throw new Error("BatchResponse: Invalid boundary");
  }
  return boundary;
}

export function ensureBody(
  body: ReadableStream<Uint8Array> | null
): asserts body is ReadableStream<Uint8Array> {
  if (!body) {
    throw new Error("BatchResponse: Empty response body");
  }
}

/**
 * parse content id from headers
 * @param headers - The headers to parse the content id from
 * @returns the content id
 */
export function parseContentId(headers: Headers) {
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
export function parseStatusLine(statusLineBytes: Uint8Array) {
  const statusLine = new TextDecoder().decode(statusLineBytes);
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
export function parseHeaders(headersBytes: Uint8Array) {
  const decodedHeaders = new TextDecoder().decode(headersBytes).split("\r\n");
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
