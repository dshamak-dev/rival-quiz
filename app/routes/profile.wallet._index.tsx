import { getAuthCookie } from '@/auth';
import { useAPI } from '@api/api.hook';
import { getUserTransactions } from '@api/transaction.api';
import { createWallet, getUserWallet } from '@api/wallet.api';
import { WalletDTO } from '@model/wallet.model';
import { ActionFunctionArgs, LoaderFunctionArgs, redirect } from '@remix-run/node';
import { Form, useLoaderData } from '@remix-run/react';
import { useAuth } from '@state/auth.hook';
import { Button } from '@view/button/button';
import { Icon } from '@view/icon';
import { TransactionCard } from '@view/transaction/transaction.card';
import { Typography } from '@view/typography/typography';
import { WalletCard } from '@view/wallet/wallet.card';
import { useEffect } from 'react';

export async function loader({ request }: LoaderFunctionArgs): Promise<WalletDTO | null> {
	const token: string | null = await getAuthCookie(request);

	if (!token) {
		return null;
	}

	const wallet = await getUserWallet().catch((err) => null);

	return wallet;
}

export async function action({ request }: ActionFunctionArgs) {
	const wallet = await createWallet();

	return redirect(``);
}

export default function ProfileWalletPage() {
	const { wallet } = useAuth();
	const { data, loading, dispatch } = useAPI({
		initialState: null,
		minDuration: 1000,
		request: () => getUserTransactions(),
	});

	useEffect(() => {
		dispatch();
	}, []);

	if (loading || !data) {
		return (
			<div className="h-full flex flex-col items-center justify-center justify-self-center align-self-center">
				<Icon size={48} name="Wallet" className="relative -top-6 animate-bounce" />
				<Typography className="text-center relative">Loading transactions</Typography>
			</div>
		);
	}

	if (!wallet) {
		return (
			<Form method="post">
				<Typography>No wallet found</Typography>
				<Button size="small" type="submit">
					+ Add Wallet
				</Button>
			</Form>
		);
	}

	return (
		<div className="grid grid-rows-[auto_1fr] gap-4 h-full p-4">
			<div>
				<WalletCard item={wallet} />
			</div>
			<div className="grid grid-rows-[auto_1fr] gap-2 h-full overflow-hidden">
				<Typography>Transactions:</Typography>
				<div className="flex flex-col gap-4 h-full overflow-y-auto">
					{data?.length ? (
						data.map((transaction) => <TransactionCard key={transaction.id} item={transaction} />)
					) : (
						<Typography>No transactions found</Typography>
					)}
				</div>
			</div>
		</div>
	);
}
