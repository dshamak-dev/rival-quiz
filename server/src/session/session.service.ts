import express from "express";
import {
  createSession,
  deleteSession,
  findSessionByIdOrHash,
  getSessionById,
  patchSession,
  updateSession,
  addSessionUser,
  removeSessionUser,
  setSessionState,
  completeSession,
} from "./session.action";
import { getRequestUser } from "../user/user.action";
import { createQuestion } from "../question/question.action";
import { getUserActions } from "../user-action/user-action.action";
import { SessionStateType } from "./session.model";
import { findSessionData } from "../session-data/session-data.api";
import { SessionDataStateTypes } from "../session-data/session-data.model";
import {
  findQuestionData,
  syncQuestionDataAndUpdate,
} from "../services/question-data/actions";
import { QuestionDataStatusTypes } from "../services/question-data/model";
import { findManySessions } from "./api";
import { formatSessionQueryValue } from "./session.utils";
import { randomString } from "../tools/random.utils";
import { addUserHistory, removeUserHistory } from "../user/api";
import { USER_HISTORY_TYPE } from "../user/constants";
import router from "./router";

const _router = express.Router();

_router.use(express.json());

_router.use(router);

_router.get("/", async (req: any, res: any) => {
  const query = req.query;

  const queryEntries = query
    ? Object.entries(query).reduce((accum, [key, value]) => {
        const name = key.trim();
        accum[name] = formatSessionQueryValue(name, value);
        return accum;
      }, {})
    : {};

  const sessions = await findManySessions(queryEntries);

  res.status(200).json(sessions || []);
});

_router.get("/:id", async (req: any, res: any) => {
  const hashOrId = req.params.id;
  const session = await findSessionByIdOrHash(hashOrId).catch((err) => null);

  if (!session) {
    return res.status(404).end();
  }

  const sessionId = session.id;
  const user = await getRequestUser(req);

  const userActions = await getUserActions({
    sessionId,
    userId: user?.id,
  })
    .then((items) => {
      const filtered = items.reduce((acc, item) => {
        acc[item.userId] = item;
        return acc;
      }, {});

      return Object.values(filtered);
    })
    .catch((err) => []);
  const _session = session;

  const payload = { ..._session, userActions };

  if (
    [
      SessionStateType.Locked,
      SessionStateType.Completed,
      SessionStateType.LockedForReview,
    ].includes(_session.state)
  ) {
    const data = await findSessionData({
      sessionId,
      state:
        session.state === SessionStateType.Completed
          ? SessionDataStateTypes.Completed
          : SessionDataStateTypes.Active,
    }).catch((err) => null);

    payload.data = data ?? undefined;
  }

  const questionDataQuery = {
    questionId: session.activeQuestionId,
    sessionId,
    state: QuestionDataStatusTypes.Draft,
  };
  const questionData = await findQuestionData(questionDataQuery).catch(
    (err) => null
  );

  payload.questionData = questionData || undefined;

  res.status(200).json(payload);
});

_router.delete("/:id", async (req: any, res: any) => {
  const sessionId = req.params.id;
  const session = await getSessionById(sessionId);

  if (!session) {
    return res.status(404).end();
  }

  const owner = await getRequestUser(req);

  const ownerId = owner?.id;

  if (!ownerId) {
    res.statusMessage = "Invalid user";
    return res.status(401).end();
  }

  const ok = await deleteSession(sessionId)
    .then(() => true)
    .catch(() => false);

  if (!ok) {
    res.statusMessage = "Failed to delete session";
    return res.status(500).end();
  }

  res.status(200).end();
});

_router.post("/", async (req: any, res: any) => {
  const owner = await getRequestUser(req).catch((err) => {
    return null;
  });

  const ownerId = owner?.id;

  if (!ownerId) {
    res.statusMessage = "Invalid user";
    return res.status(401).end();
  }

  const hash = req.body?.hash ?? randomString();

  createSession({
    ownerId: ownerId,
    metadata: {
      ownerName: owner.name || owner.tag,
      ownerAvatar: owner.photoUrl,
    },
    title: "",
    hash,
    ...(req.body ?? {}),
  })
    .then((session) => {
      res.status(201).json(session);
    })
    .catch((err) => {
      res.statusMessage = err || "Failed to create session";
      res.status(400).end();
    });
});

// Validate session owner access
const validateSessionAccess = async (req, sessionId) => {
  const session = await getSessionById(sessionId);

  if (!session) {
    return { status: 404, message: "Session not found", valid: false };
  }

  const owner = await getRequestUser(req);
  const ownerId = owner?.id;

  const sessionOwnerId = session?.ownerId?.toString();

  if (!sessionOwnerId || sessionOwnerId != ownerId) {
    return { status: 401, message: "No access", valid: false };
  }

  return { valid: true, session };
};

_router.put("/:id", async (req: any, res: any) => {
  const sessionId = req.params.id;
  const check = await validateSessionAccess(req, sessionId);

  if (!check.valid) {
    res.statusMessage = check.message;
    return res.status(check.status).end();
  }

  const updatedSession = await updateSession(sessionId, req.body);

  res.status(200).json(updatedSession);
});

_router.post("/:id/answer", async (req: any, res: any) => {
  const sessionId = req.params.id;
  const check = await validateSessionAccess(req, sessionId);

  if (!check.valid) {
    res.statusMessage = check.message;
    return res.status(check.status).end();
  }

  const { questionId, answer } = req.body;

  if (!questionId || !answer) {
    res.statusMessage = "Answer is required.";
    return res.status(400).end();
  }

  const questions =
    check.session?.questions?.map((question) => {
      if (questionId === question.id) {
        return { ...question, answer, hasAnswer: true };
      }

      return question;
    }) || [];

  const hasNextQuestion = check.session?.hasNextQuestion;

  const updates = await updateSession(sessionId, {
    questions,
    state: SessionStateType.LockedForReview,
    activeQuestionId: null,
    hasNextQuestion,
  });

  await syncQuestionDataAndUpdate(
    { sessionId, questionId },
    { state: QuestionDataStatusTypes.Completed, answer }
  ).catch((err) => {
    console.error("Error syncing question data:", err);
  });

  res.status(200).json(updates);
});

_router.post("/:id/resolve", async (req: any, res: any) => {
  const sessionId = req.params.id;
  const check = await validateSessionAccess(req, sessionId);

  if (!check.valid) {
    res.statusMessage = check.message;
    return res.status(check.status).end();
  }

  const session = check.session;

  if (!session?.hasNextQuestion) {
    await completeSession(sessionId)
      .then((payload) => {
        res.statusMessage = "Session completed successfully.";
        return res.status(200).json(payload);
      })
      .catch((err) => {
        res.statusMessage = err || "Can't complete session.";
        return res.status(400).end();
      });

    return;
  }

  // Start next question
  setSessionState(session, SessionStateType.Active)
    .then((updates) => {
      return updateSession(sessionId, updates);
    })
    .then((updated) => {
      res.status(200).json(updated);
    })
    .catch((err) => {
      res.statusMessage = err || "Can't update session.";
      return res.status(400).end();
    });
});

_router.delete("/:id/questions/:questionId", async (req: any, res: any) => {
  const sessionId = req.params.id;
  const questionId = req.params.questionId;
  const check = await validateSessionAccess(req, sessionId);

  const questionIndex =
    check.session?.questions?.findIndex((it) => it.id === questionId) ?? -1;

  if (
    !check.valid ||
    !check.session?.questions?.length ||
    questionIndex === -1
  ) {
    res.statusMessage = check.message || "Invalid request";
    return res.status(check.status || 400).end();
  }

  const questions = check.session.questions.filter(
    (it) => it.id !== questionId
  );

  const updatedSession = await updateSession(sessionId, {
    questions: questions || [],
  });

  res.status(200).json(updatedSession);
});

_router.post("/:id/questions", async (req: any, res: any) => {
  const sessionId = req.params.id;
  const check = await validateSessionAccess(req, sessionId);

  if (!check.valid) {
    res.statusMessage = check.message;
    return res.status(check.status).end();
  }

  // TODO: Create a separate Question in Questions table?
  const question = await createQuestion(req.body || { sessionId });
  const questions = [...(check.session?.questions || []), question];

  const payload = {
    ...check.session,
    questions,
  };

  const updatedSession = await updateSession(sessionId, payload);

  const target = updatedSession.questions.pop();

  res.status(200).json(target);
});

// TODO: Add common user validation for post, patch, put and delete
_router.patch("/:id", async (req: any, res: any) => {
  const sessionId = req.params.id;
  const check = await validateSessionAccess(req, sessionId);

  if (!check.valid) {
    res.statusMessage = check.message;
    return res.status(check.status).end();
  }

  patchSession(sessionId, req.body)
    .then((updatedSession) => {
      res.status(200).json(updatedSession);
    })
    .catch((err) => {
      res.statusMessage = err || "Failed to update session.";
      return res.status(400).end();
    });
});

_router.post("/:id/users", async (req: any, res: any) => {
  const sessionId = req.params.id;

  const user = await getRequestUser(req);

  const userId = user?.id;

  if (!user || !userId) {
    res.statusMessage = "Invalid user";
    return res.status(401).end();
  }

  const session = await getSessionById(sessionId);

  if (!session || ![SessionStateType.Published].includes(session.state)) {
    res.statusMessage = "Invalid session or session is not published";
    return res.status(404).end();
  }

  if (session.users?.includes(userId)) {
    return res.status(200).json(session);
  }

  addSessionUser(sessionId, userId)
    .then(async (updated) => {
      const history = await addUserHistory(
        userId,
        USER_HISTORY_TYPE.JOIN_SESSION,
        {
          sessionId,
          hash: session.hash,
        }
      );

      res.status(200).json(updated);
    })
    .catch((err) => {
      res.statusMessage =
        err ?? "Failed to add user to session. Please try again later.";
      return res.status(400).end();
    });
});

_router.delete("/:id/user", async (req: any, res: any) => {
  const sessionId = req.params.id;

  const user = await getRequestUser(req);

  const userId = user?.id;

  if (!user || !userId) {
    res.statusMessage = "Invalid user";
    return res.status(401).end();
  }

  const session = await getSessionById(sessionId);

  if (
    !session ||
    ![SessionStateType.Draft, SessionStateType.Published].includes(
      session.state
    )
  ) {
    res.statusMessage = "Invalid session or no permission to remove users";
    return res.status(404).end();
  }

  removeSessionUser(sessionId, userId)
    .then(async (updated) => {
      const history = await removeUserHistory(
        userId,
        USER_HISTORY_TYPE.JOIN_SESSION,
        {
          sessionId,
        }
      );
      
      console.log('remove user', { sessionId, userId }, updated);

      res.status(200).json(updated);
    })
    .catch((err) => {
      res.statusMessage =
        err ?? "Failed to remove user from session. Please try again later.";
      return res.status(400).end();
    });
});

_router.use(function (request, response, next: any) {
  next();
});

export default _router;
