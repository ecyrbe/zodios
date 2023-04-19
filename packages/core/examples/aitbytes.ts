import { api } from "./airbytes-api";

api
  .post("/v1/connections/list", {
    body: {
      workspaceId: "123",
    },
  })
  .then((res) => {
    console.log(res);
  });
