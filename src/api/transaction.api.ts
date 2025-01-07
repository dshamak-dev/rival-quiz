import { WEB_API } from '@control/api.control';
import { TransactionDTO } from '@model/transaction.model';

const rootPath = `/transactions`;

export async function getUserTransactions() {
	return WEB_API.get<any[]>(`${rootPath}`, {});
}

export async function requestTransactionValidation(id: TransactionDTO['id']): Promise<TransactionDTO> {
    return WEB_API.post<TransactionDTO>(`${rootPath}/${id}/validate`, {});
}
