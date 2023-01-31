import { ctx } from "../context";
import { userRouter } from "./users";

export const app = ctx.nextApp();
app.use("/api", userRouter);
