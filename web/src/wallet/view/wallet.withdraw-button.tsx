import { useAuth } from '@state/auth.hook';
import { Button } from '@view/button/button';
import { ModalButton } from '@view/modal/modal.button';
import { Typography } from '@view/typography/typography';
import { FunctionComponent, PropsWithChildren, useMemo } from 'react';
import { WithdrawalForm } from './wallet.withdrawal-form';

type Props = PropsWithChildren & {
	className?: string;
};

export function WalletWithdrawButton({ children, ...props }: Props) {
	const { wallet } = useAuth();

	const balance = useMemo(() => {
		return wallet?.balance || 0;
	}, [wallet?.balance]);

	const trigger = useMemo(() => {
		if (children) {
			return <div {...props}>{children}</div>;
		}

		return (
			<div {...props}>
				<Typography className="text-center">{balance}</Typography>
				<Button className="w-full">Withdraw</Button>
			</div>
		);
	}, [children, balance]);

	return (
		<ModalButton
			title={'withdraw balance'.toUpperCase()}
			buttonProps={{
				layout: 'custom',
				children: trigger,
			}}
			hideFooter
		>
			{(isOpen, dispatch) => isOpen && <WithdrawalForm />}
		</ModalButton>
	);
}
