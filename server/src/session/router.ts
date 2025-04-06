import { getRequestUser } from "@/user/user.action";
import express from "express";
import { findSessionByIdOrHash } from "./session.action";
import { compareDates } from "@/tools/date.utils";
const router = express.Router();

router.use(express.json());

router.get("/:id/update", async (req: any, res: any) => {
  const user = await getRequestUser(req);

  if (!user) {
    res.statusMessage = "User not found";
    return res.status(404).end();
  }

  const sessionId = req.params.id;
  const targetDate = req.query.date;

  const session = await findSessionByIdOrHash(sessionId).catch(err => {
	return null;
  });

  if (!session){
	return res.status(404).end();
  }

  const hasNewUpdates = compareDates(targetDate, session.updatedAt as string) < 0; 

  res.status(hasNewUpdates ? 200 : 404).end();
});

export default router;