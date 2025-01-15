export async function calculateUserSummaryFromVotes(votes) {
  if (!votes) {
    return null;
  }

  const stats = await Object.entries(votes)
    .filter(([questionId, questionData]: any) => {
      return !!questionId && questionData?.votes != null;
    })
    .reduce(
      async (accum, [questionId, questionData]: any) => {
        const totalVotes = questionData.votes.reduce(
          (sum, vote) => sum + vote.value,
          0
        );
        const byQuestion = await calculateUserScoresFromQuestionVotes(questionData);

        accum.maxScore += 1;

        accum.byQuestion[questionId] = byQuestion;

        return accum;
      },
      { maxScore: 0, byQuestion: {} } as any
    );

  const summary = Object.entries(stats.byQuestion).reduce(
    (accum, [questionId, usersData]: [any, any]) => {
      Object.entries(usersData).forEach(([userId, userData]: [any, any]) => {
        const summ = accum[userId] || 0;

        accum[userId] = (summ + (userData.value || 0 )) || 0;
      });

      return accum;
    },
    {}
  );

  return { ...stats, summary };
}

export async function calculateUserScoresFromQuestionVotes(questionData) {
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

export function normalizeSessionData(data) {
	return data?.json;
}
