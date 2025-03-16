import { getAuthHeaders } from '@/auth';
import { getUserTransactions } from '@api/transaction.api';
import { createWallet } from '@api/wallet.api';
import { TransactionDTO } from '@model/transaction.model';
import { ActionFunctionArgs, LoaderFunctionArgs, redirect } from '@remix-run/node';
import { Form, useLoaderData } from '@remix-run/react';
import { InvoiceStatus } from '@shared/invoice/type';
import { useAuth } from '@state/auth.hook';
import { Button } from '@view/button/button';
import { Icon } from '@view/icon';
import { TransactionCard } from '@view/transaction/transaction.card';
import { Typography } from '@view/typography/typography';
import { getUserInvoices } from 'src/invoice/api';
import { InvoiceDTO } from 'src/invoice/type';
import { InvoiceList } from 'src/invoice/view/invoice.list';
import { WalletCard } from 'src/wallet/view/wallet.card';
import { WalletDepositButton } from 'src/wallet/view/wallet.deposit-button';
import { WalletWithdrawButton } from 'src/wallet/view/wallet.withdraw-button';

import styles from './wallet.module.css';

type LoaderPayload = { transactions: TransactionDTO[] | null; invoices: InvoiceDTO[] | null } | null;

export async function loader({ request }: LoaderFunctionArgs): Promise<LoaderPayload> {
	const headers = await getAuthHeaders(request).catch((err) => null);

	if (!headers) {
		return null;
	}

	const transactions = await getUserTransactions({ headers }).catch((err) => null);
	const invoices = await getUserInvoices({ headers }).then(res => res.filter(it => it.status === InvoiceStatus.DRAFT)).catch((err) => {
		return null;
	});

	return { transactions, invoices };
}

export async function action({ request }: ActionFunctionArgs) {
	const wallet = await createWallet();

	return redirect(``);
}

export default function ProfileWalletPage() {
	const { wallet } = useAuth();
	const loaderData: LoaderPayload = useLoaderData<LoaderPayload>();
	const transactions: TransactionDTO[] | null = loaderData?.transactions || [];
	const invoices: InvoiceDTO[] | null = loaderData?.invoices || [];

	return (
		<div className={styles.content}>
			<div className="flex flex-col gap-4">
				{wallet ? (
					<WalletCard item={wallet} />
				) : (
					<Form method="post">
						<Typography>No wallet found</Typography>
						<Button size="small" type="submit">
							+ Add Wallet
						</Button>
					</Form>
				)}
				<section data-testid="payment-section" className="flex items-end gap-4">
					<div className="min-w-[12rem]">
						<WalletDepositButton>
							<Button layout="tertiary" size="small" className="w-full">
								<Icon name="Cash" size={14} /> Top Up
							</Button>
						</WalletDepositButton>
					</div>
					<div>
						<WalletWithdrawButton>
							<Button size="small" className="w-full">
								<Icon name="CashCoin" size={14} className="relative -bottom-[2px]" /> Withdraw
							</Button>
						</WalletWithdrawButton>
					</div>
				</section>
			</div>
			<div className="relative h-full overflow-hidden flex flex-col gap-4 h-full overflow-y-auto">
				{!!invoices?.length && (
					<div className="flex flex-col gap-1">
						<Typography className="sticky top-0 bg-white">Invoices:</Typography>
						<InvoiceList items={invoices} />
					</div>
				)}
				<div className="flex flex-col gap-1">
					<Typography className="sticky top-0 bg-white">Transactions:</Typography>
					<div className="flex flex-col gap-4 h-full overflow-y-auto">
						{transactions?.length ? (
							transactions.map((transaction) => (
								<TransactionCard key={transaction.id} item={transaction} />
							))
						) : (
							<Typography>No transactions found</Typography>
						)}
					</div>
				</div>
			</div>
		</div>
	);
}
