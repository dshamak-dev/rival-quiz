import { Countdown } from '@view/time/countdown';
import { InvoiceDTO } from '../type';

import styles from './invoice.module.css';
import { Button } from '@view/button/button';
import { PaymentButton, PaymentValidateButton } from 'src/payment/view/payment.button';
import { toCurrency } from 'src/payment/helper';
import { usePayment } from 'src/payment/state';
import { useEffect, useMemo, useState } from 'react';
import { InvoiceStatus } from '@shared/invoice/type';
import { cancelInvoice } from '../api';
import { Icon } from '@view/icon';

type Props = {
	item: InvoiceDTO;
	onChange?: (item: InvoiceDTO) => void;
};

export function InvoicePreview({ item, onChange }: Props) {
	const { exchangeRates } = usePayment();
	const [isLoading, setIsLoading] = useState(false);
	const [invoice, setInvoice] = useState<InvoiceDTO | null>(item);

	const currency = useMemo(
		() => Object.values(exchangeRates).find((it) => it.type === item.currency) || exchangeRates.USD,
		[exchangeRates, item.currency]
	);
	const totalPrice = useMemo(() => toCurrency(item.cost, 1, currency.symbol), [item.total, exchangeRates]);
	const isDraft = useMemo(() => item.status === InvoiceStatus.DRAFT, [item.status]);
	const canPay = useMemo(() => isDraft && item.total > 0, [isDraft, item.total]);

	useEffect(() => {
		setInvoice(item);
	}, [item]);

	if (!invoice?.id) {
		return null;
	}

	const handleCancel = () => {
		setIsLoading(true);
		cancelInvoice(invoice.id, {})
			.then((res) => {
				onChange?.(res);

				setInvoice(res);
			})
			.catch((err) => {
				console.error('Failed to update invoice:', err);
				return null;
			})
			.finally(() => {
				setIsLoading(false);
			});
	};

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
				<div className="flex gap-4 items-center">
					<PaymentButton
						invoice={item}
						buttonProps={{
							disabled: isLoading,
						}}
					>
						Pay {totalPrice}
					</PaymentButton>
					<PaymentValidateButton disabled={isLoading} invoice={item} />
					<Button onClick={handleCancel} loading={isLoading} layout="danger">
						{!isLoading && <Icon name="Trash" />}
					</Button>
				</div>
			)}
		</div>
	);
}
