import { useAPI } from '@api/api.hook';
import { requestTransactionValidation } from '@api/transaction.api';
import { formatDate } from '@control/date.control';
import { TransactionDTO, TransactionStatusEnum, TransactionStatusLabels } from '@model/transaction.model';
import { Icon } from '@view/icon';
import { Typography } from '@view/typography/typography';
import classNames from 'classnames';
import { useMemo } from 'react';

export type TransactionCardProps = {
	item: TransactionDTO;
};

export function TransactionCard({ item }: TransactionCardProps) {
	const { data, loading, dispatch } = useAPI({
		initialState: item,
		request: (id: TransactionDTO['id']) => requestTransactionValidation(id),
	});

	const transaction = data || item;

	const statusContent = useMemo(() => {
		if (!transaction) {
			return null;
		}

		const label = TransactionStatusLabels[transaction.status];

		switch (transaction.status) {
			case TransactionStatusEnum.Pending: {
				return (
					<Typography
						size="custom"
						className="relative flex items-center gap-1 cursor-pointer hover:text-sky-500"
						onClick={() => dispatch(transaction.id)}
					>
						<span>{label}</span>
						<Icon
							name="ArrowClockwise"
							size={14}
							className={classNames('absolute -right-[18px]', {
								'animate-spin': loading,
							})}
						/>
					</Typography>
				);
			}
			default: {
				return label;
			}
		}
	}, [transaction?.status]);

	if (!transaction) {
		return null;
	}

	return (
		<div key={transaction.id} className="flex flex-col gap-1 p-2 rounded border bg-gray-100 text-xs">
			<div className="flex gap-4">
				<TransactionProperty label="Type" value={transaction.type} />
				<TransactionProperty label="Amount" value={transaction.amount} />
				<TransactionProperty label="Status" value={statusContent} />
			</div>
			<div className="flex gap-4">
				<TransactionProperty label="Date" value={formatDate(transaction.updated, 'DD/MM/YYYY h:m:s')} />
			</div>
			<Typography size="custom">{transaction.details || 'N/A'}</Typography>
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
