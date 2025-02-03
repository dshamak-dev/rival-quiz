export type SessionDataDTO = {
	id: string;
	sessionId: string;
    totalUsers: number;
    votesByQuestion: object;
    userScores: { summary: Record<string, number>, rates: Record<string, number>, maxScore: number } | null;
    // 0: active, 1: closed, 2: completed, 3: archived, 4: cancelled, 5: deleted
    state: number;
    activeQuestionId: String;
};

export const SessionDataStateTypes = {
	Active: 0,
	Closed: 1,
	Completed: 2,
	Archived: 3,
	Cancelled: 4,
	Deleted: 5
};
