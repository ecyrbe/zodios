import express from "express";
import type { AddressInfo } from "net";
import { BatchRequest } from "./batch-request";
import { makeBatchResponse } from "./batch-response";
import { makeBatchStreamResponse } from "./batch-response-stream";
import { makeReactNativeBatchResponse } from "./batch-response-react-native";
import { makeBatchData } from "./batch-data";
import { makeReactNativeBatchData } from "./batch-data-react-native";

const responseDatas = [
  `Preamble
can be anything and should be ignored
--batch__1675206000000__batch
Content-Type: application/http
Content-ID: <response-PLACEHOLDER1>

`,
  `HTTP/1.1 200 OK
Content-Type: application/json
ETag: "etag/pony"

`,
  `{
  "id": 1,`,
  `
  "name": "john doe"
}
`,
  `--batch__1675206000000__batch
Content-Type: application/http
Content-ID: <response-PLACEHOLDER2>

`,
  `HTTP/1.1 200 OK
Content-Type: application/json;`,
  `
  charset=UTF-8
ETag: "etag/sheep"

`,
  `{
  "id": 2,`,
  `
  "name": "jane doe"
}
`,
  `--batch__1675206000000__batch
Content-Type: application/http
Content-ID: <response-PLACEHOLDER3>

`,
  `HTTP/1.1 304 Not Modified


`,
  `--batch__1675206000000__batch--
Epilogue can be anything
and should be ignored`,
];

const responseData = responseDatas.join("").replace(/\n/g, "\r\n");

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

describe.each([
  {
    makeBatchedResponse: makeBatchResponse,
    makeBatchedData: makeBatchData,
    batch: "/batch",
  },
  {
    makeBatchedResponse: makeBatchResponse,
    makeBatchedData: makeBatchData,
    batch: "/batch-stream",
  },
  {
    makeBatchedResponse: makeBatchStreamResponse,
    makeBatchedData: makeBatchData,
    batch: "/batch",
  },
  {
    makeBatchedResponse: makeBatchStreamResponse,
    makeBatchedData: makeBatchData,
    batch: "/batch-stream",
  },
  {
    makeBatchedResponse: makeReactNativeBatchResponse,
    makeBatchedData: makeReactNativeBatchData,
    batch: "/batch",
  },
  {
    makeBatchedResponse: makeReactNativeBatchResponse,
    makeBatchedData: makeReactNativeBatchData,
    batch: "/batch-stream",
  },
])(
  `BatchRequest $makeBatchedData.name $makeBatchedData.name with endpoint '$batch'`,
  ({ makeBatchedResponse, makeBatchedData, batch }) => {
    let app: express.Express;
    let server: ReturnType<typeof app.listen>;
    let port: number;

    beforeAll(() => {
      const app = express();
      app.use(express.json());
      app.use(express.raw({ type: "multipart/mixed" }));

      app.post("/batch", (req, res) => {
        res.setHeader(
          "Content-Type",
          "multipart/mixed; boundary=batch__1675206000000__batch"
        );
        const body = req.body.toString();
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
        res.status(200).send(response);
      });

      app.post("/batch-stream", async (req, res) => {
        res.setHeader(
          "Content-Type",
          "multipart/mixed; boundary=batch__1675206000000__batch"
        );
        const body = req.body.toString();
        // extract the requests ids
        const regex = /content-id:\s*<([^>]+)>/g;
        const matches = [...body.matchAll(regex)];
        let responses = responseDatas.map((response) =>
          response.replace(/\n/g, "\r\n")
        );
        matches
          .map((match) => match[1])
          .forEach((id, i) => {
            // replace the response placeholders with the actual response
            responses = responses.map((response) =>
              response.replace(`PLACEHOLDER${i + 1}`, id)
            );
          });
        res.writeHead(200);
        for await (const response of responses) {
          res.write(response);
          await sleep(100);
        }
        res.end();
      });

      // simulate a proxy timeout that don't handle multipart/mixed
      app.post("/batch-pending", async (req, res) => {
        await sleep(1000);
        res.status(504).json({
          error: "timeout",
        });
      });

      // simulate an internal server error that don't send back multipart/mixed
      app.post("/batch-error", (req, res) => {
        res.status(500).json({
          error: "internal server error",
        });
      });

      app.get("/users/:id", (req, res) => {
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
      const client = new BatchRequest(
        {
          input: `http://localhost:${port}${batch}`,
          init: {
            method: "POST",
          },
        },
        {
          makeBatchResponse: makeBatchedResponse,
          makeBatchData: makeBatchedData,
        }
      );
      const user7 = await client
        .fetch(`http://localhost:${port}/users/7`)
        .then((res) => res.json());

      expect(user7).toEqual({
        id: "7",
        name: "john doe",
      });
    });

    it("should be able to fetch multiple requests", async () => {
      const client = new BatchRequest(
        {
          input: `http://localhost:${port}${batch}`,
          init: {
            method: "POST",
          },
        },
        {
          makeBatchResponse: makeBatchedResponse,
          makeBatchData: makeBatchedData,
        }
      );
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

    it("should error if batch endpoint errors", async () => {
      const client = new BatchRequest(
        {
          input: `http://localhost:${port}/batch-error`,
          init: {
            method: "POST",
          },
        },
        {
          makeBatchResponse: makeBatchedResponse,
          makeBatchData: makeBatchedData,
        }
      );

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
        error: "internal server error",
      });
      expect(user2).toEqual({
        error: "internal server error",
      });
      expect(nothing.status).toBe(500);
    });

    it("should cancel one request if asked to before batching", async () => {
      const controller = new AbortController();
      controller.abort();
      const client = new BatchRequest(
        {
          input: `http://localhost:${port}${batch}`,
          init: {
            method: "POST",
          },
        },
        {
          makeBatchResponse: makeBatchedResponse,
          makeBatchData: makeBatchedData,
        }
      );

      const [user1Promise, user2Promise, nothingPromise] = [
        client
          .fetch(`http://localhost:${port}/users/1`)
          .then((res) => res.json()),
        client.fetch(`http://localhost:${port}/users/2`, {
          signal: controller.signal,
        }),
        client.fetch(`http://localhost:${port}/users/1`),
      ];

      const [user1, user2, nothing] = await Promise.allSettled([
        user1Promise,
        user2Promise,
        nothingPromise,
      ]);

      expect(user1.status).toBe("fulfilled");
      expect(user2.status).toBe("rejected");
      expect(nothing.status).toBe("fulfilled");
    });

    it("should cancel one request if asked to after batching", async () => {
      const controller = new AbortController();
      const client = new BatchRequest(
        {
          input: `http://localhost:${port}/batch-stream`,
          init: {
            method: "POST",
          },
        },
        {
          makeBatchResponse: makeBatchedResponse,
          makeBatchData: makeBatchedData,
        }
      );

      const [user1Promise, user2Promise, nothingPromise] = [
        client
          .fetch(`http://localhost:${port}/users/1`)
          .then((res) => res.json()),
        client
          .fetch(`http://localhost:${port}/users/2`, {
            signal: controller.signal,
          })
          .then((res) => {
            controller.abort();
            return res.json();
          }),
        client.fetch(`http://localhost:${port}/users/1`),
      ];

      const [user1, user2, nothing] = await Promise.allSettled([
        user1Promise,
        user2Promise,
        nothingPromise,
      ]);

      if (nothing.status === "rejected") {
        expect(nothing.reason).toEqual("");
      }

      expect(user1.status).toBe("fulfilled");
      expect(user2.status).toBe("rejected");
      expect(nothing.status).toBe("fulfilled");
    });

    it("should not cancel requests if asked to before batching", async () => {
      const client = new BatchRequest(
        {
          input: `http://localhost:${port}${batch}`,
          init: {
            method: "POST",
          },
        },
        {
          makeBatchResponse: makeBatchedResponse,
          makeBatchData: makeBatchedData,
        }
      );

      client.cancel();

      const [user1Promise, user2Promise, nothingPromise] = [
        client
          .fetch(`http://localhost:${port}/users/1`)
          .then((res) => res.json()),
        client.fetch(`http://localhost:${port}/users/2`),
        client.fetch(`http://localhost:${port}/users/1`),
      ];

      const [user1, user2, nothing] = await Promise.allSettled([
        user1Promise,
        user2Promise,
        nothingPromise,
      ]);

      expect(user1.status).toBe("fulfilled");
      expect(user2.status).toBe("fulfilled");
      expect(nothing.status).toBe("fulfilled");
    });

    it("should cancel all requests if asked to after batching", async () => {
      const client = new BatchRequest(
        {
          input: `http://localhost:${port}${batch}`,
          init: {
            method: "POST",
          },
        },
        {
          makeBatchResponse: makeBatchedResponse,
          makeBatchData: makeBatchedData,
        }
      );

      const [user1Promise, user2Promise, nothingPromise] = [
        client
          .fetch(`http://localhost:${port}/users/1`)
          .then((res) => res.json()),
        client.fetch(`http://localhost:${port}/users/2`),
        client.fetch(`http://localhost:${port}/users/1`),
      ];
      client.cancel();

      const [user1, user2, nothing] = await Promise.allSettled([
        user1Promise,
        user2Promise,
        nothingPromise,
      ]);

      expect(user1.status).toBe("rejected");
      expect(user2.status).toBe("rejected");
      expect(nothing.status).toBe("rejected");

      const [user1Promise2, user2Promise2, nothingPromise2] = [
        client.fetch(`http://localhost:${port}/users/1`),
        client.fetch(`http://localhost:${port}/users/2`),
        client.fetch(`http://localhost:${port}/users/1`),
      ];

      const [user12, user22, nothing2] = await Promise.allSettled([
        user1Promise2,
        user2Promise2,
        nothingPromise2,
      ]);

      expect(user12.status).toBe("fulfilled");
      expect(user22.status).toBe("fulfilled");
      expect(nothing2.status).toBe("fulfilled");
    });

    it("should cancel all individual requests if asked to after batching", async () => {
      const client = new BatchRequest(
        {
          input: `http://localhost:${port}/batch-pending`,
          init: {
            method: "POST",
          },
        },
        {
          makeBatchResponse: makeBatchedResponse,
          makeBatchData: makeBatchedData,
        }
      );

      const controller = new AbortController();

      const user1Promise = client
        .fetch(`http://localhost:${port}/users/1`, {
          signal: controller.signal,
        })
        .then((res) => res.json());
      const user2Promise = client
        .fetch(`http://localhost:${port}/users/2`, {
          signal: controller.signal,
        })
        .then((res) => res.json());
      const nothingPromise = client
        .fetch(`http://localhost:${port}/users/1`, {
          signal: controller.signal,
        })
        .then((res) => res.json());
      await sleep(100);
      controller.abort();

      await expect(user1Promise).rejects.toThrow("Aborted");
      await expect(user2Promise).rejects.toThrow("Aborted");
      await expect(nothingPromise).rejects.toThrow("Aborted");

      const [user12, user22, nothing2] = await Promise.all([
        client
          .fetch(`http://localhost:${port}/users/1`)
          .then((res) => res.json()),
        client
          .fetch(`http://localhost:${port}/users/2`)
          .then((res) => res.json()),
        client
          .fetch(`http://localhost:${port}/users/1`)
          .then((res) => res.json()),
      ]);

      expect(user12).toEqual({
        error: "timeout",
      });
      expect(user22).toEqual({
        error: "timeout",
      });
      expect(nothing2).toEqual({
        error: "timeout",
      });
    });
  }
);
