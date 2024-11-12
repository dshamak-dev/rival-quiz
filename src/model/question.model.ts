import { DateType, ID } from './api.model';

export type QuestionDTO = {
	id: ID;
	title: string;
	description?: string;
	type: QuestionType;
	options: string[];
	answer?: string;
	created: DateType;
	updated?: DateType;
};

export enum QuestionType {
	SINGLE = 'single',
	MULTIPLE = 'multiple',
	CUSTOM = 'custom',
}
