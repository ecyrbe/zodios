# Batch support for fetch

Batching is a technique that allows to send multiple requests in a single HTTP request.
This is useful to reduce the number of roundtrips between the client and the server and to reduce the number of requests on the server.
Because HTTPS requests are expensive, batching can greatly improve the performance of your application.
It also allows to bypass browser limitations on the number of concurrent requests.

However, if your service is already using HTTP/2, you should not use this library as HTTP/2 already supports multiplexing in a better way.
Indeed it also does supports interleaving the data of multiple requests allowing a slower request to be received before a faster one if it has fewer data to send.

These features are not supported by this library, that does batching in a FIFO way. This should be OK for most REST APIs.

So it's advised to not updload or download large files using this library, since one large file could block the response of a REST api that took longer to start sending data.

## Main interface

This allows to batch automatically all requests made within the same tick (aka the same event loop cycle)

```ts
    const client = new BatchRequest({
      input: `/batch`, 
      init: { method: "POST" }
    },
    {
      makeBatchData: () => new BatchData(),
      makeBatchResponse: (response) => new BatchResponse(response))
    });

    const [user1, user2] = await Promise.all([
      client
        .fetch(`/users/1`)
        .then((res) => res.json()),
      client
        .fetch(`/users/2`)
        .then((res) => res.json()),
    ]);

    expect(user1).toEqual({ id: 1, name: "John Doe" });
    expect(user2).toEqual({ id: 2, name: "Jane Doe" });
```

## Always Batch

By default if only one request is pending, the request is sent immediately to the final endpoint without using the batch endpoint.
If you want to always use the batch endpoint, you can use the `alwaysBatch` option.

```ts
    const client = new BatchRequest({input: `/batch`, init: { method: "POST" }}, {
      makeBatchData: () => new BatchData(),
      makeBatchResponse: (response) => new BatchResponse(response)),
      alwaysBatch: true 
    });
```

## Custom fetch

If the platform you are running does not support fetch, but a library has a 100% compatible one, you should use it as a polyfill.
Batch request assumes there is a fetch implementation that is 100% compatible with the standard one.

You can't just provite a custom fetch because behind the scene batch request uses the following objects :
- Request
- Response
- AbortSignal
- AbortController
- ReadStream 

All of which are part of the standard fetch API.

👉 Custom fetch should only be used for intrumented fetch, A.K.A a fetch overload that adds caching, telemetry, logs, etc.

```ts
    const client = new BatchRequest({input: `/batch`, init: { method: "POST" }}, {
      makeBatchData: () => new BatchData(),
      makeBatchResponse: (response) => new BatchResponse(response)),
      fetch: myFetch 
    });
```

## Streaming

Batch request supports streaming, for the request body nothing to do, it's supported out the box. and for the response body you can replace the BatchResponse contructor
by BatchStreamResponse.
Streaming is useful to reduce the memory footprint of your application, especially if you are downloading large contents.
Also it allows to handle the one response from a batched request as soon as it's available, instead of waiting for the whole batch to be completed.

```ts
    const client = new BatchRequest({input: `/batch`, init: { method: "POST" }}, {
      makeBatchData: () => new BatchData(),
      makeBatchResponse: (response) => new BatchStreamResponse(response))
    });
```

## React Native

React Native does not support ReadableStream, so you need to use a polyfill or use dedicated react native implementation for BatchData and BatchResponse.

```ts
    const client = new BatchRequest({input: `/batch`, init: { method: "POST" }}, {
      makeBatchData: () => new ReactNativeBatchData(),
      makeBatchResponse: (response) => new ReactNativeBatchResponse(response))
    });
```

## canceling individual requests

You can cancel requests individually using standard AborController.
If all requests are canceled, the batched request is canceled as well to return as soon as possible.

```ts
    const client = new BatchRequest({
      input: `/batch`, 
      init: {
        method: "POST",
      }
    }, {
      makeBatchData: () => new BatchData(),
      makeBatchResponse: (response) => new BatchStreamResponse(response))
    });

    const controller = new AbortController();

    const user1 = client
      .fetch(`/users/1`, { signal: controller.signal }).then((res) => res.json());

    const user2 = client
      .fetch(`/users/2`).then((res) => res.json());

    // be sure requests are sent
    await sleep(100);
    // abort request 1 afterwards
    controller.abort();

    await expect(user1).rejects.toThrow("Aborted");
    await expect(user2).resolves.toEqual({ id: 2, name: "Jane Doe" });
```

## Behind the scenes

Fetch batch uses multipart/mixed to send multiple requests in a single HTTP request.
Each individual request is sent as a part of the multipart/mixed request with application/http content type.
Each part is separated by a boundary. And each part starts with a Content-ID header that is used to match the response to the request.

```ts
    // individual requests must target the same host
    const getUser1 = new Request(`http://localhost:${port}/get`, {
      method: "GET",
      headers: new Headers({
        Accept: "application/json; charset=utf-8",
      }),
    });

    // individual requests must target the same host
    const renameUser2 = new Request(`http://localhost:${port}/patch`, {
      method: "PATCH",
      headers: new Headers({
        Accept: "application/json; charset=utf-8",
        "Content-Type": "application/json; charset=utf-8",
      }),
      body: JSON.stringify({
        name: "John Doe",
      }),
    });

    const body = new BatchData();
    body.addRequest(getUser1);
    body.addRequest(renameUser2);

    // use the batch endpoint to send the requests
    const batched = await fetch(`http://localhost:${port}/batch`, {
      method: "POST",
      headers: body.getHeaders({
        'x-custom-header': 'custom value'
      }),
      body: body.body(),
    }).then((response) => new BatchResponse(response));

    // you can iterate over the responses
    for await (const [contentId,response] of batched) {
      if(contentId === body.getRequestId(getUser1))
        console.log('getUser1 response',await response.json())
      else if(contentId === body.getRequestId(renameUser2))
        console.log('renameUser2 response',await response.json())
    }
```
