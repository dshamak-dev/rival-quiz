import { useAuth } from '@state/auth.hook';
import { Button } from '@view/button/button';
import { Icon } from '@view/icon';
import { Typography } from '@view/typography/typography';
import { PropsWithChildren, useMemo } from 'react';
import { WalletDepositWindow } from './wallet.deposit-window';
import { InvoiceDTO } from 'src/invoice/type';

type Props = PropsWithChildren & { onSubmit?: (invoice: InvoiceDTO) => void };
export function WalletDepositButton(props: Props) {
	const { wallet } = useAuth();

	const balance = useMemo(() => {
		return wallet?.balance || 0;
	}, [wallet?.balance]);

	const content = useMemo(() => {
		if (props.children) {
			return props.children;
		}

		return (
			<div>
				<div className="text-center">
					<Typography className="text-gray-400 text-xs">balance</Typography>
					<Typography size="large">{balance}</Typography>
				</div>
				<Button layout="tertiary" className="w-full mt-1">
					<Icon name="Cash" size={14} /> Top up
				</Button>
			</div>
		);
	}, [props.children, balance]);

	return <WalletDepositWindow trigger={content} onSubmit={props.onSubmit} />;
}
