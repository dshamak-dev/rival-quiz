import { WEB_API } from '@control/api.control';
import { TransactionDTO } from '@model/transaction.model';

const rootPath = `/transactions`;

export async function getUserTransactions(params = {}) {
	return WEB_API.get<TransactionDTO[]>(`${rootPath}`, params);
}

export async function requestTransactionValidation(id: TransactionDTO['id']): Promise<TransactionDTO> {
    return WEB_API.post<TransactionDTO>(`${rootPath}/${id}/validate`, {});
}
