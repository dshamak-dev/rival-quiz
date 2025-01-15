import express from "express";
import { createUserAction, getUserActions } from "./user-action.action";
import { getRequestUser } from "../user/user.action";

const _router = express.Router();

_router.use(express.json());

_router.get("/:sessionId", async (req: any, res: any) => {
  const sessionId = req.params.sessionId;

  if (!sessionId) {
    res.statusMessage = "Invalid session";
    return res.status(401).end();
  }

  const user = await getRequestUser(req);

  const userId = user?.id;

  if (!userId) {
    res.statusMessage = "Invalid user";
    return res.status(401).end();
  }

  const actions = await getUserActions({ sessionId, userId }).catch(() => []);

  res.status(201).json(actions);
});

_router.post("/", async (req: any, res: any) => {
  const payload = req.body;

  if (!payload) {
    res.statusMessage = "Invalid payload data.";
    return res.status(400).end();
  }

  const user = await getRequestUser(req);

  const userId = user?.id;

  if (!userId) {
    res.statusMessage = "Invalid user";
    return res.status(401).end();
  }

  const type = payload.type;

  const actionData = await createUserAction({
    ...req.body,
    userId: userId,
  });

  res.status(201).json(actionData);
});

_router.use(function (request, response, next:any) {
  next();
});

export default _router;
