import { DateType, ID } from './api.model';

export type QuestionDTO = {
	_id?: ID;
	id: ID;
	title: string;
	description?: string;
	type: QuestionType;
	options: string[];
	answer?: string;
	createdAt: DateType;
	updatedAt?: DateType;
	hasAnswer?: boolean;
};

export enum QuestionType {
	SINGLE = 'single',
	MULTIPLE = 'multiple',
	CUSTOM = 'custom',
}

export type QuestionDataDTO = {
	id: ID;
	questionId: ID;
	sessionId: ID;
	votes: any[];
	totalVotes: number;
	state: QuestionDataStateEnum;
	totalByVotes: Record<string, number>;
};

export enum QuestionDataStateEnum {
	DRAFT = 0,
	ACTIVE = 1,
    COMPLETED = 2,
    ARCHIVED = 3,
}

export enum QuestionDataActionEnum {
	SYNC = 1,
}
