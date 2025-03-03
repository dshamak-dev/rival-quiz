import { getAuthHeaders } from '@/auth';
import { getUserTransactions } from '@api/transaction.api';
import { createWallet } from '@api/wallet.api';
import { TransactionDTO } from '@model/transaction.model';
import { ActionFunctionArgs, LoaderFunctionArgs, redirect } from '@remix-run/node';
import { Form, useLoaderData } from '@remix-run/react';
import { useAuth } from '@state/auth.hook';
import { Button } from '@view/button/button';
import { Icon } from '@view/icon';
import { TransactionCard } from '@view/transaction/transaction.card';
import { Typography } from '@view/typography/typography';
import { WalletCard } from '@view/wallet/wallet.card';

export async function loader({ request }: LoaderFunctionArgs): Promise<TransactionDTO[] | null> {
	const headers = await getAuthHeaders(request).catch((err) => null);

	if (!headers) {
		return null;
	}

	return getUserTransactions({ headers }).catch((err) => null);
}

export async function action({ request }: ActionFunctionArgs) {
	const wallet = await createWallet();

	return redirect(``);
}

export default function ProfileWalletPage() {
	const { wallet } = useAuth();
	const transactions = useLoaderData<typeof loader>();

	if (!transactions) {
		return (
			<div className="h-full flex flex-col items-center justify-center justify-self-center align-self-center">
				<Icon size={48} name="Wallet2" className="relative -top-6 animate-bounce" />
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
			<div className="grid grid-rows-[auto_1fr] gap-1 h-full overflow-hidden">
				<Typography>Transactions:</Typography>
				<div className="flex flex-col gap-4 h-full overflow-y-auto">
					{transactions?.length ? (
						transactions.map((transaction) => <TransactionCard key={transaction.id} item={transaction} />)
					) : (
						<Typography>No transactions found</Typography>
					)}
				</div>
			</div>
		</div>
	);
}
