import { BatchData } from "./batch-data";
import { BatchResponse } from "./batch-response";

export class BatchRequest {
  #queue = new Map<
    Request,
    {
      resolve: (value: Response) => void;
      reject: (reason?: any) => void;
    }
  >();
  #timer?: ReturnType<typeof setTimeout>;
  #input: RequestInfo | URL;
  #init?: RequestInit;

  constructor(input: RequestInfo | URL, init?: RequestInit) {
    this.#input = input;
    this.#init = init;
  }

  async fetch(input: RequestInfo | URL, init?: RequestInit): Promise<Response> {
    return new Promise((resolve, reject) => {
      const request = new Request(input, init);
      this.#queue.set(request, { resolve, reject });
      if (!this.#timer) {
        const dispatch = this.#dispatch.bind(this);
        this.#timer = setTimeout(dispatch, 0);
      }
    });
  }

  #clear() {
    clearTimeout(this.#timer);
    this.#queue.clear();
    this.#timer = undefined;
  }

  async #dispatch() {
    const queue = new Map(this.#queue);
    this.#clear();
    if (queue.size === 1) {
      const [request, callbacks] = queue.entries().next().value;
      try {
        // no need to use batch if there is only one request
        const response = await fetch(request);
        callbacks.resolve(response);
      } catch (error) {
        callbacks.reject(error);
      }
    } else if (queue.size > 1) {
      const batchData = new BatchData();
      for (const request of queue.keys()) {
        batchData.addRequest(request);
      }
      try {
        const response = await fetch(this.#input, {
          ...this.#init,
          headers: batchData.getHeaders(this.#init?.headers),
          body: batchData.stream(),
        });
        if (response.ok) {
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
          for (const callbacks of queue.values()) {
            callbacks.reject(
              new Error(
                `Batch endpoint error: ${response.status} ${response.statusText}`
              )
            );
          }
        }
      } catch (error) {
        for (const callbacks of queue.values()) {
          callbacks.reject(error);
        }
      }
    }
  }
}
