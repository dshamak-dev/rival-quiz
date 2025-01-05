import { WEB_API } from '@control/api.control';

const rootPath = `/transactions`;

export async function getUserTransactions() {
	return WEB_API.get<any[]>(`${rootPath}`, {});
}
