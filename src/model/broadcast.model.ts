export type BroadcastDTO = {
	entity: BroadcastEntityEnum;
	message: BroadcastMessageDTO;
	payload?: any;
};

export type BroadcastMessageDTO = {
	text?: string;
	type: BroadcastMessageTypeEnum;
};

export enum BroadcastMessageTypeEnum {
	INFO = 'info',
	WARNING = 'warning',
	ERROR = 'error',
	SYSTEM = 'system',
}

export enum BroadcastEntityEnum {
	USER = 'user',
	QUIZ = 'quiz',
	ANSWER = 'answer',
	COMMENT = 'comment',
	TRANSACTION = 'transaction',
}
