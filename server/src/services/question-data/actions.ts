import * as api from "./api";
import { getUserActions } from "../../user-action/user-action.action";
import { UserActionTypes } from "../../user-action/user-action.model";
import { findQuestionById } from "../../question/question.action";
import { QuestionDataStatusTypes } from "./model";
import { SessionDataStateTypes } from "../../session-data/model";

export async function createQuestionData(sessionId, questionId) {
  const question = await findQuestionById(sessionId, questionId).catch(
    (err) => null
  );

  if (!question || !questionId || !sessionId) {
    return Promise.reject("Invalid question data.");
  }

  const questionData = await findQuestionData({
    sessionId,
    questionId,
    state: QuestionDataStatusTypes.Draft,
  });

  if (questionData) {
    return questionData;
  }

  const data = {
    sessionId: sessionId,
    questionId: questionId,
  };

  return api.create(data);
}

export async function syncQuestionDataAndUpdate(query, payload) {
  const questionData = await findQuestionData(query);

  if (!questionData) {
    return Promise.reject("No question data found.");
  }

  await syncQuestionData(questionData.id);

  return updateQuestionData(questionData.id, payload);
}

export async function findQuestionDataAndComplete(query) {
  const questionData = await findQuestionData(query);

  if (!questionData) {
    return Promise.reject("No active question found.");
  }

  return completeQuestionData(questionData.id);
}

export async function findQuestionDataAndSync(query, createIfMissing = false) {
  let questionData = await findQuestionData(query);

  if (createIfMissing) {
    questionData = await createQuestionData(query.sessionId, query.questionId);
  }

  if (!questionData) {
    return Promise.reject("No active question found.");
  }

  return syncQuestionData(questionData.id);
}

export async function completeQuestionData(id) {
  await syncQuestionData(id);

  return updateQuestionData(id, { state: SessionDataStateTypes.Completed });
}

export async function syncQuestionData(id) {
  const questionData = await findQuestionDataById(id);

  if (!questionData) {
    return Promise.reject("Question data not found");
  }

  const question = await findQuestionById(
    questionData.sessionId,
    questionData.questionId
  );

  if (!question) {
    return Promise.reject("Question not found");
  }

  const votes = await getQuestionVotes(questionData.sessionId, question);

  let totalVotes = 0;
  const totalByAnswers = {};
  votes.forEach((vote) => {
    if (!totalByAnswers[vote.answer]) {
      totalByAnswers[vote.answer] = 0;
    }
    totalByAnswers[vote.answer] += vote.value;

    totalVotes += vote.value || 0;
  });

  return updateQuestionData(id, { votes, totalVotes, totalByAnswers });
}

export async function updateQuestionData(id, payload) {
  return api.findByIdAndUpdate(id, payload);
}

export async function findQuestionDataById(id) {
  return api.findOne({ _id: id });
}

export async function findQuestionData(query) {
  return api.findOne(query);
}

export async function findManyQuestionData(query) {
  return api.findMany(query);
}

// update question data

// delete question data

// create question vote

// update question vote

// delete question vote

export async function getQuestionVotes(sessionId, question): Promise<any> {
  const questionId = question.id;
  const userActions = await getUserActions({
    sessionId,
    questionId,
    type: UserActionTypes.SUBMIT_ANSWER,
  })
    .then((items) => {
      const filtered = items.reduce((acc, item) => {
        acc[item.userId] = item;
        return acc;
      }, {});

      return Object.values(filtered);
    })
    .catch((err) => []);
  const votes: any[] = [];
  const { hasAnswer, answer } = question;

  userActions.forEach((action: any) => {
    if (action.type === UserActionTypes.SUBMIT_ANSWER) {
      // TODO: Use bet value if available
      const valueCounter = action.data.bet ?? 1;

      votes.push({
        questionId,
        sessionId,
        userId: action.userId,
        answer: action.data.value,
        value: hasAnswer
          ? answer === action.data.value
            ? valueCounter
            : 0
          : valueCounter,
      });
    }
  });

  return votes;
}
