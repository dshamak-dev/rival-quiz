import { CurrencyTypeEnum } from "@shared/payment/constant";

export type WithdrawalRequestDTO = {
	walletId: string;
	amount: number;
	currency: CurrencyTypeEnum;
	comment: string;
	metadata?: any;
	reference?: string;
};