import { Zodios } from "../../src/index";
import { articlesApi } from "./articles";
import { commentsApi } from "./comments";
import { followsApi } from "./follows";
import { followersApi } from "./followers";
import { userApi } from "./users";
import { pluginApiKey } from "./api-key-plugin";

export const devTo = new Zodios("https://dev.to/api", [
  ...articlesApi,
  ...commentsApi,
  ...followsApi,
  ...followersApi,
  ...userApi,
]);

devTo.use(
  pluginApiKey({
    getApiKey: async () => "<your dev.to api key>",
  })
);

devTo
  .get("/articles/:id", { params: { id: 2 } })
  .then((user) => console.log(user));
//        ^?
