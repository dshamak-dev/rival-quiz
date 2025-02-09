import express from "express";
import { authorizeUser, createUser, findUserByQuery } from "./user.action";
import {
  encryptPassword,
  generateToken,
  getAuthToken,
  parseToken,
} from "./user.utils";
import { createWallet } from "../services/wallet/actions";
import { findUserByToken } from "./api";

const useRouter = express.Router();

useRouter.use(express.json());

useRouter.post("/create", async (req: any, res: any, next: any) => {
  const body = req.body || null;

  const [user, error] = await createUser(body)
    .then((res) => {
      return [res, null];
    })
    .catch((err) => {
      return [null, err];
    });

  if (!user || error) {
    res.statusMessage = error || "Something went wrong. Please try again later";
    return res.status(400).end();
  }

  await createWallet(user.id).catch(err => null);

  const token = authorizeUser(user, res);

  res.status(201).json({
    user,
    token,
  });
});

useRouter.post("/login", async (req: any, res: any) => {
  const body = req.body;

  if (!body || !body.email || !body.password) {
    res.statusMessage = "Invalid email or password";
    return res.status(400).end();
  }

  const user = await findUserByQuery({
    email: body.email,
    password: encryptPassword(body.password),
  }).catch((err) => null);

  if (!user) {
    res.statusMessage = "Wrong username or password";
    return res.status(400).end();
  }

  authorizeUser(user, res);

  res.status(200).json(user);
});

useRouter.get("/current", async (req: any, res: any) => {
  const token = getAuthToken(req);

  const user = await findUserByToken(token).catch((err) => null);

  if (!user) {
    res.statusMessage = "Wrong username or password";
    return res.status(400).end();
  }

  res.status(200).json(user).end();
});

useRouter.use(function (request, response, next: any) {
  next();
});

export default useRouter;
