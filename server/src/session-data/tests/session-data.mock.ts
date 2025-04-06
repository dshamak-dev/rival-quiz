import { QuestionDataDTO } from "@/question/quistion.model";

export const user1Mock = {
  id: "67ebc05912ae7b7545c60bb4",
  name: "User 1",
  bet: 20,
  questionId: "xyZ79jCb",
  answer: "No",
};

export const user2Mock = {
  id: "67b2e2c1feb7a2b9dd19ae11",
  name: "User 2",
  bet: 40,
  questionId: "xyZ79jCb",
  answer: "Yes",
};

const asQuestionDataMock: QuestionDataDTO = {
  sessionId: "67ebc0a012ae7b7545c60bda",
  questionId: "xyZ79jCb",
  votes: [
    {
      questionId: "xyZ79jCb",
      sessionId: "67ebc0a012ae7b7545c60bda",
      userId: user1Mock.id,
      answer: user1Mock.answer,
      value: user1Mock.bet,
    },
    {
      questionId: "xyZ79jCb",
      sessionId: "67ebc0a012ae7b7545c60bda",
      userId: user2Mock.id,
      answer: user2Mock.answer,
      value: user2Mock.bet,
    },
  ],
  totalByVotes: {
    [user2Mock.answer]: user2Mock.bet,
    [user1Mock.answer]: user1Mock.bet,
  },
  totalVotes: user1Mock.bet + user2Mock.bet,
  id: "67ebc18012ae7b7545c60c49",
};

export const votesByQuestionMock = {
  [asQuestionDataMock.questionId]: asQuestionDataMock,
};
