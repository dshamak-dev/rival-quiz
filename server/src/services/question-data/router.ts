import express from "express";
import { findQuestionDataAndSync } from "./actions";
import { QuestionDataActionEnum } from "./model";
import { getRequestUser } from "../../user/user.action";

const router = express.Router();

router.use(express.json());

router.patch("/", async (req: any, response: any) => {
  const user = await getRequestUser(req);

  const userId = user?.id;

  if (!user || !userId) {
    response.statusMessage = "Invalid user";
    return response.status(401).end();
  }

  const action = req.body;
  const path = action?.path;

  switch (action?.type) {
    case QuestionDataActionEnum.SYNC: {
      if (!path?.questionId || !path?.sessionId) {
        response.statusMessage = "Invalid path";
        return response.status(400).end();
      }

      return findQuestionDataAndSync(path, true)
        .then((questionData) => {
          response.status(200).json(questionData);
        })
        .catch((err) => {
          console.error("Error synchronizing question data:", err);
          response.status(500).end();
        });
    }
  }

  response.statusMessage = "No action found for type: " + action?.type;
  response.status(404).end();
});

router.use(function (request, response, next:any) {
  next();
});

export default router;
