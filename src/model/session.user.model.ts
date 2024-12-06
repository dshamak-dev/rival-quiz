import { ID } from './api.model';

export type SessionUserActionDTO = SessionUserActionPayload;

export type SessionUserDTO = SessionUserActionPayload & {
	name: string;
};

export type SessionUserActionPayload = {
	sessionId: ID;
	questionId: ID;
	userId?: ID;
	type: SessionUserActionTypes;
	data: SessionUserActionData;
};

export enum SessionUserActionTypes {
	NONE = 0,
	SUBMIT_ANSWER = 1,
	REMOVE_ANSWER = 2,
}

export type SessionUserActionData = {
	value: any;
	transactionId?: ID;
};
