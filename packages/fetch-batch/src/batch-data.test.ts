import express from "express";
import type { AddressInfo } from "net";
import { BatchData } from "./batch-data";

describe("BatchData", () => {
  let app: express.Express;
  let server: ReturnType<typeof app.listen>;
  let port: number;

  beforeAll(() => {
    const app = express();
    app.use(express.raw({ type: "multipart/mixed" }));

    app.post("/batch", (req, res) => {
      console.log("received batch request");
      res.json({
        url: req.url,
        method: req.method,
        headers: req.headers,
        data: req.body.toString(),
      });
    });

    server = app.listen(0);
    port = (server.address() as AddressInfo).port;
  });

  afterAll((done) => {
    server.close(done);
  });

  it("should be able to batch requests", async () => {
    jest.useFakeTimers();
    jest.setSystemTime(new Date(2023, 1, 1));
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
    }).then((response) => response.json());

    expect(batched.url).toBe("/batch");
    expect(batched.method).toBe("POST");
    expect(batched.headers["content-type"]).toContain("multipart/mixed");
    expect(batched.data).toMatchSnapshot();
    jest.useRealTimers();
  });
});
