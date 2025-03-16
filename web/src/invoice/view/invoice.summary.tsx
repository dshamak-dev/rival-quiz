import { useEffect, useMemo, useRef, useState } from 'react';
import { InvoiceDTO } from '../type';
import { Typography } from '@view/typography/typography';
import { calculateInvoiceSummary, toCurrency } from 'src/payment/helper';
import { usePayment } from 'src/payment/state';

import styles from './invoice.module.css';
import classNames from 'classnames';

type Props = {
	invoice: Partial<InvoiceDTO>;
};
export function InvoiceSummary({ invoice }: Props) {
	const { exchangeRates } = usePayment();
	const currency = useMemo(() => exchangeRates.USD, [exchangeRates]);

	const [_, setUpdateState] = useState<number | null>(null);
	const summaryRef = useRef({
		quantity: 0,
		subtotal: 0,
		discount: 0,
		total: 0,
	});
	const state = summaryRef.current || {};

	const setSummary = (newState: Partial<typeof state>) => {
		summaryRef.current = { ...summaryRef.current, ...newState };
		setUpdateState(Date.now());
	};

	useEffect(() => {
		const summary = calculateInvoiceSummary(invoice);

		setSummary(summary);
	}, [invoice]);

	return (
		<>
			<Typography>Total Quantity: {state.quantity}</Typography>
			<Typography>Subtotal: {toCurrency(state.subtotal, currency.buy, currency.symbol)}</Typography>
			<Typography>
				Discount:{' '}
				<span
					className={classNames({
						[styles.discount]: state.discount > 0,
					})}
				>
					{toCurrency(state.discount, currency.buy, currency.symbol)}
				</span>
			</Typography>
			<Typography className="font-bold">
				Total: {toCurrency(state.total, currency.buy, currency.symbol)}
			</Typography>
		</>
	);
}
