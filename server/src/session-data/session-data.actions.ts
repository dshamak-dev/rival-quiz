import mongoose from "mongoose";
import { SessionDataSchema } from "./session-data.schema";
import { getQuestionData } from "../question/question.action";
import {
  calculateUserSummaryFromVotes,
  normalizeSessionData,
} from "./session-data.utils";
import { SessionDataStateTypes } from "./session-data.model";
import { getSessionById } from "../session/session.action";
import { findSessionData } from "./session-data.api";
import { findManyQuestionData } from "../services/question-data/actions";
import { QuestionDataStatusTypes } from "../services/question-data/model";
import { QuestionDataDTO } from "@/question/quistion.model";

export const sessionDataDBModel = mongoose.model(
  "sessions-data",
  SessionDataSchema
);

export async function createSessionData(session) {
  const sessionId = session.id;

  const activeSessionData = await findActiveSessionDataBySessionId(sessionId);

  // TODO: reset previous if possible
  if (activeSessionData) {
    await sessionDataDBModel.updateMany(
      {
        sessionId,
        state: {
          $in: [SessionDataStateTypes.Active, SessionDataStateTypes.Completed],
        },
      },
      { state: SessionDataStateTypes.Archived }
    );
  }

  const activeQuestionId =
    session.questios?.find((q) => !q.hasAnswer)?.id || null;

  const totalUsers = session.users.length;

  const votesByQuestion = {};
  const targetQuestions = session.activeQuestionId
    ? [session.activeQuestionId]
    : new Set(session.questions.map((q) => q.id));

  for (const questionId of targetQuestions) {
    const _qData = await getQuestionData(sessionId, questionId);

    votesByQuestion[questionId] = _qData;
  }

  const data: any = {
    sessionId,
    totalUsers,
    votesByQuestion,
    state: SessionDataStateTypes.Active,
    activeQuestionId,
  };

  return sessionDataDBModel.create(data);
}

export async function findSessionDataAndComplete(query) {
  const sessionData = await findSessionData(query);

  if (!sessionData) {
    return Promise.reject("No active session data found.");
  }

  const session = await getSessionById(sessionData.sessionId).catch((err) => {
    return null;
  });

  if (!session) {
    throw new Error("Session not found");
  }

  return completeSessionData(sessionData.id, session);
}

export async function completeSessionData(id, session) {
  const sessionData = await findSessionDataById(id);

  if (!sessionData) {
    throw new Error("Session data not found");
  }

  const sessionId = session.id;

  const { userScores, votesByQuestion } = await calculateSessionDataUserScores(
    sessionId
  );

  return sessionDataDBModel
    .findByIdAndUpdate(
      sessionData.id,
      { userScores, votesByQuestion, state: 2 },
      { new: true }
    )
    .then(normalizeSessionData);
}

export async function calculateSessionDataUserScores(sessionId) {
  const questionDataList = await findManyQuestionData({
    sessionId,
    state: {
      $in: [QuestionDataStatusTypes.Locked, QuestionDataStatusTypes.Completed],
    },
  });

  const votesByQuestion: Record<QuestionDataDTO["id"], QuestionDataDTO> = {};

  questionDataList.forEach((qData) => {
    votesByQuestion[qData.questionId] = qData;
  });

  const userScores = await calculateUserSummaryFromVotes(votesByQuestion).catch(
    (err) => {
      return null;
    }
  );

  return { userScores, votesByQuestion };
}

export async function findSessionDataBySessionId(sessionId) {
  return findActiveSessionDataBySessionId(sessionId);
}

export async function findActiveSessionDataBySessionId(sessionId) {
  return sessionDataDBModel
    .findOne({ sessionId, state: 0 })
    .then(normalizeSessionData);
}

export async function findSessionDataById(id) {
  return sessionDataDBModel.findById(id).then(normalizeSessionData);
}

export async function archiveSessionData(sessionDataId) {
  return sessionDataDBModel
    .findByIdAndUpdate(sessionDataId, { state: 3 }, { new: true })
    .then(normalizeSessionData);
}
