import { Router } from "express";
import cookieParser from "cookie-parser";
import fetch from "node-fetch";
import { findUserByCreds } from "server/controls/user.control";
import { parseSession } from "server/controls/session.controls";

const router = Router();

const rivalApi = process.env.RIVAL_API;
const tokenDomain = process.env.TOKEN_DOMAIN;

router.use(cookieParser());

router.delete("/api/auth", (req, res) => {
  res.clearCookie("rivalAccessToken", {
    httpOnly: true,
    secure: false,
    path: "/",
    domain: tokenDomain,
  });

  res.status(200).end();
});

router.get("/api/auth", async (req, res) => {
  const host = `${req.headers.referer}`;

  const [error, user] = await findUserByCreds(req);

  const authUrl = `${rivalApi}/auth?redirectUrl=${host}&tokenDomain=${tokenDomain}`;

  if (user) {
    return res.json({ user, authUrl }).status(200);
  }

  res
    .set({
      "Cache-Control": "no-cache",
    })
    .status(301)
    .end(authUrl);
});

router.get("/api/user/games", async (req, res) => {
  const [error, user] = await findUserByCreds(req);

  if (error || !user) {
    return res.status(403).end("Unauthorized");
  }

  const games = [];

  if (!user.sessions?.length) {
    return res.status(200).json([]);
  }

  for (const sessionId of user.sessions) {
    const session = await fetch(`${rivalApi}/api/sessions?_id=${sessionId}`)
      .then((res) => res.json())
      .then((res) => res[0])
      .catch((error) => null);

    if (session && [1, 3].includes(session.type)) {
      games.push({
        ...parseSession(session),
        isAdmin: session.ownerId === user._id,
      });
    }
  }

  res.status(200).json(games);
});

export default router;
