import { WEB_API } from '@control/api.control';
import { TransactionDTO } from '@model/transaction.model';
import { TransactionCreateDTO } from '@shared/transaction/type';

const rootPath = `/transactions`;

export async function getUserTransactions(params = {}) {
	return WEB_API.get<TransactionDTO[]>(`${rootPath}`, params);
}

export async function createTransaction(payload: TransactionCreateDTO, params = {}): Promise<TransactionDTO> {
	return WEB_API.post<TransactionDTO>(`${rootPath}`, {
		...params,
		body: JSON.stringify(payload),
	});
}

export async function resolveTransaction(
	id: TransactionDTO['id'],
	payload: { paymentDetails: any },
	params = {}
): Promise<TransactionDTO> {
	return WEB_API.patch<TransactionDTO>(`${rootPath}/${id}/validate`, {
		...params,
		body: JSON.stringify(payload),
	});
}

export async function requestTransactionValidation(id: TransactionDTO['id']): Promise<TransactionDTO> {
	return WEB_API.post<TransactionDTO>(`${rootPath}/${id}/validate`, {});
}
