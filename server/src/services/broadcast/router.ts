import express from "express";
import { broadcastManager, BroadcastEntityEnum } from "./model";

const router = express.Router();

router.use(express.json());

router.get("/ping", async (req: any, res: any) => {
  const message = req.query.message || "Ping";

  const broadcastData = {
    entity: BroadcastEntityEnum.OTHER,
    message: message,
  };

  broadcastManager.send(broadcastData);

  res.status(200).json(broadcastData);
});

router.use(function (request, response, next: any) {
  next();
});

export default router;
