import {
  BatchStreamResponse,
  HttpBatchTansformer,
} from "./batch-response-stream";

const mockedResponseData = `Preamble
can be anything and should be ignored
--batch_foobarbaz
Content-Type: application/http
Content-ID: <response-item1:12930812@barnyard.example.com>

HTTP/1.1 200 OK
Content-Type: application/json; charset=UTF-8
ETag: "etag/pony"

{
  "kind": "farm#animal",
  "etag": "etag/pony",
  "selfLink": "/farm/v1/animals/pony",
  "animalName": "pony",
  "animalAge": 34,
  "peltColor": "white"
}
--batch_foobarbaz
Content-Type: application/http; msgtype=response; msgtype is optional and even this comment should be ignored
Content-ID: <response-item3:12930812@barnyard.example.com>

HTTP/1.1 304 Not Modified
ETag: "etag/pony"


--batch_foobarbaz
Content-ID: response-item2:12930812@barnyard.example.com
Content-Type: application/http

HTTP/1.1 200 OK
Content-Type: application/json;
  charset=UTF-8
ETag: "etag/sheep"

{
  "kind": "farm#animal",
  "etag": "etag/sheep",
  "selfLink": "/farm/v1/animals/sheep",
  "animalName": "sheep",
  "animalAge": 5,
  "peltColor": "green"
}

--batch_foobarbaz--
Epilogue can be anything
and should be ignored`.replace(/\n/g, "\r\n");

describe("BatchResponseStream", () => {
  describe("HttpBatchTansformer", () => {
    it("should parse a multipart/mixed response in one buffer", async () => {
      const stream = new ReadableStream({
        async pull(controller) {
          controller.enqueue(new TextEncoder().encode(mockedResponseData));
          controller.close();
        },
      });
      const httpStream = new TransformStream(
        new HttpBatchTansformer("batch_foobarbaz")
      );

      await stream.pipeThrough(httpStream).pipeTo(
        new WritableStream({
          write(chunk) {
            console.log(
              `http type: '${chunk.type}'\ndata: '${new TextDecoder().decode(
                chunk.data
              )}'`
            );
          },
        })
      );
    });

    it("should parse a multipart/mixed response cut line by line", async () => {
      const chuncks = mockedResponseData.split(/(?=\r)/g);
      const chunckedStream = new ReadableStream({
        async pull(controller) {
          const chunck = chuncks.shift();
          if (chunck) {
            controller.enqueue(new TextEncoder().encode(chunck));
          } else {
            controller.close();
          }
        },
      });
      const httpStream = new TransformStream(
        new HttpBatchTansformer("batch_foobarbaz")
      );

      await chunckedStream.pipeThrough(httpStream).pipeTo(
        new WritableStream({
          write(chunk) {
            console.log(
              `http type: '${chunk.type}'\ndata: '${new TextDecoder().decode(
                chunk.data
              )}'`
            );
          },
        })
      );
    });
    it("should parse a multipart/mixed response even if cut in the middle of crlf", async () => {
      const chuncks = mockedResponseData.split(/(?=\r)/g);
      const chunckedStream = new ReadableStream({
        async pull(controller) {
          const chunck = chuncks.shift();
          if (chunck) {
            controller.enqueue(new TextEncoder().encode(chunck));
          } else {
            controller.close();
          }
        },
      });
      const httpStream = new TransformStream(
        new HttpBatchTansformer("batch_foobarbaz")
      );

      await chunckedStream.pipeThrough(httpStream).pipeTo(
        new WritableStream({
          write(chunk) {
            console.log(
              `http type: '${chunk.type}'\ndata: '${new TextDecoder().decode(
                chunk.data
              )}'`
            );
          },
        })
      );
    });

    it("should throw if preamble size is too big", async () => {
      const stream = new ReadableStream({
        async pull(controller) {
          controller.enqueue(new TextEncoder().encode("Preamble".repeat(100)));
        },
      });
      const httpStream = new TransformStream(
        new HttpBatchTansformer("batch_foobarbaz")
      );

      await expect(
        stream.pipeThrough(httpStream).pipeTo(
          new WritableStream({
            write(chunk) {
              console.log(
                `http type: '${chunk.type}'\ndata: '${new TextDecoder().decode(
                  chunk.data
                )}'`
              );
            },
          })
        )
      ).rejects.toThrowError("Preamble too large");
    });
  });

  describe("BatchStreamResponse", () => {
    it("should parse a multipart/mixed response", async () => {
      const chuncks = mockedResponseData.split(/(?=\r)/g);
      const chunckedStream = new ReadableStream({
        async pull(controller) {
          const chunck = chuncks.shift();
          if (chunck) {
            controller.enqueue(new TextEncoder().encode(chunck));
            // simulate a slow stream
            await new Promise((resolve) => setTimeout(resolve, 100));
          } else {
            controller.close();
          }
        },
      });

      const mockedResponse = new Response(chunckedStream, {
        headers: {
          // check continuation support
          "Content-Type": `multipart/mixed;
              boundary=batch_foobarbaz`,
        },
        status: 200,
        statusText: "OK",
      });

      const batchResponse = new BatchStreamResponse(mockedResponse);
      let count = 0;
      for await (const [contentId, response] of batchResponse) {
        expect(contentId).toBeDefined();
        expect(response).toBeDefined();
        switch (contentId) {
          case "response-item1:12930812@barnyard.example.com":
            {
              count++;
              expect(response.status).toBe(200);
              expect(response.statusText).toBe("OK");
              expect(response.headers.get("Content-Type")).toContain(
                "application/json"
              );
              console.time("json item 1");
              // await expect(response.json()).resolves.toEqual({
              //   kind: "farm#animal",
              //   etag: "etag/pony",
              //   selfLink: "/farm/v1/animals/pony",
              //   animalName: "pony",
              //   animalAge: 34,
              //   peltColor: "white",
              // });
              await response.body?.cancel();
              console.timeEnd("json item 1");
            }
            break;
          case "response-item2:12930812@barnyard.example.com":
            {
              count++;
              expect(response.status).toBe(200);
              expect(response.statusText).toBe("OK");
              expect(response.headers.get("Content-Type")).toContain(
                "application/json"
              );
              console.time("json item 2");
              await expect(response.json()).resolves.toEqual({
                kind: "farm#animal",
                etag: "etag/sheep",
                selfLink: "/farm/v1/animals/sheep",
                animalName: "sheep",
                animalAge: 5,
                peltColor: "green",
              });
              console.timeEnd("json item 2");
            }
            break;
          case "response-item3:12930812@barnyard.example.com":
            {
              count++;
              expect(response.status).toBe(304);
              expect(response.statusText).toBe("Not Modified");
              console.time("text item 3");
              await expect(response.text()).resolves.toBe("");
              console.timeEnd("text item 3");
            }
            break;
        }
      }
      expect(count).toBe(3);
    });

    it("should parse a multipart/mixed response when cancelled", async () => {
      const chuncks = mockedResponseData.split(/(?=\r)/g);
      const chunckedStream = new ReadableStream({
        async pull(controller) {
          const chunck = chuncks.shift();
          if (chunck) {
            controller.enqueue(new TextEncoder().encode(chunck));
            // simulate a slow stream
            await new Promise((resolve) => setTimeout(resolve, 100));
          } else {
            controller.close();
          }
        },
      });

      const mockedResponse = new Response(chunckedStream, {
        headers: {
          // check continuation support
          "Content-Type": `multipart/mixed;
              boundary=batch_foobarbaz`,
        },
        status: 200,
        statusText: "OK",
      });

      const batchResponse = new BatchStreamResponse(mockedResponse);
      let count = 0;
      for await (const [contentId, response] of batchResponse) {
        expect(contentId).toBeDefined();
        expect(response).toBeDefined();
        switch (contentId) {
          case "response-item1:12930812@barnyard.example.com":
            {
              count++;
              expect(response.status).toBe(200);
              expect(response.statusText).toBe("OK");
              expect(response.headers.get("Content-Type")).toContain(
                "application/json"
              );
              await response.body?.cancel();
            }
            break;
          case "response-item2:12930812@barnyard.example.com":
            {
              count++;
              expect(response.status).toBe(200);
              expect(response.statusText).toBe("OK");
              expect(response.headers.get("Content-Type")).toContain(
                "application/json"
              );
              await expect(response.json()).resolves.toEqual({
                kind: "farm#animal",
                etag: "etag/sheep",
                selfLink: "/farm/v1/animals/sheep",
                animalName: "sheep",
                animalAge: 5,
                peltColor: "green",
              });
            }
            break;
          case "response-item3:12930812@barnyard.example.com":
            {
              count++;
              expect(response.status).toBe(304);
              expect(response.statusText).toBe("Not Modified");
              await expect(response.text()).resolves.toBe("");
            }
            break;
        }
      }
      expect(count).toBe(3);
    });
  });
});
