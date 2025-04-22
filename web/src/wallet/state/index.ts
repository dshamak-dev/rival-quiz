import { getUserWallet } from '@api/wallet.api';
import { WalletDTO } from '@model/wallet.model';
import { useAuth } from '@state/auth.hook';

export function useWallet() {
	const { wallet, setWallet } = useAuth();

	const setBalance = (value: number) => {
		setWallet({ ...wallet, balance: value } as WalletDTO);
	};

	const fetch = async () => {
		getUserWallet()
			.then((res) => {
				setWallet({ ...wallet, ...res });
			})
			.catch((err) => null);
	};

	return { wallet, balance: wallet?.balance || 0, setBalance, fetch };
}
