import { DateType, ID } from './api.model';
import { QuestionDataDTO, QuestionDTO } from './question.model';
import { SessionUserActionDTO } from './session.user.model';
import { SessionTypes as SharedSessionTypes, SessionSettingsDTO } from '@shared/session/type';

export enum SessionTypes {
	USER_BET = SharedSessionTypes.USER_BET,
	SPONSOR = SharedSessionTypes.SPONSOR,
	SYSTEM_PRIZE = SharedSessionTypes.SYSTEM_PRIZE,
	LOTTERY = SharedSessionTypes.LOTTERY,
	CUSTOM = 'custom',
}

export type SessionType = Omit<SessionDTO, '_id' | 'id' | 'ownerId'>;

export type SessionDTO = {
	id: ID;
	description?: string;
	state: SessionStateType;
	title: string;
	data?: SessionData;
	ownerId: ID;
	createdAt: DateType;
	updatedAt?: DateType;
	questions?: QuestionDTO[];
	image?: string;
	userActions?: SessionUserActionDTO[];
	users?: ID[];
	type?: SessionTypes;
	settings?: SessionSettingsDTO;
	previewUrl?: string;
	hasNextQuestion?: boolean;
	activeQuestionId?: ID;
	questionData?: QuestionDataDTO;
	hash: string;
	metadata?: { ownerName: string; ownerAvatar: string; };
};

export type SessionData = Record<string, any>;

export enum SessionStateType {
	Draft = 0,
	Published = 1,
	Active = 2,
	Canceled = 3,
	Archived = 4,
	Locked = 5,
	LockedForReview = 6,
	Completed = 7,
}

export enum ProgressStage {
	Lobby = 0,
	Question = 1,
	Pending = 2,
	Processing = 3,
	Summary = 4,
	Results = 5,
}

export type SessionAnswerPayload = {
	questionId: ID;
	answer: string;
};
