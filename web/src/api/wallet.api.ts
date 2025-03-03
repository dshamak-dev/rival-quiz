import { WEB_API } from '@control/api.control';
import { WalletDTO } from '@model/wallet.model';

const rootPath = `/wallets`;

export async function getUserWallet(params = {}): Promise<WalletDTO> {
	return WEB_API.get<WalletDTO>(`${rootPath}`, params);
}

export async function createWallet() {
	return WEB_API.post<WalletDTO>(`${rootPath}`, {});
}
