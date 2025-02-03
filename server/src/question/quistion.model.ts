export type QuestionDataDTO = {
	totalVotes: number;
	totalByAnswers: Record<string, number>;
	votes: QuiestionVoteDTO[];
};

export type QuiestionVoteDTO = {
	userId, answer, value, questionId, sessionId
};