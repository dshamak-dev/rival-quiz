import { useAuth } from '@state/auth.hook';
import { Button } from '@view/button/button';
import { Typography } from '@view/typography/typography';
import { FunctionComponent, PropsWithChildren, useMemo } from 'react';

type Props = PropsWithChildren & {
	className?: string;
};

export function WalletWithdrawButton({ children, ...props }: Props) {
	const { wallet } = useAuth();

	const balance = useMemo(() => {
		return wallet?.balance || 0;
	}, [wallet?.balance]);

	if (children) {
		return <div {...props}>{children}</div>;
	}

	return (
		<div {...props}>
			<Typography className="text-center">{balance}</Typography>
			<Button className="w-full">Withdraw</Button>
		</div>
	);
}
