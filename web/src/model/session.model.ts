import { DateType, ID } from './api.model';
import { QuestionDataDTO, QuestionDTO } from './question.model';
import { SessionUserActionDTO } from './session.user.model';
import { SessionTypes as SharedSessionTypes } from '@shared/session/type';

// export class Session implements SessionType {
// id?: ID;
// description?: string;
// state: SessionStateType = SessionStateType.Draft;
// title: string = '';
// ownerId?: ID;
// createdAt: DateType = new Date().toISOString();
// updatedAt?: DateType;
// questions?: QuestionDTO[] = [];
// image?: string = undefined;
// betType?: SessionBetType;
// users?: ID[] = [];

// 	constructor(data: SessionType | undefined) {
// 		Object.assign(this, data);
// 	}
// }

export enum SessionTypes {
	USER_BET = SharedSessionTypes.USER_BET,
	SPONSOR = SharedSessionTypes.SPONSOR,
	SYSTEM_PRIZE = SharedSessionTypes.SYSTEM_PRIZE,
	AUCTION = SharedSessionTypes.AUCTION,
}

export type SessionType = Omit<SessionDTO, '_id' | 'id' | 'ownerId'>;

export enum SessionBetType {
	None = 0,
	Single = 1,
	Auction = 2,
	Range = 3,
}

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
	allowBids?: boolean;
	betType?: SessionBetType;
	previewUrl?: string;
	hasNextAnswer?: boolean;
	activeQuestionId?: ID;
	questionData?: QuestionDataDTO;
};

// export enum SessionTypes {
// 	USER_BET = 'user_bet',
// 	BANK = 'bank',
// 	SYSTEM_PRIZE = 'system_prize',
// 	// Single = 'single',
// 	// Multiple = 'multiple',
// 	// Range = 'range',
// 	AUCTION = 'auction',
// }

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
