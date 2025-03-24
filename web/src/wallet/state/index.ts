import { WalletDTO } from '@model/wallet.model';
import { useAuth } from '@state/auth.hook';

export function useWallet() {
	const { wallet, setWallet } = useAuth();

	const setBalance = (value: number) => {
		setWallet({ ...wallet, balance: value } as WalletDTO);
	};

	return { wallet, setBalance };
}
