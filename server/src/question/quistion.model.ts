import { ID } from "@shared/common/model";

export type QuestionDataDTO = {
	id: ID;
	sessionId: ID;
	questionId: ID;
	totalVotes: number;
	totalByVotes: Record<string, number>;
	votes: QuiestionVoteDTO[];
	answer?: string;
};

export type QuiestionVoteDTO = {
	userId, answer, value, questionId, sessionId, isMatch?: boolean;
};