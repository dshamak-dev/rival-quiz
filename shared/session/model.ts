import { DateType, ID } from "../common/model";
import { SessionBetType, SessionStateType, SessionTypes } from "./constants";

export type SessionDTO = {
	id: ID;
	description?: string;
	state: SessionStateType;
	title: string;
	data?: Record<string, any>;
	ownerId: ID;
	createdAt: DateType;
	updatedAt?: DateType;
	questions: Record<string, any>[];
	image?: string;
	userActions?: Record<string, any>[];
	users?: ID[];
	type?: SessionTypes;
	allowBids?: boolean;
	betType?: SessionBetType;
	hasNextAnswer?: boolean;
	hasNextQuestion: boolean;
	activeQuestionId?: ID;
	questionData?: Record<string, any>;
};
