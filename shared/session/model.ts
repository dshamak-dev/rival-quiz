import { DateType, ID } from "../common/model";
import { SessionBetType, SessionStateType, SessionTypes } from "./constants";
import { SessionSettingsDTO } from './type';

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
	settings?: SessionSettingsDTO;
	betType?: SessionBetType;
	hasNextQuestion?: boolean;
	activeQuestionId?: ID;
	questionData?: Record<string, any>;
};

