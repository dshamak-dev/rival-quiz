import { Router, json } from "express";
import fetch from "node-fetch";
import { parseCookies } from "../controls/request.controls";
import { parseSession } from "../controls/session.controls";
import { findUserByCreds } from "../controls/user.control";

const rivalApi = process.env.RIVAL_API;
const router = Router();

router.use("/api/games", json());

router.get("/api/games", async (req, res) => {
  const sessions = await fetch(`${rivalApi}/api/sessions?type=1`)
    .then((res) => res.json())
    .catch((error) => null);

  const games = sessions?.map(parseSession);

  res.status(200).json(games);
});

router.get("/api/game", async (req, res) => {
  const query = req.query;
  const sessionFilter = Object.entries(query)
    .map(([key, value]) => {
      return `${key}=${value}`;
    })
    .join("&");
  const game = await fetch(`${rivalApi}/api/session?${sessionFilter}`)
    .then((res) => res.json())
    .catch((error) => null);

  if (!game) {
    return res.status(404).end("Game not found");
  }

  const [error, user] = await findUserByCreds(req);

  res.status(200).json(parseSession(game, user));
});

router.post("/api/games", async (req, res) => {
  const [error, user] = await findUserByCreds(req);

  if (error || !user) {
    return res.status(403).end("Unauthorized");
  }

  const body = req.body;

  const [gameError, game] = await fetch(`${rivalApi}/api/sessions`, {
    method: "POST",
    headers: {
      "content-type": "application/json",
    },
    body: JSON.stringify({ ...body, ownerId: user._id }),
  })
    .then(async (res) => {
      if (res.status >= 400) {
        return [await res.text(), null];
      }

      return [null, await res.json()];
    })
    .catch((error) => {
      console.log("post error", error);
      return [error, null];
    });

  if (gameError || !game) {
    return res.status(400).end(gameError || "Invalid data");
  }

  res.status(200).json(parseSession(game, user));
});

router.put("/api/games/:id", async (req, res) => {
  const sessionId = req.params.id;
  const [error, user] = await findUserByCreds(req);

  if (error || !user || !sessionId) {
    return res.status(403).end(!sessionId ? "Invalid session" : "Unauthorized");
  }

  const body = req.body;

  const [gameError, game] = await fetch(
    `${rivalApi}/api/sessions/${sessionId}`,
    {
      method: "PUT",
      headers: {
        "content-type": "application/json",
      },
      body: JSON.stringify({ ...body, ownerId: user._id }),
    }
  )
    .then(async (res) => {
      if (res.status >= 400) {
        return [await res.text(), null];
      }

      return [null, await res.json()];
    })
    .catch((error) => {
      console.log("post error", error);
      return [error, null];
    });

  if (gameError || !game) {
    return res.status(400).end(gameError || "Invalid data");
  }

  res.status(200).json(parseSession(game, user));
});

router.post("/api/games/:id/user/:action", async (req, res) => {
  const sessionId = req.params.id;
  const action = req.params.action;

  if (!sessionId || !action) {
    return res.status(403).end(!sessionId ? "Invalid session" : "Unauthorized");
  }

  const body = req.body;

  const [gameError, game] = await fetch(
    `${rivalApi}/api/sessions/${sessionId}/user/${action}`,
    {
      method: "POST",
      headers: {
        "content-type": "application/json",
        cookie: parseCookies(req)
      },
      body: JSON.stringify(body),
    }
  )
    .then(async (res) => {
      if (res.status >= 400) {
        return [await res.text(), null];
      }

      return [null, await res.json()];
    })
    .catch((error) => {
      return [error.message, null];
    });

  if (gameError || !game) {
    return res.status(400).end(gameError?.message || gameError || "Invalid data");
  }

  const [error, user] = await findUserByCreds(req);

  res.status(200).json(parseSession(game, user));
});

router.get("/api/games/:id/broadcast", async (req, res) => {
  const id = req.params.id;
  res.header('cookie', req.headers.cookie);
  res.header('Connection', "keep-alive");
  res.redirect(`${rivalApi}/api/sessions/${id}/broadcast`);
});

export default router;
