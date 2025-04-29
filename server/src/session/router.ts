import { getRequestUser } from "@/user/user.action";
import express from "express";
import { findSessionByIdOrHash } from "./session.action";
import { compareDates } from "@/tools/date.utils";
import { findQuestionData } from "@/services/question-data/actions";
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

  const session = await findSessionByIdOrHash(sessionId).catch((err) => {
    return null;
  });

  if (!session) {
    return res.status(404).end();
  }

  let hasUpdates = compareDates(targetDate, session.updatedAt as string) < 0;
  const questionId = session.activeQuestionId;

  if (!hasUpdates && questionId) {
    const questionData = await findQuestionData({
      sessionId,
      questionId,
    }).catch(() => null);

    hasUpdates =
      questionData != null
        ? compareDates(targetDate, questionData.updatedAt as string) < 0
        : false;
  }

  res.status(hasUpdates ? 200 : 404).end();
});

export default router;
