import { BatchCallbacks } from "./batch-request.types";

export function cancelAbortedRequests(queue: Map<Request, BatchCallbacks>) {
  for (const [request, callbacks] of queue.entries()) {
    if (request.signal.aborted) {
      queue.delete(request);
      callbacks.reject(new DOMException("Aborted", "AbortError"));
    }
  }
}

export function cancelRequestInQueue(
  queue: Map<Request, BatchCallbacks>,
  request: Request,
  controller?: AbortController
) {
  const callbacks = queue.get(request);
  if (callbacks) {
    queue.delete(request);
    callbacks.reject(new DOMException("Aborted", "AbortError"));
    if (queue.size === 0) {
      // abort the batch request if all requests are aborted
      controller?.abort();
    }
  }
}

export function isMultipartMixed(headers: Headers) {
  return headers.get("Content-Type")?.startsWith("multipart/mixed");
}
