import { formatDate } from '@control/date.control';
import { WalletDTO } from '@model/wallet.model';
import { Typography } from '@view/typography/typography';
import classNames from 'classnames';

export type WalletCardProps = {
	item: WalletDTO;
};

export function WalletCard({ item }: WalletCardProps) {
	if (!item) {
		return null;
	}

	return (
		<div className={classNames('')}>
			<div className="flex flex-col">
				<WalletProperty label="Total Balance" value={`${item.balance} ${item.currency}`} />
			</div>
			<div className="flex flex-col text-xs">
				<WalletProperty label="Created" value={formatDate(item.created)} />
				<WalletProperty label="Last Update" value={formatDate(item.updated, 'DD/MM/YYYY h:m:s')} />
			</div>
		</div>
	);
}

function WalletProperty({ label, value }: { label: string; value: any }) {
	return (
		<Typography size="custom" className="flex gap-1">
			<span className="capitalize">{label}:</span>
			<Typography size="custom" className="font-bold capitalize">
				{value}
			</Typography>
		</Typography>
	);
}
