import { InvoiceDTO } from 'src/invoice/type';

export const toCurrency = (value: string | number, rate: number = 1, symbol = ''): string => {
	const numberValue = !rate ? 0 : Number(value) / rate;
	const isNegative = numberValue < 0;
	const abs = Math.abs(numberValue || 0);
	const formattedValue = isNegative ? `-${symbol}${abs.toFixed(2)}` : `${symbol}${abs.toFixed(2)}`;

	return formattedValue;
};

export const calculateInvoiceSummary = (invoice: Partial<InvoiceDTO>) => {
	const quantity = invoice?.items?.reduce((acc, item) => acc + item.quantity, 0) || 0;
	const totalDiscount =
		invoice?.items?.reduce((acc, item) => {
			const _dicsount = item.discount || 0;

			return acc + item.quantity * _dicsount;
		}, 0) || 0;
	const subtotal = quantity;
	const total = subtotal - totalDiscount;

	const payload = { quantity: 0, subtotal: 0, discount: 0, total: 0, error: '' };
	payload.quantity = quantity;
	payload.subtotal = Number(subtotal.toFixed(2));
	payload.discount = Number(totalDiscount.toFixed(2));
	payload.total = Number(total.toFixed(2));

	return payload;
};
