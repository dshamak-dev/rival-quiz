import { Countdown } from '@view/time/countdown';
import { InvoiceDTO } from '../type';

import styles from './invoice.module.css';
import { Button } from '@view/button/button';
import { PaymentButton } from 'src/payment/view/payment.button';
import { toCurrency } from 'src/payment/helper';
import { usePayment } from 'src/payment/state';
import { useMemo } from 'react';
import { InvoiceStatus } from '@shared/invoice/type';

type Props = {
	item: InvoiceDTO;
};

export function InvoicePreview({ item }: Props) {
	const { exchangeRates } = usePayment();

	const totalPrice = useMemo(() => toCurrency(item.total, 1, exchangeRates.USD.symbol), [item.total, exchangeRates]);
	const isDraft = useMemo(() => item.status === InvoiceStatus.DRAFT, [item.status]);
	const canPay = useMemo(() => isDraft && item.total > 0, [isDraft, item.total]);

	if (item.status === InvoiceStatus.PAID) {
		return null;
	}

	return (
		<div className={styles.item}>
			<div>
				<h2>
					Status: <b>{item.status}</b>
				</h2>
				<p>Due: {item.validUntil}</p>
				{item.validUntil && isDraft && (
					<p>
						Expires In:{' '}
						<b>
							<Countdown due={item.validUntil} />
						</b>
					</p>
				)}
				<p>Total: {totalPrice}</p>
			</div>
			{canPay && (
				<div>
					<PaymentButton invoice={item}>Pay {totalPrice}</PaymentButton>
				</div>
			)}
		</div>
	);
}
