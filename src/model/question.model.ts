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
