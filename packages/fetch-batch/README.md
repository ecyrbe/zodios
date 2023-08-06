# Batch support for fetch

```ts
    const getUser1 = new Request(`http://localhost:${port}/get`, {
      method: "GET",
      headers: new Headers({
        Accept: "application/json; charset=utf-8",
      }),
    });

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

    const batched = await fetch(`http://localhost:${port}/batch`, {
      method: "POST",
      headers: body.getHeaders(),
      body: body.stream(),
    }).then((response) => new BatchResponse(response));

    for await (const response of batched) {
      console.log(response);
    }
```