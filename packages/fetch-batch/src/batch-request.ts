import { BatchData } from "./batch-data";
import { BatchResponse } from "./batch-response";
import {
  cancelAbortedRequests,
  cancelRequestInQueue,
  isMultipartMixed,
} from "./batch-request.utils";

import type {
  BatchCallbacks,
  BatchRequestEndpoint,
  BatchRequestOptions,
} from "./batch-request.types";

/**
 * A batch request handler
 *
 * It will batch all requests made within the same tick (aka within the same event loop)
 * using a multipart/mixed request with application/http envelopes.
 * Your server should be able to handle this request and return a multipart/mixed response
 */
export class BatchRequest {
  #queue = new Map<Request, BatchCallbacks>();
  #timer?: ReturnType<typeof setTimeout>;
  #input: RequestInfo | URL;
  #init?: RequestInit;
  #fetch: typeof fetch;
  #controller?: AbortController;
  #alwaysBatch: boolean;

  /**
   * create a new batch request handler
   * @param batchEndpoint - the endpoint to send the batch request to with it's fetch init options
   * @param options - options to allow to use a custom fetch function or to allways batch requests even if there is only one request pending.
   *
   * @details allwaysBatch set to false by default, meaning it will not batch requests if there is only one request pending.
   */
  constructor(
    batchEndpoint: BatchRequestEndpoint,
    options?: BatchRequestOptions
  ) {
    this.#input = batchEndpoint.input;
    this.#init = batchEndpoint.init;
    this.#fetch = options?.fetch ?? fetch;
    this.#alwaysBatch = options?.alwaysBatch ?? false;
  }

  /**
   * cancel all pending requests
   * if no request is pending, it does nothing
   */
  cancel() {
    if (this.#controller) {
      this.#controller.abort();
    }
  }

  /**
   * fetch a request and return a promise that resolves with the response
   *
   * it will batch all requests made within the same tick (aka within the same event loop)
   *
   * @param input - a url or string or a request object, same as original fetch
   * @param init - request init object, same as original fetch
   * @returns the response
   */
  async fetch(input: RequestInfo | URL, init?: RequestInit): Promise<Response> {
    return new Promise((resolve, reject) => {
      const request = new Request(input, init);
      this.#queue.set(request, { resolve, reject });
      if (!this.#timer) {
        this.#controller = new AbortController();
        this.#timer = setTimeout(() => this.#dispatch(), 0);
      }
    });
  }

  /**
   * clear the batch queue
   */
  #clear() {
    clearTimeout(this.#timer);
    this.#timer = undefined;
    this.#controller = undefined;
    this.#queue.clear();
  }

  /**
   * process all the batched requests within the same tick
   */
  async #dispatch() {
    const queue = new Map(this.#queue);
    const controller = this.#controller;
    this.#clear();
    cancelAbortedRequests(queue);

    if (queue.size === 0) {
      return;
    }
    if (queue.size === 1 && !this.#alwaysBatch) {
      const [request, callbacks] = queue.entries().next().value;
      try {
        const response = await this.#fetch(request);
        callbacks.resolve(response);
      } catch (error) {
        callbacks.reject(error);
      }
      return;
    }

    const batchData = new BatchData();
    for (const request of queue.keys()) {
      batchData.addRequest(request);
      request.signal?.addEventListener("abort", () =>
        cancelRequestInQueue(queue, request, controller)
      );
    }
    try {
      const response = await this.#fetch(this.#input, {
        ...this.#init,
        headers: batchData.getHeaders(this.#init?.headers),
        body: batchData.stream(),
        signal: controller?.signal,
      });
      if (isMultipartMixed(response.headers)) {
        const batchResponse = new BatchResponse(response);
        for await (const [contentId, response] of batchResponse) {
          const request = batchData.getRequest(contentId);
          if (request) {
            const callbacks = queue.get(request);
            queue.delete(request);
            if (callbacks) {
              callbacks.resolve(response);
            }
          }
        }
        if (queue.size > 0) {
          for (const callbacks of queue.values()) {
            callbacks.reject(new Error("response count mismatch"));
          }
        }
      } else {
        // response is not not multipart/mixed, so it's probably an error by an intermediary proxy
        // let's just resolve all requests with the same response
        // this is not ideal, but it's better than rejecting all requests
        // it allows the user to handle the error in a more granular way
        for (const callbacks of queue.values()) {
          callbacks.resolve(response.clone());
        }
      }
    } catch (error) {
      for (const callbacks of queue.values()) {
        callbacks.reject(error);
      }
    }
  }
}
