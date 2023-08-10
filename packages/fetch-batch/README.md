# Batch support for fetch

## Main interface

This allows to batch automatically all requests made within the same tick (aka the same event loop cycle)

```ts
    const client = new BatchRequest(`http://localhost:${port}/batch`, {
      method: "POST",
    });
    const [user1, user2, nothing] = await Promise.all([
      client
        .fetch(`http://localhost:${port}/users/1`)
        .then((res) => res.json()),
      client
        .fetch(`http://localhost:${port}/users/2`)
        .then((res) => res.json()),
    ]);
```

## canceling individual requests

You can cancel requests individually using standard AborController.
If all requests are canceled, the batched request is canceled as well to return as soon as possible.

```ts
    const client = new BatchRequest(`http://localhost:${port}/batch-pending`, {
      method: "POST",
    });

    const controller = new AbortController();

    const user1 = client
      .fetch(`http://localhost:${port}/users/1`, { signal: controller.signal }).then((res) => res.json());

    const user2 = client
      .fetch(`http://localhost:${port}/users/2`, { signal: controller.signal }).then((res) => res.json());

    await sleep(100); // be sure requests are sent
    controller.abort(); // abort all requests afterwards

    await expect(user1).rejects.toThrow("Aborted");
    await expect(user2).resolves.toEqual({ id: 2, name: "Jane Doe" });
```

## Behind the scenes

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
      body: body.stream(),
    }).then((response) => new BatchResponse(response));

    // you can iterate over the responses
    for await (const [contentId,response] of batched) {
      if(contentId === body.getRequestId(getUser1))
        console.log('getUser1 response',await response.json())
      else if(contentId === body.getRequestId(renameUser2))
        console.log('renameUser2 response',await response.json())
    }
    // or directly with request / response matching
    const getUser1Response = await batched.getResponse(body.getRequestId(getUser1));
    console.log('getUser1 response',await getUser1Response.json())
    const renameUser2Response = await batched.getResponse(body.getRequestId(renameUser2));
    console.log('renameUser2 response',await renameUser2Response.json())
```
