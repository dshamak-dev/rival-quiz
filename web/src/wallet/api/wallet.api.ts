import { TransactionDTO } from '@model/transaction.model';
import { WithdrawalRequestDTO } from '../type/wallet.type';
import { WEB_API } from '@control/api.control';

export async function requestWithdrawal(payload: WithdrawalRequestDTO, params = {}): Promise<TransactionDTO> {
	return WEB_API.post<TransactionDTO>('/withdrawals', {
		...params,
		body: JSON.stringify(payload),
	});
}
