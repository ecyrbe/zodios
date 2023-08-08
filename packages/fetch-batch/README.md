# Batch support for fetch

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
