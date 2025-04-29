import { formatDecimal } from '@control/format.helpers';
import { CurrencyTypeEnum } from '@model/wallet.model';
import { useAuth } from '@state/auth.hook';
import { Anchor } from '@view/anchor';
import { Icon } from '@view/icon';
import { useMemo } from 'react';

export function WalletBalance() {
	const { wallet } = useAuth();
	const balance = useMemo(() => {
		return formatDecimal(wallet?.balance || 0, 2);
	}, [wallet?.balance]);

	const currencyIcon = useMemo(() => {
		switch (wallet?.currency) {
			case CurrencyTypeEnum.CRYPTO: {
				return 'CurrencyBitcoin';
			}
			default: {
				return 'PiggyBank';
			}
		}
	}, [wallet?.currency]);

	return (
		<Anchor activeClassName="" href="/wallet" className="flex gap-1 items-center">
			<span>{balance}</span>
			<Icon name={currencyIcon} size={16} />
		</Anchor>
	);
}
