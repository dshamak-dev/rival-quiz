import { TransactionDTO } from '@model/transaction.model';
import { WithdrawalRequestDTO } from '../type/wallet.type';
import { WEB_API } from '@control/api.control';
import { ID } from '@model/api.model';

export async function requestWithdrawal(payload: WithdrawalRequestDTO, params = {}): Promise<TransactionDTO> {
	return WEB_API.post<TransactionDTO>('/withdrawals', {
		...params,
		body: JSON.stringify(payload),
	});
}

export async function lockUserBalance(userId: ID, amount: number, params = {}) {
	return WEB_API.post(`/users/${userId}/balance-lock`, {
		...params,
		body: JSON.stringify({ amount }),
	});
}
