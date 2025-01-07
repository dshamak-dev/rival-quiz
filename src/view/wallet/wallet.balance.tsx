import { CurrencyTypeEnum } from '@model/wallet.model';
import { useAuth } from '@state/auth.hook';
import { Icon } from '@view/icon';
import { useMemo } from 'react';

export function WalletBalance() {
	const { wallet } = useAuth();
	const balance = wallet?.balance || 0;

	const currencyIcon = useMemo(() => {
		switch (wallet?.currency) {
			case CurrencyTypeEnum.CRYPTO: {
				return 'CurrencyBitcoin';
			}
			default: {
				return 'Coin';
			}
		}
	}, [wallet?.currency]);

	return (
		<div className="flex gap-2 items-center">
			<span>{balance}</span>
			<Icon name={currencyIcon} size={16} />
		</div>
	);
}
