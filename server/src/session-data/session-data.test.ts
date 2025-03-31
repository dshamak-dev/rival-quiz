import { describe, expect, test } from "@jest/globals";
import { calculateUserSummaryFromVotes } from "./session-data.utils";
import { QuestionDataDTO } from "../question/quistion.model";

const mockUser1 = {
  id: "user1",
  name: "User 1",
  votes: {
    question1: { id: "answer1", value: 1 },
  },
};

const mockUser2 = {
  id: "user2",
  name: "User 2",
  votes: {
    question1: { id: "answer1", value: 9 },
  },
};

const mockUser3 = {
  id: "user3",
  name: "User 3",
  votes: {
    question1: { id: "answer2", value: 1 },
  },
};

const mockedTotalByAnswers = { answer1: 10, answer2: 1, answer3: 0 };

const mockQuiestionData: QuestionDataDTO = {
  id: "question1-data",
  sessionId: "session1",
  questionId: "question1",
  totalVotes: 11,
  totalByAnswers: mockedTotalByAnswers,
  votes: [
    {
      userId: mockUser1.id,
      answer: "answer1",
      value: mockUser1.votes.question1.value,
      sessionId: "session1",
      questionId: "question1",
    },
    {
      userId: mockUser2.id,
      answer: "answer1",
      value: mockUser2.votes.question1.value,
      sessionId: "session1",
      questionId: "question1",
    },
    {
      userId: mockUser3.id,
      answer: "answer2",
      value: mockUser3.votes.question1.value,
      sessionId: "session1",
      questionId: "question1",
    },
  ],
};

describe("Session Data", () => {
  test("Should calculate session user summary from votes", async () => {
    const votes: Record<QuestionDataDTO["id"], QuestionDataDTO> = {
      [mockQuiestionData.id]: mockQuiestionData,
    };
    const { maxScore, rates, summary } = await calculateUserSummaryFromVotes(
      votes
    ).then((res) => res || { maxScore: 0, rates: {}, summary: {} });

    expect(maxScore).toBe(mockQuiestionData.totalVotes);

    const user1Rate = rates[mockUser1.id];
    const user2Rate = rates[mockUser2.id];
    const user3Rate = rates[mockUser3.id];

    expect(user1Rate).toBe(0.1);
    expect(user2Rate).toBe(0.9);
    expect(user3Rate).toBe(1);

    expect(summary[mockUser1.id]).toBe(
      mockQuiestionData.totalVotes * user1Rate
    );
    expect(summary[mockUser2.id]).toBe(
      mockQuiestionData.totalVotes * user2Rate
    );
    expect(summary[mockUser3.id]).toBe(
      mockQuiestionData.totalVotes * user3Rate
    );
  });
});
