import { ctx } from "../context";
import { api } from "../../common/api";

export const app = ctx.nextApp();
const router = ctx.router(api);
app.use("/api", router);

router.get("/health", (req, res) => {
  res.status(200).json({ status: "ok" });
});
