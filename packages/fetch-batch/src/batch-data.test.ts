import express from "express";
import type { AddressInfo } from "net";
import { BatchData } from "./batch-data";

function getUser1Req(port: number) {
  return new Request(`http://localhost:${port}/get`, {
    method: "GET",
    headers: new Headers({
      Accept: "application/json; charset=utf-8",
    }),
  });
}

function renameUser2Req(port: number) {
  return new Request(`http://localhost:${port}/patch`, {
    method: "PATCH",
    headers: new Headers({
      Accept: "application/json; charset=utf-8",
      "Content-Type": "application/json; charset=utf-8",
    }),
    body: JSON.stringify({
      name: "John Doe",
    }),
  });
}

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

    jest.useFakeTimers();
    jest.setSystemTime(new Date(2023, 1, 1));
  });

  afterAll((done) => {
    jest.useRealTimers();
    server.close(done);
  });

  it("should be able to batch requests", async () => {
    const getUser1 = getUser1Req(port);
    const renameUser2 = renameUser2Req(port);

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
  });

  it("should be able to iterate over requests", async () => {
    const getUser1 = getUser1Req(port);
    const renameUser2 = renameUser2Req(port);

    const body = new BatchData();
    body.addRequest(getUser1);
    body.addRequest(renameUser2);

    const requests: Request[] = [];
    for (const [, request] of body) {
      requests.push(request);
    }
    expect(requests).toEqual([getUser1, renameUser2]);

    const requests2: Request[] = [];
    for (const [, request] of body.entries()) {
      requests2.push(request);
    }
    expect(requests2).toEqual([getUser1, renameUser2]);

    expect(Array.from(body.requests())).toEqual([getUser1, renameUser2]);

    expect(Array.from(body.contentIds())).toEqual([
      "request-1-1675206000000@zodios.org",
      "request-2-1675206000000@zodios.org",
    ]);

    body.forEach((request, contentId) => {
      expect(request).toBe(body.getRequest(contentId));
    });

    expect(body.getContentId(getUser1)).toBe(
      "request-1-1675206000000@zodios.org"
    );
    expect(body.getContentId(renameUser2)).toBe(
      "request-2-1675206000000@zodios.org"
    );

    expect(body.boundary).toBe("batch__1675206000000__batch");
  });

  it("should be able to get request by content id", async () => {
    const getUser1 = getUser1Req(port);
    const renameUser2 = renameUser2Req(port);

    const body = new BatchData();
    body.addRequest(getUser1);
    body.addRequest(renameUser2);

    expect(body.hasRequest("request-1-1675206000000@zodios.org")).toBe(true);
    expect(body.getRequest("request-1-1675206000000@zodios.org")).toBe(
      getUser1
    );
    expect(body.hasRequest("request-2-1675206000000@zodios.org")).toBe(true);
    expect(body.getRequest("request-2-1675206000000@zodios.org")).toBe(
      renameUser2
    );
  });
});
