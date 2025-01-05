import { useAPI } from '@api/api.hook';
import { getUserTransactions } from '@api/transaction.api';
import { formatDate } from '@control/date.control';
import { Icon } from '@view/icon';
import { Typography } from '@view/typography/typography';
import { useEffect } from 'react';

export default function ProfileTransactionsPage() {
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

	return (
		<div className="flex flex-col gap-4 p-4">
			<Typography>Transactions:</Typography>
			<div className="flex flex-col gap-4">
				{data?.length ? (
					data.map((transaction) => (
						<div
							key={transaction.id}
							className="flex flex-col gap-1 p-2 rounded border bg-gray-100 text-xs"
						>
							<div className="flex gap-4">
								<TransactionProperty label="Type" value={transaction.type} />
								<TransactionProperty label="Amount" value={transaction.amount} />
								<TransactionProperty label="Status" value={transaction.status} />
							</div>
							<div className="flex gap-4">
								<TransactionProperty
									label="Date"
									value={formatDate(transaction.updated, 'DD/MM/YYYY h:m:s')}
								/>
							</div>
							<Typography size="custom">{transaction.details || 'N/A'}</Typography>
						</div>
					))
				) : (
					<Typography>No transactions found</Typography>
				)}
			</div>
		</div>
	);
}

function TransactionProperty({ label, value }: { label: string; value: any }) {
	return (
		<Typography size="custom" className="flex gap-1">
			<span className="capitalize">{label}:</span>
			<Typography size="custom" className="font-bold capitalize">
				{value}
			</Typography>
		</Typography>
	);
}
