import { Typography } from '@view/typography/typography';
import { InvoiceDTO } from 'src/invoice/type';
import { InvoicePreview } from './invoice.preview';

type Props = {
	items: InvoiceDTO[];
	onChange?: (items: InvoiceDTO[]) => void;
};

export function InvoiceList({ items, onChange }: Props) {
	const handleInvoiceChange = (invoice: InvoiceDTO, index: number) => {
		onChange?.([...items.slice(0, index), invoice, ...items.slice(index + 1)]);
	};

	return (
		<>
			{items?.length ? (
				items.map((item, index) => (
					<InvoicePreview key={item.id} item={item} onChange={(item) => handleInvoiceChange(item, index)} />
				))
			) : (
				<Typography>No draft invoices found</Typography>
			)}
		</>
	);
}
