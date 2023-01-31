import { ctx } from "../context";
import { userApi } from "../../common/api";

const users = [
  {
    id: 1,
    name: "John Doe",
    age: 30,
    email: "john.doe@test.com",
  },
];

export const userRouter = ctx.router(userApi);

userRouter.get("/users", (req, res) => {
  return res.status(200).json(users);
});

userRouter.get("/users/:id", (req, res) => {
  const user = users.find((u) => u.id === req.params.id);
  if (!user) {
    return res.status(404).json({
      error: {
        code: 404,
        message: "User not found",
      },
    });
  }
  return res.status(200).json(user);
});

userRouter.post("/users", (req, res) => {
  const id = users.length + 1;
  const user = { ...req.body, id };
  users.push(user);
  return res.status(201).json(user);
});
