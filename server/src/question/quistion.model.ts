import { ID } from "@shared/common/model";

export type QuestionDataDTO = {
	id: ID;
	sessionId: ID;
	questionId: ID;
	totalVotes: number;
	totalByAnswers: Record<string, number>;
	votes: QuiestionVoteDTO[];
};

export type QuiestionVoteDTO = {
	userId, answer, value, questionId, sessionId
};