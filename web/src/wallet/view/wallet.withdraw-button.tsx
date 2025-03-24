import { useAuth } from '@state/auth.hook';
import { Button } from '@view/button/button';
import { ModalButton } from '@view/modal/modal.button';
import { Typography } from '@view/typography/typography';
import { PropsWithChildren, useMemo, useState } from 'react';
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
			{(isOpen, dispatch) =>
				isOpen && <WithdrawalContent onConfirm={() => dispatch({ type: 'close', payload: true })} />
			}
		</ModalButton>
	);
}

function WithdrawalContent({ onConfirm }: { onConfirm: () => void }) {
	const [result, setResult] = useState<any>(null);

	const handleResult = (payload: any, error: any) => {
		setResult({
			payload,
			error,
			type: error ? 'error' : 'success',
		});
	};

	if (result) {
		return (
			<div className="flex flex-col gap-4 items-center justify-center">
				<Typography className="text-center text-2xl font-bold">
					Withdrawal {result.type === 'success' ? 'Successful!' : 'Failed'}
				</Typography>
				{result.error ? (
					<Typography className="text-red-600 text-center">{result.error}</Typography>
				) : (
					<Typography className="text-amber-600 text-center">Transfer can take up to 30 minutes</Typography>
				)}
				<Button onClick={onConfirm} layout="primary" className="px-8">
					OK
				</Button>
			</div>
		);
	}

	return <WithdrawalForm onResult={handleResult} />;
}
