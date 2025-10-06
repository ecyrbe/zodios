import { Zodios } from "../../src/index";
import { articlesApi } from "./articles";
import { commentsApi } from "./comments";
import { followsApi } from "./follows";
import { followersApi } from "./followers";
import { userApi } from "./users";
import { pluginApiKey } from "./api-key-plugin";

const devTo = new Zodios("https://dev.to/api", [
  ...articlesApi,
  ...commentsApi,
  ...followsApi,
  ...followersApi,
  ...userApi,
]);

(async () => {
  
  devTo.use(
    pluginApiKey({
      getApiKey: async () => "<your dev.to api key>",
    })
  );
  
  const result = await devTo.get("/articles/:id", {
    params: { id: 194541 },
  });

  console.log(`result`, result);
})()

