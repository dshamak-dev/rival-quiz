import { DateType, ID } from './api.model';
import { QuestionDTO } from './question.model';

export class Session implements SessionType {
	id?: ID;
	description?: string;
	state: SessionStateType = SessionStateType.Draft;
	title: string = '';
	ownerId?: ID;
	createdAt: DateType = new Date().toISOString();
	updatedAt?: DateType;
	questions?: QuestionDTO[] = [];

	constructor(data: SessionType | undefined) {
		Object.assign(this, data);
	}
}

export type SessionType = Omit<SessionDTO, '_id' | 'id' | 'ownerId'>;

export type SessionDTO = {
	_id: ID;
	id: ID;
	description?: string;
	state: SessionStateType;
	title: string;
	data?: SessionData;
	ownerId: ID;
	createdAt: DateType;
	updatedAt?: DateType;
	questions?: QuestionDTO[];
};

export type SessionData = Record<string, any>;

export enum SessionStateType {
	Draft = 0,
	Published = 1,
	Paused = 2,
	Canceled = 3,
	Archived = 4,
	Locked = 5,
	LockedForReview = 6,
	Completed = 7,
}
