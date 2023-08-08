import express from "express";
import type { AddressInfo } from "net";
import { BatchRequest } from "./batch-request";

const responseData = `Preamble
can be anything and should be ignored
--batch__1675206000000__batch
Content-Type: application/http
Content-ID: <response-PLACEHOLDER1>

HTTP/1.1 200 OK
Content-Type: application/json
ETag: "etag/pony"

{
  "id": 1,
  "name": "john doe"
}
--batch__1675206000000__batch
Content-Type: application/http
Content-ID: <response-PLACEHOLDER2>

HTTP/1.1 200 OK
Content-Type: application/json;
  charset=UTF-8
ETag: "etag/sheep"

{
  "id": 2,
  "name": "jane doe"
}
--batch__1675206000000__batch
Content-Type: application/http
Content-ID: <response-PLACEHOLDER3>

HTTP/1.1 304 Not Modified


--batch__1675206000000__batch--
Epilogue can be anything
and should be ignored`.replace(/\n/g, "\r\n");

describe("BatchRequest", () => {
  let app: express.Express;
  let server: ReturnType<typeof app.listen>;
  let port: number;

  beforeAll(() => {
    const app = express();
    app.use(express.json());
    app.use(express.raw({ type: "multipart/mixed" }));

    app.post("/batch", (req, res) => {
      console.log("received batch request");
      res.setHeader(
        "Content-Type",
        "multipart/mixed; boundary=batch__1675206000000__batch"
      );
      const body = req.body.toString();
      console.log(`received body: ${body}`);
      // extract the requests ids
      const regex = /content-id:\s*<([^>]+)>/g;
      const matches = [...body.matchAll(regex)];
      let response = responseData;
      matches
        .map((match) => match[1])
        .forEach((id, i) => {
          // replace the response placeholders with the actual response
          response = response.replace(`PLACEHOLDER${i + 1}`, id);
        });
      console.log(`sending response: ${response}`);
      res.status(200).send(response);
    });

    app.get("/users/:id", (req, res) => {
      console.log("received user request");
      res.status(200).json({
        id: req.params.id,
        name: "john doe",
      });
    });

    server = app.listen(0);
    port = (server.address() as AddressInfo).port;
  });

  afterAll((done) => {
    server.close(done);
  });

  it("should be able to fetch one request", async () => {
    const client = new BatchRequest(`http://localhost:${port}/batch`, {
      method: "POST",
    });
    const user7 = await client
      .fetch(`http://localhost:${port}/users/7`)
      .then((res) => res.json());

    expect(user7).toEqual({
      id: "7",
      name: "john doe",
    });
  });

  it("should be able to fetch multiple requests", async () => {
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
      client.fetch(`http://localhost:${port}/users/1`),
    ]);

    expect(user1).toEqual({
      id: 1,
      name: "john doe",
    });
    expect(user2).toEqual({
      id: 2,
      name: "jane doe",
    });
    expect(nothing.status).toBe(304);
  });
});
