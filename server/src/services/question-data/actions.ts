import * as api from "./api";
import { getUserActions } from "../../user-action/user-action.action";
import { UserActionTypes } from "../../user-action/user-action.model";
import { findQuestionById } from "../../question/question.action";
import { QuestionDataStatusTypes } from "./model";
import { SessionDataStateTypes } from "../../session-data/session-data.model";
import { QuestionDataDTO } from "@/question/quistion.model";

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

export async function findQuestionDataAndUpdate(query, payload) {
  const questionData = await findQuestionData(query);

  if (!questionData) {
    return Promise.reject("No question data found.");
  }

  return updateQuestionData(questionData.id, payload);
}

export async function syncQuestionDataAndUpdate(query, payload) {
  const questionData = await findQuestionData(query);

  if (!questionData) {
    return Promise.reject("No question data found.");
  }

  const updated = await updateQuestionData(questionData.id, payload);

  return syncQuestionData(questionData.id, updated);
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

export async function syncQuestionData(id, origin?: QuestionDataDTO) {
  const questionData = await (origin
    ? Promise.resolve(origin)
    : findQuestionDataById(id));

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
  const totalByVotes = {};
  votes.forEach((vote) => {
    if (!totalByVotes[vote.answer]) {
      totalByVotes[vote.answer] = 0;
    }

    const value = Number(vote.value) || 0;

    totalByVotes[vote.answer] += value;

    totalVotes += value || 0;
  });

  return updateQuestionData(id, { votes, totalVotes, totalByVotes });
}

export async function updateQuestionData(
  id,
  payload
): Promise<QuestionDataDTO> {
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
  // TODO: validate and normalize userActions
  // TODO: Split session pool by questions for sponsorship game

  const { hasAnswer, answer } = question;

  userActions.forEach((action: any) => {
    if (action.type === UserActionTypes.SUBMIT_ANSWER) {
      // TODO: Use bet value if available
      const bet = action.data.bet ?? 0;
      const betValue = Number(bet) || 0;

      // TODO: Simulate bet value for sponsorship game

      votes.push({
        questionId,
        sessionId,
        userId: action.userId,
        answer: action.data.value,
        value: betValue,
        isMatch: !hasAnswer || action.data.value === answer
      });
    }
  });

  return votes;
}
