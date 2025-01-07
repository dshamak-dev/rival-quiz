import { WEB_API } from '@control/api.control';
import { WalletDTO } from '@model/wallet.model';

const rootPath = `/wallets`;

export async function getUserWallet() {
	return WEB_API.get<WalletDTO>(`${rootPath}`, {});
}

export async function createWallet() {
	return WEB_API.post<WalletDTO>(`${rootPath}`, {});
}
