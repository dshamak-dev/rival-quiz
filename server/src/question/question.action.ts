import { randomString } from "../tools/random.utils";
import { findQuestionData } from "../services/question-data/actions";
import { getSessionById } from "../session/session.action";

export async function createQuestion(initial = {}) {
  const question = {
    ...(initial || {}),
    id: randomString(),
    title: "",
    description: "",
    type: "single",
    options: [],
    answer: null,
    created: new Date().toISOString(),
  };

  return question;
}

export async function getQuestionData(sessionId, questionId) {
  return findQuestionData({ sessionId, questionId });
}

export async function findQuestionById(sessionId, questionId) {
  const session = await getSessionById(sessionId);
  const question = session?.questions.find((q) => q.id === questionId);

  // const votes = await getQuestionVotesOld(sessionId, question);

  return question;
}
