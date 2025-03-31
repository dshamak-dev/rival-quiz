import { QuestionDataDTO, QuiestionVoteDTO } from "../question/quistion.model";
import { SessionDataDTO } from "./session-data.model";

export type CalculateStatsDTO = {
  maxScore: number;
  byQuestion: Record<string, Record<string, QuiestionVoteDTO>>;
};
type VoteEntries = [string, QuestionDataDTO];

export async function calculateUserSummaryFromVotes(
  votes: Record<QuestionDataDTO['id'], QuestionDataDTO>
): Promise<SessionDataDTO["userScores"]> {
  if (!votes) {
    return null;
  }

  const stats: CalculateStatsDTO = await Object.entries(votes)
    .filter(([questionId, questionData]: VoteEntries): boolean => {
      return !!questionId && questionData?.votes != null;
    })
    .reduce(
      (accum, item) => {
        const [questionId, questionData] = item;
        const byQuestion: Record<string, QuiestionVoteDTO> =
          calculateUserScoresFromQuestionVotes(questionData);

        accum.maxScore += questionData.totalVotes ?? 1;

        accum.byQuestion[questionId] = byQuestion;

        return accum;
      },
      { maxScore: 0, byQuestion: {} } as CalculateStatsDTO
    );

  const rates: Record<string, number> = Object.entries(stats.byQuestion).reduce(
    (accum, [questionId, usersData]: [any, any]) => {
      const quiestion = votes[questionId];
      const questionTotal = quiestion.totalVotes;

      Object.entries(usersData).forEach(([userId, userData]: [any, any]) => {
        const summ = accum[userId] || 0;
        const userValue = userData.value || 0;
        let rate = userValue === 0 ? 0 : userValue / questionTotal;

        rate = rate ? Number(rate.toFixed(2)) : 0;

        accum[userId] = summ + Math.max(0, rate);
      });

      return accum;
    },
    {}
  );

  const total = stats.maxScore;

  const summary = Object.entries(rates).reduce((accum, [userId, rate]) => {
    accum[userId] = total * rate;

    return accum;
  }, {});

  return { ...stats, rates, summary };
}

export function calculateUserScoresFromQuestionVotes(
  questionData: QuestionDataDTO
): Record<string, QuiestionVoteDTO> {
  const { totalVotes, totalByAnswers, votes } = questionData;

  return votes.reduce(
    (accum, { userId, answer, value, questionId, sessionId }) => {
      const rate = value / totalByAnswers[answer];
      accum[userId] = {
        questionId,
        sessionId,
        rate,
        value: totalVotes * rate,
      };

      return accum;
    },
    {}
  );
}

export function normalizeSessionData(data): SessionDataDTO {
  return data?.json;
}
