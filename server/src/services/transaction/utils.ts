import { TransactionDTO } from "@shared/transaction/type";

export function normalize(dto): TransactionDTO | null {
	return dto?.json;
}