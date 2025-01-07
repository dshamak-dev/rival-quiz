import { DateType, ID } from './api.model';

export type TransactionDTO = {
	id: ID;
	senderId: ID;
	receiverId: ID;
	type: String;
	amount: Number;
	data: Object;
	status: TransactionStatusEnum;
	reference: String;
	details: String;
	created: DateType;
	updated: DateType;
};

export enum TransactionStatusEnum {
	Pending = 0,
	Completed = 1,
	Failed = 2,
	Canceled = 3,
	Refunded = 4,
	Deleted = 5,
}

export const TransactionStatusLabels: Record<TransactionStatusEnum, string> = {
	[TransactionStatusEnum.Pending]: 'Pending',
	[TransactionStatusEnum.Completed]: 'Completed',
	[TransactionStatusEnum.Failed]: 'Failed',
	[TransactionStatusEnum.Canceled]: 'Canceled',
	[TransactionStatusEnum.Refunded]: 'Refunded',
	[TransactionStatusEnum.Deleted]: 'Deleted',
};
