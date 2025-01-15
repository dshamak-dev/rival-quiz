import express from "express";
import {
  authorizeUser,
  createUserWithPassword,
  findUserByQuery,
} from "./user.action";
import {
  encryptPassword,
  generateToken,
  getAuthToken,
  parseToken,
} from "./user.utils";
import { createWallet } from "../services/wallet/actions";

const useRouter = express.Router();

useRouter.use(express.json());

useRouter.post("/create", async (req: any, res: any, next:any) => {
  const body = req.body || null;

  if (!body || !body.email || !body.password) {
    res.statusMessage = "Invalid email or password";
    return res.status(400).end();
  }

  const [user, error] = await createUserWithPassword(body.email, body.password)
    .then((res) => {
      return [res, null];
    })
    .catch((err) => {
      console.error(err);

      return [null, err.message];
    });

  if (error) {
    res.statusMessage = error || "Something went wrong. Please try again later";
    return res.status(400).end();
  }

  await createWallet(user.id);

  authorizeUser(user, res);

  res.status(201).json({
    user,
    token: generateToken(user),
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

  if (!token) {
    res.statusMessage = "No token provided";
    return res.status(401).end();
  }

  const decoded = parseToken(token);

  if (!decoded) {
    res.statusMessage = "Invalid token";
    return res.status(403).end();
  }

  const user = await findUserByQuery({
    email: decoded.email,
    password: decoded.password,
  }).catch((err) => null);

  if (!user) {
    res.statusMessage = "Wrong username or password";
    return res.status(400).end();
  }

  res.status(200).json(user).end();
});

useRouter.use(function (request, response, next:any) {
  next();
});

export default useRouter;
