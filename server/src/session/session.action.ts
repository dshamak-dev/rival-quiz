import mongoose from "mongoose";
import { SessionSchema } from "./session.schema";
import {
  archiveSessionData,
  completeSessionData,
  createSessionData,
  findActiveSessionDataBySessionId,
} from "../session-data/session-data.actions";
import { normalizeSession } from "./session.utils";
import {
  createTransaction,
  findTransaction,
  validateTransactionById,
} from "../services/transaction/action";
import {
  createQuestionData,
  findQuestionDataAndSync,
  syncQuestionData,
} from "../services/question-data/actions";
import {
  SessionDataDTO,
  SessionDataStateTypes,
} from "../session-data/session-data.model";
import { findSessionData } from "../session-data/session-data.api";
import { SessionStateType } from "./session.model";
import { expandResponse } from "@shared/async/helpers";
import { addLog } from "@/services/logger/api";
import { SessionTypes } from "@shared/session/type";
import { ID } from "@shared/common/model";
import {
  TransactionParty,
  TransactionPayload,
} from "@/services/transaction/type";
import { createNotification } from "@/services/notification/api";
import { TransactionStatusEnum } from "@/services/transaction/model";

export const sessionDBModel = mongoose.model("sessions", SessionSchema);

export function createSession(sessionPayload) {
  return sessionDBModel
    .create(sessionPayload)
    .then((res) => normalizeSession(res));
}

export function updateSession(id, sessionPayload) {
  return sessionDBModel
    .findByIdAndUpdate(id, sessionPayload, { new: true })
    .then((res) => normalizeSession(res));
}

export function deleteSession(id) {
  return sessionDBModel.findByIdAndDelete(id);
}

export function getAllSessions() {
  return sessionDBModel.find().then((res) => res.map(normalizeSession));
}

export function getSessionById(id) {
  return sessionDBModel.findById(id).then((res) => normalizeSession(res));
}

export async function findSessionByIdOrHash(value: string) {
  let object = await sessionDBModel
    .findOne({ hash: value })
    .catch((err) => null);

  if (!object) {
    object = await sessionDBModel.findById(value).catch((err) => null);
  }

  if (object) {
    return normalizeSession(object);
  }

  return null;
}

export function getSessionsByOwner(ownerID) {
  return sessionDBModel.find({ ownerID }).then((res) => normalizeSession(res));
}

export function addSessionUser(sessionId, userId) {
  return sessionDBModel
    .findOneAndUpdate(
      { _id: sessionId, users: { $ne: userId } },
      { $push: { users: userId } },
      { new: true }
    )
    .then((res) => normalizeSession(res));
}

export function removeSessionUser(sessionId, userId) {
  return sessionDBModel
    .findOneAndUpdate(
      { _id: sessionId },
      { $pull: { users: userId } },
      { new: true }
    )
    .then((res) => normalizeSession(res));
}

export async function patchSession(id, payload) {
  let session = await getSessionById(id);

  if (!session) {
    return null;
  }

  const origin = Object.assign({}, session);
  const [entity, param] = payload.path.split(".");

  switch (entity) {
    case "questions": {
      const questionIndex = session.questions?.findIndex(
        (q) => (q._id || q.id).toString() === param
      );

      if (session.questions && questionIndex >= 0) {
        session.questions[questionIndex] = payload.value;
      }
      break;
    }
    case "info": {
      const { state, ...fields } = payload.value;
      Object.entries(fields).forEach(([key, value]) => {
        session[key] = value;
      });

      if (state !== undefined && origin.state !== state) {
        session.state = state;

        const [updates, error] = await expandResponse(
          setSessionState(session, state)
        );

        if (error || !updates) {
          return Promise.reject(error || "Failed to change session state");
        }

        Object.assign(session, updates || {});
      }
      break;
    }
    default: {
      Object.entries(payload.value).forEach(([key, value]) => {
        session[key] = value;
      });
    }
  }

  const updatedSession = await updateSession(id, session);

  return updatedSession;
}

export async function setSessionState(session, nextState: SessionStateType) {
  if (!session) {
    return null;
  }

  const sessionId = session.id;
  let updates = Object.assign({}, session);

  switch (nextState) {
    case SessionStateType.Locked: {
      // session.lockedBy = session.info.createdBy;
      /**
       * 1. Check previous locked data and remove it
       * 2. Calculate session data and stats
       * 3. Lock session
       * 4. Create lock record in session-data table
       * 5. Return updated session
       */
      // 2. Calculate session data and stats
      // const data = await createSessionData(session);
      // const question = session.questions.find(
      //   (question) => question.id === session.activeQuestionId
      // );

      const [questionData, questionDataError] = await findQuestionDataAndSync({
        sessionId,
        questionId: session.activeQuestionId,
      })
        .then((result) => {
          return [result, null];
        })
        .catch((error) => {
          return [null, error];
        });

      if (!questionData) {
        return Promise.reject(
          questionDataError || "Failed to create question data"
        );
      }

      // 3. Lock session
      updates.state = nextState;

      if (session.state === SessionStateType.Published) {
        updates.pool = updates.pool || session.users?.length || 0;
      }

      const activeQuestionIndex = session.questions.findIndex(
        (question, index) => question.hasAnswer === false
      );

      const hasNextQuestion = session.questions.some(
        (question, index) =>
          index !== activeQuestionIndex && question.hasAnswer === false
      );

      updates.hasNextQuestion = hasNextQuestion;

      break;
    }
    case SessionStateType.Published: {
      // If previous state was locked, unlock it and remove lock record
      if (session.type === SessionTypes.SPONSOR) {
        const from: TransactionParty = { id: session.ownerId, type: "user" };
        const to: TransactionParty = { id: "0", type: "system" };
        const payload: TransactionPayload = {
          unique: true,
          type: "deposit",
          amount: session.settings.pool,
          details: `Sponsorship deposit for session ${session.title}`,
        };

        const pendingDeposit = await findTransaction({
          senderId: from.id,
          receiverId: to.id,
          status: TransactionStatusEnum.Pending,
        });
        const hasPending = pendingDeposit != null;

        const [transaction, transactionError] = await (hasPending
          ? Promise.resolve([hasPending, null])
          : expandResponse(createTransaction(from, to, payload)));

        if (transactionError || !transaction) {
          await addLog({
            source: "create-sponsor-transaction",
            message: transactionError,
            data: {
              sessionId: sessionId,
            },
          });
          return Promise.reject(
            transactionError || "Failed to create sponsor transaction"
          );
        }
      }

      const activeSessionData = await findActiveSessionDataBySessionId(
        sessionId
      );

      if (activeSessionData) {
        await archiveSessionData(activeSessionData.id).catch((err) => null);
      }

      const [sessionData, error] = await expandResponse(
        createSessionData(session)
      );

      if (error || !sessionData) {
        await addLog({
          source: "create-session-data",
          message: error,
          data: {
            sessionId: sessionId,
          },
        });
      }

      await createNotification({
        title: session.title || "New session available",
        content: [session.description].filter((it) => !!it?.trim()).join("\n"),
        target: {
          type: "system",
        },
        type: "info",
        url: `/sessions/${session.hash || session.id}`,
        preview: session.image,
      }).catch((error) => {
        console.log("Failed to send notification", error);

        return null;
      });

      break;
    }
    case SessionStateType.Active: {
      const nextQuestion = session.questions.find(
        (question) => !question.hasAnswer
      );

      updates.activeQuestionId = nextQuestion?.id;
      updates.state = nextState;
      break;
    }
    default: {
      updates.state = nextState;
    }
  }

  return updates;
}

export async function completeSession(sessionId) {
  const session = await getSessionById(sessionId);

  if (
    !session ||
    [
      SessionStateType.Archived,
      SessionStateType.Completed,
      SessionStateType.Draft,
    ].includes(session.state)
  ) {
    return Promise.reject("Invalid session or session is not active");
  }

  const allQuestionsAnswered = session.questions?.every(
    (question) => question.hasAnswer
  );

  if (!allQuestionsAnswered) {
    return Promise.reject(
      "All questions must be answered before completing the session"
    );
  }

  const [sessionData, sessionDataError] = await findSessionData({
    sessionId,
    state: SessionDataStateTypes.Active,
  })
    .then((result): Promise<[SessionDataDTO | null, any]> => {
      if (!result?.id) {
        return createSessionData(session, true).then((result) => [
          result as SessionDataDTO,
          null,
        ]);
      }

      return completeSessionData(result.id, session).then((result) => [
        result as SessionDataDTO,
        null,
      ]);
    })
    .catch((error): [null, string] => {
      return [null, error];
    });

  if (!sessionData || sessionDataError) {
    console.log(sessionDataError);
    return Promise.reject(
      sessionDataError || "Failed to find active session data"
    );
  }

  const prizePool = sessionData?.userScores?.summary;

  //  Distribute prize pool among users
  const [ok, error] = await distributePrizePool(session, prizePool)
    .then((res) => [res, null])
    .catch((error) => [null, error]);

  if (!ok || error != null) {
    return Promise.reject(error || "Failed to distribute prize pool");
  }

  return updateSession(sessionId, {
    state: SessionStateType.Completed,
  });
}

export async function distributePrizePool(session, prizePool) {
  const sessionId = session?.id;
  // const sessionData = await findSessionDataBySessionId(sessionId);

  if (!sessionId || !prizePool) {
    throw new Error("Invalid prize pool data or session ID");
  }

  // Calculate prize pool
  // const [prizePool, prizePoolError] = await calculatePrizePool(
  //   sessionData,
  //   answers
  // )
  //   .then((res) => [res, null])
  //   .catch((error) => [null, error]);

  Object.entries(prizePool).forEach(async ([userId, score]) => {
    const from: TransactionParty = { id: sessionId as ID, type: "session" };
    const to: TransactionParty = { id: userId, type: "user" };
    const transactionData: TransactionPayload = {
      amount: Number(score),
      type: "prize",
      details: `Prize distribution for session ${session.title}`,
    };

    const [ok, error] = await createTransaction(from, to, transactionData)
      .then((res) => {
        if (res?.id) {
          return validateTransactionById(res.id);
        }

        return res;
      })
      .then((res) => [res != null, null])
      .catch((error) => [null, error]);

    if (!ok || error != null) {
      console.log(error || "Failed to update user balances");
    }
  });

  return true;
}
