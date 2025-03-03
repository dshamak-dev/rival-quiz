import { DateType, ID } from './api.model';

export type WalletDTO = {
	id: ID;
	userId: ID;
	type: WalletTypeEnum;
	currency: CurrencyTypeEnum;
	balance: number;
	data: Object;
	created: DateType;
	updated: DateType;
};

export enum WalletTypeEnum {
	DRAFT = 'draft',
	DEMO = 'demo',
	UNLIMIT = 'unlim',
}

export enum CurrencyTypeEnum {
	POINTS = 'points',
	CRYPTO = 'crypto',
}
