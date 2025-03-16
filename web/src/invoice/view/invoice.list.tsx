import { Typography } from '@view/typography/typography';
import { InvoiceDTO } from 'src/invoice/type';
import { InvoicePreview } from './invoice.preview';

type Props = {
	items: InvoiceDTO[];
};

export function InvoiceList({ items }: Props) {
	return (
		<div className="flex flex-col gap-4 h-full overflow-y-auto">
			{items?.length ? (
				items.map((item) => <InvoicePreview key={item.id} item={item} />)
			) : (
				<Typography>No invoices found</Typography>
			)}
		</div>
	);
}
