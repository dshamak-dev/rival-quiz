import mongoose from "mongoose";
import { UserActionSchema } from "./user-action.schema";
import { UserActionTypes } from "./user-action.model";
import { findQuestionDataAndSync } from "../services/question-data/actions";
import { QuestionDataStatusTypes } from "../services/question-data/model";

export const userActionDBModel = mongoose.model(
  "user-actions",
  UserActionSchema
);

export async function createUserAction(payload) {
  switch (payload.type) {
    case UserActionTypes.SUBMIT_ANSWER: {
      // const updated = await addSessionUser(payload.sessionId, payload.userId).catch(err => {
      //   console.error("Error adding user to session:", err);
      //   return null;
      // });

      // if (!updated) {
      //   return Promise.reject("Failed to add user to session");
      // }

      const questionId = payload.questionId;
      const sessionId = payload.sessionId;

      if (questionId && sessionId) {
        await findQuestionDataAndSync(
          {
            questionId,
            sessionId,
            state: QuestionDataStatusTypes.Draft,
          },
          true
        ).catch((err) => {
          console.error("Error syncing question data:", err);
          return null;
        });
      }

      return userActionDBModel.create(payload);
    }
    case UserActionTypes.REMOVE_ANSWER: {
      // await removeSessionUser(payload.sessionId, payload.userId);
      return userActionDBModel.deleteOne({
        userId: payload.userId,
        sessionId: payload.sessionId,
        questionId: payload.questionId,
      });
    }
  }

  return null;
}

export async function getUserActions(query) {
  return userActionDBModel
    .find(query)
    .then((res) => res.map((it: any) => it.json));
}
